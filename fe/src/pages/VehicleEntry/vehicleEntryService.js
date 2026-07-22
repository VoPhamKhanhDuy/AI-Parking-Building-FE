import { api } from '../../core/api/apiClient'
import logger from '../../core/utils/logger'
import {
  sanitizeParams,
  stripUnsupportedParams,
  unwrapList,
  shapeVehicle,
} from '../../core/models/entities'

export { shapeVehicle } from '../../core/models/entities'

export function getFormattedCurrentTime() {
  return new Date().toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

export async function getVehicles(params = {}) {
  try {
    const safeParams = sanitizeParams(stripUnsupportedParams(params, null, ['vehicleType']))
    const { data } = await api.get('/vehicles', { params: safeParams })
    return { success: true, data: unwrapList(data).map(shapeVehicle).filter(Boolean) }
  } catch (error) {
    logger.error('Vehicles', `Failed to load: ${error.message}`)
    return { success: false, data: [], error }
  }
}

export async function checkVehicleByPlate(licensePlate) {
  if (!licensePlate) return { success: false, message: 'Plate required', isNew: true }
  try {
    const { data } = await api.get(`/vehicles/by-plate/${encodeURIComponent(licensePlate)}`)
    return { success: true, data: shapeVehicle(data), isNew: false }
  } catch (error) {
    if (error.response?.status === 404) {
      return { success: false, message: 'Vehicle not found', isNew: true }
    }
    logger.error('VehicleEntry', `Check vehicle failed: ${error.message}`)
    return { success: false, message: 'Failed to check vehicle' }
  }
}

export async function createVehicle(vehicleData) {
  try {
    const { data } = await api.post('/vehicles', vehicleData)
    return { success: true, data: shapeVehicle(data) }
  } catch (error) {
    logger.error('Vehicles', `Failed to create: ${error.message}`)
    return { success: false, message: error.response?.data?.message || 'Failed to create vehicle' }
  }
}

export async function updateVehicle(id, vehicleData) {
  try {
    const { data } = await api.put(`/vehicles/${id}`, vehicleData)
    return { success: true, data: shapeVehicle(data) }
  } catch (error) {
    logger.error('Vehicles', `Failed to update: ${error.message}`)
    return { success: false, message: error.response?.data?.message || 'Failed to update' }
  }
}

export async function deleteVehicle(id) {
  try {
    await api.delete(`/vehicles/${id}`)
    return { success: true }
  } catch (error) {
    logger.error('Vehicles', `Failed to delete: ${error.message}`)
    return { success: false, message: 'Failed to delete vehicle' }
  }
}

export async function checkReservation(licensePlate) {
  if (!licensePlate) return { success: false }
  try {
    const { data } = await api.get('/reservations', { params: { search: licensePlate } })
    const list = unwrapList(data)
    const match = list.find((r) => (r.licensePlate || r.LicensePlate) === licensePlate)
    if (match && (match.status === 'Confirmed' || match.Status === 'Confirmed')) {
      return { success: true, data: match }
    }
    return { success: false }
  } catch (error) {
    logger.error('VehicleEntry', `Check reservation failed: ${error.message}`)
    return { success: false }
  }
}

export async function checkMonthlyPass(licensePlate) {
  if (!licensePlate) return { success: false }
  try {
    const { data } = await api.get('/monthly-passes', { params: { search: licensePlate } })
    const list = unwrapList(data)
    const match = list.find((p) => (p.licensePlate || p.LicensePlate) === licensePlate)
    if (match && (match.status === 'Active' || match.Status === 'Active')) {
      return { success: true, data: match }
    }
    return { success: false }
  } catch (error) {
    logger.error('VehicleEntry', `Check monthly pass failed: ${error.message}`)
    return { success: false }
  }
}

export async function getVehicleTypes() {
  try {
    const { data } = await api.get('/vehicles/types')
    return { success: true, data: unwrapList(data).map((t) => ({ id: t.id || t.Id, name: t.name || t.Name, category: t.category ?? t.Category })).filter(Boolean) }
  } catch (error) {
    logger.error('VehicleEntry', `Failed to get vehicle types: ${error.message}`)
    return { success: false, data: [], message: error.message }
  }
}

export async function startParkingSession(payload) {
  try {
    const body = typeof payload === 'string'
      ? { licensePlate: payload }
      : (payload || {})
    const { data } = await api.post('/parking-sessions', body)
    return { success: true, data }
  } catch (error) {
    const message = error.response?.data?.message || error.response?.data?.Message || error.message || 'Failed to start session'
    logger.error('VehicleEntry', `Start session failed: ${message}`)
    return { success: false, message }
  }
}

export async function getAvailableSlots(zoneId) {
  if (!zoneId || zoneId === '00000000-0000-0000-0000-000000000000') return { success: true, data: [] }
  try {
    const { data } = await api.get('/slots', { params: { zoneId, status: 0 } })
    return { success: true, data: unwrapList(data) }
  } catch (error) {
    logger.error('VehicleEntry', `Failed to get slots: ${error.message}`)
    return { success: false, data: [] }
  }
}

export async function createParkingTicket(ticketData) {
  try {
    const { data } = await api.post('/tickets', ticketData)
    return { success: true, data }
  } catch (error) {
    logger.error('VehicleEntry', `Create ticket failed: ${error.message}`)
    return { success: false, message: 'Failed to create ticket' }
  }
}
