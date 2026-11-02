import { useQuery } from '@tanstack/react-query'
import { authApi } from '@/features/auth/auth.api'

export const useCurrentUser = () => {
  return useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const response = await authApi.me()
      return response
    },
  })
}
