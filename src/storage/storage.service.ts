import { BadRequestException, ForbiddenException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { RequestContextService } from "src/common/context/request-context.service";
import { MinioStorage } from "./storage/minio.storage";
import { FileRepository } from "./repository/file.repository";
import { FILE_REPOSITORY } from "src/common/constant";
import { File } from "./domain/file";

@Injectable()
export class StorageService {
	constructor(
		@Inject(FILE_REPOSITORY)
		private readonly fileRepository: FileRepository,
		private readonly minioStorage: MinioStorage,
		private readonly contextService: RequestContextService,
	) {}

	async uploadFile(file: Express.Multer.File): Promise<File> {
		const tenantId = this.contextService.getTenantId();
		const actorId = this.contextService.getUserId();

		if (!actorId) {
			throw new BadRequestException('Actor ID is required');
		}

		const fileEntity = await this.minioStorage.uploadFile(actorId, file, tenantId);
		return this.fileRepository.create(fileEntity);
	}

	async uploadFiles(files: Express.Multer.File[]): Promise<File []> {
		const tenantId = this.contextService.getTenantId();
		const actorId = this.contextService.getUserId();
        console.log(this.contextService.getContext())
        console.log(actorId)

		if (!actorId) {
			throw new BadRequestException('Actor ID is required');
		}

		const uploadedFiles = await this.minioStorage.uploadFiles(actorId, files, tenantId);
		return this.fileRepository.createMany(uploadedFiles);
	}

	async getFileUrl(id: string): Promise<string> {
		const tenantId = this.contextService.getTenantId();

		const file = await this.fileRepository.getById(id);
		if (!file) throw new NotFoundException('File not found');

		if (file.tenantId && file.tenantId !== tenantId) {
			throw new ForbiddenException('Access denied for tenant');
		}

		return this.minioStorage.getFile(file.tenantId, file.storedName);
	}

	async getFileUrlPublic(id: string): Promise<string> {
		const file = await this.fileRepository.getById(id);
		if (!file) throw new NotFoundException('File not found');
		return this.minioStorage.getFile(file.tenantId, file.storedName);
	}

	async deleteFile(id: string): Promise<void> {
		const tenantId = this.contextService.getTenantId();
		const file = await this.fileRepository.getById(id);

		if (!file) throw new NotFoundException('File not found');

		// Jika file punya tenant, pastikan tenant sekarang cocok
		if (file.tenantId && file.tenantId !== tenantId) {
			throw new ForbiddenException('Access denied for tenant');
		}

		await this.minioStorage.deleteFile(file.tenantId, file.storedName);
		await this.fileRepository.delete(file.id);
	}

	async findById(id: string): Promise<File | null> {
		const tenantId = this.contextService.getTenantId();
		const isSuperUser = this.contextService.isSuperUser();

		const file = await this.fileRepository.getById(id);
		if (!file) return null;

		// Hanya batasi jika file memiliki tenant
		if (file.tenantId && !isSuperUser && file.tenantId !== tenantId) {
			throw new ForbiddenException('Access denied for tenant');
		}

		return file;
	}
}
