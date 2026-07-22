import { api } from '../../core/api/apiClient'
import logger from '../../core/utils/logger'
import {
  sanitizeParams,
  stripUnsupportedParams,
  unwrapList,
  shapeLog,
} from '../../core/models/entities'

export { shapeLog } from '../../core/models/entities'

export async function getSystemLogs(params = {}) {
  try {
    const safeParams = sanitizeParams(stripUnsupportedParams(params, null, ['period']))
    const { data } = await api.get('/system-logs', { params: safeParams })
    return { success: true, data: unwrapList(data).map(shapeLog) }
  } catch (error) {
    logger.warn('SystemLogs', `Failed to load: ${error.message}`)
    return { success: false, data: [], message: 'Failed to load system logs' }
  }
}

export async function getLogById(id) {
  try {
    const { data } = await api.get(`/system-logs/${id}`)
    return { success: true, data: shapeLog(data) }
  } catch (error) {
    logger.warn('SystemLogs', `Failed to get log ${id}: ${error.message}`)
    return { success: false }
  }
}

export async function filterSystemLogs(params = {}) {
  return getSystemLogs(params)
}

export async function getLogModules() {
  return { success: true, data: [] }
}

export const getSystemLogData = getSystemLogs

export async function exportSystemLogs(params = {}) {
  try {
    const { data } = await api.get('/system-logs/export', { params, responseType: 'blob' })
    return { success: true, data }
  } catch (error) {
    logger.warn('SystemLogs', `Failed to export: ${error.message}`)
    return { success: false }
  }
}
