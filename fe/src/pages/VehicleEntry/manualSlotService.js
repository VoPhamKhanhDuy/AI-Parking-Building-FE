import { api } from '../../core/api/apiClient'
import logger from '../../core/utils/logger'

const VEHICLE_TYPE_LABEL_BY_CATEGORY = {
  Car: 'Car',
  Motorbike: 'Motorbike',
  Motorcycle: 'Motorbike',
  ElectricVehicle: 'Electric Vehicle',
  EV: 'Electric Vehicle',
  'Electric Vehicle': 'Electric Vehicle',
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
  
  // Fallback to 'Car' if vehicleType is empty/undefined
  const safeVehicleType = vehicleType && vehicleType.trim() ? vehicleType : 'Car'
  
  try {
    const vehicleTypeId = await getVehicleTypeId(safeVehicleType)
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

    let ticketId, ticketCode
    try {
      const issued = await api.post('/tickets', {
        vehicleId,
        type: pickTicketType(ticketType),
      })
      ticketId = issued.data?.id || issued.data?.Id
      ticketCode = issued.data?.ticketCode || issued.data?.TicketCode
    } catch (ticketError) {
      if (ticketError.response?.status === 409) {
        // Vehicle already has an open ticket — fetch it instead
        const active = await api.get(`/tickets/active-by-vehicle/${vehicleId}`)
        ticketId = active.data?.id || active.data?.Id
        ticketCode = active.data?.ticketCode || active.data?.TicketCode
        if (!ticketId) {
          const msg = ticketError.response?.data?.message || 'Vehicle has open ticket but none found'
          logger.error('ManualSlot', msg)
          return { success: false, message: msg }
        }
        logger.warn('ManualSlot', 'Reusing existing active ticket for vehicle')
      } else {
        throw ticketError
      }
    }

    // 3) Start parking session (claims the slot) — handle if ticket already has a session
    let session
    try {
      const started = await api.post('/parking-sessions', { ticketId, slotId })
      session = started.data || {}
    } catch (sessionError) {
      if (sessionError.response?.status === 409) {
        // Ticket already has an active session — check if it's the same slot
        const existing = await api.get(`/parking-sessions/active-by-ticket/${ticketId}`)
        const existingSlotId = existing.data?.slotId || existing.data?.SlotId
        if (existingSlotId === slotId) {
          session = existing.data || {}
          logger.warn('ManualSlot', 'Ticket already has active session on this slot, using existing')
        } else {
          const sessionId = existing.data?.id || existing.data?.Id
          const oldSlot = existing.data?.slotCode || existing.data?.SlotCode
          try {
            const reassigned = await api.post(`/parking-sessions/${sessionId}/reassign-slot`, { newSlotId: slotId })
            session = reassigned.data || {}
            logger.warn('ManualSlot', `Reassigned active session from ${oldSlot} to selected slot`)
          } catch {
            const msg = `Vehicle is already parked in slot ${oldSlot}. Please checkout before assigning a new slot.`
            logger.warn('ManualSlot', msg)
            return { success: false, message: msg }
          }
        }
      } else {
        throw sessionError
      }
    }
    return {
      success: true,
      data: {
        sessionId: session.id || session.Id,
        ticketCode: session.ticketCode || session.TicketCode || ticketCode,
        entryTime: session.entryTime || session.EntryTime || new Date().toISOString(),
        slotCode: session.slotCode || session.SlotCode,
        status: session.status || session.Status,
      },
    }
  } catch (error) {
    const message = extractErrorMessage(error, 'Failed to assign slot')
    logger.error('ManualSlot', `Failed to assign: ${message}`)
    return { success: false, message }
  }
}

function extractErrorMessage(error, fallback) {
  const data = error?.response?.data
  const candidate = data?.message ?? data?.error ?? data?.title ?? data?.Message ?? data?.Error
  if (typeof candidate === 'string') return candidate
  if (candidate && typeof candidate === 'object') return candidate.message || candidate.error || fallback
  return error?.message || fallback
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
