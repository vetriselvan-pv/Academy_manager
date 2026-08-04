import type { ReactNode } from 'react'
import { useAuth } from '@/auth/AuthContext'
import { hasPermission, hasRole } from '@/auth/permissions'
import { ForbiddenPage } from '@/components/StatusPages'
import type { Permission, UserRole } from '@/types/enums'

interface RequireAccessProps {
  roles?: UserRole[]
  permissions?: Permission[]
  children: ReactNode
}

/** Route-level gate mirroring the server's `authorize`/`can` preHandlers, so a direct URL visit is blocked too. */
export function RequireAccess({ roles, permissions, children }: RequireAccessProps) {
  const { user } = useAuth()
  const roleOk = !roles || hasRole(user, ...roles)
  const permissionOk = !permissions || hasPermission(user, ...permissions)

  if (!roleOk || !permissionOk) {
    return <ForbiddenPage />
  }

  return <>{children}</>
}
