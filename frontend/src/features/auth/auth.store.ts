import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { tokenStorage } from '@/lib/api/token-storage'
import { authApi } from './auth.api'
import { queryClient } from '@/app/query-client'
import type {
  AuthUser,
  LoginPayload,
  RegisterStudentPayload,
  RegisterTutorPayload,
} from './auth.types'

interface AuthState {
  user: AuthUser | null
  status: 'idle' | 'loading' | 'error'
  error: string | null
  isAuthenticated: boolean
  initialized: boolean
  login: (payload: LoginPayload) => Promise<void>
  logout: () => Promise<void>
  initialize: () => Promise<void>
  registerStudent: (payload: RegisterStudentPayload) => Promise<void>
  registerTutor: (payload: RegisterTutorPayload) => Promise<void>
  clearError: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      status: 'idle',
      error: null,
      isAuthenticated: false,
      initialized: false,

      async login(payload) {
        set({ status: 'loading', error: null })
        try {
          // authApi.login() đã tự lưu token vào tokenStorage bên trong nó
          // (bao gồm cả bước gọi /users/me để lấy id thật) — không cần gọi tokenStorage.set() lại ở đây.
          const res = await authApi.login(payload)
          set({ user: res.user, isAuthenticated: true, status: 'idle' })
        } catch (e) {
          const message = e instanceof Error ? e.message : 'error'
          set({ status: 'error', error: message })
          throw e
        }
      },

      async registerStudent(payload) {
        set({ status: 'loading', error: null })
        try {
          await authApi.registerStudent(payload)
          set({ status: 'idle' })
        } catch (e) {
          const message = e instanceof Error ? e.message : 'error'
          set({ status: 'error', error: message })
          throw e
        }
      },

      async registerTutor(payload) {
        set({ status: 'loading', error: null })
        try {
          await authApi.registerTutor(payload)
          set({ status: 'idle' })
        } catch (e) {
          const message = e instanceof Error ? e.message : 'error'
          set({ status: 'error', error: message })
          throw e
        }
      },

      async initialize() {
        const token = tokenStorage.getAccess()
        if (!token) {
          set({ user: null, isAuthenticated: false, status: 'idle', error: null, initialized: true })
          return
        }

        // If the store already has a user (e.g. just logged in or hydrated from
        // persist), skip the /me round-trip — the token is freshly valid.
        const currentUser = useAuthStore.getState().user
        if (currentUser) {
          set({ isAuthenticated: true, status: 'idle', error: null, initialized: true })
          return
        }

        set({ status: 'loading', error: null })
        try {
          const user = await authApi.me()
          set({ user, isAuthenticated: true, status: 'idle', error: null, initialized: true })
        } catch {
          tokenStorage.clear()
          set({ user: null, isAuthenticated: false, status: 'idle', error: null, initialized: true })
        }
      },

      async logout() {
  try {
    await authApi.logout()
  } finally {
    queryClient.clear() // Xóa sạch bộ nhớ đệm dữ liệu cũ
    set({ user: null, isAuthenticated: false, status: 'idle', error: null })
  }
},
      clearError() {
        set({ error: null, status: 'idle' })
      },
    }),
    {
      name: 'auth',
      partialize: (s) => ({ user: s.user, isAuthenticated: s.isAuthenticated }),
    },
  ),
)

window.addEventListener('auth:logout', () => useAuthStore.getState().logout())