import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    Index,
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

    @CreateDateColumn({ type: 'timestamp' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamp' })
    updated_at: Date;

    new(
        name: string,
        description?: string,
        address?: string,
        contact_info?: string
    ): Tenant {
        this.name = name;
        this.description = description;
        this.address = address;
        this.contact_info = contact_info;
        this.is_active = true;
        return this;
    }

    updateInfo(
        name: string,
        description?: string,
        address?: string,
        contact_info?: string
    ) {
        this.name = name;
        this.description = description;
        this.address = address;
        this.contact_info = contact_info
        this.updated_at = new Date();
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
