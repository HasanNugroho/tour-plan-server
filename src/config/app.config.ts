import { version } from 'os';

export default () => ({
	env: process.env.NODE_ENV || 'development',
	version: process.env.VERSION || version(),
	name: process.env.APP_NAME || 'NestJS App',
	desc: process.env.APP_DESC || 'NestJS Application',
	port: parseInt(process.env.PORT || '3000', 10),

	jwt: {
		secret: process.env.JWT_SECRET_KEY,
		expired: process.env.JWT_EXPIRED || '1h',
		refresh_expired: process.env.JWT_REFRESH_TOKEN_EXPIRED || '24h',
	},

	database: {
		host: process.env.DB_HOST,
		port: parseInt(process.env.DB_PORT || '5432', 10),
		user: process.env.DB_USER,
		password: process.env.DB_PASS,
		name: process.env.DB_NAME,
	},

	redis: {
		host: process.env.REDIS_HOST || 'localhost',
		port: parseInt(process.env.REDIS_PORT || '6379', 10),
		password: process.env.REDIS_PASSWORD || undefined,
	},

	throttle: {
		ttl: parseInt(process.env.THROTTLE_TTL || '60', 10),
		limit: parseInt(process.env.THROTTLE_LIMIT || '10', 10),
	},

	upload: {
		maxSize: parseInt(process.env.UPLOAD_MAX_SIZE || '5242880', 10), // 5MB default
		allowedTypes: (process.env.UPLOAD_ALLOWED_TYPES || 'jpg,jpeg,png,pdf').split(','),
	},

	storage: {
		driver: process.env.STORAGE_DRIVER || 'minio',
		bucket: process.env.STORAGE_BUCKET || 'my-bucket',
		endpoint: process.env.STORAGE_ENDPOINT || 'localhost',
		port: parseInt(process.env.STORAGE_PORT || '9000', 10),
		region: process.env.STORAGE_REGION || 'us-east-1',
		accessKey: process.env.STORAGE_ACCESS_KEY || '',
		secretKey: process.env.STORAGE_SECRET_KEY || '',
		useSSL: process.env.STORAGE_USE_SSL === 'true',
	},
});
