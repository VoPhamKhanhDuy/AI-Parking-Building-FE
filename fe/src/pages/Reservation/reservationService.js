import { api } from '../../core/api/apiClient'
import logger from '../../core/utils/logger'
import {
  sanitizeParams,
  stripUnsupportedParams,
  translateEnum,
  unwrapList,
  shapeReservation,
  formatRangeTime,
  RESERVATION_STATUS_MAP,
} from '../../core/models/entities'

export { shapeReservation, formatRangeTime } from '../../core/models/entities'

export async function getReservations(params = {}) {
  try {
    const out = { ...params }
    if (typeof out.status === 'string') {
      out.status = translateEnum(out.status, RESERVATION_STATUS_MAP)
    }
    const safeParams = sanitizeParams(stripUnsupportedParams(out, null, ['vehicle', 'vehicleType']))
    const { data } = await api.get('/reservations', { params: safeParams })
    const rawReservations = Array.isArray(data) ? data
      : Array.isArray(data?.reservations) ? data.reservations
      : unwrapList(data)
    const activities = Array.isArray(data?.activities) ? data.activities : []
    return { success: true, data: { reservations: rawReservations.map(shapeReservation), activities } }
  } catch (error) {
    logger.error('Reservation', `Failed to load: ${error.message}`)
    return { success: false, data: { reservations: [], activities: [] }, error }
  }
}

export async function createReservation(reservation) {
  try {
    const { data } = await api.post('/reservations', reservation)
    return { success: true, data: shapeReservation(data) }
  } catch (error) {
    logger.error('Reservation', `Failed to create: ${error.message}`)
    return { success: false, message: error.response?.data?.message || 'Failed to create' }
  }
}

export async function cancelReservation(id) {
  try {
    const { data } = await api.post(`/reservations/${id}/cancel`)
    return { success: true, data: shapeReservation(data) }
  } catch (error) {
    logger.error('Reservation', `Failed to cancel: ${error.message}`)
    return { success: false, message: 'Failed to cancel' }
  }
}

export async function updateReservation(id, action = {}) {
  try {
    if (action === 'check-in') {
      const { data } = await api.post(`/reservations/${id}/check-in`)
      return { success: true, data: shapeReservation(data) }
    }
    if (action === 'cancel') {
      const { data } = await api.post(`/reservations/${id}/cancel`)
      return { success: true, data: shapeReservation(data) }
    }
    const { data } = await api.put(`/reservations/${id}`, action)
    return { success: true, data: shapeReservation(data) }
  } catch (error) {
    logger.error('Reservation', `Failed to update: ${error.message}`)
    return { success: false, message: error.response?.data?.message || 'Failed to update' }
  }
}

export async function getReservationById(id) {
  try {
    const { data } = await api.get(`/reservations/${id}`)
    return { success: true, data: shapeReservation(data) }
  } catch (error) {
    logger.error('Reservation', `Failed to get: ${error.message}`)
    return { success: false }
  }
}

export async function confirmReservation(id) {
  try {
    const { data } = await api.post(`/reservations/${id}/confirm`)
    return { success: true, data: shapeReservation(data) }
  } catch (error) {
    logger.error('Reservation', `Failed to confirm: ${error.message}`)
    return { success: false }
  }
}
