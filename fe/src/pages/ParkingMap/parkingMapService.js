import { api } from '../../core/api/apiClient'
import logger from '../../core/utils/logger'

export async function getParkingSlots(params = {}) {
  try {
    const { data } = await api.get('/parking-slots', { params })
    return { success: true, data }
  } catch (error) {
    logger.error('ParkingMap', `Failed to load: ${error.message}`)
    return { success: false }
  }
}

export async function updateSlotStatus(slotId, status) {
  try {
    const { data } = await api.patch(`/parking-slots/${slotId}`, { status })
    return { success: true, data }
  } catch (error) {
    logger.error('ParkingMap', `Failed to update slot: ${error.message}`)
    return { success: false }
  }
}

// Aliases for backward compatibility
export const getParkingMap = getParkingSlots
export const updateParkingSlot = updateSlotStatus
