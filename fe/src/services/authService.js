import { api } from '../core/api/apiClient'
import logger from '../core/utils/logger'

export { api }

const TOKEN_KEY = 'parking_access_token'
const REFRESH_KEY = 'parking_refresh_token'
const USER_KEY = 'parking_user'

export const getToken = () => localStorage.getItem(TOKEN_KEY)
export const getRefreshToken = () => localStorage.getItem(REFRESH_KEY)

export const getStoredUser = () => {
  const user = localStorage.getItem(USER_KEY)
  return user ? JSON.parse(user) : null
}

const setTokens = (accessToken, refreshToken, expiresInSeconds) => {
  localStorage.setItem(TOKEN_KEY, accessToken)
  localStorage.setItem(REFRESH_KEY, refreshToken)
  if (expiresInSeconds) {
    const expiresAt = Date.now() + expiresInSeconds * 1000
    localStorage.setItem('parking_token_expires', expiresAt.toString())
  }
}

const setUser = (user) => {
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export const clearAuth = () => {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(REFRESH_KEY)
  localStorage.removeItem(USER_KEY)
  localStorage.removeItem('parking_token_expires')
}

export const loginRequest = async (email, password) => {
  logger.info('Auth', `Login attempt for: ${email}`)
  try {
    const { data } = await api.post('/auth/login', { email, password })
    setTokens(data.accessToken, data.refreshToken, data.expiresInSeconds)
    setUser(data.user)
    logger.info('Auth', 'Login successful')
    return { success: true, user: data.user, accessToken: data.accessToken }
  } catch (error) {
    logger.error('Auth', `Login failed: ${error.response?.data?.message || error.message}`)
    return { success: false, message: error.response?.data?.message || 'Login failed. Please check your credentials.' }
  }
}

export const getCurrentUser = async () => {
  try {
    const { data } = await api.get('/auth/me')
    setUser(data)
    return data
  } catch {
    return null
  }
}

export const logoutRequest = async () => {
  try {
    await api.post('/auth/logout')
  } catch {
    // Ignore logout errors
  }
  clearAuth()
}

export const isAuthenticated = () => {
  const token = getToken()
  const expiresAt = localStorage.getItem('parking_token_expires')
  if (!token) return false
  if (expiresAt && Date.now() > parseInt(expiresAt)) return false
  return true
}

export const getUserRole = () => {
  const user = getStoredUser()
  return user?.role || null
}
