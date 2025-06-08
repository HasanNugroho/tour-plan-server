import { PaginationOptionsDto } from "src/common/dtos/page-option.dto";
import { Role } from "../role";  // Pastikan Role adalah entity yang sesuai
import { CreateRoleDto, UpdateRoleDto } from "src/account/presentation/dto/role.dto";

/**
 * Interface for the Role service
 * Provides methods for handling role-related operations.
 */
export interface IRoleService {
    /**
     * Fetch a role by its unique ID.
     * @param id - The ID of the role to retrieve.
     * @returns A promise that resolves to the role object.
     * @throws NotFoundException if the role is not found.
     */
    getById(id: string): Promise<Role>;

    /**
     * Fetch all roles with a pagination filter.
     * @param filter - The pagination filter.
     * @returns A promise that resolves to the list of roles and the total count.
     */
    getAll(filter: PaginationOptionsDto): Promise<{ roles: Role[], totalCount: number }>;

    /**
     * Create a new role.
     * @param roleData - The data of the role to create.
     * @returns role.
     * @throws ConflictException if the role name already exists.
     */
    create(roleData: CreateRoleDto): Promise<void>;

    /**
     * Update an existing role's details.
     * @param id - The ID of the role to update.
     * @param roleData - The new data to update the role with.
     * @returns A promise that resolves when the role has been updated.
     * @throws NotFoundException if the role is not found.
     */
    update(id: string, roleData: UpdateRoleDto): Promise<void>;

    /**
     * Delete a role by its ID.
     * @param id - The ID of the role to delete.
     * @returns A promise that resolves when the role has been deleted.
     * @throws NotFoundException if the role is not found.
     */
    delete(id: string): Promise<void>;
}
