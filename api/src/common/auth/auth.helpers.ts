import { ForbiddenException } from '@nestjs/common';

/**
 * Shared authorization helper to ensure the current user has Admin or Leader role.
 * Throws ForbiddenException if the user doesn't have the required role.
 *
 * @param req - Express request object containing user information
 * @throws ForbiddenException if user is not an Admin or Leader
 */
export function ensureLeader(req: any): void {
  const roles: Array<{ churchId: string; role: string }> = req.user?.roles ?? [];
  const isLeader = roles.some(role => role.role === 'Leader');
  const isAdmin = roles.some(role => role.role === 'Admin');
  if (!isLeader && !isAdmin) {
    throw new ForbiddenException('Admin or Leader role required');
  }
}
