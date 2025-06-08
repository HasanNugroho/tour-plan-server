import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    ForeignKey,
} from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';

const permissionsData = JSON.parse(
    fs.readFileSync(path.resolve('./src/config/permissions.json'), 'utf-8')
);

@Entity('roles')
export class Role {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    name: string;

    @Column({ nullable: true })
    description: string;

    @Column('jsonb')
    permissions: string[];

    @Column({ type: 'uuid', nullable: true })
    @ForeignKey("tenants")
    tenantId: string | null;
    
    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    new (
        name: string,
        description: string,
        permissions: string[],
        tenantId: string | null = null,
    ): Role {
        const role = new Role();
        role.name = name;
        role.description = description;
        role.permissions = permissions;
        role.tenantId = tenantId;
        return role;
    }

    /**
     * Validates the assigned permissions against the config list.
     * @returns true if valid, false if contains unknown permissions.
     */
    validatePermissions(): boolean {
        const invalid = this.permissions.filter(
            (permission) => !permissionsData.permissions.includes(permission)
        );
        return invalid.length === 0;
    }
}

export enum RoleStatus {
  Active = "Active",
  Inactive = "Inactive",
  Suspended = "Suspended",
  Deleted = "Deleted",
}
