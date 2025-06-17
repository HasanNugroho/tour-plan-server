// src/file/storage/minio.storage.ts
import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client } from 'minio';
import { File as FileEntity, FileStatus } from '../domain/file';
import { StorageInterface } from './storage.interface';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class MinioStorage implements StorageInterface {
	private minioClient: Client;
	private bucket: string;
    private maxSize: number

	constructor(private config: ConfigService) {
		const storageConfig = this.config.get('storage');

		this.minioClient = new Client({
			endPoint: storageConfig.endpoint || 'localhost',
			port: storageConfig.port || 9000,
			useSSL: storageConfig.useSSL || false,
			accessKey: storageConfig.accessKey,
			secretKey: storageConfig.secretKey,
		});

		this.bucket = storageConfig.bucket || 'default';
		this.maxSize = this.config.get('upload.maxSize') || 5 * 1024 * 1024;
	}

	async uploadFiles(
		userId: string,
		files: Express.Multer.File[],
		tenantId?: string,
	): Promise<FileEntity[]> {
		return Promise.all(files.map((file) => this.uploadFile(userId, file, tenantId)));
	}

	async uploadFile(
		userId: string,
		file: Express.Multer.File,
		tenantId?: string,
	): Promise<FileEntity> {
        if (file.size > this.maxSize) {
            throw new BadRequestException(`File size exceeds the maximum allowed limit of ${this.maxSize / 1024 / 1024}MB`);
        }
		const storedName = `${uuidv4()}-${file.originalname}`;
		const filePath = tenantId ? `${tenantId}/${storedName}` : storedName;

		await this.minioClient.putObject(this.bucket, filePath, file.buffer, file.size, {
			'Content-Type': file.mimetype,
		});

		const mimeType = file.mimetype;
		if (!FileEntity.isValidMimeType(mimeType)) {
			throw new Error(`Invalid MIME type: ${mimeType}`);
		}

		const newFile = FileEntity.create({
			originalName: file.originalname,
			storedName,
			filePath,
			fileSize: file.size,
			mimeType,
			fileType: FileEntity.getFileTypeFromMimeType(mimeType),
			uploadStatus: FileStatus.PENDING,
			tenantId,
			uploadedBy: userId,
		});

		return newFile;
	}

	async getFile(tenantId: string | null | undefined, filename: string): Promise<string> {
		const filePath = tenantId ? `${tenantId}/${filename}` : filename;
		const expires = 60 * 5;
		return await this.minioClient.presignedGetObject(this.bucket, filePath, expires);
	}

	async deleteFile(tenantId: string | null | undefined, filename: string): Promise<void> {
		const filePath = tenantId ? `${tenantId}/${filename}` : filename;
		await this.minioClient.removeObject(this.bucket, filePath);
	}
}
