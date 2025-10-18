import { Body, Controller, Get, Headers, Post, Req, Res, UseGuards } from '@nestjs/common';
import { FastifyReply, FastifyRequest } from 'fastify';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { AuthGuard } from './auth.guard';
import { GoogleOAuthStartGuard } from './google-oauth-start.guard';
import { GoogleOAuthCallbackGuard } from './google-oauth-callback.guard';
import { FacebookOAuthStartGuard } from './facebook-oauth-start.guard';
import { FacebookOAuthCallbackGuard } from './facebook-oauth-callback.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() dto: LoginDto) {
    const { session, user } = await this.authService.login(dto.email, dto.provider, dto.role);
    const jwt = this.authService.issueJwt(user, 'demo');
    return {
      token: session.token,
      jwt,
      provider: session.provider,
      user,
    };
  }

  @UseGuards(AuthGuard)
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
  @UseGuards(GoogleOAuthStartGuard)
  async google() {
    return;
  }

  @Get('google/callback')
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
    const redirectUrl = this.authService.buildFrontendRedirect(jwt, 'google', state.redirect, created);
    return reply.redirect(redirectUrl);
  }

  @Get('facebook')
  @UseGuards(FacebookOAuthStartGuard)
  async facebook() {
    return;
  }

  @Get('facebook/callback')
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
    const redirectUrl = this.authService.buildFrontendRedirect(jwt, 'facebook', state.redirect, created);
    return reply.redirect(redirectUrl);
  }
}
type OAuthRequest = FastifyRequest & { user?: any; query?: Record<string, any> };
