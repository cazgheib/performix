import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import axios from 'axios'

const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:8000'

interface User {
  id: string
  email: string
  full_name: string
  created_at: string
  role?: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  isAdmin: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, fullName: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  
  const isAdmin = user?.role === 'admin'

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      fetchUser()
    } else {
      setLoading(false)
    }
  }, [])

  const fetchUser = async () => {
    try {
      const response = await axios.get(`${API_URL}/auth/me`)
      setUser(response.data)
    } catch (error) {
      localStorage.removeItem('token')
      delete axios.defaults.headers.common['Authorization']
    } finally {
      setLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        email,
        password
      })
      
      const { access_token } = response.data
      localStorage.setItem('token', access_token)
      axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`
      
      await fetchUser()
    } catch (error: any) {
      console.error('Login error:', error)
      if (error.response?.data?.detail) {
        throw new Error(error.response.data.detail)
      } else if (error.response?.status === 401) {
        throw new Error('Incorrect email or password.')
      } else if (error.response?.status === 400) {
        throw new Error('Login failed. Please check your information.')
      } else if (error.response?.status >= 500) {
        throw new Error('Server error. Please try again later.')
      } else if (error.code === 'NETWORK_ERROR' || !error.response) {
        throw new Error('Network error. Please check your connection.')
      } else {
        throw new Error('Login failed. Please try again.')
      }
    }
  }

  const register = async (email: string, password: string, fullName: string) => {
    try {
      const response = await axios.post(`${API_URL}/auth/register`, {
        email,
        password,
        full_name: fullName
      })
      
      const { access_token } = response.data
      localStorage.setItem('token', access_token)
      axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`
      
      await fetchUser()
    } catch (error: any) {
      console.error('Registration error:', error)
      if (error.response?.data?.detail) {
        throw new Error(error.response.data.detail)
      } else if (error.response?.status === 400) {
        throw new Error('Registration failed. Please check your information.')
      } else if (error.response?.status >= 500) {
        throw new Error('Server error. Please try again later.')
      } else if (error.code === 'NETWORK_ERROR' || !error.response) {
        throw new Error('Network error. Please check your connection.')
      } else {
        throw new Error('Registration failed. Please try again.')
      }
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    delete axios.defaults.headers.common['Authorization']
    setUser(null)
  }

  const value = {
    user,
    loading,
    isAdmin,
    login,
    register,
    logout
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
