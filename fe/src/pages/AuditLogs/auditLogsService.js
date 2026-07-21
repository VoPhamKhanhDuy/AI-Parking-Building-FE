import { api } from '../../core/api/apiClient'
import logger from '../../core/utils/logger'

export async function getAuditLogs(params = {}) {
  try {
    const { data } = await api.get('/audit-logs', { params })
    return { success: true, data }
  } catch (error) {
    logger.error('AuditLogs', `Failed to load: ${error.message}`)
    return { success: false }
  }
}

export async function getAuditLogById(id) {
  try {
    const { data } = await api.get(`/audit-logs/${id}`)
    return { success: true, data }
  } catch (error) {
    logger.error('AuditLogs', `Failed to get: ${error.message}`)
    return { success: false }
  }
}

// Mock data for development
export const initialAuditKPIs = [
  { label: 'Total Events', value: 0, trend: 'up' },
  { label: 'Security Events', value: 0, trend: 'neutral' },
  { label: 'Failed Logins', value: 0, trend: 'down' }
]

export const initialAuditRecords = []

export const initialSecurityEvents = []

export async function getAuditStats() {
  try {
    const { data } = await api.get('/audit-logs/stats')
    return { success: true, data }
  } catch (error) {
    logger.error('AuditLogs', `Failed to get stats: ${error.message}`)
    return { success: false }
  }
}
