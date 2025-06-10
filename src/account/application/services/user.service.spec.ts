import { UserService } from './user.service';
import {
	BadRequestException,
	ForbiddenException,
	UnauthorizedException,
} from '@nestjs/common';
import { USER_REPOSITORY, ROLE_REPOSITORY } from 'src/common/constant';
import { User } from 'src/account/domain/user';
import { TestBed } from '@suites/unit';
import { IUserRepository } from 'src/account/domain/repository/user.repository.interface';
import { IRoleRepository } from 'src/account/domain/repository/role.repository.interface';
import { CreateUserDto } from 'src/account/presentation/dto/user.dto';

// Mock getContext
jest.mock('src/common/context/request-context.service', () => ({
	getContext: jest.fn(),
}));

import { getContext } from 'src/common/context/request-context.service';
import { Role } from 'src/account/domain/role';

describe('UserService', () => {
	let service: UserService;
	let userRepository: jest.Mocked<IUserRepository>;
	let roleRepository: jest.Mocked<IRoleRepository>;

	beforeEach(async () => {
		const { unit, unitRef } = await TestBed.solitary(UserService).compile();

		service = unit;
		userRepository = unitRef.get(USER_REPOSITORY);
		roleRepository = unitRef.get(ROLE_REPOSITORY);

		jest.clearAllMocks();
	});

	describe('create', () => {
		const dto: CreateUserDto = {
			username: 'newuser',
			email: 'new@example.com',
			fullname: 'New Full',
			password: 'password123',
			role_id: 'role_id',
		};

		it('should create a new tenant-bound user when context is valid', async () => {
			(getContext as jest.Mock).mockReturnValue({
				tenantId: 'tenant1',
				isSuperUser: false,
				userId: 'actor1',
			});

			const role = new Role().new('admin', 'desc', ['permission:a'], 'tenant1');
			roleRepository.getById.mockResolvedValue(role);
			userRepository.getByEmail.mockResolvedValue(null);
			userRepository.getByUsername.mockResolvedValue(null);
			userRepository.create.mockResolvedValue(new User());

			await service.create(dto);

			expect(userRepository.create).toHaveBeenCalled();
		});

		it('should throw UnauthorizedException if assigning role from another tenant', async () => {
			const role = new Role().new('admin', 'desc', ['permission:a'], 'other-tenant');
			(getContext as jest.Mock).mockReturnValue({
				tenantId: 'tenant1',
				isSuperUser: false,
				userId: 'actor1',
			});

			roleRepository.getById.mockResolvedValue(role);

			await expect(service.create(dto)).rejects.toThrow(UnauthorizedException);
		});

		it('should throw BadRequestException if creating duplicate email', async () => {
			const role = new Role().new('admin', 'desc', ['permission:a'], 'tenant1');
			const existingUser = new User();
			existingUser.tenantId = 'tenant1';
			(getContext as jest.Mock).mockReturnValue({
				tenantId: 'tenant1',
				isSuperUser: false,
				userId: 'actor1',
			});

			roleRepository.getById.mockResolvedValue(role);
			userRepository.getByEmail.mockResolvedValue(existingUser);

			await expect(service.create(dto)).rejects.toThrow(BadRequestException);
		});

		it('should throw BadRequestException if creating duplicate username', async () => {
			const role = new Role().new('admin', 'desc', ['permission:a'], 'tenant1');
			const existingUser = new User();
			existingUser.tenantId = 'tenant1';
			(getContext as jest.Mock).mockReturnValue({
				tenantId: 'tenant1',
				isSuperUser: false,
				userId: 'actor1',
			});

			roleRepository.getById.mockResolvedValue(role);
			userRepository.getByEmail.mockResolvedValue(null);
			userRepository.getByUsername.mockResolvedValue(existingUser);

			await expect(service.create(dto)).rejects.toThrow(BadRequestException);
		});

		it('should throw if non-superuser tries to create superadmin', async () => {
			const role = new Role().new('superadmin', 'desc', ['permission:a'], null);
			(getContext as jest.Mock).mockReturnValue({
				tenantId: 'tenant1',
				isSuperUser: false,
				userId: 'actor1',
			});

			roleRepository.getById.mockResolvedValue(role);

			await expect(service.create({ ...dto, role_id: role.id })).rejects.toThrow(
				UnauthorizedException,
			);
		});

		it('should throw if superadmin user is associated with tenant', async () => {
			const role = new Role().new('superadmin', 'desc', ['permission:a'], null);
			(getContext as jest.Mock).mockReturnValue({
				tenantId: 'any-tenant',
				isSuperUser: true,
				userId: 'actor1',
			});

			roleRepository.getById.mockResolvedValue(role);

			await expect(
				service.create({ ...dto, tenantId: 'some-tenant', role_id: role.id }),
			).rejects.toThrow(BadRequestException);
		});
	});

	describe('changeRole', () => {
		it('should change role if authorized', async () => {
			const user = new User();
			user.id = 'user1';
			user.tenantId = 'tenant1';

			const role = new Role().new('admin', 'desc', ['permission:a'], 'tenant1');

			(getContext as jest.Mock).mockReturnValue({
				tenantId: 'tenant1',
				isSuperUser: false,
				userId: 'actor1',
			});

			userRepository.getById.mockResolvedValue(user);
			roleRepository.getById.mockResolvedValue(role);

			await service.changeRole('user1', 'new-role');

			expect(userRepository.update).toHaveBeenCalledWith(
				'user1',
				expect.objectContaining({ role_id: 'new-role' }),
			);
		});

		it('should throw if trying to change own role', async () => {
			const user = new User();
			user.id = 'user1';
			user.tenantId = 'tenant1';

			(getContext as jest.Mock).mockReturnValue({
				tenantId: 'tenant1',
				isSuperUser: true,
				userId: 'user1',
			});

			userRepository.getById.mockResolvedValue(user);

			await expect(service.changeRole('user1', 'role')).rejects.toThrow(ForbiddenException);
		});
	});

	describe('toggleStatus', () => {
		it('should toggle status if authorized', async () => {
			const user = new User();
			user.id = 'user-id';
			user.tenantId = 'tenant1';

			(getContext as jest.Mock).mockReturnValue({
				tenantId: 'tenant1',
				isSuperUser: false,
				userId: 'actor-id',
			});

			userRepository.getById.mockResolvedValue(user);
			userRepository.update.mockResolvedValue(user);

			await service.toggleStatus('user-id', false);

			expect(userRepository.update).toHaveBeenCalled();
		});

		it('should throw if user tries to toggle own status', async () => {
			const user = new User();
			user.id = 'user-id';
			user.tenantId = 'tenant1';

			(getContext as jest.Mock).mockReturnValue({
				tenantId: 'tenant1',
				isSuperUser: true,
				userId: 'user-id',
			});

			userRepository.getById.mockResolvedValue(user);

			await expect(service.toggleStatus('user-id', false)).rejects.toThrow(ForbiddenException);
		});
	});

	describe('delete', () => {
		it('should delete another user within tenant', async () => {
			const user = new User();
			user.id = 'target-id';
			user.tenantId = 'tenant1';

			(getContext as jest.Mock).mockReturnValue({
				tenantId: 'tenant1',
				isSuperUser: false,
				userId: 'actor-id',
			});

			userRepository.getById.mockResolvedValue(user);
			userRepository.delete.mockResolvedValue(undefined);

			await service.delete('target-id');

			expect(userRepository.delete).toHaveBeenCalledWith('target-id');
		});

		it('should not allow superuser to delete themselves', async () => {
			const user = new User();
			user.id = 'actor-id';
			user.tenantId = null;

			(getContext as jest.Mock).mockReturnValue({
				tenantId: null,
				isSuperUser: true,
				userId: 'actor-id',
			});

			userRepository.getById.mockResolvedValue(user);

			await expect(service.delete('actor-id')).rejects.toThrow(ForbiddenException);
		});
	});

	describe('setupSuperUser', () => {
		it('should throw if superuser already exists', async () => {
			userRepository.getSuperUser.mockResolvedValue(new User());

			await expect(
				service.setupSuperUser({
					username: 'super',
					email: 'super@example.com',
					fullname: 'Super Admin',
					password: 'pwd',
					role_id: 'role',
				}),
			).rejects.toThrow(BadRequestException);
		});

		it('should create a superuser if not exists', async () => {
			userRepository.getSuperUser.mockResolvedValue(null);
			roleRepository.getByName.mockResolvedValue(new Role());
			userRepository.create.mockResolvedValue(new User());

			await service.setupSuperUser({
				username: 'super',
				email: 'super@example.com',
				fullname: 'Super Admin',
				password: 'pwd',
				role_id: 'role',
			});

			expect(userRepository.create).toHaveBeenCalled();
		});
	});
});
