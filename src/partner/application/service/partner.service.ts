import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PARTNER_REPOSITORY } from 'src/common/constant';
import { RequestContextService } from 'src/common/context/request-context.service';
import { IPartnerRepository } from 'src/partner/domain/interface/partner.repository.interface';
import { IPartnerService } from 'src/partner/domain/interface/partner.service.interface';
import { Partner } from 'src/partner/domain/partner';
import { PartnerFilterOptionDto } from 'src/partner/presentation/dto/partner-filter.dto';
import { CreatePartnerDto, UpdatePartnerDto } from 'src/partner/presentation/dto/partner.dto';

@Injectable()
export class PartnerService implements IPartnerService {
	constructor(
		@Inject(PARTNER_REPOSITORY)
		private readonly partnerRepository: IPartnerRepository,

		private readonly context: RequestContextService,
	) {}

	async getAll(pagination: PartnerFilterOptionDto): Promise<{ data: Partner[]; total: number }> {
		const tenantId = this.context.getTenantId();

		if (!tenantId) {
			// Only tenant-scoped users should call this. Superadmin access is not permitted here.
			throw new ForbiddenException('Access denied: This endpoint is tenant-scoped only.');
		}

		return this.partnerRepository.getAll(tenantId, pagination);
	}

	async getById(id: string): Promise<Partner> {
		const tenantId = this.context.getTenantId();

		const partner = await this.partnerRepository.getById(id);
		if (!partner) {
			throw new NotFoundException(`Partner with ID ${id} not found`);
		}

		// Multi-tenant isolation
		if (!this.context.isSuperUser() && partner.tenantId !== tenantId) {
			throw new ForbiddenException(`Access to partner ${id} is forbidden`);
		}

		return partner;
	}

	async create(payload: CreatePartnerDto): Promise<Partner> {
		const tenantId = this.context.getTenantId();

		const partner = Partner.create({
			name: payload.name,
			category: payload.category,
			address: payload.address,
			phone: payload.phone,
			contactPerson: payload.contactPerson,
			email: payload.email,
			tenantId,
		});

		return await this.partnerRepository.create(partner);
	}

	async update(id: string, payload: UpdatePartnerDto): Promise<void> {
		const tenantId = this.context.getTenantId();

		const partner = await this.partnerRepository.getById(id);
		if (!partner) {
			throw new NotFoundException(`Partner with ID ${id} not found`);
		}

		// Multi-tenant isolation
		if (partner.tenantId !== tenantId) {
			throw new ForbiddenException(`Access to partner ${id} is forbidden`);
		}

		partner.update(
			payload.name ?? partner.name,
			payload.category ?? partner.category,
			payload.contactPerson ?? partner.contactPerson,
			payload.phone ?? partner.phone,
			payload.address ?? partner.address,
			payload.email ?? partner.email,
		);

		await this.partnerRepository.update(partner);
	}

	async delete(id: string): Promise<void> {
		const tenantId = this.context.getTenantId();

		const partner = await this.partnerRepository.getById(id);
		if (!partner) {
			throw new NotFoundException(`Partner with ID ${id} not found`);
		}

		// Multi-tenant isolation
		if (partner.tenantId !== tenantId) {
			throw new ForbiddenException(`Access to partner ${id} is forbidden`);
		}

		await this.partnerRepository.delete(id);
	}
}
