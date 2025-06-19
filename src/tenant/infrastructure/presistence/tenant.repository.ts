import { Injectable } from '@nestjs/common';
import { Repository, ILike } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Tenant } from 'src/tenant/domain/tenant';
import { ITenantRepository } from 'src/tenant/domain/interface/tenant.repository.interface';
import { TenantFilterOptionDto } from 'src/tenant/presentation/dto/tenant-filter.dto';

@Injectable()
export class TenantRepository implements ITenantRepository {
	constructor(
		@InjectRepository(Tenant)
		private readonly repo: Repository<Tenant>,
	) {}

	async getById(id: string): Promise<Tenant | null> {
		return this.repo.findOneBy({ id });
	}

	async getByCode(code: string): Promise<Tenant | null> {
		return this.repo.findOneBy({ code });
	}

	async getAll(pagination: TenantFilterOptionDto): Promise<{ data: Tenant[]; total: number }> {
	const {
		keyword,
		order = 'ASC',
		orderby = 'updated_at',
		limit = 10,
		isActive,
	} = pagination;

	console.log(isActive)

	const baseFilter = {
		...(isActive !== undefined && { isActive }),
	};

	let where: any;

	if (keyword) {
		where = [
			{ ...baseFilter, name: ILike(`%${keyword}%`) },
			{ ...baseFilter, code: ILike(`%${keyword}%`) },
			{ ...baseFilter, description: ILike(`%${keyword}%`) },
		];
	} else {
		where = baseFilter;
	}

	const [data, total] = await this.repo.findAndCount({
		where,
		order: {
			[orderby]: order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC',
		},
		skip: pagination.getOffset(),
		take: limit,
	});

	return { data, total };
}


	async create(tenant: Tenant): Promise<Tenant> {
		return this.repo.save(tenant);
	}

	async update(id: string, tenant: Tenant): Promise<void> {
		await this.repo.update(id, tenant);
	}

	async delete(id: string): Promise<void> {
		await this.repo.delete(id);
	}
}
