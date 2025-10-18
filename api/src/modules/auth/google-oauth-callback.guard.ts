import { Injectable } from '@nestjs/common';
import { AuthGuard as PassportAuthGuard } from '@nestjs/passport';

@Injectable()
export class GoogleOAuthCallbackGuard extends PassportAuthGuard('google') {
  getAuthenticateOptions() {
    return { session: false };
  }
}
