import { IsEnum, IsOptional, IsString, IsUUID, IsEmail, Length, Matches } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PartnerCategory } from 'src/partner/domain/partner';

export class CreatePartnerDto {
	@ApiProperty({
		description: 'Name of the partner or vendor',
		example: 'PT. Wisata Bahagia',
	})
	@IsString()
	@Length(1, 255)
	name: string;

	@ApiProperty({
		description: 'Category of the partner',
		enum: PartnerCategory,
		example: PartnerCategory.TRANSPORTATION,
	})
	@IsEnum(PartnerCategory)
	category: PartnerCategory;

	@ApiProperty({
		description: 'Contact person for this partner',
		example: 'Budi Santoso',
		required: false,
	})
	@IsOptional()
	@IsString()
	@Length(1, 100)
	contactPerson?: string;

	@ApiProperty({
		description: 'Phone number of the partner',
		example: '+62 812-3456-7890',
		required: false,
	})
	@IsOptional()
	@IsString()
	@Length(5, 50)
	@Matches(/^[\d+()\s-]*$/, { message: 'Invalid phone number format' })
	phone?: string;

	@ApiProperty({
		description: 'Email address of the partner',
		example: 'info@wisatabahagia.co.id',
		required: false,
	})
	@IsOptional()
	@IsEmail()
	@Length(5, 100)
	email?: string;

	@ApiProperty({
		description: 'Physical address of the partner',
		example: 'Jl. Merdeka No. 123, Jakarta',
		required: false,
	})
	@IsOptional()
	@IsString()
	@Length(1, 255)
	address?: string;
}

export class UpdatePartnerDto {
	@ApiPropertyOptional({
		description: 'Name of the partner or vendor',
		example: 'PT. Wisata Bahagia',
	})
	@IsOptional()
	@IsString()
	@Length(1, 255)
	name?: string;

	@ApiPropertyOptional({
		description: 'Category of the partner',
		enum: PartnerCategory,
		example: PartnerCategory.TRANSPORTATION,
	})
	@IsOptional()
	@IsEnum(PartnerCategory)
	category?: PartnerCategory;

	@ApiPropertyOptional({
		description: 'Contact person for this partner',
		example: 'Budi Santoso',
	})
	@IsOptional()
	@IsString()
	@Length(1, 100)
	contactPerson?: string;

	@ApiPropertyOptional({
		description: 'Phone number of the partner',
		example: '+62 812-3456-7890',
	})
	@IsOptional()
	@IsString()
	@Length(5, 50)
	@Matches(/^[\d+()\s-]*$/, { message: 'Invalid phone number format' })
	phone?: string;

	@ApiPropertyOptional({
		description: 'Email address of the partner',
		example: 'info@wisatabahagia.co.id',
	})
	@IsOptional()
	@IsEmail()
	@Length(5, 100)
	email?: string;

	@ApiPropertyOptional({
		description: 'Physical address of the partner',
		example: 'Jl. Merdeka No. 123, Jakarta',
	})
	@IsOptional()
	@IsString()
	@Length(1, 255)
	address?: string;
}
