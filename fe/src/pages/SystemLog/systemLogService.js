import { api } from '../../core/api/apiClient'
import logger from '../../core/utils/logger'

export async function getSystemLogs(params = {}) {
  try {
    const { data } = await api.get('/system-logs', { params })
    return { success: true, data }
  } catch (error) {
    logger.error('SystemLogs', `Failed to load: ${error.message}`)
    return { success: false, message: 'Failed to load system logs' }
  }
}

export async function getLogById(id) {
  try {
    const { data } = await api.get(`/system-logs/${id}`)
    return { success: true, data }
  } catch (error) {
    logger.error('SystemLogs', `Failed to get log ${id}: ${error.message}`)
    return { success: false }
  }
}

// Additional functions
export async function filterSystemLogs(params = {}) {
  return getSystemLogs(params)
}

export async function getLogModules() {
  try {
    const { data } = await api.get('/system-logs/modules')
    return { success: true, data }
  } catch (error) {
    logger.error('SystemLogs', `Failed to get modules: ${error.message}`)
    return { success: false, data: [] }
  }
}

export async function getSystemLogData(params = {}) {
  return getSystemLogs(params)
}

export async function exportSystemLogs(params = {}) {
  try {
    const { data } = await api.get('/system-logs/export', {
      params,
      responseType: 'blob'
    })
    return { success: true, data }
  } catch (error) {
    logger.error('SystemLogs', `Failed to export: ${error.message}`)
    return { success: false }
  }
}
