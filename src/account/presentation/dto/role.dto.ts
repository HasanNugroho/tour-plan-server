import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsBoolean, IsOptional, IsString, IsUUID } from "class-validator";

export class CreateRoleDto {
    @ApiProperty({
        description: "Role name",
        example: "admin"
    })
    @IsString()
    name: string;

    @ApiProperty({
        description: "Role description",
        example: "Administrator role"
    })
    @IsString()
    description: string;

    @ApiProperty({
        description: "Role description",
        example: ["users:create", "users:read"]
    })
    @IsArray()
    @IsString({ each: true })
    access: string[];
}

export class UpdateRoleDto {
    @ApiProperty({
        description: "Role name",
        example: "admin"
    })
    @IsString()
    @IsOptional()
    name?: string

    @ApiProperty({
        description: "Role description",
        example: "admin permission"
    })
    @IsString()
    @IsOptional()
    description?: string

    @ApiProperty({
        description: "Role status",
        example: true
    })
    @IsBoolean()
    @IsOptional()
    is_active?: boolean

    @ApiProperty({
        description: "Role description",
        example: ["users:create", "users:read"]
    })
    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    access?: string[];
}
