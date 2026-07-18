import { api } from '../../core/api/apiClient'
import logger from '../../core/utils/logger'

export async function checkInSuccess(ticketId) {
  try {
    const { data } = await api.get(`/parking-tickets/${ticketId}/checkin-success`)
    return { success: true, data }
  } catch (error) {
    logger.error('CheckinSuccess', `Failed to load: ${error.message}`)
    return { success: false }
  }
}

// Additional functions
export function formatSessionTime(date) {
  if (!date) return ''
  return new Date(date).toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

export async function getCheckinNextSteps() {
  return {
    success: true,
    data: {
      steps: [
        { id: 1, label: 'Print ticket', completed: true },
        { id: 2, label: 'Direct vehicle to slot', completed: false },
        { id: 3, label: 'Complete check-in', completed: false }
      ]
    }
  }
}

export async function getTicketDetails(ticketId) {
  try {
    const { data } = await api.get(`/parking-tickets/${ticketId}`)
    return { success: true, data }
  } catch (error) {
    logger.error('CheckinSuccess', `Failed to get details: ${error.message}`)
    return { success: false }
  }
}
