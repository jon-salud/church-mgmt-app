import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface User {
  id: string;
  primaryEmail: string;
  churchId: string;
  roles: Array<{ churchId: string; roleId: string; role: string }>;
}

export const CurrentUser = createParamDecorator((data: unknown, ctx: ExecutionContext): User => {
  const request = ctx.switchToHttp().getRequest();
  return request.user;
});
