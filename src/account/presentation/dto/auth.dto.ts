import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, Length, MinLength } from 'class-validator';

export class TokenPayloadDto {
	@ApiProperty({
		description: 'Refresh token to be invalidated',
		required: true,
	})
	@IsString()
	refreshToken: string;
}

export class RegisterDto {
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
	@MinLength(8)
	@IsString()
	password: string;

	@ApiProperty({
		description: 'Tenant name',
		example: 'Acme Corp Updated',
	})
	@IsString()
	@Length(1, 100)
	companyName: string;
}