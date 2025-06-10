import { TestBed, Mocked } from '@suites/unit';
import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { RoleService } from './role.service';
import { IRoleRepository } from '../../domain/repository/role.repository.interface';
import { IUserRepository } from '../../domain/repository/user.repository.interface';
import { Role } from '../../domain/role';
import { CreateRoleDto, UpdateRoleDto } from '../../presentation/dto/role.dto';
import { PaginationOptionsDto } from 'src/common/dtos/page-option.dto';
import { ROLE_REPOSITORY, USER_REPOSITORY } from 'src/common/constant';
import { RequestContextService } from 'src/common/context/request-context.service';
import { User } from 'src/account/domain/user';

jest.mock('src/common/context/request-context.service');

describe('RoleService', () => {
	let service: RoleService;
	let roleRepository: Mocked<IRoleRepository>;
	let userRepository: Mocked<IUserRepository>;
	let contextService: Mocked<RequestContextService>;

	beforeEach(async () => {
		const contextServiceMock = {
			getTenantId: jest.fn(),
			isSuperUser: jest.fn(),
		};

		const { unit, unitRef } = await TestBed.solitary(RoleService).compile();

		service = unit;
		roleRepository = unitRef.get(ROLE_REPOSITORY);
		userRepository = unitRef.get(USER_REPOSITORY);
		contextService = unitRef.get(RequestContextService);
		jest.clearAllMocks();
	});

	describe('getById', () => {
		it('should return role when found and tenant matches', async () => {
			const role = new Role();
			role.id = 'role-id';
			role.tenantId = 'tenant-1';
			contextService.getTenantId.mockReturnValue('tenant-1');
			contextService.isSuperUser.mockReturnValue(false);

			roleRepository.getById.mockResolvedValueOnce(role);

			const result = await service.getById('role-id');
			expect(result).toBe(role);
		});

		it('should throw NotFoundException if role not found', async () => {
			contextService.getTenantId.mockReturnValue('tenant-1');
			contextService.isSuperUser.mockReturnValue(false);
			roleRepository.getById.mockResolvedValueOnce(null);
			await expect(service.getById('missing-id')).rejects.toThrow(NotFoundException);
		});

		it('should throw ForbiddenException if tenant mismatch', async () => {
			const role = new Role();
			role.id = 'role-id';
			role.tenantId = 'tenant-2';
			contextService.getTenantId.mockReturnValue('tenant-1');
			contextService.isSuperUser.mockReturnValue(false);
			roleRepository.getById.mockResolvedValueOnce(role);
			await expect(service.getById('role-id')).rejects.toThrow(ForbiddenException);
		});
	});

	describe('getAll', () => {
		it('should return paginated roles for tenant', async () => {
			contextService.getTenantId.mockReturnValue('tenant-1');
			contextService.isSuperUser.mockReturnValue(false);
			const role = new Role();
			role.tenantId = 'tenant-1';
			const filter = new PaginationOptionsDto();
			roleRepository.getAll.mockResolvedValueOnce({
				roles: [role],
				totalCount: 1,
			});

			const result = await service.getAll(filter);
			expect(result.roles).toHaveLength(1);
			expect(roleRepository.getAll).toHaveBeenCalledWith(filter, 'tenant-1');
		});

		it('should return all roles for superuser', async () => {
			contextService.getTenantId.mockReturnValue('tenant-1');
			contextService.isSuperUser.mockReturnValue(true);
			const role = new Role();
			roleRepository.getAll.mockResolvedValueOnce({
				roles: [role],
				totalCount: 1,
			});

			const filter = new PaginationOptionsDto();
			const result = await service.getAll(filter);
			expect(roleRepository.getAll).toHaveBeenCalledWith(filter, null);
		});
	});

	describe('create', () => {
		it('should create role with valid permissions', async () => {
			contextService.getTenantId.mockReturnValue('tenant-1');
			const dto = new CreateRoleDto();
			dto.name = 'admin';
			dto.description = 'desc';
			dto.permissions = ['roles:create', 'roles:read'];

			roleRepository.getByName.mockResolvedValueOnce(null);
			jest.spyOn(Role.prototype, 'validatePermissions').mockReturnValue(true);
			roleRepository.create.mockResolvedValueOnce(new Role());

			await expect(service.create(dto)).resolves.not.toThrow();
			expect(roleRepository.create).toHaveBeenCalled();
		});

		it('should throw BadRequestException on superadmin name', async () => {
			contextService.getTenantId.mockReturnValue('tenant-1');
			const dto = new CreateRoleDto();
			dto.name = 'superadmin';
			dto.description = 'desc';
			dto.permissions = ['roles:create'];

			await expect(service.create(dto)).rejects.toThrow(BadRequestException);
		});

		it('should throw BadRequestException on invalid permissions', async () => {
			contextService.getTenantId.mockReturnValue('tenant-1');
			const dto = new CreateRoleDto();
			dto.name = 'admin';
			dto.description = 'desc';
			dto.permissions = ['invalid:perm'];

			roleRepository.getByName.mockResolvedValueOnce(null);
			jest.spyOn(Role.prototype, 'validatePermissions').mockReturnValue(false);

			await expect(service.create(dto)).rejects.toThrow(BadRequestException);
		});
	});

	describe('update', () => {
		it('should update role with valid data', async () => {
			contextService.getTenantId.mockReturnValue('tenant-1');
			const role = new Role();
			role.id = 'role-id';
			role.tenantId = 'tenant-1';
			role.name = 'admin';
			jest.spyOn(Role.prototype, 'validatePermissions').mockReturnValue(true);

			roleRepository.getById.mockResolvedValueOnce(role);
			roleRepository.update.mockResolvedValueOnce(undefined);

			await expect(service.update('role-id', { name: 'Updated' })).resolves.not.toThrow();
			expect(roleRepository.update).toHaveBeenCalled();
		});

		it('should throw ForbiddenException if tenant mismatch', async () => {
			contextService.getTenantId.mockReturnValue('tenant-1');
			const role = new Role();
			role.id = 'role-id';
			role.tenantId = 'tenant-2';
			roleRepository.getById.mockResolvedValueOnce(role);

			await expect(service.update('role-id', { name: 'Updated' })).rejects.toThrow(
				ForbiddenException,
			);
		});

		it('should throw BadRequestException if updating superadmin', async () => {
			contextService.getTenantId.mockReturnValue('tenant-1');
			const role = new Role();
			role.id = 'role-id';
			role.tenantId = 'tenant-1';
			role.name = 'superadmin';
			roleRepository.getById.mockResolvedValueOnce(role);

			await expect(service.update('role-id', { name: 'Updated' })).rejects.toThrow(
				BadRequestException,
			);
		});

		it('should throw BadRequestException if permissions invalid', async () => {
			contextService.getTenantId.mockReturnValue('tenant-1');
			const role = new Role();
			role.id = 'role-id';
			role.tenantId = 'tenant-1';
			role.name = 'admin';
			roleRepository.getById.mockResolvedValueOnce(role);
			jest.spyOn(Role.prototype, 'validatePermissions').mockReturnValue(false);

			await expect(service.update('role-id', { permissions: ['invalid:perm'] })).rejects.toThrow(
				BadRequestException,
			);
		});
	});

	describe('delete', () => {
		it('should delete role when exists and not used', async () => {
			contextService.getTenantId.mockReturnValue('tenant-1');
			contextService.isSuperUser.mockReturnValue(false);
			const role = new Role();
			role.id = 'role-id';
			role.tenantId = 'tenant-1';
			roleRepository.getById.mockResolvedValueOnce(role);
			userRepository.getAllByRoleId.mockResolvedValueOnce([]);
			roleRepository.delete.mockResolvedValueOnce(undefined);

			await expect(service.delete('role-id')).resolves.not.toThrow();
			expect(roleRepository.delete).toHaveBeenCalledWith('role-id');
		});

		it('should throw BadRequestException if role used by user', async () => {
			contextService.getTenantId.mockReturnValue('tenant-1');
			contextService.isSuperUser.mockReturnValue(false);
			const role = new Role();
			role.id = 'role-id';
			role.tenantId = 'tenant-1';
			roleRepository.getById.mockResolvedValueOnce(role);
			userRepository.getAllByRoleId.mockResolvedValueOnce([new User(), new User()]);

			await expect(service.delete('role-id')).rejects.toThrow(BadRequestException);
		});

		it('should throw ForbiddenException if tenant mismatch', async () => {
			contextService.getTenantId.mockReturnValue('tenant-1');
			contextService.isSuperUser.mockReturnValue(false);
			const role = new Role();
			role.id = 'role-id';
			role.tenantId = 'tenant-2';
			roleRepository.getById.mockResolvedValueOnce(role);
			userRepository.getAllByRoleId.mockResolvedValueOnce([]);

			await expect(service.delete('role-id')).rejects.toThrow(ForbiddenException);
		});
	});
});
