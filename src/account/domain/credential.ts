import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class Credential {
	@ApiProperty({
		description: 'username or email',
		required: true,
	})
	@IsString()
	identifier: string;

	@ApiProperty({
		description: 'password',
		required: true,
	})
	@IsString()
	password: string;

	isEmail(): boolean {
		const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
		return emailRegex.test(this.identifier);
	}
}

export class CredentialResponse {
	access_token: string;
	refresh_token: string;
	id: string;

	constructor(access_token: string, refresh_token: string, id: string) {
		this.access_token = access_token;
		this.refresh_token = refresh_token;
		this.id = id;
	}
}
