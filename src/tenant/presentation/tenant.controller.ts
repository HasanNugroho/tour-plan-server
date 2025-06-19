import {
	Controller,
	Get,
	Post,
	Put,
	Delete,
	Param,
	Body,
	Query,
	NotFoundException,
	Inject,
	HttpStatus,
} from '@nestjs/common';
import { PaginationOptionsDto } from 'src/common/dtos/page-option.dto';
import {
	ApiTags,
	ApiOperation,
	ApiResponse,
	ApiParam,
	ApiBody,
	ApiBearerAuth,
} from '@nestjs/swagger';
import { ITenantService } from '../domain/interface/tenant.service.interface';
import { TENANT_SERVICE } from 'src/common/constant';
import { Tenant } from '../domain/tenant';
import { CreateTenantDto, UpdateTenantDto } from '../domain/dto/tenant.dto';
import { HttpResponse } from 'src/common/dtos/response.dto';
import { PageMetaDto } from 'src/common/dtos/page-meta.dto';
import { Roles } from 'src/common/decorators/roles.decorator';
import { TenantFilterOptionDto } from './dto/tenant-filter.dto';

@ApiBearerAuth()
@ApiTags('Tenants')
@Controller('api/tenants')
export class TenantController {
	constructor(
		@Inject(TENANT_SERVICE)
		private readonly tenantService: ITenantService,
	) {}

	@Get()
	@ApiOperation({ summary: 'Get all tenants with pagination' })
	@ApiResponse({ status: 200, description: 'List of tenants with pagination' })
	@Roles()
	async findAll(@Query() pagination: TenantFilterOptionDto) {
		const { data, total } = await this.tenantService.getAll(pagination);
		return new HttpResponse(
			HttpStatus.OK,
			true,
			'Fetch tenant(s) successfully',
			data,
			new PageMetaDto(pagination, total),
		);
	}

	@Get(':id')
	@ApiOperation({ summary: 'Get tenant by ID' })
	@ApiParam({ name: 'id', type: String, description: 'Tenant ID' })
	@ApiResponse({ status: 200, description: 'Tenant found', type: Tenant })
	@ApiResponse({ status: 404, description: 'Tenant not found' })
	async findOne(@Param('id') id: string) {
		const tenant = await this.tenantService.getById(id);
		if (!tenant) {
			throw new NotFoundException(`Tenant with ID ${id} not found`);
		}
		return new HttpResponse(HttpStatus.OK, true, 'Fetch tenant(s) successfully', tenant);
	}

	@Post()
	@ApiOperation({ summary: 'Create a new tenant' })
	@ApiBody({ type: CreateTenantDto })
	@ApiResponse({ status: 201, description: 'Tenant created', type: Tenant })
	@ApiResponse({ status: 400, description: 'Bad request' })
	@Roles()
	async create(@Body() payload: CreateTenantDto) {
		try {
			const result = await this.tenantService.create(payload);
			return new HttpResponse(HttpStatus.CREATED, true, 'Create tenant successfully', result);
		} catch (error) {
			throw error;
		}
	}

	@Put(':id')
	@ApiOperation({ summary: 'Update tenant by ID' })
	@ApiParam({ name: 'id', type: String, description: 'Tenant ID' })
	@ApiBody({ type: UpdateTenantDto })
	@ApiResponse({ status: 200, description: 'Tenant updated', type: Tenant })
	@ApiResponse({ status: 404, description: 'Tenant not found' })
	@ApiResponse({ status: 400, description: 'Bad request' })
	@Roles()
	async update(@Param('id') id: string, @Body() payload: UpdateTenantDto) {
		try {
			await this.tenantService.update(id, payload);
			return new HttpResponse(HttpStatus.OK, true, 'Update tenant successfully');
		} catch (error) {
			throw error;
		}
	}

	@Delete(':id')
	@ApiOperation({ summary: 'Delete tenant by ID' })
	@ApiParam({ name: 'id', type: String, description: 'Tenant ID' })
	@ApiResponse({ status: 200, description: 'Tenant deleted' })
	@ApiResponse({ status: 404, description: 'Tenant not found' })
	@Roles()
	async delete(@Param('id') id: string) {
		try {
			await this.tenantService.delete(id);
			return new HttpResponse(HttpStatus.OK, true, 'Delete tenant successfully');
		} catch (error) {
			throw error;
		}
	}
}
