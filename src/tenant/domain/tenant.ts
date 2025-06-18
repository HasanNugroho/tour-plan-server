import { File } from 'src/storage/domain/file';
import {
	Entity,
	Column,
	PrimaryGeneratedColumn,
	CreateDateColumn,
	UpdateDateColumn,
	Index,
	ForeignKey,
} from 'typeorm';

@Entity('tenants')
export class Tenant {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Column({ length: 100 })
	name: string;

	@Index()
	@Column({ unique: true })
	code: string;

	@Column({ type: 'text', nullable: true })
	description?: string;

	@Column({ type: 'text', nullable: true })
	address?: string;

	@Column({ type: 'text', nullable: true })
	contact_info?: string;

	@Index()
	@Column({ default: true })
	is_active: boolean;

	@Column({ type: 'uuid', nullable: true })
	@ForeignKey('files')
	logoId?: string;
	logo?: File

	@CreateDateColumn({ type: 'timestamp' })
	createdAt: Date;

	@UpdateDateColumn({ type: 'timestamp' })
	updated_at: Date;

	static create(params: Partial<Tenant>): Tenant {
		const tenant = new Tenant();
		Object.assign(tenant, params);
		return tenant;
	}

	updateInfo(
		name: string,
		description?: string,
		address?: string,
		contact_info?: string,
		logoId?: string
	) {
		this.name = name;
		this.description = description;
		this.address = address;
		this.contact_info = contact_info;
		this.logoId = logoId;
	}

	deactivate() {
		this.is_active = false;
		this.updated_at = new Date();
	}

	activate() {
		this.is_active = true;
		this.updated_at = new Date();
	}
}
