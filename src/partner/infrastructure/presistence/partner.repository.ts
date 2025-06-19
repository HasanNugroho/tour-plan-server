import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IPartnerRepository } from 'src/partner/domain/interface/partner.repository.interface';
import { Partner } from 'src/partner/domain/partner';
import { PartnerFilterOptionDto } from 'src/partner/presentation/dto/partner-filter.dto';
import { ILike, Repository } from 'typeorm';

@Injectable()
export class PartnerRepository implements IPartnerRepository {
	constructor(
		@InjectRepository(Partner)
		private readonly repo: Repository<Partner>,
	) {}

	async getAll(
		tenantId: string,
		pagination: PartnerFilterOptionDto,
	): Promise<{ data: Partner[]; total: number }> {
		const {
			keyword,
			order = 'ASC',
			orderby = 'updatedAt',
			limit = 10,
			category,
			is_active,
		} = pagination;

		const baseFilter = {
			tenantId,
			...(category !== undefined && { category }),
			...(is_active !== undefined && { isActive: is_active }),
		};

		let where: any;

		if (keyword) {
			where = [
				{ ...baseFilter, name: ILike(`%${keyword}%`) },
				{ ...baseFilter, contactPerson: ILike(`%${keyword}%`) },
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

	async getById(id: string): Promise<Partner | null> {
		return await this.repo.findOneBy({ id });
	}

	async create(partner: Partner): Promise<Partner> {
		return await this.repo.save(partner);
	}

	async update(updateData: Partner): Promise<void> {
		await this.repo.save(updateData);
	}

	async delete(id: string): Promise<void> {
		await this.repo.delete(id);
	}
}
