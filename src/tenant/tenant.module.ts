import { Module } from '@nestjs/common';
import { TenantService } from './application/service/tenant.service';
import { TenantController } from './presentation/tenant.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tenant } from './domain/tenant';
import { TENANT_REPOSITORY, TENANT_SERVICE } from 'src/common/constant';
import { TenantRepository } from './infrastructure/presistence/tenant.repository';
import { RequestContextModule } from 'src/common/context/request-context.module';
import { StorageModule } from 'src/storage/storage.module';

@Module({
	imports: [
		TypeOrmModule.forFeature([Tenant]),
		RequestContextModule,
		StorageModule
	],
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
export class TenantModule { }
