import { CreateTenantDto, UpdateTenantDto } from '../dto/tenant.dto';
import { Tenant } from '../tenant';
import { TenantFilterOptionDto } from 'src/tenant/presentation/dto/tenant-filter.dto';

export interface ITenantService {
	/**
	 * Retrieves a tenant by its unique identifier.
	 * @param id - The unique identifier of the tenant.
	 * @returns A promise that resolves to the tenant with the specified ID.
	 */
	getById(id: string): Promise<Tenant>;

	/**
	 * Retrieves a tenant by its unique code.
	 * @param code - The unique code of the tenant.
	 * @returns A promise that resolves to the tenant with the specified code.
	 */
	getByCode(code: string): Promise<Tenant>;

	/**
	 * Retrieves all tenants.
	 * @param pagination - Pagination options to control the number of results and offset.
	 * @returns A promise that resolves to an array of all tenants.
	 */
	getAll(pagination: TenantFilterOptionDto): Promise<{ data: Tenant[]; total: number }>;

	/**
	 * Creates a new tenant.
	 * @param payload - The data required to create a new tenant.
	 * @returns A promise that resolves to the newly created tenant.
	 */
	create(payload: CreateTenantDto): Promise<Tenant>;

	/**
	 * Updates an existing tenant.
	 * @param id - The unique identifier of the tenant to update.
	 * @param payload - The data to update the tenant with.
	 * @returns A promise that resolves to the updated tenant.
	 */
	update(id: string, payload: UpdateTenantDto): Promise<void>;

	/**
	 * Deletes a tenant by its unique identifier.
	 * @param id - The unique identifier of the tenant to delete.
	 * @returns A promise that resolves when the tenant has been deleted.
	 */
	delete(id: string): Promise<void>;
}
