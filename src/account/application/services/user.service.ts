import {
	BadRequestException,
	ForbiddenException,
	Inject,
	Injectable,
	NotFoundException,
	UnauthorizedException,
} from '@nestjs/common';
import { IUserService } from '../../domain/interface/user.service.interface';
import { IUserRepository } from '../../domain/interface/user.repository.interface';
import { IRoleRepository } from 'src/account/domain/interface/role.repository.interface';
import { ONE_DAY_MS, ONE_DAY_S, ROLE_REPOSITORY, STORAGE_SERVICE, USER_REPOSITORY } from 'src/common/constant';
import { User } from '../../domain/user';
import { CreateUserDto, UpdateUserDto } from '../../presentation/dto/user.dto';
import { RequestContextService } from 'src/common/context/request-context.service';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { plainToInstance } from 'class-transformer';
import { StorageServiceInterface } from 'src/storage/domain/interface/storage.service.interface';
import { FileStatus } from 'src/storage/domain/file';

@Injectable()
export class UserService implements IUserService {
	constructor(
		@Inject(USER_REPOSITORY)
		private readonly userRepository: IUserRepository,

		@Inject(ROLE_REPOSITORY)
		private readonly roleRepository: IRoleRepository,

		@Inject(CACHE_MANAGER)
		private cacheManager: Cache,

		@Inject(STORAGE_SERVICE)
		private readonly storageService: StorageServiceInterface,

		private readonly contextService: RequestContextService,
	) { }

	async getById(id: string): Promise<User> {
		const tenantId = this.contextService.getTenantId();
		const isSuperUser = this.contextService.isSuperUser();

		const user = await this.handleCache(id, () => this.userRepository.getById(id));
		if (!user) throw new NotFoundException(`User with ID ${id} not found`);

		if (!isSuperUser && user.tenantId !== tenantId) {
			throw new ForbiddenException('Access denied for tenant');
		}

		return user;
	}

	async getByEmail(email: string): Promise<User> {
		const tenantId = this.contextService.getTenantId();
		const isSuperUser = this.contextService.isSuperUser();

		const user = await this.userRepository.getByEmail(email);
		if (!user) throw new NotFoundException(`User with email ${email} not found`);
		if (!isSuperUser && user.tenantId !== tenantId) {
			throw new ForbiddenException('Access denied for tenant');
		}

		return user;
	}

	async getByUsername(username: string): Promise<User> {
		const tenantId = this.contextService.getTenantId();
		const isSuperUser = this.contextService.isSuperUser();

		const user = await this.userRepository.getByUsername(username);
		if (!user) throw new NotFoundException(`User with username ${username} not found`);
		if (!isSuperUser && user.tenantId !== tenantId) {
			throw new ForbiddenException('Access denied for tenant');
		}

		return user;
	}

	async create(payload: CreateUserDto): Promise<void> {
		const actorTenantId = this.contextService.getTenantId();
		const isSuperUser = this.contextService.isSuperUser();

		const role = await this.roleRepository.getById(payload.role_id);
		if (!role) throw new BadRequestException('Invalid role');

		const isSuperAdminRole = role.name.toLowerCase() === 'superadmin';

		if (isSuperAdminRole && !isSuperUser) {
			throw new UnauthorizedException('Only superadmin can create another superadmin');
		}

		if (!isSuperUser && role.tenantId !== actorTenantId) {
			throw new UnauthorizedException('Cannot assign role from another tenant');
		}

		const tenantId = isSuperAdminRole ? null : actorTenantId;

		const emailInUse = await this.userRepository.getByEmail(payload.email);
		if (emailInUse && emailInUse.tenantId === tenantId) {
			throw new BadRequestException('Email is already in use in this tenant');
		}

		const usernameInUse = await this.userRepository.getByUsername(payload.username);
		if (usernameInUse && usernameInUse.tenantId === tenantId) {
			throw new BadRequestException('Username is already in use in this tenant');
		}

		const user = await User.create({
			fullname: payload.fullname,
			username: payload.username,
			email: payload.email,
			password: payload.password,
			role_id: payload.role_id,
			tenantId,
		});

		await this.userRepository.create(user);
	}

	async changeRole(userId: string, roleId: string): Promise<void> {
		const tenantId = this.contextService.getTenantId();
		const isSuperUser = this.contextService.isSuperUser();
		const actorId = this.contextService.getUserId();

		const user = await this.userRepository.getById(userId);
		if (!user) throw new NotFoundException(`User with ID ${userId} not found`);

		if (user.id === actorId) {
			throw new ForbiddenException('You cannot change your own role');
		}

		if (!isSuperUser && user.tenantId !== tenantId) {
			throw new ForbiddenException('Cannot change role of user outside your tenant');
		}

		const role = await this.roleRepository.getById(roleId);
		if (!role) throw new BadRequestException('Role does not exist');

		user.role_id = roleId;
		await this.userRepository.update(userId, user);
	}

	async toggleStatus(userId: string, isActive: boolean): Promise<void> {
		const tenantId = this.contextService.getTenantId();
		const isSuperUser = this.contextService.isSuperUser();
		const actorId = this.contextService.getUserId();

		const user = await this.userRepository.getById(userId);
		if (!user) throw new NotFoundException(`User with ID ${userId} not found`);
		if (user.id === actorId) throw new ForbiddenException('Cannot change your own status');
		if (!isSuperUser && user.tenantId !== tenantId) {
			throw new ForbiddenException('Access denied for tenant');
		}

		user.is_active = isActive;
		await this.userRepository.update(userId, user);
	}

	async update(id: string, data: UpdateUserDto): Promise<void> {
		const tenantId = this.contextService.getTenantId();
		const isSuperUser = this.contextService.isSuperUser();

		const user = await this.userRepository.getById(id);
		if (!user) throw new NotFoundException(`User with ID ${id} not found`);
		if (!isSuperUser && user.tenantId !== tenantId) {
			throw new ForbiddenException('Access denied for tenant');
		}

		if (data.role_id) {
			const role = await this.roleRepository.getById(data.role_id);
			if (!role) throw new BadRequestException('Invalid role');

			if (role.name.toLowerCase() === 'superadmin' && !isSuperUser) {
				throw new ForbiddenException('Cannot assign superadmin role');
			}

			if (!isSuperUser && role.tenantId !== user.tenantId) {
				throw new ForbiddenException('Cannot assign role from another tenant');
			}

			user.role_id = data.role_id;
		}

		user.fullname = data.fullname ?? user.fullname;

		if (data.profilePhotoId) {
			const file = await this.storageService.getById(data.profilePhotoId);
			if (!file) {
				throw new BadRequestException('File not valid');
			}
			await this.storageService.updateStatus(FileStatus.COMPLETED);
			user.profilePhotoId = data.profilePhotoId;
		}

		if (data.password) {
			throw new ForbiddenException('Forbidden to change password');
			// await user.setPassword(data.password);
		}

		if (data.email) {
			const existing = await this.userRepository.getByEmail(data.email);
			const sameTenant = existing?.tenantId === user.tenantId;
			const isOtherUser = existing && existing.id !== user.id;

			if (isOtherUser && (sameTenant || existing?.tenantId === null)) {
				throw new BadRequestException('Email is already in use');
			}

			user.email = data.email;
		}

		await this.userRepository.update(id, user);

		if (user.profilePhotoId) {
			user.profilePhoto = await this.storageService.getById(user.profilePhotoId, ONE_DAY_S)
		}

		const key = `user:${user.id}`;
		await this.cacheManager.del(key)
		await this.cacheManager.set(key, user, ONE_DAY_MS);
	}

	async delete(id: string): Promise<void> {
		const tenantId = this.contextService.getTenantId();
		const isSuperUser = this.contextService.isSuperUser();
		const actorId = this.contextService.getUserId();

		const user = await this.userRepository.getById(id);
		if (!user) throw new NotFoundException(`User with ID ${id} not found`);
		if (user.id === actorId && isSuperUser) {
			throw new ForbiddenException('Superuser cannot delete themselves');
		}

		if (!isSuperUser && user.tenantId !== tenantId) {
			throw new ForbiddenException('Access denied for tenant');
		}

		await this.userRepository.delete(id);

		const key = `user:${user.id}`;
		await this.cacheManager.del(key)
	}

	async setupSuperUser(payload: Omit<CreateUserDto, 'tenantId' | 'role_id'>): Promise<void> {
		const exists = await this.userRepository.getSuperUser();
		if (exists) {
			throw new BadRequestException('Superuser already exists');
		}

		const role = await this.roleRepository.getByName('superadmin');
		if (!role) {
			throw new BadRequestException('Superadmin role not found');
		}

		const superUser = await User.create({
			fullname: payload.fullname,
			username: payload.username,
			email: payload.email,
			password: payload.password,
			role_id: role.id,
		});

		await this.userRepository.create(superUser);
	}

	private async handleCache(id: string, fetchUser: () => Promise<User | null>): Promise<User | null> {
		const key = `user:${id}`;
		const cached = await this.cacheManager.get<User | null>(key);
		if (cached) return plainToInstance(User, cached);

		const user = await fetchUser();
		if (user) {
			if (user.profilePhotoId) {
				user.profilePhoto = await this.storageService.getById(user.profilePhotoId, ONE_DAY_S)
			}
			await this.cacheManager.set(key, user, ONE_DAY_MS);
		}
		return user;
	}
}
