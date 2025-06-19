import { Partner } from '../partner';
import { CreatePartnerDto, UpdatePartnerDto } from 'src/partner/presentation/dto/partner.dto';
import { PartnerFilterOptionDto } from 'src/partner/presentation/dto/partner-filter.dto';

/**
 * Service interface for business logic related to Partners
 */
export interface IPartnerService {
	/**
	 * Retrieves a paginated list of Partners for the specified tenant
	 * @param pagination Pagination parameters (page, limit, etc.)
	 * @returns An object containing the Partner data array and total count
	 */
	getAll(pagination: PartnerFilterOptionDto): Promise<{ data: Partner[]; total: number }>;

	/**
	 * Retrieves a Partner by its unique ID
	 * @param id UUID of the Partner
	 * @returns The found Partner or throws if not found
	 */
	getById(id: string): Promise<Partner>;

	/**
	 * Creates a new Partner with the given payload
	 * @param payload DTO containing the Partner details
	 * @returns The created Partner entity
	 */
	create(payload: CreatePartnerDto): Promise<Partner>;

	/**
	 * Updates an existing Partner with partial payload
	 * @param id UUID of the Partner to update
	 * @param payload DTO with the fields to update
	 */
	update(id: string, payload: UpdatePartnerDto): Promise<void>;

	/**
	 * Deletes a Partner by its ID
	 * @param id UUID of the Partner
	 */
	delete(id: string): Promise<void>;
}
