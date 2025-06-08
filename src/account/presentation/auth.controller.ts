import {
    BadRequestException,
    Body,
    Controller,
    Get,
    HttpStatus,
    Post,
    Req,
} from '@nestjs/common';
import { Inject } from '@nestjs/common';
import {
    ApiOperation,
    ApiBadRequestResponse,
    ApiUnauthorizedResponse,
    ApiBearerAuth,
    ApiTags,
} from '@nestjs/swagger';
import { AUTH_SERVICE } from 'src/common/constant';
import { HttpResponse } from 'src/common/dtos/response.dto';
import { IAuthService } from '../domain/service/auth.service.interface';
import { Credential } from '../domain/credential';
import { CurrentUser } from 'src/common/decorators/user.decorator';
import { User } from '../domain/user';
import { Public } from 'src/common/decorators/public.decorator';
import { TokenPayloadDto } from './dto/auth.dto';
import { Roles } from 'src/common/decorators/roles.decorator';

@ApiTags('Auth')
@Controller('api/auth')
export class AuthController {
    constructor(
        @Inject(AUTH_SERVICE)
        private readonly authService: IAuthService
    ) { }

    @ApiOperation({ summary: 'Login' })
    @ApiBadRequestResponse({ description: 'Bad request' })
    @ApiUnauthorizedResponse({ description: 'Invalid identifier or password' })
    @Public()
    @Post('login')
    async create(@Body() payload: Credential) {
        const result = await this.authService.login(payload);
        return new HttpResponse(HttpStatus.OK, true, 'User logged in successfully', result);
    }

    @ApiBearerAuth()
    @Roles('users:read')
    @Get('me')
    async me(@CurrentUser() user: User) {
        return new HttpResponse(HttpStatus.OK, true, 'Fetch user successfully', user.toResponse());
    }

    @ApiBearerAuth()
    @Roles('users:deactivate')
    @Post('logout')
    async logout(@Req() req: any, @Body() body: TokenPayloadDto) {
        const accessToken = req.headers['authorization']?.split(' ')[1];
        const refreshToken = body.refreshToken;

        if (!accessToken || !refreshToken) {
            throw new BadRequestException('Access token or refresh token is missing');
        }

        await this.authService.logout(accessToken, refreshToken);
        return new HttpResponse(HttpStatus.OK, true, 'User logged out successfully', null);
    }

    @ApiOperation({ summary: 'Refresh access token using refresh token' })
    @ApiBadRequestResponse({ description: 'Missing or invalid refresh token' })
    @ApiUnauthorizedResponse({ description: 'Invalid or expired refresh token' })
    @Public()
    @Post('refresh-token')
    async refreshToken(@Body() body: TokenPayloadDto) {
        const { refreshToken } = body;

        if (!refreshToken) {
            throw new BadRequestException('User ID and refresh token are required');
        }

        const result = await this.authService.refreshToken(refreshToken);
        return new HttpResponse(HttpStatus.OK, true, 'Token refreshed successfully', result);
    }
}
