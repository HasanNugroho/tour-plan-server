import { BadRequestException, ForbiddenException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { RequestContextService } from "src/common/context/request-context.service";
import { FileRepository } from "./repository/file.repository";
import { FILE_REPOSITORY, MINIO_STORAGE, ONE_DAY_MS, ONE_DAY_S } from "src/common/constant";
import { File, FileStatus } from "./domain/file";
import { StorageInterface } from "./storage/storage.interface";
import { StorageServiceInterface } from "./domain/interface/storage.service.interface";

@Injectable()
export class StorageService implements StorageServiceInterface {
	private file: File;

	constructor(
		@Inject(FILE_REPOSITORY)
		private readonly fileRepository: FileRepository,

		@Inject(MINIO_STORAGE)
		private readonly storage: StorageInterface,
		private readonly contextService: RequestContextService,
	) { }

	async getById(id: string, expired: number = ONE_DAY_S): Promise<File | null> {
		const tenantId = this.contextService.getTenantId();
		const isSuperUser = this.contextService.isSuperUser();

		const file = await this.fileRepository.getById(id);
		if (!file) return null;

		// Hanya batasi jika file memiliki tenant
		if (file.tenantId && !isSuperUser && file.tenantId !== tenantId) {
			throw new ForbiddenException('Access denied for tenant');
		}

		file.url = await this.storage.getFile(file.storedName, file.tenantId, expired);

		this.file = file
		return file;
	}

	async uploadFile(file: Express.Multer.File): Promise<File> {
		const tenantId = this.contextService.getTenantId();
		const actorId = this.contextService.getUserId();

		if (!actorId) {
			throw new BadRequestException('Actor ID is required');
		}

		const fileEntity = await this.storage.uploadFile(actorId, file, tenantId);
		return this.fileRepository.create(fileEntity);
	}

	async uploadFiles(files: Express.Multer.File[]): Promise<File[]> {
		const tenantId = this.contextService.getTenantId();
		const actorId = this.contextService.getUserId();

		if (!actorId) {
			throw new BadRequestException('Actor ID is required');
		}

		const uploadedFiles = await this.storage.uploadFiles(actorId, files, tenantId);
		return this.fileRepository.createMany(uploadedFiles);
	}

	async updateStatus(status: FileStatus): Promise<void> {
		if (status === FileStatus.COMPLETED) {
			this.file.markAsCompleted();
		} else {
			this.file.markAsFailed();
		}

		await this.fileRepository.update(this.file);
	}

	async delete(id: string): Promise<void> {
		const tenantId = this.contextService.getTenantId();
		const file = await this.fileRepository.getById(id);

		if (!file) throw new NotFoundException('File not found');

		if (file.tenantId && file.tenantId !== tenantId) {
			throw new ForbiddenException('Access denied for tenant');
		}

		await this.storage.deleteFile(file.storedName, file.tenantId);
		await this.fileRepository.delete(file.id);
	}
}
