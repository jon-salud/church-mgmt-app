import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader: string | undefined = request.headers['authorization'];
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;
    const result = await this.authService.resolveAuthBearer(token);
    if (!result) {
      throw new UnauthorizedException(
        'Missing or invalid credentials. Provide a Bearer JWT from the OAuth login flow or an allowed demo token.',
      );
    }

    request.user = {
      id: result.user.id,
      email: result.user.primaryEmail,
      roles: result.user.roles,
      profile: result.user.profile,
      token: result.session.token,
    };
    return true;
  }
}
