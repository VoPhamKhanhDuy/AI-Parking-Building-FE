import { api } from '../../core/api/apiClient'
import logger from '../../core/utils/logger'

export async function getReports(params = {}) {
  try {
    const { data } = await api.get('/reports', { params })
    return { success: true, data }
  } catch (error) {
    logger.error('Reports', `Failed to load: ${error.message}`)
    return { success: false }
  }
}

export async function getDailyOperationsReport(date) {
  try {
    const { data } = await api.get('/reports/daily-operations', { params: { date } })
    return { success: true, data }
  } catch (error) {
    logger.error('Reports', `Failed to load daily report: ${error.message}`)
    return { success: false }
  }
}

export async function getFinancialReport(startDate, endDate) {
  try {
    const { data } = await api.get('/reports/financial', { params: { startDate, endDate } })
    return { success: true, data }
  } catch (error) {
    logger.error('Reports', `Failed to load financial report: ${error.message}`)
    return { success: false }
  }
}

export async function exportReport(reportId, format = 'pdf') {
  try {
    const { data } = await api.get(`/reports/${reportId}/export`, {
      params: { format },
      responseType: 'blob'
    })
    return { success: true, data }
  } catch (error) {
    logger.error('Reports', `Failed to export report: ${error.message}`)
    return { success: false, message: 'Failed to export report' }
  }
}
