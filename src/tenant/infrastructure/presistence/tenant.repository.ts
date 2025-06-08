import { Injectable } from '@nestjs/common';
import { Repository, ILike } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationOptionsDto } from 'src/common/dtos/page-option.dto';
import { Tenant } from 'src/tenant/domain/tenant';
import { ITenantRepository } from 'src/tenant/domain/repository/tenant.repository.interface';

@Injectable()
export class TenantRepository implements ITenantRepository {
    constructor(
        @InjectRepository(Tenant)
        private readonly repo: Repository<Tenant>,
    ) { }

    async findById(id: string): Promise<Tenant | null> {
        return this.repo.findOne({ where: { id } });
    }

    async findByCode(code: string): Promise<Tenant | null> {
        return this.repo.findOne({ where: { code } });
    }

    async findAll(
        pagination: PaginationOptionsDto,
    ): Promise<{ data: Tenant[]; total: number }> {
        const { keyword, order = 'ASC', orderby = 'updatedAt', limit = 10 } = pagination;

        const where = keyword
            ? [
                { name: ILike(`%${keyword}%`) },
                { code: ILike(`%${keyword}%`) },
                { description: ILike(`%${keyword}%`) },
            ]
            : {};

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

    async update(id: string, tenant: Tenant): Promise<Tenant> {
        await this.repo.update(id, tenant);
        return this.findById(id) as Promise<Tenant>;
    }

    async delete(id: string): Promise<void> {
        await this.repo.delete(id);
    }
}
