import { api } from '../../core/api/apiClient'
import logger from '../../core/utils/logger'
import {
  sanitizeParams,
  stripUnsupportedParams,
  translateEnum,
  unwrapList,
  shapeReservation,
  RESERVATION_STATUS_MAP,
} from '../../core/models/entities'
import { reservations as mockReservations, reservationActivities as mockActivities } from '../../mock-data/reservationsData'

export { shapeReservation, formatRangeTime } from '../../core/models/entities'

const useMockData = import.meta.env.VITE_USE_MOCK_DATA !== 'false'

export async function getReservations(params = {}) {
  if (useMockData) {
    let list = [...mockReservations]
    if (params.search) {
      const q = params.search.toLowerCase()
      list = list.filter((r) => r.plate?.toLowerCase().includes(q) || r.code?.toLowerCase().includes(q) || r.driver?.toLowerCase().includes(q))
    }
    if (params.status && params.status !== 'All Statuses') {
      list = list.filter((r) => r.status === params.status)
    }
    if (params.vehicle && params.vehicle !== 'All Vehicles') {
      list = list.filter((r) => r.vehicleType === params.vehicle)
    }
    return { success: true, data: { reservations: list.map(shapeReservation), activities: mockActivities } }
  }

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
    logger.error('Reservation', `API load failed, falling back to mock data: ${error.message}`)
    let list = [...mockReservations]
    if (params.search) {
      const q = params.search.toLowerCase()
      list = list.filter((r) => r.plate?.toLowerCase().includes(q) || r.code?.toLowerCase().includes(q) || r.driver?.toLowerCase().includes(q))
    }
    return { success: true, data: { reservations: list.map(shapeReservation), activities: mockActivities }, error }
  }
}

export async function createReservation(reservation) {
  if (useMockData) {
    const newRsv = {
      id: Date.now(),
      code: `RSV-2026-${Math.floor(10000 + Math.random() * 90000)}`,
      status: 'Confirmed',
      payment: 'Paid',
      amount: 20000,
      ...reservation,
    }
    mockReservations.unshift(newRsv)
    return { success: true, data: shapeReservation(newRsv) }
  }

  try {
    const { data } = await api.post('/reservations', reservation)
    return { success: true, data: shapeReservation(data) }
  } catch (error) {
    logger.error('Reservation', `Failed to create: ${error.message}`)
    const newRsv = {
      id: Date.now(),
      code: `RSV-2026-${Math.floor(10000 + Math.random() * 90000)}`,
      status: 'Confirmed',
      payment: 'Paid',
      amount: 20000,
      ...reservation,
    }
    mockReservations.unshift(newRsv)
    return { success: true, data: shapeReservation(newRsv) }
  }
}

export async function cancelReservation(id) {
  if (useMockData) {
    const idx = mockReservations.findIndex((r) => r.id === id)
    if (idx >= 0) {
      mockReservations[idx].status = 'Cancelled'
      return { success: true, data: shapeReservation(mockReservations[idx]) }
    }
  }

  try {
    const { data } = await api.post(`/reservations/${id}/cancel`)
    return { success: true, data: shapeReservation(data) }
  } catch (error) {
    logger.error('Reservation', `Failed to cancel: ${error.message}`)
    return { success: false, message: 'Failed to cancel' }
  }
}

export async function updateReservation(id, action = {}) {
  if (useMockData) {
    const idx = mockReservations.findIndex((r) => r.id === id)
    if (idx >= 0) {
      if (action === 'check-in') mockReservations[idx].status = 'Checked In'
      else if (action === 'cancel') mockReservations[idx].status = 'Cancelled'
      else if (typeof action === 'object') Object.assign(mockReservations[idx], action)
      return { success: true, data: shapeReservation(mockReservations[idx]) }
    }
  }

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
    const item = mockReservations.find((r) => r.id === id)
    return item ? { success: true, data: shapeReservation(item) } : { success: false }
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
