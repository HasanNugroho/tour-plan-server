// src/file/storage/minio.storage.ts
import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client } from 'minio';
import { File as FileEntity, FileStatus } from '../domain/file';
import { StorageInterface } from './storage.interface';
import { v4 as uuidv4 } from 'uuid';
import { ONE_HOUR_S } from 'src/common/constant';

@Injectable()
export class MinioStorage implements StorageInterface {
	private minioClient: Client;
	private bucket: string;
	private region: string;
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
		this.region = storageConfig.region
	}

	async onModuleInit() {
		try {
			const exists = await this.minioClient.bucketExists(this.bucket);
			if (!exists) {
				await this.minioClient.makeBucket(this.bucket, this.region);
				console.log(`Bucket created successfully in ${this.region}.`);
			}
		} catch (err) {
			console.error('Error initializing Minio bucket:', err);
			throw err;
		}
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
		const mimeType = file.mimetype;
		if (!FileEntity.isValidMimeType(mimeType)) {
			throw new Error(`Invalid MIME type: ${mimeType}`);
		}

		const storedName = `${uuidv4()}-${file.originalname}`;
		const filePath = tenantId ? `${tenantId}/${storedName}` : storedName;

		await this.minioClient.putObject(this.bucket, filePath, file.buffer, file.size, {
			'Content-Type': file.mimetype,
		});

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

	async getFile(filename: string, tenantId: string | null | undefined, expires: number = ONE_HOUR_S): Promise<string> {
		const filePath = tenantId ? `${tenantId}/${filename}` : filename;
		return await this.minioClient.presignedGetObject(this.bucket, filePath, expires);
	}

	async deleteFile(filename: string, tenantId: string | null | undefined): Promise<void> {
		const filePath = tenantId ? `${tenantId}/${filename}` : filename;
		await this.minioClient.removeObject(this.bucket, filePath);
	}
}
