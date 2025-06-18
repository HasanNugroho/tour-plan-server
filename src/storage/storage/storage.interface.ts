import { File } from '../domain/file';

export interface StorageInterface {
	uploadFiles(userId: string, files: Express.Multer.File[], tenantId?: string): Promise<File[]>;
	uploadFile(userId: string, file: Express.Multer.File, tenantId?: string): Promise<File>;
	getFile(tenantId: string, filename: string): Promise<string>;
	deleteFile(tenantId: string, filename: string): Promise<void>;
}
