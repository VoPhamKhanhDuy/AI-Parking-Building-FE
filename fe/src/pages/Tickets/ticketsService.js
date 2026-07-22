import { api } from '../../core/api/apiClient'
import logger from '../../core/utils/logger'
import {
  sanitizeParams,
  stripUnsupportedParams,
  translateEnum,
  unwrapList,
  shapeTicket,
  TICKET_STATUS_MAP,
  TICKET_TYPE_MAP,
} from '../../core/models/entities'

export { shapeTicket, typeLabel } from '../../core/models/entities'

export async function getTickets(params = {}) {
  try {
    const out = { ...params }
    if (typeof out.status === 'string') {
      out.status = translateEnum(out.status, TICKET_STATUS_MAP)
    }
    if (typeof out.type === 'string') {
      out.type = translateEnum(out.type, TICKET_TYPE_MAP)
    }
    const safeParams = sanitizeParams(stripUnsupportedParams(out, null, ['vehicle']))
    const { data } = await api.get('/tickets', { params: safeParams })
    const items = unwrapList(data).map(shapeTicket)
    const stats = (data && !Array.isArray(data) && data.stats) || {}
    return { success: true, data: { tickets: items, stats, activities: [], raw: data } }
  } catch (error) {
    logger.error('Tickets', `Failed to load: ${error.message}`)
    return { success: false, error, data: { tickets: [], activities: [], stats: {} } }
  }
}

export async function getTicketByCode(code) {
  try {
    const { data } = await api.get(`/tickets/by-code/${encodeURIComponent(code)}`)
    return { success: true, data: shapeTicket(data) }
  } catch {
    logger.error('Tickets', `Ticket not found: ${code}`)
    return { success: false, message: 'Ticket not found' }
  }
}

export async function createTicket(ticketData) {
  try {
    const { data } = await api.post('/tickets', ticketData)
    return { success: true, data: shapeTicket(data) }
  } catch (error) {
    logger.error('Tickets', `Failed to create: ${error.message}`)
    return { success: false, message: error.response?.data?.message || 'Failed to create' }
  }
}

export async function cancelTicket(id) {
  try {
    const { data } = await api.post(`/tickets/${id}/cancel`)
    return { success: true, data: shapeTicket(data) }
  } catch (error) {
    logger.error('Tickets', `Failed to cancel: ${error.message}`)
    return { success: false }
  }
}

export async function markTicketLost(ticketId) {
  try {
    const { data } = await api.post(`/tickets/${ticketId}/mark-lost`)
    return { success: true, data: shapeTicket(data) }
  } catch (error) {
    logger.error('Tickets', `Failed to mark as lost: ${error.message}`)
    return { success: false }
  }
}

export async function getTicketById(id) {
  try {
    const { data } = await api.get(`/tickets/${id}`)
    return { success: true, data: shapeTicket(data) }
  } catch (error) {
    logger.error('Tickets', `Failed to get ticket: ${error.message}`)
    return { success: false }
  }
}
