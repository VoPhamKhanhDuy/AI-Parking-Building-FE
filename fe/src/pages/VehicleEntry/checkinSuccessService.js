import { api } from '../../core/api/apiClient'
import logger from '../../core/utils/logger'

export async function checkInSuccess(ticketId) {
  if (!ticketId) return { success: false, message: 'Missing ticketId' }
  try {
    const { data } = await api.get(`/tickets/${ticketId}/checkin-success`)
    return { success: true, data }
  } catch (error) {
    logger.error('CheckinSuccess', `Failed to load: ${error.message}`)
    return { success: false, message: error?.message || 'Failed to load' }
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

// Static handoff steps. Page renders them as plain strings; we return
// a flat array of labels so the consumer can .map() directly.
const DEFAULT_NEXT_STEPS = [
  'Print ticket',
  'Direct vehicle to slot',
  'Complete check-in',
]

export function getCheckinNextSteps() {
  // Parameters kept for future extensibility (slotId, floor, zone)
  return DEFAULT_NEXT_STEPS
}

export async function getTicketDetails(ticketId) {
  if (!ticketId) return { success: false, message: 'Missing ticketId' }
  try {
    const { data } = await api.get(`/tickets/${ticketId}`)
    return { success: true, data }
  } catch (error) {
    logger.error('CheckinSuccess', `Failed to get details: ${error.message}`)
    return { success: false, message: error?.message || 'Failed to load ticket details' }
  }
}
