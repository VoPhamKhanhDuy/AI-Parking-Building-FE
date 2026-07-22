import { api } from '../../core/api/apiClient'
import logger from '../../core/utils/logger'
import {
  safeArray,
  unwrapList,
  shapeZoneStructure,
  shapeBuilding,
  buildStructureKpis,
  buildStructureSlotTypes,
  FALLBACK_STRUCTURE,
} from '../../core/models/entities'

export { shapeZoneStructure, shapeBuilding, buildStructureKpis, buildStructureSlotTypes } from '../../core/models/entities'

export async function getParkingStructure() {
  try {
    const { data } = await api.get('/parking-structure')
    if (!data || typeof data !== 'object') return { ...FALLBACK_STRUCTURE }

    const buildings = (Array.isArray(data.buildings) ? data.buildings : [])
      .map(shapeBuilding)
      .filter(Boolean)
    const zones = (Array.isArray(data.zones) ? data.zones : [])
      .map(shapeZoneStructure)
      .filter(Boolean)

    return {
      buildings: buildings.length ? buildings : [{ id: null, name: 'Building A', floors: [] }],
      zones,
      kpis: Array.isArray(data.kpis) ? data.kpis : buildStructureKpis(zones),
      slotTypes: Array.isArray(data.slotTypes) ? data.slotTypes : buildStructureSlotTypes(zones),
      recentUpdates: Array.isArray(data.recentUpdates) ? data.recentUpdates : [],
    }
  } catch (error) {
    logger.warn('ParkingStructure', `getParkingStructure fallback: ${error.message}`)
    return { ...FALLBACK_STRUCTURE }
  }
}

export async function createBuilding(buildingData) {
  try {
    const { data } = await api.post('/buildings', buildingData)
    return { success: true, data }
  } catch (error) {
    logger.error('ParkingStructure', `Failed to create building: ${error.message}`)
    return { success: false, message: error.response?.data?.message || error.message }
  }
}

export async function createFloor(buildingId, floorData) {
  try {
    const { data } = await api.post('/floors', { ...floorData, buildingId })
    return { success: true, data }
  } catch (error) {
    logger.error('ParkingStructure', `Failed to create floor: ${error.message}`)
    return { success: false, message: error.response?.data?.message || error.message }
  }
}

export async function createZone(floorId, zoneData) {
  try {
    const payload = {
      name: zoneData.name || zoneData.zone,
      vehicleType: zoneData.vehicleType || zoneData.type || 'Car',
      capacity: zoneData.capacity || 20,
      floorId
    }
    const { data } = await api.post('/parking-zones', payload)
    return { success: true, data }
  } catch (error) {
    logger.error('ParkingStructure', `Failed to create zone: ${error.message}`)
    return { success: false, message: error.response?.data?.message || error.message }
  }
}

export async function updateZone(zoneId, zoneData) {
  try {
    const { data } = await api.put(`/parking-zones/${zoneId}`, zoneData)
    return { success: true, data }
  } catch (error) {
    logger.error('ParkingStructure', `Failed to update zone: ${error.message}`)
    return { success: false, message: error.response?.data?.message || error.message }
  }
}

export async function createSlot(zoneId, slotData) {
  try {
    const payload = {
      code: slotData.code,
      slotNumber: slotData.slotNumber || 1,
      vehicleType: slotData.vehicleType || 'Car',
      zoneId
    }
    const { data } = await api.post('/parking-slots', payload)
    return { success: true, data }
  } catch (error) {
    logger.error('ParkingStructure', `Failed to create slot: ${error.message}`)
    return { success: false, message: error.response?.data?.message || error.message }
  }
}

export async function updateSlot(slotId, slotData) {
  try {
    const { data } = await api.put(`/parking-slots/${slotId}`, slotData)
    return { success: true, data }
  } catch (error) {
    logger.error('ParkingStructure', `Failed to update slot: ${error.message}`)
    return { success: false, message: error.response?.data?.message || error.message }
  }
}

export const _internal = { safeArray, unwrapList }
