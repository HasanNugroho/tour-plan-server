import { ApiProperty, OmitType } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, IsUUID, MinLength } from 'class-validator';

export class CreateUserDto {
	@ApiProperty({
		description: 'Tenant ID (UUID)',
		example: '6d3164c9-b672-4ba8-8d9d-cb9aa53563ca',
	})
	@IsUUID('4')
	@IsOptional()
	tenantId?: string;

	@ApiProperty({
		description: 'user email',
		example: 'admin@user.com',
	})
	@IsEmail()
	email: string;

	@ApiProperty({
		description: 'Full name',
		example: 'admin',
	})
	@IsString()
	fullname: string;

	@ApiProperty({
		description: 'username',
		example: 'admin123',
	})
	@IsString()
	username: string;

	@ApiProperty({
		description: 'password',
		example: 'admin123',
	})
	@MinLength(6)
	@IsString()
	password: string;

	@ApiProperty({
		description: 'uuid',
	})
	@IsUUID('4')
	@IsOptional()
	role_id: string;
}

export class UpdateUserDto {
	@ApiProperty({
		description: 'user email',
		example: 'admin@user.com',
	})
	@IsEmail()
	@IsOptional()
	email?: string;

	@ApiProperty({
		description: 'Full name',
		example: 'admin',
	})
	@IsString()
	@IsOptional()
	fullname?: string;

	@ApiProperty({
		description: 'uuid',
	})
	@IsUUID('4')
	@IsOptional()
	role_id?: string;

	@ApiProperty({
		description: 'password',
		example: 'admin123',
	})
	@MinLength(6)
	@IsString()
	@IsOptional()
	password?: string;
}

export class SetupSuperUserDto extends OmitType(CreateUserDto, ['tenantId', 'role_id'] as const) {}
