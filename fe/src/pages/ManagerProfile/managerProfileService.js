import { api } from '../../core/api/apiClient'
import logger from '../../core/utils/logger'

export async function getManagerProfile(managerId) {
  try {
    const { data } = await api.get(`/users/${managerId}`)
    return { success: true, data }
  } catch (error) {
    logger.error('ManagerProfile', `Failed to load: ${error.message}`)
    return { success: false }
  }
}

export async function updateManagerProfile(managerId, profileData) {
  try {
    const { data } = await api.put(`/users/${managerId}`, profileData)
    return { success: true, data }
  } catch (error) {
    logger.error('ManagerProfile', `Failed to update: ${error.message}`)
    return { success: false }
  }
}

export async function changeManagerPassword(managerId, passwordData) {
  try {
    const { data } = await api.post(`/users/${managerId}/change-password`, passwordData)
    return { success: true, data }
  } catch (error) {
    logger.error('ManagerProfile', `Failed to change password: ${error.message}`)
    return { success: false, message: error.response?.data?.message || 'Failed to change password' }
  }
}
