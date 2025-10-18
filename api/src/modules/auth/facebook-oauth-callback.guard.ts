import { Injectable } from '@nestjs/common';
import { AuthGuard as PassportAuthGuard } from '@nestjs/passport';

@Injectable()
export class FacebookOAuthCallbackGuard extends PassportAuthGuard('facebook') {
  getAuthenticateOptions() {
    return { session: false };
  }
}
