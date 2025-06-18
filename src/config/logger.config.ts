import { utilities as nestWinstonModuleUtilities } from 'nest-winston';
import { WinstonModuleOptions } from 'nest-winston';
import * as winston from 'winston';
import * as path from 'path';

const logDir = path.join(__dirname, '../../logs');
const isProduction = process.env.NODE_ENV === 'production';

export const winstonLoggerConfig: WinstonModuleOptions = {
	transports: [
		new winston.transports.Console({
			level: 'debug',
			format: isProduction
				? winston.format.combine(
						winston.format.timestamp(),
						winston.format.errors({ stack: true }),
						winston.format.json(),
					)
				: winston.format.combine(
						winston.format.colorize(),
						winston.format.timestamp(),
						winston.format.errors({ stack: true }),
						nestWinstonModuleUtilities.format.nestLike('MyAppName', {
							prettyPrint: true,
						}),
					),
		}),

		new winston.transports.File({
			level: 'error',
			filename: path.join(logDir, 'error.log'),
			format: winston.format.combine(
				winston.format.timestamp(),
				winston.format.errors({ stack: true }),
				isProduction
					? winston.format.json()
					: winston.format.printf(({ timestamp, level, message, stack }) => {
							return `${timestamp} - [${level}] - ${message} - ${stack || ''}`;
						}),
			),
		}),

		new winston.transports.File({
			level: 'info',
			filename: path.join(logDir, 'combined.log'),
			format: winston.format.combine(
				winston.format.timestamp(),
				winston.format.errors({ stack: true }),
				isProduction
					? winston.format.json()
					: winston.format.printf(({ timestamp, level, message, stack }) => {
							return `${timestamp} - [${level}] - ${message} - ${stack || ''}`;
						}),
			),
		}),
	],
};
