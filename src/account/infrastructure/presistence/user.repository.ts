import { ConflictException, Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "src/account/domain/user";
import { IUserRepository } from "src/account/domain/repository/user.repository.interface";

@Injectable()
export class UserRepository implements IUserRepository {
    constructor(
        @InjectRepository(User)
        private readonly db: Repository<User>,
    ) { }

    async create(user: User): Promise<User> {
        try {
            return this.db.save(user);
        } catch (error) {
            if (error.code === '23505') {
                throw new ConflictException('Role already exists');
            }
            throw new InternalServerErrorException(error);
        }
    }

    async getById(id: string): Promise<User | null> {
        return this.db.findOne({ where: { id } });
    }

    async getByEmail(email: string): Promise<User | null> {
        return this.db.findOne({ where: { email } });
    }

    async getByUsername(username: string): Promise<User | null> {
        return this.db.findOne({ where: { username } });
    }

    async update(id: string, userData: Partial<User>): Promise<User> {
        const existingUser = await this.db.findOne({ where: { id } });

        if (!existingUser) {
            throw new NotFoundException('User not found');
        }

        Object.assign(existingUser, userData);

        try {
            return this.db.save(existingUser);
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }

    async delete(id: string): Promise<void> {
        try {
            await this.db.delete(id);
        } catch (error) {
            throw new InternalServerErrorException(error);
        }
    }
}
