import { UserService } from './user.service';
import {
    BadRequestException,
    InternalServerErrorException,
    NotFoundException,
} from '@nestjs/common';
import { TestBed, Mocked } from '@suites/unit';
import { USER_REPOSITORY } from 'src/common/constant';
import { User } from 'src/account/domain/user';
import { IUserRepository } from 'src/account/domain/repository/user.repository.interface';
import {
    CreateUserDto,
    UpdateUserDto,
} from 'src/account/presentation/dto/user.dto';

describe('UserService', () => {
    let service: UserService;
    let repository: Mocked<IUserRepository>;

    beforeEach(async () => {
        const { unit, unitRef } = await TestBed.solitary(UserService).compile();

        service = unit;
        repository = unitRef.get(USER_REPOSITORY);
    });

    describe('getById', () => {
        it('should return user when found by id', async () => {
            const user = new User();
            repository.getById.mockResolvedValueOnce(user);

            const result = await service.getById('user-id');

            expect(result).toBe(user);
            expect(repository.getById).toHaveBeenCalledWith('user-id');
        });

        it('should throw NotFoundException if not found', async () => {
            repository.getById.mockResolvedValueOnce(null);
            await expect(service.getById('missing')).rejects.toThrow(NotFoundException);
        });

        it('should throw InternalServerErrorException on repository failure', async () => {
            repository.getById.mockRejectedValueOnce(new InternalServerErrorException());
            await expect(service.getById('error')).rejects.toThrow(InternalServerErrorException);
        });
    });

    describe('getByEmail', () => {
        it('should return user when found', async () => {
            const user = new User();
            repository.getByEmail.mockResolvedValueOnce(user);

            const result = await service.getByEmail('test@example.com');

            expect(result).toBe(user);
            expect(repository.getByEmail).toHaveBeenCalledWith('test@example.com');
        });

        it('should throw NotFoundException if not found', async () => {
            repository.getByEmail.mockResolvedValueOnce(null);
            await expect(service.getByEmail('notfound@example.com')).rejects.toThrow(NotFoundException);
        });

        it('should throw InternalServerErrorException on error', async () => {
            repository.getByEmail.mockRejectedValueOnce(new InternalServerErrorException());
            await expect(service.getByEmail('fail@example.com')).rejects.toThrow(InternalServerErrorException);
        });
    });

    describe('getByUsername', () => {
        it('should return user when found', async () => {
            const user = new User();
            repository.getByUsername.mockResolvedValueOnce(user);

            const result = await service.getByUsername('user');

            expect(result).toBe(user);
            expect(repository.getByUsername).toHaveBeenCalledWith('user');
        });

        it('should throw NotFoundException if not found', async () => {
            repository.getByUsername.mockResolvedValueOnce(null);
            await expect(service.getByUsername('notfound')).rejects.toThrow(NotFoundException);
        });

        it('should throw InternalServerErrorException on error', async () => {
            repository.getByUsername.mockRejectedValueOnce(new InternalServerErrorException());
            await expect(service.getByUsername('fail')).rejects.toThrow(InternalServerErrorException);
        });
    });

    describe('create', () => {
        it('should create and return new user', async () => {
            const dto: CreateUserDto = {
                username: 'newuser',
                email: 'new@example.com',
                name: 'New',
                fullname: 'New Full',
                password: 'password123',
            };

            const saved = new User();
            saved.id = 'user-id';
            saved.email = dto.email;

            repository.getByEmail.mockResolvedValueOnce(null);
            repository.create.mockResolvedValueOnce(saved);

            const result = await service.create(dto);

            expect(result).toBeUndefined();
            expect(repository.getByEmail).toHaveBeenCalledWith(dto.email);
            expect(repository.create).toHaveBeenCalled();
        });

        it('should throw BadRequestException if email already exists', async () => {
            repository.getByEmail.mockResolvedValueOnce(new User());
            await expect(service.create({
                username: 'user',
                email: 'duplicate@example.com',
                name: 'dup',
                fullname: 'dup user',
                password: 'pwd',
            })).rejects.toThrow(BadRequestException);
        });
    });

    describe('update', () => {
        it('should update user when data is valid', async () => {
            const user = new User();
            user.id = 'id';
            user.email = 'user@example.com';
            user.chiper_text = 'oldpass';

            const dto: UpdateUserDto = {
                email: 'user@example.com',
                name: 'Updated Name',
                fullname: 'Updated Fullname',
                password: 'newpass',
            };

            repository.getById.mockResolvedValueOnce(user);
            repository.update.mockResolvedValueOnce(user);

            const result = await service.update('id', dto);

            expect(result).toBe(undefined);
            expect(repository.update).toHaveBeenCalled();
        });

        it('should allow email change if email is not taken', async () => {
            const user = new User();
            user.id = 'id';
            user.email = 'old@example.com';
            user.chiper_text = 'oldpass';

            const dto: UpdateUserDto = {
                email: 'new@example.com',
                name: 'Updated',
                fullname: 'Updated Fullname',
                password: 'pwd',
            };

            repository.getById.mockResolvedValueOnce(user);
            repository.getByEmail.mockResolvedValueOnce(null);
            repository.update.mockResolvedValueOnce(user);

            const result = await service.update('id', dto);

            expect(result).toBeUndefined();
            expect(repository.getByEmail).toHaveBeenCalledWith('new@example.com');
        });

        it('should throw BadRequestException if updated email is taken', async () => {
            const currentUser = new User();
            currentUser.id = 'id';
            currentUser.email = 'old@example.com';
            currentUser.chiper_text = 'oldpass';

            const anotherUser = new User();
            anotherUser.id = 'other-id';
            anotherUser.email = 'new@example.com';

            const dto: UpdateUserDto = {
                email: 'new@example.com',
                name: 'Dup',
                fullname: 'Dup Full',
                password: 'pwd',
            };

            repository.getById.mockResolvedValueOnce(currentUser);
            repository.getByEmail.mockResolvedValueOnce(anotherUser);

            await expect(service.update('id', dto)).rejects.toThrow(BadRequestException);
        });
    });
});
