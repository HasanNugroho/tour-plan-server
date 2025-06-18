import { Module } from '@nestjs/common';
import { PartnerService } from './application/service/partner.service';
import { PartnerController } from './presentation/partner.controller';
import { RequestContextModule } from 'src/common/context/request-context.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PARTNER_REPOSITORY, PARTNER_SERVICE } from 'src/common/constant';
import { PartnerRepository } from './infrastructure/presistence/partner.repository';
import { Partner } from './domain/partner';

@Module({
	imports: [TypeOrmModule.forFeature([Partner]), RequestContextModule],
	controllers: [PartnerController],
	providers: [
		{
			provide: PARTNER_SERVICE,
			useClass: PartnerService,
		},
		{
			provide: PARTNER_REPOSITORY,
			useClass: PartnerRepository,
		},
	],
})
export class PartnerModule {}
