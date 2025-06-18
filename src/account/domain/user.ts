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
	@Column('uuid', { name: 'tenant_id', nullable: true })
	@ForeignKey('tenants')
	tenantId?: string;

	@Column({ name: 'fullname' })
	fullName: string;

	@Index()
	@Column({ name: 'username', unique: true })
	username: string;

	@Index()
	@Column({ name: 'email', unique: true })
	email: string;

	@Column('text', { name: 'password_hash' })
	passwordHash: string;

	@Index()
	@Column('uuid', { name: 'role_id' })
	@ForeignKey('roles')
	roleId: string;
	role?: Role;

	@Column('uuid', { name: 'profile_photo_id', nullable: true })
	@ForeignKey('files')
	profilePhotoId?: string;
	profilePhoto?: File;

	@Column({ name: 'is_active', type: 'boolean', default: true })
	isActive: boolean;

	@CreateDateColumn({ name: 'created_at' })
	createdAt: Date;

	@UpdateDateColumn({ name: 'updated_at' })
	updatedAt: Date;

	static async create(params: {
		fullName: string;
		username: string;
		email: string;
		password: string;
		roleId: string;
		tenantId?: string;
	}): Promise<User> {
		const user = new User();
		user.fullName = params.fullName;
		user.username = params.username;
		user.email = params.email;
		user.passwordHash = await user.setPassword(params.password);
		user.roleId = params.roleId;
		user.tenantId = params.tenantId;
		user.isActive = true;
		return user;
	}

	async setPassword(plain: string): Promise<string> {
		this.passwordHash = await bcrypt.hash(plain, 10);
		return this.passwordHash;
	}

	async validatePasswordHash(password: string): Promise<boolean> {
		return await bcrypt.compare(password, this.passwordHash);
	}

	toResponse() {
		const { passwordHash, ...userData } = this;
		return userData;
	}
}
