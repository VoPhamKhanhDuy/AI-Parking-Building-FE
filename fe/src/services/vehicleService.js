import { api } from '../core/api/apiClient'
import logger from '../core/utils/logger'

// Check-in vehicle
export async function checkInVehicle(plate, vehicleTypeId, ticketType, slotId = null) {
  try {
    const { data } = await api.post('/parking-sessions/entry', {
      licensePlate: plate,
      vehicleTypeId,
      ticketType,
      assignedSlotId: slotId
    })
    return { success: true, data }
  } catch (error) {
    logger.error('VehicleService', `Check-in failed: ${error.message}`)
    return {
      success: false,
      message: error.response?.data?.message || 'Check-in failed',
      error: error.response?.data
    }
  }
}

// Check-out vehicle
export async function checkOutVehicle(ticketCode) {
  try {
    const { data } = await api.post('/parking-sessions/exit', {
      ticketCode
    })
    return { success: true, data }
  } catch (error) {
    logger.error('VehicleService', `Check-out failed: ${error.message}`)
    return {
      success: false,
      message: error.response?.data?.message || 'Check-out failed',
      error: error.response?.data
    }
  }
}

// Get active sessions
export async function getActiveSessions() {
  try {
    const { data } = await api.get('/parking-sessions/active')
    return { success: true, data }
  } catch (error) {
    logger.error('VehicleService', `Failed to load sessions: ${error.message}`)
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to load sessions'
    }
  }
}

// Get session by ticket code
export async function getSessionByTicket(ticketCode) {
  try {
    const { data } = await api.get(`/parking-sessions/by-ticket/${ticketCode}`)
    return { success: true, data }
  } catch (error) {
    logger.error('VehicleService', `Session not found: ${error.message}`)
    return {
      success: false,
      message: error.response?.data?.message || 'Session not found'
    }
  }
}

// Get available slots
export async function getAvailableSlots(vehicleTypeId = null, zoneId = null) {
  try {
    const params = {}
    if (vehicleTypeId) params.vehicleTypeId = vehicleTypeId
    if (zoneId) params.zoneId = zoneId
    const { data } = await api.get('/parking-slots/available', { params })
    return { success: true, data }
  } catch (error) {
    logger.error('VehicleService', `Failed to load slots: ${error.message}`)
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to load slots'
    }
  }
}

// Get all slots with status
export async function getAllSlots() {
  try {
    const { data } = await api.get('/parking-slots')
    return { success: true, data }
  } catch (error) {
    logger.error('VehicleService', `Failed to load all slots: ${error.message}`)
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to load slots'
    }
  }
}

// Get vehicle types
export async function getVehicleTypes() {
  try {
    const { data } = await api.get('/vehicles/types')
    return { success: true, data }
  } catch (error) {
    logger.error('VehicleService', `Failed to load vehicle types: ${error.message}`)
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to load vehicle types'
    }
  }
}

// Ticket type options
export const ticketTypes = [
  { value: 'Hourly', label: 'Hourly' },
  { value: 'Daily', label: 'Daily' },
  { value: 'MonthlyPass', label: 'Monthly Pass' }
]

// Format parking duration
export function formatDuration(entryTime) {
  if (!entryTime) return ''
  const now = new Date()
  const entry = new Date(entryTime)
  const diffMs = now - entry
  const hours = Math.floor(diffMs / (1000 * 60 * 60))
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))
  if (hours > 24) {
    const days = Math.floor(hours / 24)
    return `${days}d ${hours % 24}h`
  }
  return `${hours}h ${minutes}m`
}
