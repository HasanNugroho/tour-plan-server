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
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { StorageService } from './storage.service';
import { File as FileEntity } from './domain/file';
import { STORAGE_SERVICE } from 'src/common/constant';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { UploadFilesDto } from './dto/file.dto';

@ApiBearerAuth()
@ApiTags('File')
@Controller('api/file')
export class StorageController {
	constructor(
		@Inject(STORAGE_SERVICE)
		private readonly storageService: StorageService,
	) {}

	// @Post('upload')
	// @ApiConsumes('multipart/form-data')
    // @ApiBody({ type: UploadFilesDto })
	// @UseInterceptors(FileInterceptor('file'))
	// async uploadSingleFile(@UploadedFile() file: Express.Multer.File): Promise<FileEntity> {
	// 	return this.storageService.uploadFile(file);
	// }

	@Post('uploads')
	@ApiConsumes('multipart/form-data')
    @ApiBody({ type: UploadFilesDto })
	@UseInterceptors(FilesInterceptor('files'))
	async uploadMultipleFiles(@UploadedFiles() files: Express.Multer.File[]): Promise<FileEntity[]> {
		return this.storageService.uploadFiles(files);
	}

	@Get(':id/url')
	async getFileUrl(@Param('id', new ParseUUIDPipe()) id: string): Promise<{ url: string }> {
		const url = await this.storageService.getFileUrl(id);
		return { url };
	}

	@Get(':id/url/public')
	async getFileUrlPublic(@Param('id', new ParseUUIDPipe()) id: string): Promise<{ url: string }> {
		const url = await this.storageService.getFileUrlPublic(id);
		return { url };
	}

	@Delete(':id')
	@HttpCode(HttpStatus.NO_CONTENT)
	async deleteFile(@Param('id', new ParseUUIDPipe()) id: string): Promise<void> {
		await this.storageService.deleteFile(id);
	}
}
