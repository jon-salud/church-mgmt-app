import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard as PassportAuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';

@Injectable()
export class GoogleOAuthStartGuard extends PassportAuthGuard('google') {
  constructor(private readonly authService: AuthService) {
    super();
  }

  getAuthenticateOptions(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const redirect = (request?.query?.redirect as string | undefined) ?? undefined;
    const state = this.authService.generateOAuthState('google', redirect);
    return {
      scope: ['email', 'profile'],
      session: false,
      state,
      prompt: 'select_account',
    };
  }
}
