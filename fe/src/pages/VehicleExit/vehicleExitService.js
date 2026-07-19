import { api } from '../../core/api/apiClient'
import logger from '../../core/utils/logger'
import {
  shapeSession,
  formatVnd,
} from '../../core/models/entities'

export { shapeSession, formatVnd } from '../../core/models/entities'

export async function fetchActiveSessions() {
  try {
    const { data } = await api.get('/vehicle-exits/active')
    const sessions = (data?.sessions || []).map(shapeSession)
    return {
      success: true,
      sessions,
      totalCount: data?.totalCount || sessions.length,
    }
  } catch (error) {
    logger.error('VehicleExit', `fetchActiveSessions failed: ${error.message}`)
    return { success: false, sessions: [], totalCount: 0 }
  }
}

export async function fetchVehicleExitData() {
  const result = await fetchActiveSessions()
  return { sessions: result.sessions, recentExits: [] }
}

export async function lookupVehicleExitSession(query) {
  if (!query || !String(query).trim()) return null
  try {
    const { data } = await api.get('/vehicle-exits/lookup', { params: { query } })
    return shapeSession(data)
  } catch (error) {
    logger.warn('VehicleExit', `lookup fallback: ${error.message}`)
    const matches = await fetchActiveSessions()
    const normalized = String(query).trim().toLowerCase()
    return matches.sessions.find((s) =>
      s.licensePlate?.toLowerCase() === normalized ||
      s.ticketCode?.toLowerCase() === normalized,
    ) || null
  }
}

export async function calculateExitFee(sessionId) {
  if (!sessionId) return null
  try {
    const { data } = await api.post(`/vehicle-exits/${sessionId}/calculate-fee`)
    return {
      baseFee: formatVnd(data.unitPricePerHour),
      surcharge: formatVnd(data.surcharge),
      discount: '0 VND',
      total: data.totalFee,
      formattedTotal: formatVnd(data.totalFee),
      hours: data.durationHours,
      pricePerHour: data.unitPricePerHour,
      overtimeSurchargePerHour: data.overtimeSurchargePerHour,
      ruleDescription: data.pricingRuleDescription,
      raw: data,
    }
  } catch (error) {
    logger.warn('VehicleExit', `calculateExitFee fallback: ${error.message}`)
    return {
      baseFee: '—',
      surcharge: '0 VND',
      discount: '0 VND',
      total: 0,
      formattedTotal: '0 VND',
      hours: 0,
      raw: null,
    }
  }
}

export async function createExitPayment(sessionId) {
  if (!sessionId) return null
  try {
    const { data } = await api.post(`/vehicle-exits/${sessionId}/payments`, { method: 2 })
    return {
      paymentId: data.paymentId,
      amount: data.amount,
      method: data.method,
      status: data.status,
      transactionCode: data.transactionCode,
      qrImageUrl: 'data:image/svg+xml;utf8,' + encodeURIComponent(
        `<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180'><rect width='100%' height='100%' fill='%23fff'/><text x='50%' y='50%' text-anchor='middle' font-family='monospace' font-size='14'>QR ${formatVnd(data.amount)}</text></svg>`,
      ),
      bankName: 'Mock Bank',
      expiresAt: data.expiresAt,
    }
  } catch (error) {
    logger.warn('VehicleExit', `createExitPayment fallback: ${error.message}`)
    return {
      paymentId: `LOCAL-${Date.now()}`,
      amount: 0,
      method: 'EWallet',
      status: 'PENDING',
      transactionCode: `TXN-${Date.now()}`,
      qrImageUrl: null,
      bankName: 'Mock Bank',
    }
  }
}

export async function checkExitPaymentStatus(paymentId) {
  if (!paymentId) return null
  try {
    const { data } = await api.get(`/vehicle-exits/payments/${paymentId}/status`)
    return { status: data.status, paidAt: data.paidAt }
  } catch (error) {
    logger.warn('VehicleExit', `checkExitPaymentStatus fallback: ${error.message}`)
    return { status: 'PENDING', paidAt: null }
  }
}

export async function processVehicleExit(sessionId) {
  if (!sessionId) return null
  try {
    const { data } = await api.post(`/vehicle-exits/${sessionId}/complete`)
    return data
  } catch (error) {
    logger.warn('VehicleExit', `processVehicleExit fallback: ${error.message}`)
    return { id: sessionId, status: 'Completed', exitTime: new Date().toISOString() }
  }
}

export async function getPaymentSummary(selected) {
  if (!selected) return null
  if (selected.id) {
    try {
      return await calculateExitFee(selected.id)
    } catch {
      return null
    }
  }
  return null
}
