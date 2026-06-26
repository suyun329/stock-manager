import { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import { login as apiLogin, signup as apiSignup } from '@/api/auth'

interface AuthUser {
  username: string
  name: string
}

interface AuthContextType {
  user: AuthUser | null
  isLoading: boolean
  login: (username: string, password: string) => Promise<void>
  signup: (username: string, name: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const storedUser = localStorage.getItem('user')
    if (token && storedUser) {
      setUser(JSON.parse(storedUser))
    }
    setIsLoading(false)
  }, [])

  const login = async (username: string, password: string) => {
    const data = await apiLogin(username, password)
    localStorage.setItem('token', data.access_token)
    const authUser = { username, name: data.name }
    localStorage.setItem('user', JSON.stringify(authUser))
    setUser(authUser)
  }

  const signup = async (username: string, name: string, password: string) => {
    await apiSignup(username, name, password)
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
