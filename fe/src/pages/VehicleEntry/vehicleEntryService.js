import { api } from '../../core/api/apiClient'
import logger from '../../core/utils/logger'

export function getFormattedCurrentTime() {
  return new Date().toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

export async function checkVehicleByPlate(licensePlate) {
  try {
    const { data } = await api.get('/vehicles/by-plate', {
      params: { licensePlate }
    })
    return { success: true, data }
  } catch (error) {
    if (error.response?.status === 404) {
      return { success: false, message: 'Vehicle not found', isNew: true }
    }
    logger.error('VehicleEntry', `Check vehicle failed: ${error.message}`)
    return { success: false, message: 'Failed to check vehicle' }
  }
}

export async function checkReservation(licensePlate) {
  try {
    const { data } = await api.get('/reservations/by-plate', {
      params: { licensePlate }
    })
    if (data && data.Status === 'Confirmed' || data?.status === 'Confirmed') {
      return { success: true, data }
    }
    return { success: false }
  } catch (error) {
    if (error.response?.status === 404) {
      return { success: false }
    }
    logger.error('VehicleEntry', `Check reservation failed: ${error.message}`)
    return { success: false }
  }
}

export async function checkMonthlyPass(licensePlate) {
  try {
    const { data } = await api.get('/monthly-passes/by-plate', {
      params: { licensePlate }
    })
    if (data && (data.Status === 'Active' || data.status === 'Active')) {
      return { success: true, data }
    }
    return { success: false }
  } catch (error) {
    if (error.response?.status === 404) {
      return { success: false }
    }
    logger.error('VehicleEntry', `Check monthly pass failed: ${error.message}`)
    return { success: false }
  }
}

export async function getVehicleTypes() {
  try {
    const { data } = await api.get('/vehicle-types')
    return { success: true, data }
  } catch (error) {
    logger.error('VehicleEntry', `Failed to get vehicle types: ${error.message}`)
    return { success: false, data: [] }
  }
}

export async function startParkingSession(licensePlate, vehicleType, ticketType, slotId) {
  try {
    const { data } = await api.post('/parking-sessions/start', {
      licensePlate,
      vehicleType,
      ticketType,
      slotId
    })
    return { success: true, data }
  } catch (error) {
    logger.error('VehicleEntry', `Start session failed: ${error.response?.data?.message || error.message}`)
    return { success: false, message: error.response?.data?.message || 'Failed to start session' }
  }
}

export async function getAvailableSlots(zoneId) {
  try {
    const { data } = await api.get('/parking-slots/available', {
      params: { zoneId }
    })
    return { success: true, data }
  } catch (error) {
    logger.error('VehicleEntry', `Failed to get slots: ${error.message}`)
    return { success: false, data: [] }
  }
}

export async function createParkingTicket(ticketData) {
  try {
    const { data } = await api.post('/parking-tickets', ticketData)
    return { success: true, data }
  } catch (error) {
    logger.error('VehicleEntry', `Create ticket failed: ${error.message}`)
    return { success: false, message: 'Failed to create ticket' }
  }
}
