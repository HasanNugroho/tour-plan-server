import { Entity, Column, PrimaryGeneratedColumn, Index } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';

const permissionsData = JSON.parse(
    fs.readFileSync(path.resolve('./src/config/permissions.json'), 'utf-8')
);

@Entity('roles')
export class Role {
    @PrimaryGeneratedColumn('uuid')
    @Index()
    id: string;

    @Column()
    name: string;

    @Column()
    description: string;

    @Column()
    access: string;

    @Column({ type: 'boolean', default: true })
    is_active: boolean;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    created_at: Date;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    updated_at: Date;

    new(name: string, description: string, access: string[]) {
        this.name = name;
        this.description = description;
        this.access = JSON.stringify(access);
        return this;
    }

    validatePermissions(): boolean {
        const accessArray = JSON.parse(this.access);
        const invalid = accessArray.filter(
            (permission) => !permissionsData.permissions.includes(permission)
        );

        return (invalid.length > 0) ? false : true;
    }

}
