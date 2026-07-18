import { api } from '../../core/api/apiClient'
import logger from '../../core/utils/logger'

export async function getStaffActivities(params = {}) {
  try {
    const { data } = await api.get('/staff-activities', { params })
    return { success: true, data }
  } catch (error) {
    logger.error('StaffActivity', `Failed to load: ${error.message}`)
    return { success: false }
  }
}

export async function submitStaffActivityAction(action, staffId) {
  try {
    const { data } = await api.post('/staff-activities', { action, staffId })
    return { success: true, data }
  } catch (error) {
    logger.error('StaffActivity', `Failed to submit: ${error.message}`)
    return { success: false, message: 'Failed to submit action' }
  }
}

export async function getStaffActivity(params = {}) {
  return getStaffActivities(params)
}
