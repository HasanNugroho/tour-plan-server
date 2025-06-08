import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class TokenPayloadDto {
    @ApiProperty({
        description: "Refresh token to be invalidated",
        required: true,
    })
    @IsString()
    refreshToken: string;
}