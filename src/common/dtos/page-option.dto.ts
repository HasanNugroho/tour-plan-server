import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Order } from "../enums/order.enum";
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from "class-validator";
import { Type } from "class-transformer";

export class PaginationOptionsDto {
    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    keyword?: string;

    @ApiPropertyOptional({ enum: Order, default: Order.ASC })
    @IsEnum(Order)
    @IsOptional()
    order?: Order = Order.ASC;

    @ApiPropertyOptional()
    @IsString()
    @IsOptional()
    orderby?: string = 'updated_at';

    @ApiPropertyOptional({
        minimum: 1,
        default: 1,
    })
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @IsOptional()
    page: number = 1;

    @ApiPropertyOptional({
        minimum: 1,
        maximum: 50,
        default: 10,
    })
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(50)
    @IsOptional()
    limit: number = 10;

    getOffset(): number {
        return (this.page - 1) * this.limit;
    }
}