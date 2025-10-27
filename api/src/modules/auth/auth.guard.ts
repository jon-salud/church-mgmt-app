import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { AuthService } from './auth.service';

const BEARER_PREFIX = 'Bearer ';
const SESSION_COOKIE_NAME = 'session_token';

const normaliseHeader = (value: unknown): string | undefined => {
  if (typeof value === 'string') {
    return value;
  }
  if (Array.isArray(value)) {
    return value.find(item => typeof item === 'string');
  }
  return undefined;
};

const extractCookieToken = (cookieHeader?: string): string | undefined => {
  if (!cookieHeader) return undefined;
  const cookies = cookieHeader.split(';');
  for (const cookie of cookies) {
    const [name, ...rest] = cookie.trim().split('=');
    if (name === SESSION_COOKIE_NAME) {
      return rest.join('=').trim();
    }
    // Also check for demo_token
    if (name === 'demo_token') {
      return rest.join('=').trim();
    }
  }
  return undefined;
};

const coerceBearerToken = (headerValue?: string): string | undefined => {
  if (!headerValue) return undefined;
  if (headerValue.startsWith(BEARER_PREFIX)) {
    return headerValue.slice(BEARER_PREFIX.length).trim();
  }
  return headerValue.trim();
};

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const headerToken = coerceBearerToken(normaliseHeader(request.headers['authorization']));
    const xSessionToken = normaliseHeader(request.headers['x-session-token']);
    const cookieHeader = normaliseHeader(request.headers['cookie']);
    const cookieToken = request.cookies?.[SESSION_COOKIE_NAME] ?? extractCookieToken(cookieHeader);
    const token = headerToken ?? xSessionToken ?? cookieToken;
    const result = await this.authService.resolveAuthBearer(token);
    if (!result) {
      throw new UnauthorizedException(
        'Missing or invalid credentials. Provide a Bearer JWT from the OAuth login flow or an allowed demo token.'
      );
    }

    if (result.user.status && result.user.status !== 'active') {
      throw new ForbiddenException(
        'Account is not active yet. Contact an administrator for access.'
      );
    }

    request.user = {
      id: result.user.id,
      email: result.user.primaryEmail,
      roles: result.user.roles,
      profile: result.user.profile,
      token: result.session.token,
    };
    request.session = result.session;
    return true;
  }
}
