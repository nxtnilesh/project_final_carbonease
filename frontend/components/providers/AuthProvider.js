'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { authAPI } from '@/lib/api'
import { getToken, setToken, removeToken, getUser, setUser, removeUser, isTokenValid } from '@/lib/auth'
import toast from 'react-hot-toast'

const AuthContext = createContext({})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUserState] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = getToken()
        const savedUser = getUser()
        
        if (token && isTokenValid() && savedUser) {
          // Verify token with server
          try {
            const response = await authAPI.getMe()
            setUserState(response.data.data.user)
            setUser(response.data.data.user)
            setIsAuthenticated(true)
          } catch (error) {
            // Token is invalid, clear auth state
            logout()
          }
        } else {
          // No valid token, clear auth state
          logout()
        }
      } catch (error) {
        console.error('Auth initialization error:', error)
        logout()
      } finally {
        setLoading(false)
      }
    }

    initAuth()
  }, [])

  const login = async (credentials) => {
    try {
      setLoading(true)
      const response = await authAPI.login(credentials)
      const { user: userData, token } = response.data.data
      
      setToken(token)
      setUser(userData)
      setUserState(userData)
      setIsAuthenticated(true)
      
      toast.success('Login successful!')
      return { success: true, user: userData }
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed'
      toast.error(message)
      return { success: false, error: message }
    } finally {
      setLoading(false)
    }
  }

  const register = async (userData) => {
    try {
      setLoading(true)
      const response = await authAPI.register(userData)
      const { user: newUser, token } = response.data.data
      
      setToken(token)
      setUser(newUser)
      setUserState(newUser)
      setIsAuthenticated(true)
      
      toast.success('Registration successful!')
      return { success: true, user: newUser }
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed'
      toast.error(message)
      return { success: false, error: message }
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      if (isAuthenticated) {
        await authAPI.logout()
      }
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      removeToken()
      removeUser()
      setUserState(null)
      setIsAuthenticated(false)
    }
  }

  const updateProfile = async (profileData) => {
    try {
      setLoading(true)
      const response = await authAPI.updateProfile(profileData)
      const updatedUser = response.data.data.user
      
      setUser(updatedUser)
      setUserState(updatedUser)
      
      toast.success('Profile updated successfully!')
      return { success: true, user: updatedUser }
    } catch (error) {
      const message = error.response?.data?.message || 'Profile update failed'
      toast.error(message)
      return { success: false, error: message }
    } finally {
      setLoading(false)
    }
  }

  const changePassword = async (passwordData) => {
    try {
      setLoading(true)
      await authAPI.changePassword(passwordData)
      toast.success('Password changed successfully!')
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.message || 'Password change failed'
      toast.error(message)
      return { success: false, error: message }
    } finally {
      setLoading(false)
    }
  }

  const forgotPassword = async (email) => {
    try {
      setLoading(true)
      await authAPI.forgotPassword(email)
      toast.success('Password reset email sent!')
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to send reset email'
      toast.error(message)
      return { success: false, error: message }
    } finally {
      setLoading(false)
    }
  }

  const resetPassword = async (token, password) => {
    try {
      setLoading(true)
      const response = await authAPI.resetPassword(token, password)
      const { token: newToken } = response.data.data
      
      setToken(newToken)
      toast.success('Password reset successful!')
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.message || 'Password reset failed'
      toast.error(message)
      return { success: false, error: message }
    } finally {
      setLoading(false)
    }
  }

  const verifyEmail = async (token) => {
    try {
      setLoading(true)
      await authAPI.verifyEmail(token)
      toast.success('Email verified successfully!')
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.message || 'Email verification failed'
      toast.error(message)
      return { success: false, error: message }
    } finally {
      setLoading(false)
    }
  }

  const resendVerification = async () => {
    try {
      setLoading(true)
      await authAPI.resendVerification()
      toast.success('Verification email sent!')
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to send verification email'
      toast.error(message)
      return { success: false, error: message }
    } finally {
      setLoading(false)
    }
  }

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    forgotPassword,
    resetPassword,
    verifyEmail,
    resendVerification,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
