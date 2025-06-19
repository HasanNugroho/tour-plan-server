import { Partner } from '../partner';
import { PartnerFilterOptionDto } from 'src/partner/presentation/dto/partner-filter.dto';

/**
 * Repository interface for managing Partner entities in the database
 */
export interface IPartnerRepository {
	/**
	 * Retrieves a paginated list of Partners for a given tenant
	 * @param tenantId UUID of the tenant
	 * @param pagination Pagination options (page, limit, sorting)
	 * @returns An object containing the list of Partners and total count
	 */
	getAll(
		tenantId: string,
		pagination: PartnerFilterOptionDto,
	): Promise<{ data: Partner[]; total: number }>;

	/**
	 * Retrieves a Partner by its unique ID
	 * @param id UUID of the Partner
	 * @returns The Partner entity if found
	 */
	getById(id: string): Promise<Partner | null>;

	/**
	 * Creates a new Partner entity
	 * @param partner Partner entity to be created
	 * @returns The created Partner
	 */
	create(partner: Partner): Promise<Partner>;

	/**
	 * Updates an existing Partner by its ID
	 * @param updateData Updated Partner data
	 */
	update(updateData: Partner): Promise<void>;

	/**
	 * Deletes a Partner by its ID
	 * @param id UUID of the Partner to delete
	 */
	delete(id: string): Promise<void>;
}
