import { Entity, Column, PrimaryGeneratedColumn, Index } from 'typeorm';
import * as bcrypt from 'bcrypt';

@Entity('users')
export class User {
    @PrimaryGeneratedColumn('uuid')
    @Index()
    id: string;

    @Column()
    name: string;

    @Column()
    fullname: string;

    @Column({ unique: true })
    @Index()
    username: string;

    @Column({ unique: true })
    @Index()
    email: string;

    @Column('text')
    chiper_text: string;

    @Column({ type: 'uuid', default: null, nullable: true })
    @Index()
    role_id: string;

    @Column({ type: 'boolean', default: true })
    is_active: boolean;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    created_at: Date;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    updated_at: Date;

    new(name: string, fullname: string, username: string, email: string, password: string) {
        this.name = name;
        this.fullname = fullname;
        this.username = username;
        this.email = email;
        this.chiper_text = password;

        return this;
    }

    async encryptPassword(password: string): Promise<void> {
        const saltOrRounds = 10;
        this.chiper_text = await bcrypt.hash(password, saltOrRounds);
    }

    validatePasswordHash(password: string): boolean {
        return bcrypt.compare(password, this.chiper_text);
    }

    toResponse() {
        const { chiper_text, ...userData } = this;
        return userData;
    }
}
