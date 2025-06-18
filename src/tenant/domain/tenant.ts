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

	@Column({ name: 'name', length: 100 })
	name: string;

	@Index()
	@Column({ name: 'code', unique: true })
	code: string;

	@Column({ name: 'description', type: 'text', nullable: true })
	description?: string;

	@Column({ name: 'address', type: 'text', nullable: true })
	address?: string;

	@Column({ name: 'contact_info', type: 'text', nullable: true })
	contactInfo?: string;

	@Index()
	@Column({ name: 'is_active', default: true })
	isActive: boolean;

	@Column({ name: 'logo_id', type: 'uuid', nullable: true })
	@ForeignKey('files')
	logoId?: string;
	logo?: File;

	@CreateDateColumn({ name: 'created_at', type: 'timestamp' })
	createdAt: Date;

	@UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
	updatedAt: Date;

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
		logoId?: string,
	): this {
		this.name = name;
		this.description = description;
		this.address = address;
		this.contactInfo = contact_info;
		this.logoId = logoId;
		return this;
	}

	deactivate() {
		this.isActive = false;
	}

	activate() {
		this.isActive = true;
	}
}
