import { Tenant } from '../tenant';
import { TenantFilterOptionDto } from 'src/tenant/presentation/dto/tenant-filter.dto';

export interface ITenantRepository {
	/**
	 * gets a tenant by its unique identifier.
	 * @param id - The unique identifier of the tenant.
	 * @returns A promise that resolves to the tenant if found, or null otherwise.
	 */
	getById(id: string): Promise<Tenant | null>;

	/**
	 * gets a tenant by its unique code.
	 * @param code - The unique code of the tenant.
	 * @returns A promise that resolves to the tenant if found, or null otherwise.
	 */
	getByCode(code: string): Promise<Tenant | null>;

	/**
	 * Retrieves all tenants.
	 * @param pagination - Pagination options to control the number of results and offset.
	 * @returns A promise that resolves to an array of tenants.
	 */
	getAll(pagination: TenantFilterOptionDto): Promise<{ data: Tenant[]; total: number }>;

	/**
	 * Creates a new tenant.
	 * @param tenant - The tenant entity to create.
	 * @returns A promise that resolves to the created tenant.
	 */
	create(tenant: Tenant): Promise<Tenant>;

	/**
	 * Updates an existing tenant.
	 * @param id - The unique identifier of the tenant to update.
	 * @param tenant - The tenant entity with updated data.
	 * @returns A promise that void
	 */
	update(id: string, tenant: Tenant): Promise<void>;

	/**
	 * Deletes a tenant by its unique identifier.
	 * @param id - The unique identifier of the tenant to delete.
	 * @returns A promise that resolves when the tenant is deleted.
	 */
	delete(id: string): Promise<void>;
}
