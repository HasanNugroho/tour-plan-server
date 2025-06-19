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
import { STORAGE_SERVICE } from 'src/common/constant';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { UploadFilesDto } from './dto/file.dto';
import { StorageServiceInterface } from './domain/interface/storage.service.interface';
import { HttpResponse } from 'src/common/dtos/response.dto';

@ApiBearerAuth()
@ApiTags('File')
@Controller('api/file')
export class StorageController {
	constructor(
		@Inject(STORAGE_SERVICE)
		private readonly storageService: StorageServiceInterface,
	) {}

	@Post()
	@ApiConsumes('multipart/form-data')
	@ApiBody({ type: UploadFilesDto })
	@UseInterceptors(FilesInterceptor('files'))
	async uploadMultipleFiles(@UploadedFiles() files: Express.Multer.File[]) {
		const result = this.storageService.uploadFiles(files);
		return new HttpResponse(HttpStatus.CREATED, true, 'Upload file successfully', result);
	}

	@Get(':id/url')
	async getFileUrl(@Param('id', new ParseUUIDPipe()) id: string) {
		const file = await this.storageService.getById(id);
		if (!file) {
			throw new NotFoundException('File not found or URL missing');
		}
		return new HttpResponse(HttpStatus.OK, true, 'Fetch file(s) successfully', file);
	}

	@Delete(':id')
	async deleteFile(@Param('id', new ParseUUIDPipe()) id: string) {
		try {
			await this.storageService.delete(id);
			return new HttpResponse(HttpStatus.OK, true, 'Delete file successfully');
		} catch (error) {
			throw error;
		}
	}
}
