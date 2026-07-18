import { api } from '../../core/api/apiClient'
import logger from '../../core/utils/logger'

export async function getUserProfile(userId) {
  try {
    const { data } = await api.get(`/users/${userId}`)
    return { success: true, data }
  } catch (error) {
    logger.error('Profile', `Failed to load: ${error.message}`)
    return { success: false }
  }
}

export async function updateProfile(userId, profileData) {
  try {
    const { data } = await api.put(`/users/${userId}`, profileData)
    return { success: true, data }
  } catch (error) {
    logger.error('Profile', `Failed to update: ${error.message}`)
    return { success: false, message: error.response?.data?.message || 'Failed to update' }
  }
}

export async function changePassword(passwordData) {
  try {
    const { data } = await api.post('/auth/change-password', passwordData)
    return { success: true, data }
  } catch (error) {
    logger.error('Profile', `Failed to change password: ${error.message}`)
    return { success: false, message: error.response?.data?.message || 'Failed to change' }
  }
}

// Aliases for backward compatibility
export const getStaffProfile = getUserProfile
export const changeStaffPassword = changePassword
