import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { authApi } from '@/api/auth.api'
import { meApi } from '@/api/me.api'
import { authEvents } from '@/lib/authEvents'
import { queryClient } from '@/lib/queryClient'
import { tokenStorage } from '@/lib/tokenStorage'
import type { LoginPayload, RegisterStudentPayload } from '@/types/api'
import type { AuthenticatedUser } from '@/types/models'

interface AuthContextValue {
  user: AuthenticatedUser | null
  isAuthenticated: boolean
  isBootstrapping: boolean
  login: (payload: LoginPayload) => Promise<AuthenticatedUser>
  registerStudent: (payload: RegisterStudentPayload) => Promise<AuthenticatedUser>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthenticatedUser | null>(null)
  const [isBootstrapping, setIsBootstrapping] = useState(true)

  const clearSession = useCallback(() => {
    tokenStorage.clear()
    setUser(null)
    queryClient.clear()
  }, [])

  useEffect(() => {
    let cancelled = false

    async function bootstrap() {
      if (!tokenStorage.getAccessToken()) {
        setIsBootstrapping(false)
        return
      }
      try {
        const { user: me } = await meApi.get()
        if (!cancelled) setUser(me)
      } catch {
        if (!cancelled) clearSession()
      } finally {
        if (!cancelled) setIsBootstrapping(false)
      }
    }

    void bootstrap()
    return () => {
      cancelled = true
    }
  }, [clearSession])

  useEffect(() => {
    return authEvents.on('unauthorized', clearSession)
  }, [clearSession])

  const login = useCallback(async (payload: LoginPayload) => {
    const { user: loggedInUser, ...tokens } = await authApi.login(payload)
    tokenStorage.setTokens(tokens)
    setUser(loggedInUser)
    return loggedInUser
  }, [])

  const registerStudent = useCallback(async (payload: RegisterStudentPayload) => {
    const { user: newUser, ...tokens } = await authApi.registerStudent(payload)
    tokenStorage.setTokens(tokens)
    setUser(newUser)
    return newUser
  }, [])

  const logout = useCallback(async () => {
    const refreshToken = tokenStorage.getRefreshToken()
    if (refreshToken) {
      await authApi.logout(refreshToken).catch(() => undefined)
    }
    clearSession()
  }, [clearSession])

  const refreshUser = useCallback(async () => {
    const { user: me } = await meApi.get()
    setUser(me)
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: user !== null,
      isBootstrapping,
      login,
      registerStudent,
      logout,
      refreshUser,
    }),
    [user, isBootstrapping, login, registerStudent, logout, refreshUser],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
