import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthStore } from './auth.store'
import { Spinner } from '@/components/ui/Spinner'

/**
 * Route guard. Waits for auth initialization before deciding to redirect,
 * preventing a flash-redirect when the store hydrates from localStorage.
 */
export function ProtectedRoute() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const initialized = useAuthStore((s) => s.initialized)
  const location = useLocation()

  if (!initialized) return <Spinner />

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }
  return <Outlet />
}
