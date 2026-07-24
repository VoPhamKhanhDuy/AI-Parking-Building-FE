import { api } from '../../core/api/apiClient'
import logger from '../../core/utils/logger'
import {
  sanitizeParams,
  stripUnsupportedParams,
  unwrapList,
  shapeLog,
} from '../../core/models/entities'
import { systemLogData } from '../../mock-data/systemLogs'

export { shapeLog } from '../../core/models/entities'

export async function getSystemLogs(params = {}) {
  try {
    const safeParams = sanitizeParams(stripUnsupportedParams(params, null, ['period']))
    const { data } = await api.get('/system-logs', { params: safeParams })
    const rawList = Array.isArray(data)
      ? data
      : Array.isArray(data?.logs)
        ? data.logs
        : Array.isArray(data?.items)
          ? data.items
          : unwrapList(data)

    const shapedList = rawList.map(shapeLog).filter(Boolean)
    const list = shapedList.length > 0 ? shapedList : systemLogData.logs.map(shapeLog)
    return { success: true, data: list }
  } catch (error) {
    logger.warn('SystemLogs', `Failed to load from API, using fallback: ${error.message}`)
    return { success: true, data: systemLogData.logs.map(shapeLog) }
  }
}

export async function getLogById(id) {
  try {
    const { data } = await api.get(`/system-logs/${id}`)
    return { success: true, data: shapeLog(data) }
  } catch (error) {
    logger.warn('SystemLogs', `Failed to get log ${id}: ${error.message}`)
    const item = systemLogData.logs.find((l) => String(l.id) === String(id))
    return item ? { success: true, data: shapeLog(item) } : { success: false }
  }
}

export async function filterSystemLogs(params = {}) {
  return getSystemLogs(params)
}

export async function getLogModules() {
  return { success: true, data: ['Auth', 'Entry', 'Exit', 'Payment', 'Ticket', 'System', 'Vehicle', 'Reservation'] }
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
