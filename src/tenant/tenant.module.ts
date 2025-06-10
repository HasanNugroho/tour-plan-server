import { Module } from '@nestjs/common';
import { TenantService } from './application/service/tenant.service';
import { TenantController } from './presentation/tenant.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tenant } from './domain/tenant';
import { TENANT_REPOSITORY, TENANT_SERVICE } from 'src/common/constant';
import { TenantRepository } from './infrastructure/presistence/tenant.repository';

@Module({
	imports: [TypeOrmModule.forFeature([Tenant])],
	controllers: [TenantController],
	providers: [
		{
			provide: TENANT_SERVICE,
			useClass: TenantService,
		},
		{
			provide: TENANT_REPOSITORY,
			useClass: TenantRepository,
		},
	],
})
export class TenantModule {}
