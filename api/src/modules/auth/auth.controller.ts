import { Body, Controller, Get, Headers, Post, Req, Res, UseGuards } from '@nestjs/common';
import { FastifyReply, FastifyRequest } from 'fastify';
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { AuthGuard } from './auth.guard';
import { GoogleOAuthStartGuard } from './google-oauth-start.guard';
import { GoogleOAuthCallbackGuard } from './google-oauth-callback.guard';
import { FacebookOAuthStartGuard } from './facebook-oauth-start.guard';
import { FacebookOAuthCallbackGuard } from './facebook-oauth-callback.guard';
import { objectResponse } from '../../common/openapi/schemas';

@Controller('auth')
@ApiTags('Auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user with invitation token' })
  @ApiOkResponse(objectResponse)
  async register(
    @Body()
    dto: {
      token: string;
      firstName: string;
      lastName: string;
      password?: string;
      provider?: 'google' | 'facebook';
    }
  ) {
    const { session, user, jwt, provider } = await this.authService.registerWithInvitation(dto);
    return {
      token: session.token,
      jwt,
      provider,
      user,
    };
  }

  @UseGuards(AuthGuard)
  @ApiOperation({ summary: 'Get current session details' })
  @ApiBearerAuth()
  @ApiOkResponse(objectResponse)
  @Get('me')
  async me(@Headers('authorization') authorization?: string) {
    const token = authorization?.startsWith('Bearer ') ? authorization.slice(7) : authorization;
    const session = await this.authService.me(token || undefined);
    if (!session) {
      return null;
    }
    return session;
  }

  @Get('google')
  @ApiOperation({ summary: 'Start Google OAuth' })
  @ApiResponse({ status: 302, description: 'Redirects to Google' })
  @UseGuards(GoogleOAuthStartGuard)
  async google() {
    return;
  }

  @Get('google/callback')
  @ApiOperation({ summary: 'Google OAuth callback' })
  @ApiResponse({ status: 302, description: 'Redirects back to frontend with session token' })
  @UseGuards(GoogleOAuthCallbackGuard)
  async googleCallback(@Req() req: OAuthRequest, @Res() reply: FastifyReply) {
    const oauthUser = (req.user ?? {}) as any;
    const query = req.query as Record<string, any> | undefined;
    const stateToken = (query?.state as string | undefined) ?? oauthUser?.state;
    const state = this.authService.parseOAuthState(stateToken);
    const { user, created } = await this.authService.upsertUserFromOAuth({
      provider: 'google',
      providerUserId: oauthUser.providerUserId,
      email: oauthUser.email,
      firstName: oauthUser.firstName,
      lastName: oauthUser.lastName,
      picture: oauthUser.picture,
    });
    const jwt = this.authService.issueJwt(user, 'google');
    const redirectUrl = this.authService.buildFrontendRedirect(
      jwt,
      'google',
      state.redirect,
      created
    );
    return reply.redirect(redirectUrl);
  }

  @Get('facebook')
  @ApiOperation({ summary: 'Start Facebook OAuth' })
  @ApiResponse({ status: 302, description: 'Redirects to Facebook' })
  @UseGuards(FacebookOAuthStartGuard)
  async facebook() {
    return;
  }

  @Get('facebook/callback')
  @ApiOperation({ summary: 'Facebook OAuth callback' })
  @ApiResponse({ status: 302, description: 'Redirects back to frontend with session token' })
  @UseGuards(FacebookOAuthCallbackGuard)
  async facebookCallback(@Req() req: OAuthRequest, @Res() reply: FastifyReply) {
    const oauthUser = (req.user ?? {}) as any;
    const query = req.query as Record<string, any> | undefined;
    const stateToken = (query?.state as string | undefined) ?? oauthUser?.state;
    const state = this.authService.parseOAuthState(stateToken);
    const { user, created } = await this.authService.upsertUserFromOAuth({
      provider: 'facebook',
      providerUserId: oauthUser.providerUserId,
      email: oauthUser.email,
      firstName: oauthUser.firstName,
      lastName: oauthUser.lastName,
      picture: oauthUser.picture,
    });
    const jwt = this.authService.issueJwt(user, 'facebook');
    const redirectUrl = this.authService.buildFrontendRedirect(
      jwt,
      'facebook',
      state.redirect,
      created
    );
    return reply.redirect(redirectUrl);
  }
}
type OAuthRequest = FastifyRequest & { user?: any; query?: Record<string, any> };
