import { BadRequestException, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { IUserRepository } from '../../domain/interface/user.repository.interface';
import { USER_REPOSITORY } from 'src/common/constant';
import { IAuthService } from '../../domain/interface/auth.service.interface';
import { Credential, CredentialResponse } from '../../domain/credential';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { plainToInstance } from 'class-transformer';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class AuthService implements IAuthService {
	constructor(
		@Inject(USER_REPOSITORY)
		private readonly userRepository: IUserRepository,
		@Inject(CACHE_MANAGER)
		private readonly cacheManager: Cache,
		private readonly jwtService: JwtService,
		private readonly configService: ConfigService,
	) {}

	async login(credential: Credential): Promise<CredentialResponse> {
		const credentialInstance = plainToInstance(Credential, credential);
		const identifier = credentialInstance.identifier;
		const password = credentialInstance.password;

		try {
			const user = credentialInstance.isEmail()
				? await this.userRepository.getByEmail(identifier)
				: await this.userRepository.getByUsername(identifier);

			if (!user || !(await user.validatePasswordHash(password))) {
				throw new UnauthorizedException('Invalid identifier or password');
			}

			return this.generateTokens(user.id);
		} catch (error) {
			throw error;
		}
	}

	async logout(accessToken: string, refreshToken: string): Promise<void> {
		try {
			const accessClaims = await this.decodeToken(accessToken, true);
			const refreshClaims = await this.decodeToken(refreshToken, true, true);

			await this.blacklistToken('access-token', accessToken, accessClaims.exp);
			await this.blacklistToken('refresh-token', refreshToken, refreshClaims.exp);
		} catch (error) {
			throw new BadRequestException('Failed to blacklist token', {
				cause: error,
			});
		}
	}

	async refreshToken(refreshToken: string): Promise<CredentialResponse> {
		try {
			const blacklistKey = `blacklist:refresh-token:${refreshToken}`;
			const isBlacklisted = await this.cacheManager.get(blacklistKey);
			if (isBlacklisted) throw new UnauthorizedException('Token is blacklisted');

			const claims = await this.jwtService.verifyAsync(refreshToken, {
				secret: this.configService.get<string>('jwt.secret'),
			});

			if (claims.nbf) {
				const nbfDate = new Date(claims.nbf * 1000);
				if (new Date() < nbfDate) {
					throw new UnauthorizedException('Refresh token not yet valid');
				}
			}

			const id = claims.id || claims.payload;
			if (!id) {
				throw new UnauthorizedException('Invalid token payload');
			}

			const user = await this.userRepository.getById(id);
			if (!user) {
				throw new BadRequestException('User not found');
			}

			return this.generateTokens(user.id);
		} catch (error) {
			if (error.name === 'TokenExpiredError') {
				throw new UnauthorizedException('Refresh token expired');
			}
			if (error instanceof UnauthorizedException || error instanceof BadRequestException) {
				throw error;
			}
			throw new UnauthorizedException('Invalid refresh token', error);
		}
	}

	private async generateTokens(id: string): Promise<CredentialResponse> {
		const tokenExpiresIn = this.configService.get<string>('jwt.expired');
		const refreshExpiresIn = this.configService.get<string>('jwt.refresh_expired');

		const payload = { id };

		const accessToken = await this.jwtService.signAsync(payload, {
			expiresIn: tokenExpiresIn,
		});
		const refreshToken = await this.jwtService.signAsync(payload, {
			expiresIn: refreshExpiresIn,
			notBefore: tokenExpiresIn,
		});

		return new CredentialResponse(accessToken, refreshToken, id);
	}

	private async decodeToken(token: string, ignoreExpiration = false, ignoreNotBefore = false) {
		return this.jwtService.verifyAsync(token, {
			secret: this.configService.get<string>('jwt.secret'),
			ignoreExpiration,
			ignoreNotBefore,
		});
	}

	private calculateTtl(exp?: number): number {
		const now = Date.now();
		if (!exp || exp * 1000 <= now) {
			return 60000;
		}
		const ttlInMs = exp * 1000 - now;
		return Math.max(ttlInMs, 60000);
	}

	private async blacklistToken(
		type: 'access-token' | 'refresh-token',
		token: string,
		exp?: number,
	) {
		const ttl = this.calculateTtl(exp);
		const key = `blacklist:${type}:${token}`;
		await this.cacheManager.set(key, true, ttl);
	}
}
