import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard as PassportAuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';

@Injectable()
export class FacebookOAuthStartGuard extends PassportAuthGuard('facebook') {
  constructor(private readonly authService: AuthService) {
    super();
  }

  getAuthenticateOptions(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const redirect = (request?.query?.redirect as string | undefined) ?? undefined;
    const state = this.authService.generateOAuthState('facebook', redirect);
    return {
      scope: ['email', 'public_profile'],
      session: false,
      state,
    };
  }
}
