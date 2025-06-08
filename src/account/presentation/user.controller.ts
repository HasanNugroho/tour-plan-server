import { Body, Controller, Delete, Get, HttpStatus, Param, ParseUUIDPipe, Post, Put } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { IUserService } from '../domain/service/user.service.interface';
import { User } from '../domain/user';
import { ApiOperation, ApiCreatedResponse, ApiBadRequestResponse, ApiNotFoundResponse, ApiConflictResponse, ApiBearerAuth } from '@nestjs/swagger';
import { USER_SERVICE } from 'src/common/constant';
import { CreateUserDto, UpdateUserDto } from './dto/user.dto';
import { HttpResponse } from 'src/common/dtos/response.dto';
import { Public } from 'src/common/decorators/public.decorator';

@ApiBearerAuth()
@Controller('api/users')
export class UserController {
    constructor(
        @Inject(USER_SERVICE)
        private readonly userService: IUserService
    ) { }

    @ApiOperation({ summary: 'Endpoint untuk create user' })
    @ApiCreatedResponse({
        description: "Response success create user",
        type: User,
        isArray: false,
    })
    @ApiBadRequestResponse({
        description: "Bad request",
    })
    @ApiConflictResponse({
        description: "Email or username already exists",
    })
    @Post()
    @Public()
    async create(@Body() payload: CreateUserDto) {
        try {
            const result = await this.userService.create(payload);
            return new HttpResponse(HttpStatus.CREATED, true, "create user successfully", result)
        } catch (error) {
            throw error;
        }

    }

    @ApiOperation({ summary: 'Get user by ID' })
    @ApiNotFoundResponse({
        description: "User not found",
    })
    @Get(':id')
    async getById(@Param('id', new ParseUUIDPipe()) id: string) {
        const user = await this.userService.getById(id);
        return new HttpResponse(HttpStatus.CREATED, true, "fetch user(s) successfully", user.toResponse())
    }

    @ApiOperation({ summary: 'Update user by ID' })
    @ApiNotFoundResponse({
        description: "User not found",
    })
    @ApiBadRequestResponse({
        description: "Bad request",
    })
    @Put(':id')
    async update(@Param('id', new ParseUUIDPipe()) id: string, @Body() userData: UpdateUserDto) {
        const result = await this.userService.update(id, userData);
        return new HttpResponse(HttpStatus.CREATED, true, "update user successfully", result)
    }

    @ApiOperation({ summary: 'Delete user by ID' })
    @ApiNotFoundResponse({
        description: "User not found",
    })
    @Delete(':id')
    async delete(@Param('id', new ParseUUIDPipe()) id: string) {
        const result = await this.userService.delete(id);
        return new HttpResponse(HttpStatus.CREATED, true, "delete user successfully", result)
    }
}
