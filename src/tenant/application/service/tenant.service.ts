import {
	Injectable,
	NotFoundException,
	BadRequestException,
	ForbiddenException,
	Inject,
} from '@nestjs/common';
import { ITenantService } from '../../domain/interface/tenant.service.interface';
import { ITenantRepository } from '../../domain/interface/tenant.repository.interface';
import { Tenant } from '../../domain/tenant';
import { CreateTenantDto, UpdateTenantDto } from '../../domain/dto/tenant.dto';
import { ONE_WEEK_MS, ONE_WEEK_S, STORAGE_SERVICE, TENANT_REPOSITORY } from 'src/common/constant';
import { RequestContextService } from 'src/common/context/request-context.service';
import { plainToInstance } from 'class-transformer';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { File, FileStatus } from 'src/storage/domain/file';
import { StorageServiceInterface } from 'src/storage/domain/interface/storage.service.interface';
import { TenantFilterOptionDto } from 'src/tenant/presentation/dto/tenant-filter.dto';

@Injectable()
export class TenantService implements ITenantService {
	constructor(
		@Inject(TENANT_REPOSITORY)
		private readonly tenantRepository: ITenantRepository,

		@Inject(CACHE_MANAGER)
		private cacheManager: Cache,

		@Inject(STORAGE_SERVICE)
		private readonly storageService: StorageServiceInterface,

		private readonly context: RequestContextService,
	) {}

	async getById(id: string): Promise<Tenant> {
		const tenant = await this.handleCache(id, () => this.tenantRepository.getById(id));
		if (!tenant) {
			throw new NotFoundException(`Tenant with ID ${id} not found`);
		}

		// Multi-tenant isolation
		if (!this.context.isSuperUser() && tenant.id !== this.context.getTenantId()) {
			throw new ForbiddenException(`Access to tenant ${id} is forbidden`);
		}

		return tenant;
	}

	async getByCode(code: string): Promise<Tenant> {
		const tenant = await this.tenantRepository.getByCode(code);
		if (!tenant) {
			throw new NotFoundException(`Tenant with code "${code}" not found`);
		}

		if (!this.context.isSuperUser() && tenant.id !== this.context.getUserId()) {
			throw new ForbiddenException(`Access to tenant with code "${code}" is forbidden`);
		}

		return tenant;
	}

	async getAll(pagination: TenantFilterOptionDto): Promise<{ data: Tenant[]; total: number }> {
		if (!this.context.isSuperUser()) {
			throw new ForbiddenException('Only superadmin can access all tenants');
		}

		return this.tenantRepository.getAll(pagination);
	}

	async create(payload: CreateTenantDto): Promise<Tenant> {
		if (!this.context.isSuperUser() && this.context.getTenantId()) {
			throw new ForbiddenException('Only superadmin can create tenants');
		}

		const generatedCode = this.generateTenantCode(payload.name);

		const existing = await this.tenantRepository.getByCode(generatedCode);
		if (existing) {
			throw new BadRequestException(`Tenant code "${generatedCode}" already exists`);
		}

		const tenant = await Tenant.create({
			name: payload.name,
			description: payload.description,
			address: payload.address,
			contactInfo: payload.contact_info,
			logoId: payload.logoId,
		});
		tenant.code = generatedCode;

		if (payload.logoId) {
			const file = await this.storageService.getById(payload.logoId, ONE_WEEK_S);
			if (!file) {
				throw new BadRequestException('File not valid');
			}
			tenant.logo = file === null ? undefined : file;
			await this.storageService.updateStatus(FileStatus.COMPLETED);
		}

		return this.tenantRepository.create(tenant);
	}

	async update(id: string, payload: UpdateTenantDto): Promise<void> {
		const tenant = await this.tenantRepository.getById(id);
		if (!tenant) {
			throw new NotFoundException(`Tenant with ID ${id} not found`);
		}

		const isSuperUser = this.context.isSuperUser();
		const currentTenantId = this.context.getTenantId();

		if (!isSuperUser && tenant.id !== currentTenantId) {
			throw new ForbiddenException(`Access to update tenant ${id} is forbidden`);
		}

		let file: File | null = null;
		if (payload.logoId) {
			file = await this.storageService.getById(payload.logoId, ONE_WEEK_S);
			if (!file) {
				throw new BadRequestException('File not valid');
			}

			await this.storageService.updateStatus(FileStatus.COMPLETED);
		}

		tenant.updateInfo(
			payload.name ?? tenant.name,
			payload.description ?? tenant.description,
			payload.address ?? tenant.address,
			payload.contact_info ?? tenant.contactInfo,
			payload.logoId ?? tenant.logoId,
		);

		await this.tenantRepository.update(id, tenant);

		if (file) {
			tenant.logo = file;
		}

		const key = `tenant:${tenant.id}`;
		await this.cacheManager.del(key);
		await this.cacheManager.set(key, tenant, ONE_WEEK_MS);
	}

	async delete(id: string): Promise<void> {
		const tenant = await this.tenantRepository.getById(id);
		if (!tenant) {
			throw new NotFoundException(`Tenant with ID ${id} not found`);
		}

		if (!this.context.isSuperUser()) {
			throw new ForbiddenException(`Only superadmin can delete tenants`);
		}

		await this.tenantRepository.delete(id);

		const key = `tenant:${tenant.id}`;
		await this.cacheManager.del(key);
	}

	private generateTenantCode(name: string): string {
		const firstWord = name
			.trim()
			.split(/\s+/)[0]
			.toLowerCase()
			.replace(/[^a-z0-9]/g, '');
		const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '');

		return `${firstWord}-${datePart}`;
	}

	private async handleCache(
		id: string,
		fetchTenant: () => Promise<Tenant | null>,
	): Promise<Tenant | null> {
		const key = `tenant:${id}`;
		const cached = await this.cacheManager.get<Tenant | null>(key);
		if (cached) return plainToInstance(Tenant, cached);

		const tenant = await fetchTenant();
		if (tenant) {
			if (tenant.logoId) {
				const logoFile = await this.storageService.getById(tenant.logoId, ONE_WEEK_S);
				tenant.logo = logoFile === null ? undefined : logoFile;
			}
			await this.cacheManager.set(key, tenant, ONE_WEEK_MS);
		}
		return tenant;
	}
}
