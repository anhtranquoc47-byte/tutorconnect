import axios, {
  AxiosError,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from 'axios'
import { env } from '@/config/env'
import { tokenStorage } from './token-storage'
import { authApi } from '@/features/auth/auth.api'

/** Shape our backend uses for error payloads. Adapt to your API. */
export interface ApiErrorBody {
  message: string
  code?: string
  errors?: Record<string, string[]>
}

export interface ApiEnvelope<T> {
  message: string
  data: T
  code: number
}

/**
 * Normalized error thrown to the UI/query layer. Components should never see
 * a raw AxiosError — they get this stable shape instead.
 */
export class ApiError extends Error {
  readonly status: number
  readonly code?: string
  readonly fieldErrors?: Record<string, string[]>

  constructor(status: number, body?: ApiErrorBody) {
    super(body?.message ?? `Request failed with status ${status}`)
    this.name = 'ApiError'
    this.status = status
    this.code = body?.code
    this.fieldErrors = body?.errors
  }
}

export const http: AxiosInstance = axios.create({
  baseURL: env.apiBaseUrl,
  timeout: 15_000,
  headers: { 'Content-Type': 'application/json' },
})

// --- Request interceptor: attach bearer token -------------------------------
http.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = tokenStorage.getAccess()
  if (token) config.headers.set('Authorization', `Bearer ${token}`)
  return config
})

// --- Response interceptor: normalize errors + handle 401 --------------------
// A single in-flight refresh promise prevents a thundering herd of refreshes
// when several requests 401 at the same time.
let refreshing: Promise<void> | null = null

async function refreshSession(): Promise<void> {
  const refresh = tokenStorage.getRefresh()
  if (!refresh) throw new Error('No refresh token')
  const data = await authApi.refresh()
  tokenStorage.set(data.accessToken, data.refreshToken)
}

// Unwrap the backend envelope { message, data, code } → return the inner `data`
// so callers can do `res.data.accessToken` instead of `res.data.data.accessToken`.
http.interceptors.response.use(
  (response) => {
    const body = response.data as Partial<ApiEnvelope<unknown>>
    if (body && typeof body === 'object' && 'data' in body && 'code' in body) {
      response.data = body.data
    }
    return response
  },
  async (error: AxiosError<ApiErrorBody>) => {
    const original = error.config as InternalAxiosRequestConfig & {
      _retried?: boolean
    }

    const requestUrl = original?.url ?? ''
    const isSessionEndpoint =
      requestUrl.includes('/api/v1/auth/refresh') ||
      requestUrl.includes('/api/v1/auth/logout')

    // Attempt one transparent refresh on protected API requests, then replay.
    // Session endpoints must never refresh themselves: an invalid refresh token
    // would otherwise cause a retry loop and block local logout.
    if (
      error.response?.status === 401 &&
      original &&
      !isSessionEndpoint &&
      !original._retried &&
      tokenStorage.getRefresh()
    ) {
      original._retried = true
      try {
        refreshing ??= refreshSession().finally(() => (refreshing = null))
        await refreshing
        return http(original)
      } catch {
        tokenStorage.clear()
        // Let the app react (e.g. redirect to /login).
        window.dispatchEvent(new CustomEvent('auth:logout'))
      }
    }

    throw new ApiError(error.response?.status ?? 0, error.response?.data)
  },
)