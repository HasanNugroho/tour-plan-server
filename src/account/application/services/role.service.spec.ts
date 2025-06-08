import { TestBed, Mocked } from '@suites/unit';
import { BadRequestException, LoggerService, NotFoundException } from '@nestjs/common';
import { RoleService } from './role.service';
import { IRoleRepository } from '../../domain/repository/role.repository.interface';
import { Role } from '../../domain/role';
import { CreateRoleDto, UpdateRoleDto } from '../../presentation/dto/role.dto';
import { PaginationOptionsDto } from 'src/common/dtos/page-option.dto';
import { Order } from 'src/common/enums/order.enum';
import { RoleRepository } from 'src/account/infrastructure/presistence/role.repository';
import { ROLE_REPOSITORY } from 'src/common/constant';
import { Logger } from 'winston';

describe('RoleService', () => {
    let service: RoleService;
    let repository: Mocked<IRoleRepository>;

    beforeEach(async () => {
        const { unit, unitRef } = await TestBed.solitary(RoleService).compile();

        service = unit;
        repository = unitRef.get(ROLE_REPOSITORY);
    });

    describe('getById', () => {
        it('should return role when found', async () => {
            const role = new Role();
            role.name = 'admin';
            role.description = 'admin desc';
            role.access = JSON.stringify(["manage:system", "roles:create", "roles:read"]);

            repository.getById.mockResolvedValueOnce(role);

            const result = await service.getById('role-id');

            expect(result).toBe(role);
            expect(repository.getById).toHaveBeenCalledWith('role-id');
        });

        it('should throw NotFoundException if role not found', async () => {
            repository.getById.mockResolvedValueOnce(null);
            await expect(service.getById('missing-id')).rejects.toThrow(NotFoundException);
        });
    });

    describe('getAll', () => {
        it('should return paginated roles', async () => {
            const role = new Role();
            role.name = 'admin';
            role.description = 'desc';
            role.access = JSON.stringify(["roles:read"]);

            const filter = new PaginationOptionsDto();
            filter.page = 1;
            filter.limit = 10;
            filter.order = Order.ASC;
            filter.orderby = 'created_at';

            repository.getAll.mockResolvedValueOnce({ roles: [role], totalCount: 1 });

            const result = await service.getAll(filter);

            expect(result.roles).toHaveLength(1);
            expect(repository.getAll).toHaveBeenCalledWith(filter);
        });
    });

    describe('create', () => {
        it('should create role with valid permissions', async () => {
            const dto = new CreateRoleDto();
            dto.name = 'admin';
            dto.description = 'desc';
            dto.access = ['roles:create', 'roles:read'];

            repository.create.mockImplementation(async (role) => role);

            await expect(service.create(dto)).resolves.not.toThrow();
            expect(repository.create).toHaveBeenCalled();
        });

        it('should throw BadRequestException on invalid permission', async () => {
            const dto = new CreateRoleDto();
            dto.name = 'admin';
            dto.description = 'desc';
            dto.access = ['roles:slice']; // invalid

            await expect(service.create(dto)).rejects.toThrow(BadRequestException);
        });
    });

    describe('update', () => {
        it('should update role with valid data', async () => {
            const role = new Role();
            role.id = 'role-id';

            repository.getById.mockResolvedValueOnce(role);
            repository.update.mockResolvedValueOnce();

            await expect(service.update('role-id', { name: 'Updated' })).resolves.not.toThrow();
            expect(repository.update).toHaveBeenCalled();
        });

        it('should throw if permission is invalid', async () => {
            const role = new Role();
            role.id = 'role-id';
            repository.getById.mockResolvedValueOnce(role);

            const updateDto = new UpdateRoleDto();
            updateDto.access = ['roles:slice']; // invalid

            await expect(service.update('role-id', updateDto)).rejects.toThrow(BadRequestException);
        });

        it('should throw NotFoundException if role missing', async () => {
            repository.getById.mockResolvedValueOnce(null);
            await expect(service.update('missing-id', {})).rejects.toThrow(NotFoundException);
        });
    });

    describe('delete', () => {
        it('should delete role when exists', async () => {
            const role = new Role();
            repository.getById.mockResolvedValueOnce(role);
            repository.delete.mockResolvedValueOnce();

            await expect(service.delete('role-id')).resolves.not.toThrow();
            expect(repository.delete).toHaveBeenCalledWith('role-id');
        });

        it('should throw NotFoundException when role does not exist', async () => {
            repository.getById.mockResolvedValueOnce(null);
            await expect(service.delete('missing-id')).rejects.toThrow(NotFoundException);
        });
    });
});
