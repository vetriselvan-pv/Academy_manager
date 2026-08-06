import axios, { AxiosHeaders, type AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { authEvents } from './authEvents'
import { tokenStorage } from './tokenStorage'
import type { ApiErrorBody, TokenPair } from '@/types/api'

const baseURL = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_TARGET || '/api'

declare module 'axios' {
  interface InternalAxiosRequestConfig {
    _retry?: boolean
  }
}

export const apiClient = axios.create({ baseURL })

apiClient.interceptors.request.use((config) => {
  const token = tokenStorage.getAccessToken()
  if (token) {
    config.headers = config.headers ?? new AxiosHeaders()
    config.headers.set('Authorization', `Bearer ${token}`)
  }
  return config
})

let refreshPromise: Promise<TokenPair> | null = null

async function refreshTokens(): Promise<TokenPair> {
  const refreshToken = tokenStorage.getRefreshToken()
  if (!refreshToken) {
    throw new Error('No refresh token available')
  }
  const { data } = await axios.post<TokenPair>(`${baseURL}/auth/refresh`, { refreshToken })
  tokenStorage.setTokens(data)
  return data
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiErrorBody>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig | undefined
    const status = error.response?.status
    const isAuthRoute = originalRequest?.url?.includes('/auth/')

    if (status === 401 && originalRequest && !originalRequest._retry && !isAuthRoute) {
      originalRequest._retry = true
      try {
        refreshPromise ??= refreshTokens().finally(() => {
          refreshPromise = null
        })
        const tokens = await refreshPromise
        originalRequest.headers = originalRequest.headers ?? new AxiosHeaders()
        originalRequest.headers.set('Authorization', `Bearer ${tokens.accessToken}`)
        return apiClient(originalRequest)
      } catch (refreshError) {
        tokenStorage.clear()
        authEvents.emit('unauthorized')
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  },
)

export function getApiErrorMessage(error: unknown, fallback = 'Something went wrong'): string {
  if (axios.isAxiosError<ApiErrorBody>(error)) {
    return error.response?.data?.message ?? fallback
  }
  return fallback
}

export function getApiFieldErrors(error: unknown): Record<string, string[] | undefined> | undefined {
  if (axios.isAxiosError<ApiErrorBody>(error)) {
    return error.response?.data?.errors
  }
  return undefined
}
