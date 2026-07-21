import { api } from '../../core/api/apiClient'
import logger from '../../core/utils/logger'

export async function getExitSuccessData(sessionId) {
  try {
    const { data } = await api.get(`/parking-sessions/${sessionId}/exit-success`)
    return { success: true, data }
  } catch (error) {
    logger.error('ExitSuccess', `Failed to load: ${error.message}`)
    return { success: false }
  }
}

// Additional functions
export function formatPaidAmount(amount) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0
  }).format(amount)
}

export async function getExitSummary(sessionId) {
  try {
    const { data } = await api.get(`/parking-sessions/${sessionId}/summary`)
    return { success: true, data }
  } catch (error) {
    logger.error('ExitSuccess', `Failed to get summary: ${error.message}`)
    return { success: false }
  }
}

export async function printExitReceipt(sessionId) {
  try {
    const { data } = await api.get(`/parking-sessions/${sessionId}/receipt`)
    return { success: true, data }
  } catch (error) {
    logger.error('ExitSuccess', `Failed to print: ${error.message}`)
    return { success: false }
  }
}

// Aliases
export const getExitCompletion = getExitSuccessData
