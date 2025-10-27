import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { Role } from './types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Check if a user has a specific role by slug (case-insensitive)
 */
export function hasRole(userRoles: Role[] | undefined | null, roleName: string): boolean {
  if (!Array.isArray(userRoles)) return false;
  const normalizedRoleName = roleName.toLowerCase();
  return userRoles.some(role => {
    if (!role) return false;
    // Check only 'slug' property, case-insensitive
    if (typeof role.slug === 'string' && role.slug.toLowerCase() === normalizedRoleName) {
      return true;
    }
    return false;
  });
}
