import { api } from '../../core/api/apiClient'
import logger from '../../core/utils/logger'

export async function getUserProfile(userId) {
  if (!userId) {
    logger.warn('Profile', 'getUserProfile called without userId')
    return { success: false, message: 'Missing userId' }
  }
  try {
    const { data } = await api.get(`/users/${userId}`)
    return { success: true, data }
  } catch (error) {
    const message = error.response?.data?.message || error.message || 'Failed to load profile'
    logger.error('Profile', `Failed to load: ${message}`)
    return { success: false, message }
  }
}

export async function getCurrentStaffProfile() {
  try {
    const { data } = await api.get('/auth/me')
    return { success: true, data }
  } catch (error) {
    const message = error.response?.data?.message || error.message || 'Failed to load profile'
    logger.error('Profile', `Failed to load: ${message}`)
    return { success: false, message }
  }
}

export async function updateProfile(userId, profileData) {
  try {
    const { data } = await api.put(`/users/${userId}`, profileData)
    return { success: true, data }
  } catch (error) {
    const message = error.response?.data?.message || error.message || 'Failed to update'
    logger.error('Profile', `Failed to update: ${message}`)
    return { success: false, message }
  }
}

export async function changePassword(passwordData) {
  try {
    const { data } = await api.post('/auth/change-password', passwordData)
    const message = (typeof data === 'string' && data) || data?.message || 'Password changed successfully.'
    return { success: true, message }
  } catch (error) {
    const message = error.response?.data?.message || error.message || 'Failed to change'
    logger.error('Profile', `Failed to change password: ${message}`)
    return { success: false, message }
  }
}

// Aliases for backward compatibility
export const getStaffProfile = getCurrentStaffProfile
export const changeStaffPassword = changePassword
