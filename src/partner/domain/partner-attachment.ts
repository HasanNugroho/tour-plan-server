import { File } from 'src/storage/domain/file';
import {
	Entity,
	PrimaryGeneratedColumn,
	Column,
	CreateDateColumn,
	Index,
	ForeignKey,
} from 'typeorm';

@Entity('partner_attachment')
export class PartnerAttachment {
	@PrimaryGeneratedColumn('uuid')
	id: string;

	@Index()
	@Column('uuid', { name: 'partner_id' })
	@ForeignKey('partner')
	partnerId: string;

	@Column({ name: 'file_id', type: 'uuid' })
	@ForeignKey('files')
	fileId: string;
	file: File;

	@Column({ type: 'text', nullable: true, name: 'description' })
	description?: string;

	@CreateDateColumn({ name: 'uploaded_at' })
	uploadedAt: Date;
}
