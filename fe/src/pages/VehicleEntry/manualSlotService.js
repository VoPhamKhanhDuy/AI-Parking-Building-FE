import { api } from '../../core/api/apiClient'
import logger from '../../core/utils/logger'

const VEHICLE_TYPE_LABEL_BY_CATEGORY = {
  Car: 'Car',
  Motorbike: 'Motorbike',
  Motorcycle: 'Motorbike',
  ElectricVehicle: 'Electric Vehicle',
  EV: 'Electric Vehicle',
}

const TICKET_TYPE_BY_LABEL = {
  Hourly: 'Hourly',
  'Hourly (Visitor)': 'Hourly',
  Daily: 'Daily',
  Monthly: 'MonthlyPass',
  'Monthly Pass': 'MonthlyPass',
  MonthlyPass: 'MonthlyPass',
  Reservation: 'Reservation',
}

let vehicleTypeCache = null

async function getVehicleTypeId(category) {
  const label = VEHICLE_TYPE_LABEL_BY_CATEGORY[category]
  if (!label) throw new Error(`Unknown vehicle category: ${category}`)
  if (!vehicleTypeCache) {
    const { data } = await api.get('/vehicles/types')
    vehicleTypeCache = unwrapList(data).map((t) => ({
      id: t.id || t.Id,
      name: t.name || t.Name,
      category: t.category ?? t.Category,
    }))
  }
  const match = vehicleTypeCache.find(
    (t) => (t.name || '').toLowerCase() === label.toLowerCase() || t.category === category
  )
  if (!match) throw new Error(`VehicleType not seeded for "${category}"`)
  return match.id
}

function unwrapList(payload) {
  if (Array.isArray(payload)) return payload
  if (payload && Array.isArray(payload.items)) return payload.items
  if (payload && Array.isArray(payload.data)) return payload.data
  if (payload && typeof payload === 'object') return Object.values(payload).find(Array.isArray) || []
  return []
}

function pickTicketType(label) {
  return TICKET_TYPE_BY_LABEL[label] || 'Hourly'
}

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

export async function assignParkingSlot({ slotId, licensePlate, vehicleType, ticketType }) {
  if (!slotId) return { success: false, message: 'Missing slotId' }
  if (!licensePlate) return { success: false, message: 'Missing licensePlate' }
  try {
    const vehicleTypeId = await getVehicleTypeId(vehicleType)
    const normalizedPlate = String(licensePlate).trim().toUpperCase()

    // 1) Lookup or create vehicle
    let vehicleId
    try {
      const lookup = await api.get(`/vehicles/by-plate/${encodeURIComponent(normalizedPlate)}`)
      vehicleId = lookup.data?.id || lookup.data?.Id
    } catch (lookupError) {
      if (lookupError.response?.status !== 404) throw lookupError
      const created = await api.post('/vehicles', { licensePlate: normalizedPlate, vehicleTypeId })
      vehicleId = created.data?.id || created.data?.Id
    }

    // 2) Issue ticket
    const issued = await api.post('/tickets', {
      vehicleId,
      type: pickTicketType(ticketType),
    })
    const ticket = issued.data || {}
    const ticketId = ticket.id || ticket.Id

    // 3) Start parking session (claims the slot)
    const started = await api.post('/parking-sessions', { ticketId, slotId })
    const session = started.data || {}
    return {
      success: true,
      data: {
        sessionId: session.id || session.Id,
        ticketCode: session.ticketCode || session.TicketCode || ticket.ticketCode || ticket.TicketCode,
        entryTime: session.entryTime || session.EntryTime || new Date().toISOString(),
        slotCode: session.slotCode || session.SlotCode,
        status: session.status || session.Status,
      },
    }
  } catch (error) {
    const message = error.response?.data?.message || error.response?.data?.error || error.message || 'Failed to assign slot'
    logger.error('ManualSlot', `Failed to assign: ${message}`)
    return { success: false, message }
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
