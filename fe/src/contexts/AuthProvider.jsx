import { useState, useEffect, useCallback } from 'react'
import { AuthContext } from './AuthContext'
import {
  loginRequest,
  logoutRequest,
  getCurrentUser,
  getStoredUser,
  isAuthenticated,
  clearAuth
} from '../services/authService'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Initialize auth state from stored data
  useEffect(() => {
    const initAuth = async () => {
      if (!isAuthenticated()) {
        setLoading(false)
        return
      }

      const storedUser = getStoredUser()
      if (storedUser) {
        setUser(storedUser)
      }

      try {
        const freshUser = await getCurrentUser()
        if (freshUser) {
          setUser(freshUser)
        }
      } catch {
        // Token might be expired, will be handled by API interceptor
      } finally {
        setLoading(false)
      }
    }

    initAuth()
  }, [])

  const login = useCallback(async (email, password) => {
    setLoading(true)
    setError(null)

    try {
      const result = await loginRequest(email, password)

      if (result.success) {
        setUser(result.user || getStoredUser())
        return { success: true, user: result.user }
      }

      setError(result.message)
      return { success: false, message: result.message }
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed'
      setError(message)
      return { success: false, message }
    } finally {
      setLoading(false)
    }
  }, [])

  const logout = useCallback(async () => {
    setLoading(true)

    try {
      await logoutRequest()
    } finally {
      clearAuth()
      setUser(null)
      setError(null)
      setLoading(false)
    }
  }, [])

  const clearError = useCallback(() => setError(null), [])

  const value = {
    user,
    loading,
    error,
    isAuthenticated,
    login,
    logout,
    setUser,
    clearError
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
