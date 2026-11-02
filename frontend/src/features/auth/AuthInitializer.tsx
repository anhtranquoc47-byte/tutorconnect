import { useEffect, type ReactNode } from 'react'
import { useAuthStore } from './auth.store'

export function AuthInitializer({ children }: { children: ReactNode }) {
  const initialize = useAuthStore((state) => state.initialize)

  useEffect(() => {
    void initialize()
  }, [initialize])

  return <>{children}</>
}
