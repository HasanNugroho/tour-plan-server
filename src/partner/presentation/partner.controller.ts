import {
	Controller,
	Get,
	Post,
	Put,
	Delete,
	Param,
	Body,
	Query,
	ParseUUIDPipe,
	HttpCode,
	HttpStatus,
	Inject,
	NotFoundException,
} from '@nestjs/common';
import {
	ApiTags,
	ApiOperation,
	ApiResponse,
	ApiParam,
	ApiQuery,
	ApiBearerAuth,
} from '@nestjs/swagger';

import { CreatePartnerDto, UpdatePartnerDto } from '../presentation/dto/partner.dto';
import { PartnerFilterOptionDto } from '../presentation/dto/partner-filter.dto';
import { IPartnerService } from '../domain/interface/partner.service.interface';
import { Partner } from '../domain/partner';
import { PARTNER_SERVICE } from 'src/common/constant';
import { HttpResponse } from 'src/common/dtos/response.dto';
import { PageMetaDto } from 'src/common/dtos/page-meta.dto';

@ApiBearerAuth()
@ApiTags('partners')
@Controller('api/partners')
export class PartnerController {
	constructor(
		@Inject(PARTNER_SERVICE)
		private readonly partnerService: IPartnerService,
	) {}

	@Get()
	@ApiOperation({ summary: 'Get paginated list of partners' })
	@ApiResponse({
		status: 200,
		description: 'List of partners retrieved successfully',
		type: [Partner],
	})
	async getAll(@Query() pagination: PartnerFilterOptionDto) {
		const { data, total } = await this.partnerService.getAll(pagination);
		return new HttpResponse(
			HttpStatus.OK,
			true,
			'Fetch partner(s) successfully',
			data,
			new PageMetaDto(pagination, total),
		);
	}

	@Get(':id')
	@ApiOperation({ summary: 'Get partner by ID' })
	@ApiParam({ name: 'id', type: 'string', format: 'uuid' })
	@ApiResponse({ status: 200, description: 'Partner found', type: Partner })
	async getById(@Param('id', ParseUUIDPipe) id: string) {
		const partner = await this.partnerService.getById(id);
		if (!partner) {
			throw new NotFoundException(`Partner with ID ${id} not found`);
		}
		return new HttpResponse(HttpStatus.OK, true, 'Fetch partner(s) successfully', partner);
	}

	@Post()
	@ApiOperation({ summary: 'Create a new partner' })
	@ApiResponse({ status: 201, description: 'Partner created successfully', type: Partner })
	async create(@Body() payload: CreatePartnerDto) {
		try {
			const result = await this.partnerService.create(payload);
			return new HttpResponse(HttpStatus.CREATED, true, 'Create partner successfully', result);
		} catch (error) {
			throw error;
		}
	}

	@Put(':id')
	@ApiOperation({ summary: 'Update an existing partner' })
	@ApiParam({ name: 'id', type: 'string', format: 'uuid' })
	async update(@Param('id', ParseUUIDPipe) id: string, @Body() payload: UpdatePartnerDto) {
		try {
			await this.partnerService.update(id, payload);
			return new HttpResponse(HttpStatus.OK, true, 'Update partner successfully');
		} catch (error) {
			throw error;
		}
	}

	@Delete(':id')
	@ApiOperation({ summary: 'Delete a partner by ID' })
	@ApiParam({ name: 'id', type: 'string', format: 'uuid' })
	async delete(@Param('id', ParseUUIDPipe) id: string) {
		try {
			await this.partnerService.delete(id);
			return new HttpResponse(HttpStatus.OK, true, 'Delete partner successfully');
		} catch (error) {
			throw error;
		}
	}
}
