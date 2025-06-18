import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { File } from '../domain/file';

@Injectable()
export class FileRepository {
  constructor(
    @InjectRepository(File)
    private readonly db: Repository<File>,
  ) { }

  async create(file: File): Promise<File> {
    try {
      return await this.db.save(file);
    } catch (error: any) {
      if (error.code === '23505') {
        throw new ConflictException('File already exists');
      }
      throw new InternalServerErrorException(error);
    }
  }

  async createMany(file: File[]): Promise<File[]> {
    try {
      return await this.db.save(file);
    } catch (error: any) {
      if (error.code === '23505') {
        throw new ConflictException('File already exists');
      }
      throw new InternalServerErrorException(error);
    }
  }

  async getById(id: string): Promise<File | null> {
    return this.db.findOne({ where: { id } });
  }

  async delete(id: string): Promise<void> {
    try {
      const result = await this.db.delete(id);
      if (result.affected === 0) {
        throw new NotFoundException(`File with id ${id} not found`);
      }
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException(error);
    }
  }

  async findByStoredName(storedName: string, tenantId?: string): Promise<File | null> {
    return this.db.findOne({ where: { storedName, tenantId } });
  }

  async update(file: File): Promise<void> {
    await this.db.save(file);
  }
}
