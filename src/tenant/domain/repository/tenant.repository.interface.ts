import { PaginationOptionsDto } from 'src/common/dtos/page-option.dto';
import { Tenant } from '../tenant';

export interface ITenantRepository {
    /**
 * Finds a tenant by its unique identifier.
 * @param id - The unique identifier of the tenant.
 * @returns A promise that resolves to the tenant if found, or null otherwise.
 */
    findById(id: string): Promise<Tenant | null>;

    /**
     * Finds a tenant by its unique code.
     * @param code - The unique code of the tenant.
     * @returns A promise that resolves to the tenant if found, or null otherwise.
     */
    findByCode(code: string): Promise<Tenant | null>;

    /**
     * Retrieves all tenants.
     * @param pagination - Pagination options to control the number of results and offset.
     * @returns A promise that resolves to an array of tenants.
     */
    findAll(pagination: PaginationOptionsDto): Promise<{ data: Tenant[]; total: number }>;

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
     * @returns A promise that resolves to the updated tenant.
     */
    update(id: string, tenant: Tenant): Promise<Tenant>;

    /**
     * Deletes a tenant by its unique identifier.
     * @param id - The unique identifier of the tenant to delete.
     * @returns A promise that resolves when the tenant is deleted.
     */
    delete(id: string): Promise<void>;
}
