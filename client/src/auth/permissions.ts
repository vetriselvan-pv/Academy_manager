import { UserRole } from '@/types/enums'
import type { Permission } from '@/types/enums'
import type { AuthenticatedUser } from '@/types/models'

export function isSuperAdmin(user: AuthenticatedUser | null): boolean {
  return user?.role === UserRole.SUPER_ADMIN
}

export function isTeacher(user: AuthenticatedUser | null): user is AuthenticatedUser & { role: 'TEACHER' } {
  return user?.role === UserRole.TEACHER
}

export function isStudent(user: AuthenticatedUser | null): user is AuthenticatedUser & { role: 'STUDENT' } {
  return user?.role === UserRole.STUDENT
}

export function hasRole(user: AuthenticatedUser | null, ...roles: UserRole[]): boolean {
  if (!user) return false
  if (user.role === UserRole.SUPER_ADMIN) return true
  return roles.includes(user.role)
}

/** SUPER_ADMIN always passes, mirroring the backend's `can()` preHandler. */
export function hasPermission(user: AuthenticatedUser | null, ...permissions: Permission[]): boolean {
  if (!user) return false
  if (user.role === UserRole.SUPER_ADMIN) return true
  if (user.role !== UserRole.TEACHER) return false
  return permissions.every((permission) => user.permissions.includes(permission))
}
