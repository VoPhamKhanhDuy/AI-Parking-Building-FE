import { api } from '../../core/api/apiClient'
import logger from '../../core/utils/logger'

/**
 * Change Admin Password via Backend API POST /api/auth/change-password
 */
export async function changeAdminPassword(currentPassword, newPassword) {
  try {
    const payload = { currentPassword, newPassword }
    const { data } = await api.post('/auth/change-password', payload)
    return { success: true, message: data?.message || 'Password changed successfully.' }
  } catch (error) {
    logger.warn('AdminProfileService', `Backend API POST /auth/change-password failed: ${error.message}. Fallback mode active.`)
    return { success: false, message: error.response?.data?.message || error.message }
  }
}
