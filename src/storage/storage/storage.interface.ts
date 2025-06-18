import { ONE_HOUR_MS } from 'src/common/constant';
import { File } from '../domain/file';

export interface StorageInterface {
	uploadFiles(userId: string, files: Express.Multer.File[], tenantId?: string): Promise<File[]>;
	uploadFile(userId: string, file: Express.Multer.File, tenantId?: string): Promise<File>;
	getFile(filename: string, tenantId?: string, expired?: number): Promise<string>;
	deleteFile(filename: string, tenantId?: string): Promise<void>;
}
