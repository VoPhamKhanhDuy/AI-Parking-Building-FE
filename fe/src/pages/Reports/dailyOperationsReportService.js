import { api } from '../../core/api/apiClient'
import logger from '../../core/utils/logger'

export async function getDailyOperationsReport(reportId = 'RPT-2026-00012') {
  try {
    const { data } = await api.get(`/manager/reports/${reportId}`)
    return { success: true, data }
  } catch (error) {
    logger.error('DailyReport', `Failed to load: ${error.message}`)
    return { success: false, message: 'Failed to load report' }
  }
}

export async function reviewDailyOperationsReport(reportId, action) {
  try {
    const { data } = await api.post(`/manager/reports/${reportId}/reviews`, { action })
    return { success: true, data }
  } catch (error) {
    logger.error('DailyReport', `Failed to review: ${error.message}`)
    return { success: false, message: 'Failed to submit review' }
  }
}
