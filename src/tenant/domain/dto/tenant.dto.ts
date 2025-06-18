import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, IsUUID, Length } from 'class-validator';

export class CreateTenantDto {
	@ApiProperty({
		description: 'Tenant name',
		example: 'Acme Corp',
	})
	@IsString()
	@Length(1, 100)
	name: string;

	@ApiProperty({
		description: 'Tenant description',
		example: 'A company that provides cloud services',
		required: false,
	})
	@IsOptional()
	@IsString()
	description?: string;

	@ApiProperty({
		description: 'Tenant address',
		example: '123 Cloud Street',
		required: false,
	})
	@IsOptional()
	@IsString()
	address?: string;

	@ApiProperty({
		description: 'Contact info',
		example: 'support@acme.com',
		required: false,
	})
	@IsOptional()
	@IsString()
	contact_info?: string;

	@ApiProperty({
		description: 'file id of tenant logo',
	})
	@IsOptional()
	@IsUUID('4')
	logoId?: string;
}

export class UpdateTenantDto {
	@ApiProperty({
		description: 'Tenant name',
		example: 'Acme Corp Updated',
		required: false,
	})
	@IsOptional()
	@IsString()
	@Length(1, 100)
	name?: string;

	@ApiProperty({
		description: 'Tenant description',
		example: 'Updated company description',
		required: false,
	})
	@IsOptional()
	@IsString()
	description?: string;

	@ApiProperty({
		description: 'Tenant address',
		example: '456 New Cloud Street',
		required: false,
	})
	@IsOptional()
	@IsString()
	address?: string;

	@ApiProperty({
		description: 'Contact info',
		example: 'new-contact@acme.com',
		required: false,
	})
	@IsOptional()
	@IsString()
	contact_info?: string;

	@ApiProperty({
		description: 'Status whether tenant is active',
		example: true,
		required: false,
	})
	@IsOptional()
	@IsBoolean()
	is_active?: boolean;

	@ApiProperty({
		description: 'file id of tenant logo',
	})
	@IsOptional()
	@IsUUID('4')
	logoId?: string;
}
