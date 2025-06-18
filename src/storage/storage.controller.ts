import {
	Controller,
	Post,
	UseInterceptors,
	UploadedFile,
	UploadedFiles,
	Get,
	Param,
	Delete,
	HttpCode,
	HttpStatus,
	ParseUUIDPipe,
	Inject,
	NotFoundException,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { StorageService } from './storage.service';
import { File as FileEntity } from './domain/file';
import { STORAGE_SERVICE } from 'src/common/constant';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { UploadFilesDto } from './dto/file.dto';
import { StorageServiceInterface } from './domain/interface/storage.service.interface';

@ApiBearerAuth()
@ApiTags('File')
@Controller('api/file')
export class StorageController {
	constructor(
		@Inject(STORAGE_SERVICE)
		private readonly storageService: StorageServiceInterface,
	) { }

	@Post()
	@ApiConsumes('multipart/form-data')
	@ApiBody({ type: UploadFilesDto })
	@UseInterceptors(FilesInterceptor('files'))
	async uploadMultipleFiles(@UploadedFiles() files: Express.Multer.File[]): Promise<FileEntity[]> {
		return this.storageService.uploadFiles(files);
	}

	@Get(':id/url')
	async getFileUrl(@Param('id', new ParseUUIDPipe()) id: string): Promise<{ url: string }> {
		const file = await this.storageService.getById(id);
		if (!file || !file.url) {
			throw new NotFoundException('File not found or URL missing');
		}
		return { url: file.url };
	}

	@Delete(':id')
	@HttpCode(HttpStatus.NO_CONTENT)
	async deleteFile(@Param('id', new ParseUUIDPipe()) id: string): Promise<void> {
		await this.storageService.delete(id);
	}
}
