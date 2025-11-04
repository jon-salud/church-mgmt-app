import { ForbiddenException } from '@nestjs/common';

/**
 * Shared authorization helper to ensure the current user has Admin or Leader role.
 * Throws ForbiddenException if the user doesn't have the required role.
 *
 * @param req - Express request object containing user information
 * @throws ForbiddenException if user is not an Admin or Leader
 */
export function ensureLeader(req: any): void {
  const role = req.user?.role;
  if (role !== 'Admin' && role !== 'Leader') {
    throw new ForbiddenException('Admin or Leader role required');
  }
}
