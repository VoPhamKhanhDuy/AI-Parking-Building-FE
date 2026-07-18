import { api } from '../../core/api/apiClient'
import logger from '../../core/utils/logger'

export async function getParkingStructure() {
  try {
    const { data } = await api.get('/parking-structure')
    return data // Return raw data directly
  } catch (error) {
    logger.error('ParkingStructure', `Failed to load: ${error.message}`)
    return getMockParkingStructure()
  }
}

export async function createBuilding(buildingData) {
  try {
    const { data } = await api.post('/parking-structure/buildings', buildingData)
    return { success: true, data }
  } catch (error) {
    logger.error('ParkingStructure', `Failed to create building: ${error.message}`)
    return { success: false }
  }
}

export async function createFloor(buildingId, floorData) {
  try {
    const { data } = await api.post(`/parking-structure/buildings/${buildingId}/floors`, floorData)
    return { success: true, data }
  } catch (error) {
    logger.error('ParkingStructure', `Failed to create floor: ${error.message}`)
    return { success: false }
  }
}

export async function createZone(floorId, zoneData) {
  try {
    const { data } = await api.post(`/parking-structure/floors/${floorId}/zones`, zoneData)
    return { success: true, data }
  } catch (error) {
    logger.error('ParkingStructure', `Failed to create zone: ${error.message}`)
    return { success: false }
  }
}

export async function updateZone(zoneId, zoneData) {
  try {
    const { data } = await api.put(`/parking-structure/zones/${zoneId}`, zoneData)
    return { success: true, data }
  } catch (error) {
    logger.error('ParkingStructure', `Failed to update zone: ${error.message}`)
    return { success: false }
  }
}

export async function updateSlot(slotId, slotData) {
  try {
    const { data } = await api.patch(`/parking-slots/${slotId}`, slotData)
    return { success: true, data }
  } catch (error) {
    logger.error('ParkingStructure', `Failed to update slot: ${error.message}`)
    return { success: false }
  }
}

function getMockParkingStructure() {
  const zones = [
    { zone: 'A1', location: 'Ground Floor', type: 'Standard', status: 'Available', capacity: 20, occupied: 12, available: 8, reserved: 0, maintenance: 0 },
    { zone: 'A2', location: 'Ground Floor', type: 'EV Charging', status: 'Available', capacity: 10, occupied: 4, available: 6, reserved: 0, maintenance: 0 },
    { zone: 'B1', location: 'Ground Floor', type: 'Motorcycle', status: 'Full', capacity: 30, occupied: 30, available: 0, reserved: 0, maintenance: 0 },
    { zone: 'A1', location: 'Level 1', type: 'Standard', status: 'Available', capacity: 25, occupied: 15, available: 10, reserved: 0, maintenance: 0 },
    { zone: 'B1', location: 'Level 1', type: 'Standard', status: 'Maintenance', capacity: 20, occupied: 0, available: 0, reserved: 0, maintenance: 20 }
  ]
  return { zones }
}
