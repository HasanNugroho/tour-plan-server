import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	CreateDateColumn,
	UpdateDateColumn,
	Index,
	ForeignKey,
} from 'typeorm';

export enum FileStatus {
	PENDING = 'pending',
	COMPLETED = 'completed',
	FAILED = 'failed',
}

export enum FileType {
	CV = 'cv',
	PHOTO = 'photo',
	DOCUMENT = 'document',
	IMAGE = 'image',
	OTHER = 'other',
}

// Extend mime types untuk skalabilitas
export type AppMimeType =
	| 'image/png'
	| 'image/jpeg'
	| 'image/webp'
	| 'application/pdf'
	| 'application/msword'
	| 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
	| 'text/plain';

@Entity('files')
@Index(['uploadStatus', 'createdAt'])
@Index(['tenantId', 'uploadedBy'])
export class File {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Column({ name: 'original_name', length: 255 })
	originalName: string;

	@Column({ name: 'stored_name', length: 255 })
	storedName: string;

	@Column({ name: 'file_path', type: 'text' })
	filePath: string;

	@Column({ name: 'mime_type', length: 100 })
	mimeType: AppMimeType;

	@Column({ name: 'file_size', type: 'bigint' })
	fileSize: number;

	@Column({
		name: 'file_type',
		type: 'enum',
		enum: FileType,
		default: FileType.OTHER,
	})
	fileType: FileType;

	@Index()
	@Column({ type: 'uuid', nullable: true })
	@ForeignKey('tenants')
	tenantId?: string;

	@Column({
		name: 'upload_status',
		type: 'enum',
		enum: FileStatus,
		default: FileStatus.PENDING,
	})
	uploadStatus: FileStatus;

	@Column({ name: 'uploaded_by', type: 'uuid' })
	@ForeignKey('users')
	uploadedBy: string;

	@CreateDateColumn({ name: 'created_at' })
	createdAt: Date;

	@UpdateDateColumn({ name: 'updated_at' })
	updatedAt: Date;

	// url from cloud storage
	url?: string;

	static create(params: Partial<File>): File {
		const file = new File();
		Object.assign(file, params);
		return file;
	}

	get sizeInMB(): number {
		return Math.round((Number(this.fileSize) / (1024 * 1024)) * 100) / 100;
	}

	get fileExtension(): string {
		return this.originalName.split('.').pop()?.toLowerCase() || '';
	}

	get isImage(): boolean {
		return this.mimeType.startsWith('image/');
	}

	get isPdf(): boolean {
		return this.mimeType === 'application/pdf';
	}

	// Helper methods
	markAsCompleted(): void {
		this.uploadStatus = FileStatus.COMPLETED;
	}

	markAsFailed(): void {
		this.uploadStatus = FileStatus.FAILED;
	}

	static isValidMimeType(mimeType: string): mimeType is AppMimeType {
		const validTypes: AppMimeType[] = [
			'image/png',
			'image/jpeg',
			'image/webp',
			'application/pdf',
			'application/msword',
			'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
			'text/plain',
		];
		return validTypes.includes(mimeType as AppMimeType);
	}

	static getFileTypeFromMimeType(mimeType: AppMimeType): FileType {
		if (mimeType.startsWith('image/')) {
			return FileType.IMAGE;
		}
		if (
			mimeType === 'application/pdf' ||
			mimeType === 'application/msword' ||
			mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
		) {
			return FileType.DOCUMENT;
		}
		return FileType.OTHER;
	}
}

