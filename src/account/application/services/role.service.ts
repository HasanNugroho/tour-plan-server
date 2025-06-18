import {
	BadRequestException,
	ForbiddenException,
	Inject,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import { IRoleRepository } from '../../domain/interface/role.repository.interface';
import { IRoleService } from '../../domain/interface/role.service.interface';
import { IUserRepository } from 'src/account/domain/interface/user.repository.interface';
import { ROLE_REPOSITORY, USER_REPOSITORY } from 'src/common/constant';
import { Role } from '../../domain/role';
import { CreateRoleDto, UpdateRoleDto } from '../../presentation/dto/role.dto';
import { PaginationOptionsDto } from 'src/common/dtos/page-option.dto';
import { RequestContextService } from 'src/common/context/request-context.service';
import * as rolesData from 'src/config/default-roles.json';

@Injectable()
export class RoleService implements IRoleService {
	constructor(
		@Inject(ROLE_REPOSITORY)
		private readonly roleRepository: IRoleRepository,

		@Inject(USER_REPOSITORY)
		private readonly userRepository: IUserRepository,

		private readonly contextService: RequestContextService,
	) { }

	async getById(id: string): Promise<Role> {
		const tenantId = this.contextService.getTenantId();
		const isSuperUser = this.contextService.isSuperUser();

		const role = await this.roleRepository.getById(id);
		if (!role) {
			throw new NotFoundException(`Role with ID ${id} not found`);
		}

		if (!isSuperUser && role.tenantId !== tenantId) {
			throw new ForbiddenException('Access denied for tenant');
		}

		return role;
	}

	async getAll(filter: PaginationOptionsDto): Promise<{ roles: Role[]; totalCount: number }> {
		const tenantId = this.contextService.getTenantId();
		const isSuperUser = this.contextService.isSuperUser();

		const { roles, totalCount } = await this.roleRepository.getAll(
			filter,
			isSuperUser ? null : (tenantId ?? null),
		);

		return { roles, totalCount };
	}

	async create(payload: CreateRoleDto): Promise<void> {
		const tenantId = this.contextService.getTenantId();

		if (payload.name.toLowerCase() === 'superadmin') {
			throw new BadRequestException('Cannot create a superuser role.');
		}

		const existingRole = await this.roleRepository.getByName(payload.name);
		if (existingRole && existingRole.tenantId === tenantId) {
			throw new BadRequestException('Role name already exists in this tenant');
		}

		const role = Role.create(
			payload.name,
			payload.description,
			payload.permissions,
			tenantId
		);

		if (!role.validatePermissions()) {
			throw new BadRequestException('Invalid permissions provided.');
		}

		await this.roleRepository.create(role);
	}

	async createDefaultRoles(tenantId?: string): Promise<Role[]> {
		const roles: Role[] = rolesData.roles
			.filter((roleData: any) => roleData.name !== 'superadmin')
			.map((roleData: any) =>
				Role.create(
					roleData.name,
					roleData.description,
					roleData.permissions,
					tenantId,
					true
				),
			);

		return await this.roleRepository.createMany(roles);
	}

	async update(id: string, payload: UpdateRoleDto): Promise<void> {
		const tenantId = this.contextService.getTenantId();

		const role = await this.roleRepository.getById(id);
		if (!role) {
			throw new NotFoundException(`Role with ID ${id} not found`);
		}

		if (role.tenantId !== tenantId) {
			throw new ForbiddenException('Access denied to update this role');
		}

		if (role.name.toLowerCase() === 'superadmin') {
			throw new BadRequestException('Cannot update a superuser role.');
		}

		role.name = payload.name ?? role.name;
		role.description = payload.description ?? role.description;

		if (payload.permissions) {
			role.permissions = payload.permissions;

			if (!role.validatePermissions()) {
				throw new BadRequestException('Invalid permissions provided.');
			}
		}

		await this.roleRepository.update(id, role);
	}

	async delete(id: string): Promise<void> {
		const tenantId = this.contextService.getTenantId();
		const isSuperUser = this.contextService.isSuperUser();

		const role = await this.roleRepository.getById(id);
		if (!role) {
			throw new NotFoundException(`Role with ID ${id} not found`);
		}

		if (!isSuperUser && (role.tenantId !== tenantId || role.isSystem)) {
			throw new ForbiddenException('Access denied to delete this role');
		}

		const users = await this.userRepository.getAllByRoleId(id);
		if (users.length > 0) {
			throw new BadRequestException('Role masih digunakan oleh user');
		}

		await this.roleRepository.delete(id);
	}
}
