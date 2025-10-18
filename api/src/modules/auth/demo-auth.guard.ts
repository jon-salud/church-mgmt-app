import { CanActivate, ExecutionContext, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { DATA_STORE, DataStore } from '../../datastore';

@Injectable()
export class DemoAuthGuard implements CanActivate {
  constructor(@Inject(DATA_STORE) private readonly db: DataStore) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const authHeader: string | undefined = request.headers['authorization'];
    const token =
      authHeader?.startsWith('Bearer ') === true ? authHeader.slice(7) : authHeader;
    const session = this.db.getSessionByToken(token || 'demo-admin');
    if (!session) {
      throw new UnauthorizedException(
        'Invalid or missing demo token. Use one of demo-admin | demo-leader | demo-member or login via /auth/login.',
      );
    }
    request.user = {
      id: session.user.id,
      email: session.user.primaryEmail,
      roles: session.user.roles,
      profile: session.user.profile,
      token: session.session.token,
    };
    return true;
  }
}
