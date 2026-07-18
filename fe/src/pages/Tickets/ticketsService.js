import { api } from '../../core/api/apiClient'
import logger from '../../core/utils/logger'

export async function getTickets(params = {}) {
  try {
    const { data } = await api.get('/parking-tickets', { params })
    return { success: true, data }
  } catch (error) {
    logger.error('Tickets', `Failed to load: ${error.message}`)
    return { success: false }
  }
}

export async function getTicketByCode(code) {
  try {
    const { data } = await api.get(`/parking-tickets/by-code/${code}`)
    return { success: true, data }
  } catch {
    logger.error('Tickets', `Ticket not found: ${code}`)
    return { success: false, message: 'Ticket not found' }
  }
}

export async function createTicket(ticketData) {
  try {
    const { data } = await api.post('/parking-tickets', ticketData)
    return { success: true, data }
  } catch (error) {
    logger.error('Tickets', `Failed to create: ${error.message}`)
    return { success: false, message: error.response?.data?.message || 'Failed to create' }
  }
}

export async function cancelTicket(id) {
  try {
    const { data } = await api.post(`/parking-tickets/${id}/cancel`)
    return { success: true, data }
  } catch (error) {
    logger.error('Tickets', `Failed to cancel: ${error.message}`)
    return { success: false }
  }
}

// Additional functions
export async function markTicketLost(ticketId) {
  try {
    const { data } = await api.post(`/parking-tickets/${ticketId}/mark-lost`)
    return { success: true, data }
  } catch (error) {
    logger.error('Tickets', `Failed to mark as lost: ${error.message}`)
    return { success: false }
  }
}

export async function getTicketById(id) {
  try {
    const { data } = await api.get(`/parking-tickets/${id}`)
    return { success: true, data }
  } catch (error) {
    logger.error('Tickets', `Failed to get ticket: ${error.message}`)
    return { success: false }
  }
}
