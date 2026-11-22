import React, { createContext, useContext, useState, useEffect } from 'react'
import { api, ApiError } from '../services/api'

export interface UserSkill {
  id: number
  profile_id: number
  name: string
}

export interface UserProfile {
  id: number
  user_id: number
  experience_level?: string
  location?: string
  work_mode?: string
  skills: UserSkill[]
}

export interface User {
  id: number
  email: string
  created_at?: string
  profile?: UserProfile | null
}

interface AuthContextType {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (data: {
    email: string
    password: string
    experience_level?: string
    location?: string
    work_mode?: string
    skills?: string[]
  }) => Promise<void>
  logout: () => void
  refreshUser: () => Promise<void>
  updateProfile: (data: {
    experience_level?: string
    location?: string
    work_mode?: string
    skills?: string[]
  }) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('hiremind_token'))
  const [isLoading, setIsLoading] = useState<boolean>(true)

  const fetchCurrentUser = async () => {
    try {
      const userData: User = await api.auth.getMe()
      setUser(userData)
    } catch (err: any) {
      if (err instanceof ApiError && err.status === 401) {
        localStorage.removeItem('hiremind_token')
        setToken(null)
        setUser(null)
      }
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (token) {
      fetchCurrentUser()
    } else {
      setIsLoading(false)
    }
  }, [token])

  const login = async (email: string, password: string) => {
    const data = await api.auth.login({ email, password })
    localStorage.setItem('hiremind_token', data.access_token)
    setToken(data.access_token)
    setUser(data.user)
  }

  const register = async (payload: {
    email: string
    password: string
    experience_level?: string
    location?: string
    work_mode?: string
    skills?: string[]
  }) => {
    const data = await api.auth.register(payload)
    localStorage.setItem('hiremind_token', data.access_token)
    setToken(data.access_token)
    setUser(data.user)
  }

  const logout = () => {
    localStorage.removeItem('hiremind_token')
    setToken(null)
    setUser(null)
  }

  const refreshUser = async () => {
    if (token) {
      await fetchCurrentUser()
    }
  }

  const updateProfile = async (payload: {
    experience_level?: string
    location?: string
    work_mode?: string
    skills?: string[]
  }) => {
    const updatedUser = await api.auth.updateProfile(payload)
    setUser(updatedUser)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        refreshUser,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
