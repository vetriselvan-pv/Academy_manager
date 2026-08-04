import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/auth/AuthContext'
import { FullPageSpinner } from '@/components/ui/Spinner'

export function ProtectedRoute() {
  const { isAuthenticated, isBootstrapping } = useAuth()
  const location = useLocation()

  if (isBootstrapping) return <FullPageSpinner />
  if (!isAuthenticated) return <Navigate to="/login" replace state={{ from: location }} />
  return <Outlet />
}

export function GuestRoute() {
  const { isAuthenticated, isBootstrapping } = useAuth()

  if (isBootstrapping) return <FullPageSpinner />
  if (isAuthenticated) return <Navigate to="/dashboard" replace />
  return <Outlet />
}
