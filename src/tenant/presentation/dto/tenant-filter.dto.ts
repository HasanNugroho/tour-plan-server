import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';
import { ToBoolean } from 'src/common/decorators/to-boolean.decorator';
import { PaginationOptionsDto } from 'src/common/dtos/page-option.dto';

/**
 * DTO for filtering and paginating Partner queries
 */
export class TenantFilterOptionDto extends PaginationOptionsDto {
    @ApiPropertyOptional({
        description: `Filter by active status:
    - true = show only active tenant
    - false = show only inactive tenant
    - (empty) = show all`,
        type: Boolean,
    })
    @IsOptional()
    @IsBoolean()
    @ToBoolean()
    isActive?: boolean;
}
