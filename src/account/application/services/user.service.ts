import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { IUserService } from '../../domain/service/user.service.interface';
import { IUserRepository } from "../../domain/repository/user.repository.interface";
import { USER_REPOSITORY } from 'src/common/constant';
import { User } from "../../domain/user";
import { CreateUserDto, UpdateUserDto } from '../../presentation/dto/user.dto';

@Injectable()
export class UserService implements IUserService {
    constructor(
        @Inject(USER_REPOSITORY)
        private readonly userRepository: IUserRepository,
    ) { }


    // Method to get a user by ID
    async getById(id: string): Promise<User> {
        const user = await this.userRepository.getById(id);
        if (!user) throw new NotFoundException(`User with ID ${id} not found`);
        return user;
    }

    async getByEmail(email: string): Promise<User> {
        const user = await this.userRepository.getByEmail(email);
        if (!user) throw new NotFoundException(`User with email ${email} not found`);
        return user;
    }

    async getByUsername(username: string): Promise<User> {
        const user = await this.userRepository.getByUsername(username);
        if (!user) throw new NotFoundException(`User with username ${username} not found`);
        return user;
    }

    // Method to create a new user
    async create(payload: CreateUserDto): Promise<void> {
        try {
            const existingUser = await this.userRepository.getByEmail(payload.email);
            if (existingUser) {
                throw new BadRequestException('Email is already in use');
            }

            const user = new User()
            user.email = payload.email;
            user.username = payload.username;
            user.fullname = payload.fullname;
            user.name = payload.name;
            await user.encryptPassword(payload.password);

            await this.userRepository.create(user);
            return
        } catch (error) {
            throw error
        }
    }

    // Method to update an existing user's information
    async update(id: string, userData: UpdateUserDto): Promise<void> {
        const user = await this.userRepository.getById(id);
        if (!user) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }

        // Update the user fields
        user.name = userData.name || user.name;
        user.fullname = userData.fullname || user.fullname;
        user.email = userData.email || user.email;

        // If password is provided, validate and encrypt it
        if (userData.password) {
            try {
                user.validatePasswordHash(userData.password);
                await user.encryptPassword(userData.password);
            } catch (error) {
                throw new BadRequestException('Invalid password format');
            }
        }

        if (userData.email) {
            const existingUser = await this.userRepository.getByEmail(userData.email);
            if (existingUser && existingUser.id !== id) {
                throw new BadRequestException('Email is already in use by another user');
            }
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