import { PaginationOptionsDto } from 'src/common/dtos/page-option.dto';
import { Role } from '../role';

export interface IRoleRepository {
	/**
	 * Creates a new role in the system.
	 *
	 * @param role - The role object to create.
	 *
	 * @returns A promise that resolves when the role is created successfully.
	 */
	create(role: Role): Promise<Role>;

	/**
	 * Creates a new role in the system.
	 *
	 * @param role - The role object to create.
	 *
	 * @returns A promise that resolves when the role is created successfully.
	 */
	createMany(role: Role[]): Promise<Role[]>;

	/**
	 * gets a role by its ID.
	 *
	 * @param id - The ID of the role to get.
	 *
	 * @returns A promise that resolves to the role with the given ID, or null if not found.
	 */
	getById(id: string): Promise<Role | null>;

	/**
	 * gets a role by its Name.
	 *
	 * @param name - The Name of the role to get.
	 *
	 * @returns A promise that resolves to the role with the given ID, or null if not found.
	 */
	getByName(name: string): Promise<Role | null>;

	/**
	 * gets multiple roles by their IDs.
	 *
	 * @param ids - An array of role IDs to get.
	 *
	 * @returns A promise that resolves to an array of roles with the given IDs, or null if not found.
	 */
	getManyById(ids: string[]): Promise<Role[] | null>;

	/**
	 * gets all roles with a pagination filter.
	 *
	 * @param filter - The pagination filter to apply (including page number, page size, etc.).
	 *
	 * @returns A promise that resolves to an object containing the roles and total count of roles.
	 */
	getAll(
		filter: PaginationOptionsDto,
		tenantId: string | null,
	): Promise<{ roles: Role[]; totalCount: number }>;

	/**
	 * Updates an existing role by its ID.
	 *
	 * @param id - The ID of the role to update.
	 * @param role - The updated role data.
	 *
	 * @returns A promise that resolves when the role is updated successfully.
	 */
	update(id: string, role: Role): Promise<void>;

	/**
	 * Deletes a role by its ID.
	 *
	 * @param id - The ID of the role to delete.
	 *
	 * @returns A promise that resolves when the role is deleted successfully.
	 */
	delete(id: string): Promise<void>;
}
