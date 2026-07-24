import axios from 'axios'
import { reservations as mockReservations, reservationActivities as mockActivities } from '../../mock-data/reservationsData'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
const useMockData = import.meta.env.VITE_USE_MOCK_DATA !== 'false'

export const shapeReservation = (item) => ({
  id: item.id || item.Id,
  code: item.code || item.reservationCode || item.Code || `RSV-2026-${String(item.id).padStart(5, '0')}`,
  driver: item.driverName || item.driver || 'Khách gửi xe',
  phone: item.driverPhone || item.phone || '0901 234 567',
  plate: item.licensePlate || item.plate || '51A-12345',
  vehicleType: item.vehicleType || 'Car',
  slot: item.slotCode || item.slot || 'B2-18',
  floorZone: item.floorZone || 'Floor 2 · Zone B',
  window: item.timeWindow || item.window || '09:00 - 17:00',
  status: item.status || 'Confirmed',
  payment: item.paymentStatus || item.payment || 'Paid',
  amount: item.amount || item.depositAmount || 20000,
})

export const formatRangeTime = (win) => win || '09:00 - 17:00'

export async function getReservations(params = {}) {
  if (useMockData) {
    let list = [...mockReservations]
    if (params.search) {
      const q = params.search.toLowerCase()
      list = list.filter((r) => r.plate?.toLowerCase().includes(q) || r.code?.toLowerCase().includes(q) || r.driver?.toLowerCase().includes(q))
    }
    return { success: true, data: { reservations: list.map(shapeReservation), activities: mockActivities } }
  }

  try {
    const token = localStorage.getItem('token')
    const headers = token ? { Authorization: `Bearer ${token}` } : {}
    const response = await axios.get(`${API_BASE_URL}/reservations`, { params, headers })
    const data = response.data
    const list = Array.isArray(data) ? data : Array.isArray(data?.reservations) ? data.reservations : []
    return { success: true, data: { reservations: list.map(shapeReservation), activities: data?.activities || [] } }
  } catch (error) {
    let list = [...mockReservations]
    if (params.search) {
      const q = params.search.toLowerCase()
      list = list.filter((r) => r.plate?.toLowerCase().includes(q) || r.code?.toLowerCase().includes(q) || r.driver?.toLowerCase().includes(q))
    }
    return { success: true, data: { reservations: list.map(shapeReservation), activities: mockActivities } }
  }
}

export async function createReservation(reservation) {
  try {
    const token = localStorage.getItem('token')
    const headers = token ? { Authorization: `Bearer ${token}` } : {}
    const response = await axios.post(`${API_BASE_URL}/reservations`, reservation, { headers })
    return { success: true, data: shapeReservation(response.data) }
  } catch (error) {
    const newRsv = { id: Date.now(), code: `RSV-2026-${Math.floor(10000 + Math.random() * 90000)}`, status: 'Confirmed', payment: 'Paid', amount: 20000, ...reservation }
    mockReservations.unshift(newRsv)
    return { success: true, data: shapeReservation(newRsv) }
  }
}

export async function cancelReservation(id) {
  try {
    const token = localStorage.getItem('token')
    const headers = token ? { Authorization: `Bearer ${token}` } : {}
    const response = await axios.post(`${API_BASE_URL}/reservations/${id}/cancel`, {}, { headers })
    return { success: true, data: shapeReservation(response.data) }
  } catch (error) {
    const idx = mockReservations.findIndex((r) => r.id === id)
    if (idx >= 0) {
      mockReservations[idx].status = 'Cancelled'
      return { success: true, data: shapeReservation(mockReservations[idx]) }
    }
    return { success: false, message: 'Failed to cancel' }
  }
}

export async function updateReservation(id, action = {}) {
  try {
    const token = localStorage.getItem('token')
    const headers = token ? { Authorization: `Bearer ${token}` } : {}
    if (action === 'check-in') {
      const response = await axios.post(`${API_BASE_URL}/reservations/${id}/check-in`, {}, { headers })
      return { success: true, data: shapeReservation(response.data) }
    }
    if (action === 'cancel') {
      const response = await axios.post(`${API_BASE_URL}/reservations/${id}/cancel`, {}, { headers })
      return { success: true, data: shapeReservation(response.data) }
    }
    const response = await axios.put(`${API_BASE_URL}/reservations/${id}`, action, { headers })
    return { success: true, data: shapeReservation(response.data) }
  } catch (error) {
    const idx = mockReservations.findIndex((r) => r.id === id)
    if (idx >= 0) {
      if (action === 'check-in') mockReservations[idx].status = 'Checked In'
      else if (action === 'cancel') mockReservations[idx].status = 'Cancelled'
      else if (typeof action === 'object') Object.assign(mockReservations[idx], action)
      return { success: true, data: shapeReservation(mockReservations[idx]) }
    }
    return { success: false, message: 'Failed to update' }
  }
}

export async function getReservationById(id) {
  try {
    const token = localStorage.getItem('token')
    const headers = token ? { Authorization: `Bearer ${token}` } : {}
    const response = await axios.get(`${API_BASE_URL}/reservations/${id}`, { headers })
    return { success: true, data: shapeReservation(response.data) }
  } catch (error) {
    const item = mockReservations.find((r) => r.id === id)
    return item ? { success: true, data: shapeReservation(item) } : { success: false }
  }
}

export async function confirmReservation(id) {
  try {
    const token = localStorage.getItem('token')
    const headers = token ? { Authorization: `Bearer ${token}` } : {}
    const response = await axios.post(`${API_BASE_URL}/reservations/${id}/confirm`, {}, { headers })
    return { success: true, data: shapeReservation(response.data) }
  } catch (error) {
    return { success: false }
  }
}
