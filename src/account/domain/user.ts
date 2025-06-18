import {
	Entity,
	Column,
	PrimaryGeneratedColumn,
	Index,
	CreateDateColumn,
	UpdateDateColumn,
	ForeignKey,
} from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Role } from './role';
import { File } from 'src/storage/domain/file';

@Entity('users')
export class User {
	@PrimaryGeneratedColumn('uuid')
	@Index()
	id: string;

	@Index()
	@Column('uuid', { nullable: true })
	@ForeignKey('tenants')
	tenantId: string | null;

	@Column()
	fullname: string;

	@Index()
	@Column({ unique: true })
	username: string;

	@Index()
	@Column({ unique: true })
	email: string;

	@Column('text')
	password_hash: string;

	@Index()
	@Column({ type: 'uuid' })
	@ForeignKey('roles')
	role_id: string;
	role?: Role;

	@Column({ type: 'uuid', nullable: true })
	@ForeignKey('files')
	profilePhotoId: string | null;
	profilePhoto?: File | null | undefined

	@Column({ type: 'boolean', default: true })
	is_active: boolean;

	@CreateDateColumn()
	created_at: Date;

	@UpdateDateColumn()
	updated_at: Date;

	static async create(params: {
		fullname: string;
		username: string;
		email: string;
		password: string;
		role_id: string;
		tenantId?: string | null;
	}): Promise<User> {
		const user = new User();
		user.fullname = params.fullname;
		user.username = params.username;
		user.email = params.email;
		user.password_hash = await user.setPassword(params.password);
		user.role_id = params.role_id;
		user.tenantId = params.tenantId ?? null;
		user.is_active = true;
		return user;
	}

	async setPassword(plain: string): Promise<string> {
		this.password_hash = await bcrypt.hash(plain, 10);
		return this.password_hash;
	}

	async validatePasswordHash(password: string): Promise<boolean> {
		return await bcrypt.compare(password, this.password_hash);
	}

	toResponse() {
		const { password_hash, ...userData } = this;
		return userData;
	}
}
