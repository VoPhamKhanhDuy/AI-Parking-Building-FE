import { api } from '../../core/api/apiClient'
import logger from '../../core/utils/logger'

const DEFAULT_POLICY = {
  carPenalty: 500000,
  motorcyclePenalty: 200000,
  baseParkingFee: 50000
}

export async function findLostTicketSession({ method, query } = {}) {
  try {
    const trimmed = String(query || '').trim()
    if (!trimmed) {
      return { success: false, message: 'Please enter a ticket code or license plate.' }
    }

    let session
    if (method === 'Ticket Code') {
      const { data } = await api.get(`/lost-tickets/find-by-ticket/${encodeURIComponent(trimmed)}`)
      session = data
    } else {
      const { data } = await api.get(`/lost-tickets/find-by-plate/${encodeURIComponent(trimmed)}`)
      session = data
    }

    if (!session) {
      return { success: false, message: 'No active session found.' }
    }

    return { success: true, data: shapeSession(session) }
  } catch (error) {
    const status = error?.response?.status
    if (status === 404) {
      return { success: false, message: 'No active session matches the supplied information.' }
    }
    logger.error('LostTicket', `Find session failed: ${error.message}`)
    return { success: false, message: error.response?.data?.message || 'Lookup failed.' }
  }
}

function shapeSession(data) {
  if (!data) return null
  return {
    id: data.id || data.Id,
    ticketId: data.ticketId || data.TicketId,
    ticketCode: data.ticketCode || data.TicketCode,
    licensePlate: data.licensePlate || data.LicensePlate,
    vehicleId: data.vehicleId || data.VehicleId,
    vehicleType: data.vehicleType || data.VehicleType,
    slotId: data.slotId || data.SlotId,
    slotCode: data.slotCode || data.SlotCode,
    floorZone: data.floorZone || data.FloorZone,
    entryGate: data.entryGate || data.EntryGate || '—',
    entryTime: data.entryTime || data.EntryTime,
    duration: '—',
    status: data.status || data.Status || 'Active',
    assignmentMethod: data.assignmentMethod || data.AssignmentMethod || 'Manual'
  }
}

export async function getLostTicketPageData() {
  try {
    const { data } = await api.get('/lost-tickets/page-data')
    return {
      success: true,
      data: {
        policy: {
          carPenalty: data?.policy?.carPenalty || data?.policy?.CarPenalty || DEFAULT_POLICY.carPenalty,
          motorcyclePenalty: data?.policy?.motorcyclePenalty || data?.policy?.MotorcyclePenalty || DEFAULT_POLICY.motorcyclePenalty,
          baseParkingFee: data?.policy?.baseParkingFee || data?.policy?.BaseParkingFee || DEFAULT_POLICY.baseParkingFee
        },
        recentCases: (data?.recentCases || data?.RecentCases || []).map(shapeCase)
      }
    }
  } catch (error) {
    logger.warn('LostTicket', `Failed to get page data: ${error.message}`)
    return {
      success: true,
      data: { policy: DEFAULT_POLICY, recentCases: [] }
    }
  }
}

function shapeCase(data) {
  if (!data) return null
  return {
    id: data.id || data.Id,
    caseCode: data.caseCode || data.CaseCode,
    sessionId: data.sessionId || data.SessionId,
    ticketCode: data.ticketCode || data.TicketCode,
    licensePlate: data.licensePlate || data.LicensePlate,
    vehicleType: data.vehicleType || data.VehicleType,
    slotId: data.slotId || data.SlotId,
    slotCode: data.slotCode || data.SlotCode,
    parkingFee: data.parkingFee || data.ParkingFee || 0,
    penalty: data.penalty || data.Penalty || 0,
    discount: data.discount || data.Discount || 0,
    totalPaid: data.totalPaid || data.TotalPaid || 0,
    paymentStatus: data.paymentStatus || data.PaymentStatus,
    time: data.createdAt || data.CreatedAt,
    status: data.paymentStatus === 'Paid' || data.paymentStatus === 'paid' ? 'Completed' : 'Pending'
  }
}

export async function calculateLostTicketFee(session, policy = {}) {
  const baseParkingFee = policy.baseParkingFee || DEFAULT_POLICY.baseParkingFee
  const isMotor = /motor/i.test(String(session?.vehicleType || ''))
  const penalty = isMotor
    ? (policy.motorcyclePenalty || DEFAULT_POLICY.motorcyclePenalty)
    : (policy.carPenalty || DEFAULT_POLICY.carPenalty)
  const total = baseParkingFee + penalty

  return {
    parkingFee: baseParkingFee,
    penalty,
    discount: 0,
    total,
    formattedTotal: formatLostTicketMoney(total),
    paymentStatus: 'Unpaid'
  }
}

export async function createLostTicketCase(session, payload = {}) {
  try {
    if (!session?.id) {
      return { success: false, message: 'Invalid session.' }
    }

    const { data } = await api.post('/lost-tickets', {
      sessionId: session.id,
      ownerName: payload.ownerName || '',
      phone: payload.phone || null,
      notes: payload.notes || null
    })

    return {
      success: true,
      data: shapeCase(data),
      caseId: data?.id || data?.Id || data?.caseCode || data?.CaseCode
    }
  } catch (error) {
    logger.error('LostTicket', `Create case failed: ${error.message}`)
    return { success: false, message: error.response?.data?.message || 'Failed to create lost ticket case.' }
  }
}

export async function processLostTicketPayment(caseId, payload = {}) {
  try {
    const { data } = await api.post(`/lost-tickets/${caseId}/process-payment`, {
      ownerName: payload.ownerName || '',
      phone: payload.phone || null,
      paymentMethod: payload.paymentMethod || 'Cash',
      transactionReference: payload.transactionReference || null,
      processedByUserId: payload.processedByUserId || null,
      notes: payload.notes || null
    })

    return { success: true, data: shapeCase(data) }
  } catch (error) {
    logger.error('LostTicket', `Process payment failed: ${error.message}`)
    return { success: false, message: error.response?.data?.message || 'Failed to process payment.' }
  }
}

export async function calculateFeeFromBackend(sessionId) {
  try {
    const { data } = await api.post('/lost-tickets/calculate-fee', { sessionId })
    return {
      success: true,
      data: {
        parkingFee: data.parkingFee || data.ParkingFee || 0,
        penalty: data.penalty || data.Penalty || 0,
        discount: data.discount || data.Discount || 0,
        total: data.total || data.Total || 0,
        formattedTotal: data.formattedTotal || data.FormattedTotal || formatLostTicketMoney(data.total || 0)
      }
    }
  } catch (error) {
    logger.warn('LostTicket', `Backend fee calc failed, using local: ${error.message}`)
    return { success: false }
  }
}

export function formatLostTicketMoney(amount) {
  const value = Number(amount) || 0
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0
  }).format(value)
}
