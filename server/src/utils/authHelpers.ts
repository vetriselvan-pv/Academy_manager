import { AuthUser, UserRole } from '../types';
import { ForbiddenError } from './errors';

/**
 * Restricts a TEACHER to branches they are assigned to. SUPER_ADMIN always
 * passes. Used by routes where a teacher manages branch-scoped resources
 * (students, enrollments) instead of relying on a blanket role check.
 */
export function assertBranchAccess(authUser: AuthUser, branchId: string): void {
  if (authUser.role === UserRole.SUPER_ADMIN) {
    return;
  }
  if (authUser.role === UserRole.TEACHER && authUser.branches.includes(branchId)) {
    return;
  }
  throw new ForbiddenError('You do not have access to this branch');
}
