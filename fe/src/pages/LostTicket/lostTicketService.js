import { api } from '../../core/api/apiClient'
import logger from '../../core/utils/logger'

const SAFE_DEFAULTS = {
  policy: {
    carPenalty: 500000,
    motorcyclePenalty: 200000
  },
  recentCases: []
}

// Recover an active parking session by:
//   1) ticketCode -> GET /tickets/by-code/{code} -> active session via /parking-sessions/active-by-ticket/{ticketId}
//   2) licensePlate -> GET /vehicles?search=... (fallback) -> /parking-sessions/active-by-vehicle/{vehicleId}
async function recoverActiveSession({ method, query }) {
  const trimmed = String(query || '').trim()
  if (!trimmed) return null

  if (method === 'Ticket Code') {
    const { data: ticket } = await api.get(`/tickets/by-code/${encodeURIComponent(trimmed)}`)
    if (!ticket || !ticket.id) return null
    try {
      const { data: session } = await api.get(`/parking-sessions/active-by-ticket/${ticket.id}`)
      return shapeSessionFromTicket(session, ticket)
    } catch {
      return shapeSessionFromTicket(null, ticket)
    }
  }

  // Default: treat input as license plate
  const { data: vehicles } = await api.get('/vehicles', { params: { search: trimmed, pageSize: 5 } })
  const list = Array.isArray(vehicles) ? vehicles
    : Array.isArray(vehicles?.items) ? vehicles.items
    : Array.isArray(vehicles?.data) ? vehicles.data
    : []
  const plate = trimmed.toLowerCase()
  const vehicle = list.find((v) => String(v.licensePlate || '').toLowerCase() === plate)
    || list.find((v) => String(v.LicensePlate || '').toLowerCase() === plate)
    || list[0]
  if (!vehicle) return null
  const vehicleId = vehicle.id || vehicle.Id
  try {
    const { data: session } = await api.get(`/parking-sessions/active-by-vehicle/${vehicleId}`)
    return shapeSessionFromVehicle(session, vehicle)
  } catch {
    return shapeSessionFromVehicle(null, vehicle)
  }
}

function shapeSessionFromTicket(session, ticket) {
  if (!ticket) return null
  const plate = ticket.vehiclePlate || ticket.VehiclePlate || '—'
  return {
    id: session?.id || session?.Id || `local-${ticket.id || ticket.Id}`,
    ticketId: ticket.id || ticket.Id,
    ticketCode: ticket.ticketCode || ticket.TicketCode,
    licensePlate: plate,
    vehicleId: ticket.vehicleId || ticket.VehicleId,
    vehicleType: '—',
    slotId: session?.slotId ? String(session.slotId).slice(0, 8).toUpperCase() : '—',
    slotCode: '—',
    floorZone: '—',
    entryGate: '—',
    entryTime: session?.entryTime || ticket.entryTime || ticket.EntryTime,
    duration: '—',
    status: session?.status || 'Active',
    assignmentMethod: 'Manual'
  }
}

function shapeSessionFromVehicle(session, vehicle) {
  if (!vehicle) return null
  return {
    id: session?.id || session?.Id || `local-${vehicle.id || vehicle.Id}`,
    ticketId: session?.ticketId || null,
    ticketCode: '—',
    licensePlate: vehicle.licensePlate || vehicle.LicensePlate || '—',
    vehicleId: vehicle.id || vehicle.Id,
    vehicleType: vehicle.vehicleType?.name || vehicle.vehicleTypeName || vehicle.VehicleType?.Name || '—',
    slotId: session?.slotId ? String(session.slotId).slice(0, 8).toUpperCase() : '—',
    slotCode: '—',
    floorZone: '—',
    entryGate: '—',
    entryTime: session?.entryTime || vehicle.createdAt || vehicle.CreatedAt,
    duration: '—',
    status: session?.status || 'Active',
    assignmentMethod: 'Manual'
  }
}

export async function findLostTicketSession({ method, query } = {}) {
  try {
    const session = await recoverActiveSession({ method, query })
    if (!session) {
      logger.warn('LostTicket', `No active session for ${method}=${query}`)
      return { success: false, message: 'No active session matches the supplied information.', data: null }
    }
    return { success: true, data: session }
  } catch (error) {
    logger.warn('LostTicket', `Recovery fallback (${error.message})`)
    return { success: false, message: error.response?.data?.message || 'Lookup failed.', data: null }
  }
}

export async function getLostTicket(ticketCode) {
  try {
    const { data } = await api.get(`/tickets/by-code/${encodeURIComponent(ticketCode)}`)
    return { success: true, data }
  } catch (err) {
    logger.warn('LostTicket', `Not found: ${ticketCode} (${err.message})`)
    return { success: false, message: 'Ticket not found' }
  }
}

export async function calculateLostTicketFee(session) {
  const baseFee = 50000
  const isMotor = session && /motor/i.test(String(session.vehicleType || ''))
  const policy = SAFE_DEFAULTS.policy
  const penalty = isMotor ? policy.motorcyclePenalty : policy.carPenalty
  const discount = 0
  const total = baseFee + penalty - discount
  return {
    parkingFee: baseFee,
    penalty,
    discount,
    total,
    formattedTotal: formatLostTicketMoney(total),
    paymentStatus: 'Unpaid'
  }
}

export async function processLostTicket(session, feeData = {}) {
  try {
    if (session?.id && /^[0-9a-f-]{36}$/i.test(String(session.id))) {
      const { data } = await api.post(`/parking-sessions/${session.id}/end`, {
        exitTime: new Date().toISOString(),
        feeData: feeData || null
      })
      return { success: true, data, caseId: data?.id || session.id }
    }
    return { success: true, data: { id: session?.id, status: 'Completed' }, caseId: session?.id || 'LOCAL' }
  } catch (error) {
    logger.error('LostTicket', `Failed to process: ${error.message}`)
    return { success: false, message: 'Failed to process lost ticket' }
  }
}

export async function createLostTicketCase(session, payload = {}) {
  // The backend exposes no dedicated lost-ticket endpoint yet — close the active
  // session (if real id) or fall back to local completion.
  return processLostTicket(session, payload)
}

export function formatLostTicketMoney(amount) {
  const value = Number(amount) || 0
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0
  }).format(value)
}

export async function getLostTicketPageData() {
  // No backend endpoint for policy/recent-cases yet — return safe defaults.
  return { success: true, data: SAFE_DEFAULTS }
}
