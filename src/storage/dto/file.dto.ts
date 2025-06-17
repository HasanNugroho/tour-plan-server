import { ApiProperty } from "@nestjs/swagger";

export class UploadFilesDto {
    @ApiProperty({
        type: 'array',
        items: { type: 'string', format: 'binary' },
        required: false,
        description: 'Attachment files (optional)',
    })
    files?: any[];
}