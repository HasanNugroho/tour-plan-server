import {
	Body,
	Controller,
	Delete,
	Get,
	HttpStatus,
	Param,
	ParseUUIDPipe,
	Post,
	Put,
} from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { IUserService } from '../domain/interface/user.service.interface';
import { User } from '../domain/user';
import {
	ApiOperation,
	ApiCreatedResponse,
	ApiBadRequestResponse,
	ApiNotFoundResponse,
	ApiConflictResponse,
	ApiBearerAuth,
	ApiTags,
} from '@nestjs/swagger';
import { USER_SERVICE } from 'src/common/constant';
import { CreateUserDto, SetupSuperUserDto, UpdateUserDto } from './dto/user.dto';
import { HttpResponse } from 'src/common/dtos/response.dto';
import { Public } from 'src/common/decorators/public.decorator';
import { Roles } from 'src/common/decorators/roles.decorator';

@ApiBearerAuth()
@ApiTags('Users')
@Controller('api/users')
export class UserController {
	constructor(
		@Inject(USER_SERVICE)
		private readonly userService: IUserService,
	) {}

	@ApiOperation({ summary: 'Endpoint untuk create user' })
	@ApiCreatedResponse({
		description: 'Response success create user',
		type: User,
		isArray: false,
	})
	@ApiBadRequestResponse({
		description: 'Bad request',
	})
	@ApiConflictResponse({
		description: 'Email or username already exists',
	})
	@Post()
	@Public()
	async create(@Body() payload: CreateUserDto) {
		try {
			const result = await this.userService.create(payload);
			return new HttpResponse(HttpStatus.CREATED, true, 'create user successfully', result);
		} catch (error) {
			throw error;
		}
	}

	@ApiOperation({ summary: 'Get user by ID' })
	@ApiNotFoundResponse({
		description: 'User not found',
	})
	@Roles('users:read')
	@Get(':id')
	async getById(@Param('id', new ParseUUIDPipe()) id: string) {
		const user = await this.userService.getById(id);
		return new HttpResponse(HttpStatus.OK, true, 'fetch user(s) successfully', user.toResponse());
	}

	@ApiOperation({ summary: 'Update user by ID' })
	@ApiNotFoundResponse({
		description: 'User not found',
	})
	@ApiBadRequestResponse({
		description: 'Bad request',
	})
	@Roles('users:update')
	@Put(':id')
	async update(@Param('id', new ParseUUIDPipe()) id: string, @Body() userData: UpdateUserDto) {
		const result = await this.userService.update(id, userData);
		return new HttpResponse(HttpStatus.OK, true, 'update user successfully', result);
	}

	@ApiOperation({ summary: 'Setup superuser (hanya satu kali)' })
	@ApiCreatedResponse({
		description: 'Superuser berhasil dibuat',
		type: User,
	})
	@ApiBadRequestResponse({
		description: 'Superuser sudah ada',
	})
	@Post('setup-superuser')
	@Public()
	async setupSuperUser(@Body() payload: SetupSuperUserDto) {
		try {
			await this.userService.setupSuperUser(payload);
			return new HttpResponse(HttpStatus.CREATED, true, 'superuser created successfully');
		} catch (error) {
			throw error;
		}
	}

	@ApiOperation({ summary: 'Delete user by ID' })
	@ApiNotFoundResponse({
		description: 'User not found',
	})
	@Roles('users:delete')
	@Delete(':id')
	async delete(@Param('id', new ParseUUIDPipe()) id: string) {
		const result = await this.userService.delete(id);
		return new HttpResponse(HttpStatus.OK, true, 'delete user successfully', result);
	}
}
