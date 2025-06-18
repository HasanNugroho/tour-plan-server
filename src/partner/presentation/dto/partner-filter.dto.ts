import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsOptional } from 'class-validator';
import { ToBoolean } from 'src/common/decorators/to-boolean.decorator';
import { PaginationOptionsDto } from 'src/common/dtos/page-option.dto';
import { PartnerCategory } from 'src/partner/domain/partner';

/**
 * DTO for filtering and paginating Partner queries
 */
export class PartnerFilterOptionDto extends PaginationOptionsDto {
	@ApiPropertyOptional({
		description: 'Filter by partner category',
		enum: PartnerCategory,
		example: PartnerCategory.ACCOMMODATION,
	})
	@IsOptional()
	@IsEnum(PartnerCategory)
	category?: PartnerCategory;

	@ApiPropertyOptional({
		description: `Filter by active status:
    - true = show only active partners
    - false = show only inactive partners
    - (empty) = show all`,
		type: Boolean,
	})
	@IsOptional()
	@IsBoolean()
	@ToBoolean()
	is_active?: boolean;
}
