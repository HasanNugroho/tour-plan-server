import { createKeyv } from '@keyv/redis';
import { CacheModuleAsyncOptions } from '@nestjs/cache-manager';
import { ConfigModule, ConfigService } from '@nestjs/config';

export const KeyvOptions: CacheModuleAsyncOptions = {
	isGlobal: true,
	imports: [ConfigModule],
	inject: [ConfigService],
	useFactory: async (config: ConfigService) => {
		const redisHost = config.get<string>('redis.host', 'localhost');
		const redisPort = config.get<number>('redis.port', 6379);
		const redisPassword = config.get<string>('redis.password');

		const redisUrl = redisPassword
			? `redis://:${redisPassword}@${redisHost}:${redisPort}`
			: `redis://${redisHost}:${redisPort}`;

		return {
			stores: [createKeyv(redisUrl)],
		};
	},
};
