import { api } from '../../core/api/apiClient'
import logger from '../../core/utils/logger'
import {
  safeNumber,
  unwrapList,
  shapeSlot,
  shapeZone,
  shapeFloor,
  shapeBuilding,
  pickCategory,
  summarizeSlots,
  SLOT_STATUS_LABELS,
} from '../../core/models/entities'

export { shapeSlot, shapeZone, shapeFloor, shapeBuilding, pickCategory, summarizeSlots } from '../../core/models/entities'

export async function getBuildings() {
  try {
    const { data } = await api.get('/buildings')
    return unwrapList(data).map(shapeBuilding).filter(Boolean)
  } catch (error) {
    logger.warn('ParkingMap', `getBuildings fallback: ${error.message}`)
    return []
  }
}

export async function getFloors(buildingId) {
  if (!buildingId) return []
  try {
    const { data } = await api.get('/floors', { params: { buildingId } })
    return unwrapList(data).map(shapeFloor).filter(Boolean)
  } catch (error) {
    logger.warn('ParkingMap', `getFloors fallback: ${error.message}`)
    return []
  }
}

export async function getZones(floorId) {
  if (!floorId) return []
  try {
    const { data } = await api.get('/zones', { params: { floorId } })
    return unwrapList(data).map(shapeZone).filter(Boolean)
  } catch (error) {
    logger.warn('ParkingMap', `getZones fallback: ${error.message}`)
    return []
  }
}

const STATUS_REVERSE = SLOT_STATUS_LABELS.reduce((acc, label, idx) => {
  acc[label] = idx
  return acc
}, {})

export async function getSlotsByZone(zoneId, status) {
  if (!zoneId || zoneId === '00000000-0000-0000-0000-000000000000') return []
  try {
    const params = { zoneId }
    if (status && status !== 'All Statuses') {
      const numeric = STATUS_REVERSE[status]
      params.status = numeric != null ? numeric : status.replace(/\s+/g, '')
    }
    const { data } = await api.get('/slots', { params })
    return unwrapList(data).map(shapeSlot).filter(Boolean)
  } catch (error) {
    logger.warn('ParkingMap', `getSlots fallback: ${error.message}`)
    return []
  }
}

export async function getParkingSlots(params = {}) {
  const selectedBuilding = params.building && params.building !== 'All Buildings' ? params.building : null
  const selectedFloor = params.floor && params.floor !== 'All Floors' ? params.floor : null
  const selectedZone = params.zone && params.zone !== 'All Zones' ? params.zone : null
  const statusFilter = params.status && params.status !== 'All Statuses' ? params.status : null
  const vehicleFilter = params.vehicleType && params.vehicleType !== 'All Vehicles' ? params.vehicleType : null
  const search = String(params.search || '').trim().toLowerCase()

  const buildings = selectedBuilding
    ? (await getBuildings()).filter((b) => b.name === selectedBuilding)
    : await getBuildings()

  let allSlots = []
  const updates = []

  for (const building of buildings) {
    const floors = selectedFloor
      ? (await getFloors(building.id)).filter((f) => f.name === selectedFloor)
      : await getFloors(building.id)

    for (const floor of floors) {
      const zones = selectedZone
        ? (await getZones(floor.id)).filter((z) => z.name === selectedZone)
        : await getZones(floor.id)

      for (const zone of zones) {
        if (vehicleFilter) {
          const cat = pickCategory(zone)
          if (cat !== vehicleFilter) continue
        }
        const slots = await getSlotsByZone(zone.id)
        const decorated = slots.map((s) => ({
          id: s.id,
          code: s.slotCode,
          slotCode: s.slotCode,
          type: pickCategory(zone),
          status: s.status,
          zone: zone.name,
          zoneId: zone.id,
          floor: floor.name,
          floorId: floor.id,
          building: building.name,
          buildingId: building.id,
          distance: s.distance ?? zone.distanceToExitOrElevator,
        }))

        const filtered = decorated.filter((s) => {
          if (statusFilter && s.status !== statusFilter) return false
          if (search) return (s.slotCode || '').toLowerCase().includes(search)
          return true
        })

        allSlots = allSlots.concat(filtered)
        for (const slot of filtered) {
          updates.push({
            id: `auto-${slot.id || slot.slotCode || Math.random().toString(36).slice(2)}`,
            time: new Date().toLocaleString('vi-VN', { hour12: false }),
            slot: slot.slotCode,
            vehicle: '',
            action: `Seed zone ${zone.name}`,
            staff: 'system',
            status: 'synced',
          })
        }
      }
    }
  }

  return {
    summary: summarizeSlots(allSlots),
    slots: allSlots,
    updates: updates.slice(0, 8),
  }
}

export async function getParkingMap(params = {}) {
  return getParkingSlots(params)
}

export async function updateSlotStatus(slotId, status) {
  const numeric = typeof status === 'string'
    ? STATUS_REVERSE[status] ?? 0
    : status
  try {
    const { data } = await api.put(`/slots/${slotId}`, { status: numeric })
    const shaped = shapeSlot(data) || { id: slotId }
    return {
      slot: { ...shaped, status: typeof data.status === 'number' ? SLOT_STATUS_LABELS[data.status] : data.status },
      update: { id: slotId, status, at: new Date().toISOString(), by: 'staff' },
    }
  } catch (error) {
    logger.warn('ParkingMap', `updateSlotStatus fallback: ${error.message}`)
    return {
      slot: { id: slotId, status },
      update: { id: slotId, status, at: new Date().toISOString(), by: 'staff' },
    }
  }
}

export const updateParkingSlot = updateSlotStatus

export function totalSlotsSafe(data) {
  return safeNumber(data?.summary?.totalSlots)
}
