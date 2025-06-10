import {
	Injectable,
	NotFoundException,
	BadRequestException,
	ForbiddenException,
	Inject,
} from '@nestjs/common';
import { ITenantService } from '../../domain/service/tenant.service.interface';
import { ITenantRepository } from '../../domain/repository/tenant.repository.interface';
import { Tenant } from '../../domain/tenant';
import { CreateTenantDto, UpdateTenantDto } from '../../domain/dto/tenant.dto';
import { TENANT_REPOSITORY } from 'src/common/constant';
import { PaginationOptionsDto } from 'src/common/dtos/page-option.dto';
import { RequestContextService } from 'src/common/context/request-context.service';

@Injectable()
export class TenantService implements ITenantService {
	constructor(
		@Inject(TENANT_REPOSITORY)
		private readonly tenantRepository: ITenantRepository,

		private readonly context: RequestContextService,
	) {}

	async getById(id: string): Promise<Tenant> {
		const tenant = await this.tenantRepository.findById(id);
		if (!tenant) {
			throw new NotFoundException(`Tenant with ID ${id} not found`);
		}

		// Multi-tenant isolation
		if (!this.context.isSuperUser() && tenant.id !== this.context.getUserId()) {
			throw new ForbiddenException(`Access to tenant ${id} is forbidden`);
		}

		return tenant;
	}

	async getByCode(code: string): Promise<Tenant> {
		const tenant = await this.tenantRepository.findByCode(code);
		if (!tenant) {
			throw new NotFoundException(`Tenant with code "${code}" not found`);
		}

		if (!this.context.isSuperUser() && tenant.id !== this.context.getUserId()) {
			throw new ForbiddenException(`Access to tenant with code "${code}" is forbidden`);
		}

		return tenant;
	}

	async getAll(pagination: PaginationOptionsDto): Promise<{ data: Tenant[]; total: number }> {
		if (!this.context.isSuperUser()) {
			throw new ForbiddenException('Only superadmin can access all tenants');
		}

		return this.tenantRepository.findAll(pagination);
	}

	async create(payload: CreateTenantDto): Promise<Tenant> {
		if (!this.context.isSuperUser()) {
			throw new ForbiddenException('Only superadmin can create tenants');
		}

		const generatedCode = this.generateTenantCode(payload.name);

		const existing = await this.tenantRepository.findByCode(generatedCode);
		if (existing) {
			throw new BadRequestException(`Tenant code "${generatedCode}" already exists`);
		}

		const tenant = new Tenant().new(
			payload.name,
			payload.description,
			payload.address,
			payload.contact_info,
		);
		tenant.code = generatedCode;

		return this.tenantRepository.create(tenant);
	}

	async update(id: string, payload: UpdateTenantDto): Promise<Tenant> {
		const tenant = await this.tenantRepository.findById(id);
		if (!tenant) {
			throw new NotFoundException(`Tenant with ID ${id} not found`);
		}

		if (!this.context.isSuperUser() && tenant.id !== this.context.getUserId()) {
			throw new ForbiddenException(`Access to update tenant ${id} is forbidden`);
		}

		tenant.updateInfo(
			payload.name ?? tenant.name,
			payload.description ?? tenant.description,
			payload.address ?? tenant.address,
			payload.contact_info ?? tenant.contact_info,
		);

		return this.tenantRepository.update(id, tenant);
	}

	async delete(id: string): Promise<void> {
		const tenant = await this.tenantRepository.findById(id);
		if (!tenant) {
			throw new NotFoundException(`Tenant with ID ${id} not found`);
		}

		if (!this.context.isSuperUser()) {
			throw new ForbiddenException(`Only superadmin can delete tenants`);
		}

		await this.tenantRepository.delete(id);
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
}
