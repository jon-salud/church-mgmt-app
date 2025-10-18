import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { MockDatabaseService } from '../../mock/mock-database.service';

@Injectable()
export class DemoAuthGuard implements CanActivate {
  constructor(private readonly db: MockDatabaseService) {}

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
