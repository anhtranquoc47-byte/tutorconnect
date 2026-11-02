import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from './auth.store'

export function PublicOnlyRoute() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  if (isAuthenticated) {
    return <Navigate to="/already-authenticated" replace />
  }

  return <Outlet />
}