import { Role } from 'src/account/domain/role';

export interface IUser {
	id: string;
	name: string;
	fullname: string;
	email: string;
	role: Role;
	createdAt: Date;
	updated_at: Date;

	password?: string;
}
