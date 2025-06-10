import {
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	HttpStatus,
	Inject,
	Param,
	ParseUUIDPipe,
	Post,
	Put,
	Query,
	UseGuards,
} from '@nestjs/common';
import { ROLE_SERVICE } from 'src/common/constant';
import { IRoleService } from '../domain/service/role.service.interface';
import {
	ApiBadRequestResponse,
	ApiBearerAuth,
	ApiCreatedResponse,
	ApiNotFoundResponse,
	ApiOperation,
	ApiTags,
} from '@nestjs/swagger';
import { CreateRoleDto, UpdateRoleDto } from './dto/role.dto';
import { HttpResponse } from 'src/common/dtos/response.dto';
import { PaginationOptionsDto } from 'src/common/dtos/page-option.dto';
import { Roles } from 'src/common/decorators/roles.decorator';

@ApiBearerAuth()
@ApiTags('Roles')
@Controller('api/roles')
export class RoleController {
	constructor(
		@Inject(ROLE_SERVICE)
		private readonly roleService: IRoleService,
	) {}

	@ApiOperation({ summary: 'Endpoint for create role' })
	@ApiCreatedResponse({
		description: 'Response success create role',
		type: CreateRoleDto,
		isArray: false,
	})
	@ApiBadRequestResponse({ description: 'Bad request' })
	@Post()
	@Roles('roles:create')
	async create(@Body() payload: CreateRoleDto) {
		const result = await this.roleService.create(payload);
		return new HttpResponse(HttpStatus.CREATED, true, 'Role created successfully', result);
	}

	@ApiOperation({ summary: 'Get roles' })
	@ApiNotFoundResponse({ description: 'roles not found' })
	@Get()
	@Roles('roles:read')
	async getAll(@Query() filter: PaginationOptionsDto) {
		const result = await this.roleService.getAll(filter);
		return new HttpResponse(HttpStatus.OK, true, 'fetch role(s) successfully', result);
	}

	@ApiOperation({ summary: 'Get role by ID' })
	@ApiNotFoundResponse({ description: 'role not found' })
	@Get(':id')
	@Roles('roles:read')
	async getById(@Param('id', new ParseUUIDPipe()) id: string) {
		const result = await this.roleService.getById(id);
		return new HttpResponse(HttpStatus.OK, true, 'fetch role(s) successfully', result);
	}

	@ApiOperation({ summary: 'Update role by ID' })
	@ApiNotFoundResponse({ description: 'role not found' })
	@ApiBadRequestResponse({ description: 'Bad request' })
	@Put(':id')
	@Roles('roles:update')
	async update(@Param('id', new ParseUUIDPipe()) id: string, @Body() roleData: UpdateRoleDto) {
		const result = await this.roleService.update(id, roleData);
		return new HttpResponse(HttpStatus.OK, true, 'update roles successfully', result);
	}

	@ApiOperation({ summary: 'Delete role by ID' })
	@ApiNotFoundResponse({ description: 'role not found' })
	@Delete(':id')
	@Roles('roles:delete')
	async delete(@Param('id', new ParseUUIDPipe()) id: string) {
		const result = await this.roleService.delete(id);
		return new HttpResponse(HttpStatus.OK, true, 'delete role successfully', result);
	}
}
