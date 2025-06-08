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

@Entity('users')
export class User {
    @PrimaryGeneratedColumn('uuid')
    @Index()
    id: string;

    @Column('uuid', { nullable: true })
    @ForeignKey("tenants")
    tenantId: string | null;

    @Column()
    fullname: string;

    @Column({ unique: true })
    @Index()
    username: string;

    @Column({ unique: true })
    @Index()
    email: string;

    @Column('text')
    password_hash: string;

    @Column({ type: 'uuid'})
    @ForeignKey("roles")
    @Index()
    role_id: string;
    role?: Role

    @Column({ type: 'boolean', default: true })
    is_active: boolean;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;

    async new(
        fullname: string,
        username: string,
        email: string,
        password: string,
        role_id: string,
        tenantId: string | null = null
    ): Promise<User> {
        this.fullname = fullname;
        this.username = username;
        this.email = email;
        this.password_hash = await this.setPassword(password);
        this.role_id = role_id;
        this.tenantId = tenantId,
        this.is_active = true;
        return this;
    }

    async setPassword(plain: string): Promise<string> {
        this.password_hash = await bcrypt.hash(plain, 10);
        return this.password_hash;
    }

    validatePasswordHash(password: string): boolean {
        return bcrypt.compare(password, this.password_hash);
    }

    toResponse() {
        const { password_hash, ...userData } = this;
        return userData;
    }
}
