import { createKeyv } from '@keyv/redis';
import { CacheModuleAsyncOptions } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';

export const KeyvOptions: CacheModuleAsyncOptions = {
    isGlobal: true,
    imports: [ConfigModule],
    useFactory: async () => {
        return {
            stores: [
                createKeyv('redis://localhost:6379'),
            ],
        };
    },
    inject: [ConfigService],
};
