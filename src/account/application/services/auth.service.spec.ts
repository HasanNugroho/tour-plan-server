import { TestBed, Mocked } from '@suites/unit';
import { AuthService } from './auth.service';
import { IUserRepository } from '../../domain/interface/user.repository.interface';
import { USER_REPOSITORY } from 'src/common/constant';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Credential } from '../../domain/credential';
import { UnauthorizedException, BadRequestException } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

describe('AuthService', () => {
	let service: AuthService;
	let userRepository: Mocked<IUserRepository>;
	let jwtService: Mocked<JwtService>;
	let configService: Mocked<ConfigService>;
	let cacheManager: Mocked<Cache>;

	beforeEach(async () => {
		const { unit, unitRef } = await TestBed.solitary(AuthService).compile();
		service = unit;
		userRepository = unitRef.get(USER_REPOSITORY);
		jwtService = unitRef.get(JwtService);
		configService = unitRef.get(ConfigService);
		cacheManager = unitRef.get(CACHE_MANAGER);

		// Ensure consistent behavior for cacheManager.get
		cacheManager.get.mockResolvedValue(null);
	});

	describe('login', () => {
		it('should return tokens if login success with email', async () => {
			const credential = new Credential();
			credential.identifier = 'user@example.com';
			credential.password = 'password';

			const user = {
				id: 'user-id',
				validatePasswordHash: jest.fn().mockResolvedValue(true),
			} as any;

			userRepository.getByEmail.mockResolvedValueOnce(user);
			jwtService.signAsync.mockResolvedValueOnce('access-token');
			jwtService.signAsync.mockResolvedValueOnce('refresh-token');
			configService.get.mockReturnValue('60s');

			const result = await service.login(credential);

			expect(result.access_token).toBe('access-token');
			expect(result.refresh_token).toBe('refresh-token');
		});

		it('should throw UnauthorizedException on invalid credentials', async () => {
			const credential = new Credential();
			credential.identifier = 'user@example.com';
			credential.password = 'wrongpassword';

			const user = {
				validatePasswordHash: jest.fn().mockResolvedValue(false),
			} as any;

			userRepository.getByEmail.mockResolvedValueOnce(user);

			await expect(service.login(credential)).rejects.toThrow(UnauthorizedException);
		});
	});

	describe('logout', () => {
		it('should blacklist both access and refresh tokens', async () => {
			const accessToken = 'access-token';
			const refreshToken = 'refresh-token';
			const now = Math.floor(Date.now() / 1000) + 3600;

			jwtService.verifyAsync
				.mockResolvedValueOnce({ exp: now }) // access token
				.mockResolvedValueOnce({ exp: now }); // refresh token

			cacheManager.set.mockResolvedValueOnce(undefined);
			cacheManager.set.mockResolvedValueOnce(undefined);

			await service.logout(accessToken, refreshToken);

			expect(cacheManager.set).toHaveBeenCalledTimes(2);
		});

		it('should throw BadRequestException on failure', async () => {
			jwtService.verifyAsync.mockRejectedValueOnce(new Error());

			await expect(service.logout('a', 'b')).rejects.toThrow(BadRequestException);
		});
	});

	describe('refreshToken', () => {
		it('should return new tokens if refresh token is valid', async () => {
			const refreshToken = 'refresh-token';
			const now = Math.floor(Date.now() / 1000) + 3600;

			cacheManager.get.mockResolvedValue(null);
			jwtService.verifyAsync.mockResolvedValue({ id: 'user-id', exp: now });

			const user = { id: 'user-id' } as any;
			userRepository.getById.mockResolvedValue(user);
			jwtService.signAsync.mockResolvedValueOnce('new-access');
			jwtService.signAsync.mockResolvedValueOnce('new-refresh');
			configService.get.mockReturnValue('60s');

			const result = await service.refreshToken(refreshToken);

			expect(result.access_token).toBe('new-access');
			expect(result.refresh_token).toBe('new-refresh');
		});

		it('should throw UnauthorizedException if token blacklisted', async () => {
			cacheManager.get.mockResolvedValue(true);

			await expect(service.refreshToken('token')).rejects.toThrow(UnauthorizedException);
		});

		it('should throw UnauthorizedException if token expired', async () => {
			jwtService.verifyAsync.mockRejectedValue({ name: 'TokenExpiredError' });

			await expect(service.refreshToken('token')).rejects.toThrow(UnauthorizedException);
		});

		it('should throw UnauthorizedException if token invalid', async () => {
			jwtService.verifyAsync.mockRejectedValue(new Error());

			await expect(service.refreshToken('token')).rejects.toThrow(UnauthorizedException);
		});
	});
});
