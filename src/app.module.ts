import { Logger, MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AccountModule } from './account/account.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import configuration from './config/app.config';
import { connectionSource } from './config/database.config';
import { winstonLoggerConfig } from './config/logger.config';
import { WinstonModule } from 'nest-winston';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { AuthGuard } from './account/application/guards/auth.guard';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { CacheModule } from '@nestjs/cache-manager';
import { KeyvOptions } from './config/redis.config';
import { TenantModule } from './tenant/tenant.module';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { ThrottlerStorageRedisService } from '@nest-lab/throttler-storage-redis';
import { ContextMiddleware } from './common/middlewares/context.middleware';
import { StorageModule } from './storage/storage.module';
import Redis from 'ioredis';
import { RequestContextInterceptor } from './common/context/request-context.interceptor';

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
			envFilePath: ['.env.development.local', '.env.development', '.env'],
			load: [configuration],
		}),
		CacheModule.registerAsync(KeyvOptions),
		WinstonModule.forRoot(winstonLoggerConfig),
		TypeOrmModule.forRoot(connectionSource.options),
		EventEmitterModule.forRoot(),
		ThrottlerModule.forRootAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: (config: ConfigService) => {
				const ttl = config.get<number>('throttle.ttl') ?? 60;
				const limit = config.get<number>('throttle.limit') ?? 10;

				const redis = new Redis({
					host: config.get('redis.host'),
					port: config.get('redis.port'),
					password: config.get('redis.password'),
				});

				return {
					throttlers: [{ ttl, limit }],
					storage: new ThrottlerStorageRedisService(redis),
				};
			},
		}),
		AccountModule,
		TenantModule,
		StorageModule,
	],
	controllers: [],
	providers: [
		{
			provide: APP_FILTER,
			useClass: HttpExceptionFilter,
		},
		{
			provide: APP_GUARD,
			useClass: ThrottlerGuard,
		},
		{
			provide: APP_GUARD,
			useClass: AuthGuard,
		},
		{
			provide: APP_INTERCEPTOR,
			useClass: RequestContextInterceptor,
		},
		Logger,
	],
})
export class AppModule implements NestModule {
	configure(consumer: MiddlewareConsumer) {
		consumer.apply(ContextMiddleware).forRoutes('*');
	}
}
