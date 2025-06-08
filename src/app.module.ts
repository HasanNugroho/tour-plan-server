import { Logger, Module } from '@nestjs/common';
import { AccountModule } from './account/account.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import configuration from './config/app.config';
import { connectionSource } from './config/database.config';
import { winstonLoggerConfig } from './config/logger.config';
import { WinstonModule } from 'nest-winston';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './account/application/guards/auth.guard';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { CacheModule } from '@nestjs/cache-manager';
import { KeyvOptions } from './config/redis.config';

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
        AccountModule,
    ],
    controllers: [],
    providers: [
        {
            provide: APP_GUARD,
            useClass: AuthGuard,
        },
        Logger,
        HttpExceptionFilter,
    ],
})
export class AppModule { }
