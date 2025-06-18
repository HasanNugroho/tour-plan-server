import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	CreateDateColumn,
	UpdateDateColumn,
	ForeignKey,
	Index,
} from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';

const permissionsData = JSON.parse(
	fs.readFileSync(path.resolve('./src/config/permissions.json'), 'utf-8'),
);

@Entity('roles')
export class Role {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Index()
	@Column({ name: 'name' })
	name: string;

	@Column({ name: 'description', nullable: true })
	description: string;

	@Column('jsonb', { name: 'permissions' })
	permissions: string[];

	@Index()
	@Column({ name: 'tenant_id', type: 'uuid', nullable: true })
	@ForeignKey('tenants')
	tenantId?: string;

	@Column('boolean', { name: 'is_system', default: false })
	isSystem: boolean

	@CreateDateColumn({ name: 'created_at' })
	createdAt: Date;

	@UpdateDateColumn({ name: 'updated_at' })
	updatedAt: Date;

	/**
	 * Factory method to create a new Role instance.
	 */
	static create(
		name: string,
		description: string,
		permissions: string[],
		tenantId?: string,
		isSystem: boolean = false
	): Role {
		const role = new Role();
		role.name = name;
		role.description = description;
		role.permissions = permissions;
		role.tenantId = tenantId;
		role.isSystem = isSystem
		return role;
	}

	/**
	 * Validates the assigned permissions against the config list.
	 * @returns true if valid, false if contains unknown permissions.
	 */
	validatePermissions(): boolean {
		const invalid = this.permissions.filter(
			(permission) => !permissionsData.permissions.includes(permission),
		);
		return invalid.length === 0;
	}
}

export enum RoleStatus {
	Active = 'Active',
	Inactive = 'Inactive',
	Suspended = 'Suspended',
	Deleted = 'Deleted',
}
