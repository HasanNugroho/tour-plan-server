import { Module } from '@nestjs/common';
import { StorageService } from './storage.service';
import { StorageController } from './storage.controller';
import { FILE_REPOSITORY, MINIO_STORAGE, STORAGE_SERVICE } from 'src/common/constant';
import { FileRepository } from './repository/file.repository';
import { RequestContextModule } from 'src/common/context/request-context.module';
import { File } from './domain/file';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MinioStorage } from './storage/minio.storage';

@Module({
	imports: [
		TypeOrmModule.forFeature([File]),
		RequestContextModule
	],
	controllers: [StorageController],
	providers: [
		{
			provide: STORAGE_SERVICE,
			useClass: StorageService,
		},
		{
			provide: FILE_REPOSITORY,
			useClass: FileRepository,
		},
		{
			provide: MINIO_STORAGE,
			useClass: MinioStorage
		}
	],
	exports: [STORAGE_SERVICE]
})
export class StorageModule { }
