import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsOptional, IsString, IsUUID, MinLength } from "class-validator";

export class CreateUserDto {
    @ApiProperty({
        description: "user email",
        example: "adam@user.com"
    })
    @IsEmail()
    email: string

    @ApiProperty({
        description: "Nama user",
        example: "adam"
    })
    @IsString()
    name: string

    @ApiProperty({
        description: "Full name",
        example: "adam"
    })
    @IsString()
    fullname: string

    @ApiProperty({
        description: "username",
        example: "adam123"
    })
    @IsString()
    username: string

    @ApiProperty({
        description: "password",
        example: "adam123"
    })
    @MinLength(6)
    @IsString()
    password: string
}

export class UpdateUserDto {
    @ApiProperty({
        description: "user email",
        example: "adam@user.com"
    })
    @IsEmail()
    @IsOptional()
    email?: string

    @ApiProperty({
        description: "Nama user",
        example: "adam"
    })
    @IsString()
    @IsOptional()
    name?: string

    @ApiProperty({
        description: "Full name",
        example: "adam"
    })
    @IsString()
    @IsOptional()
    fullname?: string

    @ApiProperty({
        description: "uuid",
    })
    @IsUUID('4')
    @IsOptional()
    role_id?: string

    @ApiProperty({
        description: "password",
        example: "adam123"
    })
    @MinLength(6)
    @IsString()
    @IsOptional()
    password?: string
}