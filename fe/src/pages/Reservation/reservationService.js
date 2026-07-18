import { api } from '../../core/api/apiClient'
import logger from '../../core/utils/logger'

export async function getReservations(params = {}) {
  try {
    const { data } = await api.get('/reservations', { params })
    return { success: true, data }
  } catch (error) {
    logger.error('Reservation', `Failed to load: ${error.message}`)
    return { success: false }
  }
}

export async function createReservation(reservation) {
  try {
    const { data } = await api.post('/reservations', reservation)
    return { success: true, data }
  } catch (error) {
    logger.error('Reservation', `Failed to create: ${error.message}`)
    return { success: false, message: error.response?.data?.message || 'Failed to create' }
  }
}

export async function cancelReservation(id) {
  try {
    await api.post(`/reservations/${id}/cancel`)
    return { success: true }
  } catch (error) {
    logger.error('Reservation', `Failed to cancel: ${error.message}`)
    return { success: false, message: 'Failed to cancel' }
  }
}

// Additional functions
export async function updateReservation(id, reservationData) {
  try {
    const { data } = await api.put(`/reservations/${id}`, reservationData)
    return { success: true, data }
  } catch (error) {
    logger.error('Reservation', `Failed to update: ${error.message}`)
    return { success: false }
  }
}

export async function getReservationById(id) {
  try {
    const { data } = await api.get(`/reservations/${id}`)
    return { success: true, data }
  } catch (error) {
    logger.error('Reservation', `Failed to get: ${error.message}`)
    return { success: false }
  }
}

export async function confirmReservation(id) {
  try {
    const { data } = await api.post(`/reservations/${id}/confirm`)
    return { success: true, data }
  } catch (error) {
    logger.error('Reservation', `Failed to confirm: ${error.message}`)
    return { success: false }
  }
}
