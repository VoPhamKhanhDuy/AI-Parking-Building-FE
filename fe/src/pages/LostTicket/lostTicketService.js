import { api } from '../../core/api/apiClient'
import logger from '../../core/utils/logger'

export async function getLostTicket(ticketCode) {
  try {
    const { data } = await api.get('/tickets/lost-ticket', { params: { ticketCode } })
    return { success: true, data }
  } catch {
    logger.error('LostTicket', `Not found: ${ticketCode}`)
    return { success: false, message: 'Ticket not found' }
  }
}

export async function processLostTicket(ticketId, feeData) {
  try {
    const { data } = await api.post('/tickets/lost-ticket/process', { ticketId, ...feeData })
    return { success: true, data }
  } catch (error) {
    logger.error('LostTicket', `Failed to process: ${error.message}`)
    return { success: false, message: 'Failed to process lost ticket' }
  }
}

// Additional functions
export async function findLostTicketSession(sessionId) {
  try {
    const { data } = await api.get(`/parking-sessions/${sessionId}`)
    return { success: true, data }
  } catch (error) {
    logger.error('LostTicket', `Failed to find session: ${error.message}`)
    return { success: false }
  }
}

export async function createLostTicketCase(ticketData) {
  try {
    const { data } = await api.post('/tickets/lost-ticket', ticketData)
    return { success: true, data }
  } catch (error) {
    logger.error('LostTicket', `Failed to create case: ${error.message}`)
    return { success: false }
  }
}

export function formatLostTicketMoney(amount) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0
  }).format(amount)
}

export function calculateLostTicketFee(baseFee = 500000, surcharge = 0) {
  return baseFee + surcharge
}

export async function getLostTicketPageData() {
  return { success: true, data: { baseFee: 500000 } }
}
