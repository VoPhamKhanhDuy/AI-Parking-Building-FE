import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
const REQUEST_TIMEOUT = 15000

// Token refresh state
let isRefreshing = false
let refreshSubscribers = []

const subscribeTokenRefresh = (callback) => {
  refreshSubscribers.push(callback)
}

const onTokenRefreshed = (newToken) => {
  refreshSubscribers.forEach((callback) => callback(newToken))
  refreshSubscribers = []
  isRefreshing = false
}

const clearAuthStorage = () => {
  localStorage.removeItem('parking_access_token')
  localStorage.removeItem('parking_refresh_token')
  localStorage.removeItem('parking_user')
  localStorage.removeItem('parking_token_expires')
}

// Create base axios instance
const createBaseInstance = () => {
  const instance = axios.create({
    baseURL: API_BASE_URL,
    timeout: REQUEST_TIMEOUT,
    headers: {
      'Content-Type': 'application/json'
    }
  })
  return instance
}

const api = createBaseInstance()

// Request interceptor: attach token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('parking_access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor: handle 401 and token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // Only handle 401 errors that haven't been retried
    if (error.response?.status === 401 && !originalRequest._retry) {
      // If already refreshing, queue this request
      if (isRefreshing) {
        return new Promise((resolve) => {
          subscribeTokenRefresh((newToken) => {
            originalRequest._retry = true
            originalRequest.headers.Authorization = `Bearer ${newToken}`
            resolve(api(originalRequest))
          })
        })
      }

      // Start refresh process
      isRefreshing = true
      originalRequest._retry = true

      try {
        const refreshToken = localStorage.getItem('parking_refresh_token')

        if (!refreshToken) {
          throw new Error('No refresh token')
        }

        const { data } = await axios.post(`${API_BASE_URL}/auth/refresh`, { refreshToken })

        localStorage.setItem('parking_access_token', data.accessToken)
        localStorage.setItem('parking_refresh_token', data.refreshToken)

        if (data.expiresInSeconds) {
          localStorage.setItem(
            'parking_token_expires',
            String(Date.now() + data.expiresInSeconds * 1000)
          )
        }

        // Update the original request with new token
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`
        onTokenRefreshed(data.accessToken)

        // Retry original request
        return api(originalRequest)
      } catch (refreshError) {
        // Refresh failed - clear tokens and redirect to login
        clearAuthStorage()
        window.location.href = '/'
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

// Create additional API client instances (for specific use cases)
export const createApiClient = (baseURL = API_BASE_URL) => {
  const client = createBaseInstance()
  client.defaults.baseURL = `${baseURL}/`

  // Attach token on each request
  client.interceptors.request.use((config) => {
    const token = localStorage.getItem('parking_access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  })

  return client
}

export { api }
export default api
