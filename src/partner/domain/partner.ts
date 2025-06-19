import { Tenant } from 'src/tenant/domain/tenant';
import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	ManyToOne,
	CreateDateColumn,
	UpdateDateColumn,
	JoinColumn,
	Index,
	ForeignKey,
} from 'typeorm';

export enum PartnerCategory {
	ACCOMMODATION = 'accommodation',
	TRANSPORTATION = 'transportation',
	MEALS = 'meals',
	OTHERS = 'others',
}

@Entity('partner')
export class Partner {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Index()
	@Column({ type: 'uuid' })
	@ForeignKey('tenants')
	tenantId: string;
	tenant: Tenant;

	@Index()
	@Column({ length: 255, name: 'name' })
	name: string;

	@Column({
		type: 'enum',
		enum: PartnerCategory,
		name: 'category',
	})
	category: PartnerCategory;

	@Column({ length: 100, nullable: true, name: 'contact_person' })
	contactPerson?: string;

	@Column({ length: 50, nullable: true, name: 'phone' })
	phone?: string;

	@Column({ length: 255, nullable: true, name: 'address' })
	address?: string;

	@Column({ length: 100, nullable: true, name: 'email' })
	email?: string;

	@Column({ default: true, name: 'is_active' })
	isActive: boolean;

	@CreateDateColumn({ name: 'created_at' })
	createdAt: Date;

	@UpdateDateColumn({ name: 'updated_at' })
	updatedAt: Date;

	static create(params: Partial<Partner>): Partner {
		const partner = new Partner();
		Object.assign(partner, params);
		return partner;
	}

	update(
		name: string,
		category: PartnerCategory,
		contactPerson?: string,
		phone?: string,
		address?: string,
		email?: string,
	): this {
		this.name = name;
		this.category = category;
		this.contactPerson = contactPerson;
		this.phone = phone;
		this.address = address;
		this.email = email;
		return this;
	}

	deactivate() {
		this.isActive = false;
	}

	activate() {
		this.isActive = true;
	}
}
