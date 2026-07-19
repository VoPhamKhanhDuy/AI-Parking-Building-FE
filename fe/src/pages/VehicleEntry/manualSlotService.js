import { api } from '../../core/api/apiClient'
import logger from '../../core/utils/logger'

export async function getManualSlotRecommendation(vehicleData) {
  try {
    const { data } = await api.post('/parking-slots/manual-recommendation', vehicleData)
    return { success: true, data }
  } catch (error) {
    logger.error('ManualSlot', `Failed to get: ${error.message}`)
    return { success: false }
  }
}

export async function assignManualSlot(slotId, ticketId) {
  try {
    const { data } = await api.post('/parking-slots/assign', { slotId, ticketId })
    return { success: true, data }
  } catch (error) {
    logger.error('ManualSlot', `Failed to assign: ${error.message}`)
    return { success: false }
  }
}

export async function assignParkingSlot(payload) {
  try {
    const { data } = await api.post('/parking-slots/assign', payload)
    return { success: true, data }
  } catch (error) {
    logger.error('ManualSlot', `Failed to assign: ${error.message}`)
    return { success: false }
  }
}

export async function getFloorStats(floorId) {
  if (!floorId) return null
  try {
    const { data } = await api.get(`/parking-structure/floors/${floorId}/stats`)
    return data
  } catch (error) {
    logger.warn('ManualSlot', `Failed to get floor stats: ${error.message}`)
    return null
  }
}

export function isCompatible() {
  return true // Simplified compatibility check
}

export async function getAvailableSlotsByFloor(floorId, vehicleType) {
  try {
    const { data } = await api.get(`/parking-slots/available`, {
      params: { floorId, vehicleType },
    })
    return { success: true, data }
  } catch (error) {
    logger.error('ManualSlot', `Failed to get slots: ${error.message}`)
    return { success: false }
  }
}
