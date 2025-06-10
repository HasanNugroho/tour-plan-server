import {
	Injectable,
	InternalServerErrorException,
	NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, ILike, In, IsNull, Repository } from 'typeorm';
import { IRoleRepository } from 'src/account/domain/repository/role.repository.interface';
import { Role } from 'src/account/domain/role';
import { PaginationOptionsDto } from 'src/common/dtos/page-option.dto';

@Injectable()
export class RoleRepository implements IRoleRepository {
	constructor(
		@InjectRepository(Role)
		private readonly db: Repository<Role>,
	) {}

	async create(role: Role): Promise<Role> {
		try {
			return await this.db.save(role);
		} catch (error) {
			throw new InternalServerErrorException('Database error on role creation');
		}
	}

	async getById(id: string): Promise<Role | null> {
		return this.db.findOne({ where: { id } });
	}

	async getByName(name: string): Promise<Role | null> {
		return this.db.findOne({ where: { name } });
	}

	async getAll(
		filter: PaginationOptionsDto,
		tenantId: string | null,
	): Promise<{ roles: Role[]; totalCount: number }> {
		const where: FindOptionsWhere<Role> = {};
		const offset = (filter.page - 1) * filter.limit;

		if (filter.keyword) {
			where.name = ILike(`%${filter.keyword}%`);
		}

		where.tenantId = tenantId ?? IsNull();

		const [roles, totalCount] = await this.db.findAndCount({
			where,
			order: {
				[filter.orderby || 'created_at']: filter.order || 'DESC',
			},
			skip: offset,
			take: filter.limit,
		});

		return { roles, totalCount };
	}

	async getManyById(ids: string[]): Promise<Role[] | null> {
		return this.db.findBy({
			id: In(ids),
		});
	}

	async update(id: string, RoleData: Partial<Role>): Promise<void> {
		const existingRole = await this.db.findOne({ where: { id } });

		if (!existingRole) {
			throw new NotFoundException('Role not found');
		}

		Object.assign(existingRole, RoleData);
		try {
			this.db.save(existingRole);
		} catch (error) {
			throw error;
		}
	}

	async delete(id: string): Promise<void> {
		await this.db.delete(id);
	}
}
