import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import { api } from '@/lib/api'
import { setAccessToken } from '@/lib/auth-token'

const REFRESH_TOKEN_KEY = 'refresh_token'

interface User {
  id: string
  email: string
}

interface AuthResponse {
  user: User
  accessToken: string
  refreshToken: string
}

interface AuthContextValue {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

function saveTokens(access: string, refresh: string) {
  setAccessToken(access)
  localStorage.setItem(REFRESH_TOKEN_KEY, refresh)
}

function clearTokens() {
  setAccessToken(null)
  localStorage.removeItem(REFRESH_TOKEN_KEY)
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // On mount: try to restore session using a stored refresh token
  useEffect(() => {
    const storedRefresh = localStorage.getItem(REFRESH_TOKEN_KEY)
    if (!storedRefresh) {
      setIsLoading(false)
      return
    }

    api
      .post<{ accessToken: string; refreshToken: string }>('/api/auth/refresh', {
        refreshToken: storedRefresh,
      })
      .then(({ accessToken, refreshToken }) => {
        saveTokens(accessToken, refreshToken)
        return api.get<{ user: User }>('/api/users/me')
      })
      .then(({ user }) => setUser(user))
      .catch(() => clearTokens())
      .finally(() => setIsLoading(false))
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const { user, accessToken, refreshToken } = await api.post<AuthResponse>('/api/auth/login', {
      email,
      password,
    })
    saveTokens(accessToken, refreshToken)
    setUser(user)
  }, [])

  const register = useCallback(async (email: string, password: string) => {
    const { user, accessToken, refreshToken } = await api.post<AuthResponse>('/api/auth/register', {
      email,
      password,
    })
    saveTokens(accessToken, refreshToken)
    setUser(user)
  }, [])

  const logout = useCallback(async () => {
    const storedRefresh = localStorage.getItem(REFRESH_TOKEN_KEY)
    if (storedRefresh) {
      await api.post('/api/auth/logout', { refreshToken: storedRefresh }).catch(() => {})
    }
    clearTokens()
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: user !== null,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
