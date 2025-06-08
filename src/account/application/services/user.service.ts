import { BadRequestException, ForbiddenException, Inject, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { IUserService } from '../../domain/service/user.service.interface';
import { IUserRepository } from "../../domain/repository/user.repository.interface";
import { ROLE_REPOSITORY, USER_REPOSITORY } from 'src/common/constant';
import { User } from "../../domain/user";
import { CreateUserDto, UpdateUserDto } from '../../presentation/dto/user.dto';
import { getContext } from 'src/common/context/request-context.service';
import { IRoleRepository } from 'src/account/domain/repository/role.repository.interface';

@Injectable()
export class UserService implements IUserService {
    constructor(
        @Inject(USER_REPOSITORY)
        private readonly userRepository: IUserRepository,

        @Inject(ROLE_REPOSITORY)
        private readonly roleRepository: IRoleRepository,
    ) { }

    // Method to get a user by ID
    async getById(id: string): Promise<User> {
        const { tenantId, isSuperUser } = getContext();

        const user = await this.userRepository.getById(id);
        if (!user) throw new NotFoundException(`User with ID ${id} not found`);

        if (!isSuperUser && user.tenantId !== tenantId) {
            throw new ForbiddenException('Access denied for tenant');
        }

        return user;
    }

    async getByEmail(email: string): Promise<User> {
        const { tenantId, isSuperUser } = getContext();

        const user = await this.userRepository.getByEmail(email);
        if (!user) throw new NotFoundException(`User with email ${email} not found`);

        if (!isSuperUser && user.tenantId !== tenantId) {
            throw new ForbiddenException('Access denied for tenant');
        }

        return user;
    }

    async getByUsername(username: string): Promise<User> {
        const { tenantId, isSuperUser } = getContext();

        const user = await this.userRepository.getByUsername(username);
        if (!user) throw new NotFoundException(`User with username ${username} not found`);

        if (!isSuperUser && user.tenantId !== tenantId) {
            throw new ForbiddenException('Access denied for tenant');
        }
        
        return user;
    }

    // Method to create a new user
    async create(payload: CreateUserDto): Promise<void> {
        const { tenantId: actorTenantId, isSuperUser, userId: actorId } = getContext();

        const role = await this.roleRepository.getById(payload.role_id);
        if (!role) throw new BadRequestException('Invalid role');

        const isSuperAdminRole = role.name.toLowerCase() === 'superadmin';

        // Superadmin-specific logic
        if (isSuperAdminRole) {
            if (!isSuperUser) {
                throw new UnauthorizedException('Only superadmin can create another superadmin');
            }

            if (payload.tenantId) {
                throw new BadRequestException('Superadmin cannot be associated with any tenant');
            }
        }

        // For non-superadmin roles, enforce tenantId
        const tenantId = isSuperAdminRole ? null : actorTenantId;

        // Validate uniqueness by email
        const userByEmail = await this.userRepository.getByEmail(payload.email);
        if (userByEmail && userByEmail.tenantId === tenantId) {
            throw new BadRequestException('Email is already in use in this tenant');
        }

        // Validate uniqueness by username
        const userByUsername = await this.userRepository.getByUsername(payload.username);
        if (userByUsername && userByUsername.tenantId === tenantId) {
            throw new BadRequestException('Username is already in use in this tenant');
        }

        // For non-superadmin actor, make sure role belongs to the same tenant
        if (!isSuperUser && role.tenantId !== actorTenantId) {
            throw new UnauthorizedException('Cannot assign role from another tenant');
        }

        const user = await new User().new(
            payload.fullname,
            payload.username,
            payload.email,
            payload.password,
            payload.role_id,
            tenantId
        );

        await this.userRepository.create(user);
    }


    async changeRole(userId: string, roleId: string): Promise<void> {
        const { tenantId, isSuperUser, userId: actorId } = getContext();

        const user = await this.userRepository.getById(userId);
        if (!user) {
            throw new NotFoundException(`User with ID ${userId} not found`);
        }

        if (!isSuperUser) {
            if (user.tenantId !== tenantId) {
                throw new ForbiddenException('You do not have permission to change role of users outside your tenant');
            }

            if (user.id === actorId) {
                throw new ForbiddenException('You cannot change your own role');
            }
        }

        const role = await this.roleRepository.getById(roleId);
        if (!role) {
            throw new BadRequestException('Role does not exist');
        }

        user.role_id = roleId;
        await this.userRepository.update(userId, user);
    }

    async toggleStatus(userId: string, isActive: boolean): Promise<void> {
        const { tenantId, isSuperUser, userId: actorId } = getContext();

        const user = await this.userRepository.getById(userId);
        if (!user) {
            throw new NotFoundException(`User with ID ${userId} not found`);
        }

        if (!isSuperUser) {
            if (user.tenantId !== tenantId) {
                throw new ForbiddenException('You do not have permission to change status of users outside your tenant');
            }

            if (user.id === actorId) {
                throw new ForbiddenException('You cannot change your own status');
            }
        }

        user.is_active = isActive;
        await this.userRepository.update(userId, user);
    }

    // Method to update an existing user's information
    async update(id: string, userData: UpdateUserDto): Promise<void> {
        const { tenantId, isSuperUser, userId: actorId } = getContext();

        const user = await this.userRepository.getById(id);
        if (!user) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }


        if (!isSuperUser && user.tenantId !== tenantId) {
            throw new ForbiddenException('You do not have permission to modify users outside your tenant');
        }

        if (userData.role_id) {
            const targetRole = await this.roleRepository.getById(userData.role_id);
            if (!targetRole) {
                throw new BadRequestException('Invalid role provided');
            }

            const isTargetRoleSuperAdmin = targetRole.name.toLowerCase() === 'superadmin';
            if (isTargetRoleSuperAdmin && !isSuperUser) {
                throw new ForbiddenException('Cannot assign SUPERADMIN role');
            }

            user.role_id = userData.role_id;
        }

        // Update the user fields
        user.fullname = userData.fullname ?? user.fullname;

        // If password is provided, validate and encrypt it
        if (userData.password) {
            await user.setPassword(userData.password);
        }

        if (userData.email) {
            const existingUser = await this.userRepository.getByEmail(userData.email);
            const isSameTenant = existingUser?.tenantId === user.tenantId;
            const isGlobalUser = existingUser?.tenantId === null;

            if (existingUser && existingUser.id !== id && (isSameTenant || isGlobalUser)) {
                throw new BadRequestException('Email is already in use by another user');
            }
            
            user.email = userData.email;
        }

        try {
            const updatedUser = await this.userRepository.update(id, user);
            if (!updatedUser) {
                throw new NotFoundException(`Failed to update user with ID ${id}`);
            }
            return
        } catch (error) {
            throw error
        }
    }

    // Method to delete a user by ID
    async delete(id: string): Promise<void> {
        const user = await this.userRepository.getById(id);
        if (!user) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }

        try {
            await this.userRepository.delete(id);
            return
        } catch (error) {
            throw error;
        }
    }
}