import { QueryClient } from '@tanstack/react-query'
import { ApiError } from '@/lib/api/http'

/**
 * Shared TanStack Query client. Sensible defaults for a real app:
 * - don't retry 4xx (client errors won't fix themselves)
 * - 30s stale time to cut redundant refetches
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: (failureCount, error) => {
        if (error instanceof ApiError && error.status >= 400 && error.status < 500)
          return false
        return failureCount < 2
      },
      refetchOnWindowFocus: false,
    },
    mutations: { retry: false },
  },
})
