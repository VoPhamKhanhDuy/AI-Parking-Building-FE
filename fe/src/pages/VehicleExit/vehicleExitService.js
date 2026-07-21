import { api } from '../../core/api/apiClient'
import logger from '../../core/utils/logger'
import {
  shapeSession,
  formatVnd,
} from '../../core/models/entities'
import QRCode from 'qrcode'

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
    const id = data?.paymentId || data?.PaymentId
    if (!id) throw new Error('createExitPayment: missing paymentId in response')
    const qrImageUrl = await buildMockQr(data.amount ?? data.Amount)
    return {
      paymentId: id,
      amount: data.amount ?? data.Amount,
      method: data.method ?? data.Method,
      status: data.status ?? data.Status,
      transactionCode: data.transactionCode || data.TransactionCode,
      qrImageUrl,
      bankName: 'Mock Bank',
      expiresAt: data.expiresAt ?? data.ExpiresAt,
    }
  } catch (error) {
    const status = error?.response?.status
    if (status === 409) {
      try {
        const existing = await fetchExitPaymentBySession(sessionId)
        if (existing?.paymentId) {
          return { ...existing, reused: true }
        }
      } catch {
        // surface a friendly message below
      }
      const message = extractErrorMessage(error, 'A pending payment already exists for this session.')
      throw new Error(message, { cause: error })
    }
    const message = extractErrorMessage(error, 'Failed to create payment')
    throw new Error(message, { cause: error })
  }
}

export async function checkExitPaymentStatus(paymentId) {
  if (!paymentId) return null
  const { data } = await api.get(`/vehicle-exits/payments/${paymentId}/status`)
  return { status: data.status, paidAt: data.paidAt }
}

export async function fetchExitPaymentBySession(sessionId) {
  if (!sessionId) return null
  try {
    const { data } = await api.get(`/payments/by-session/${sessionId}`)
    return shapeFromPaymentDto(data)
  } catch (error) {
    const status = error?.response?.status
    if (status === 404) return null
    logger.warn('VehicleExit', `fetchExitPaymentBySession: ${error.message}`)
    return null
  }
}

function extractErrorMessage(error, fallback) {
  const data = error?.response?.data
  const err = data?.error || data?.Error
  const candidate = err?.message ?? data?.message ?? data?.title ?? err?.Message ?? data?.Message
  if (typeof candidate === 'string') return candidate
  if (candidate && typeof candidate === 'object') return candidate.message || candidate.error || fallback
  return error?.message || fallback
}

async function buildMockQr(amount) {
  try {
    const qrData = `PAYMENT|${amount}|PARKING|VNPay`
    return await QRCode.toDataURL(qrData, {
      width: 200,
      margin: 2,
      color: { dark: '#000000', light: '#ffffff' }
    })
  } catch {
    return 'data:image/svg+xml;utf8,' + encodeURIComponent(
      `<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><rect width='100%' height='100%' fill='%23fff'/><text x='50%' y='50%' text-anchor='middle' font-family='monospace' font-size='12'>QR ${formatVnd(amount)}</text></svg>`,
    )
  }
}

async function shapeFromPaymentDto(data) {
  if (!data || typeof data !== 'object') return null
  const id = data.id || data.Id
  if (!id) return null
  const qrImageUrl = await buildMockQr(data.amount ?? data.Amount)
  return {
    paymentId: id,
    amount: data.amount ?? data.Amount,
    method: data.method ?? data.Method,
    status: data.status ?? data.Status,
    transactionCode: data.transactionReference || data.TransactionReference || `TXN-${String(id).slice(0, 8)}`,
    qrImageUrl,
    bankName: 'Mock Bank',
    expiresAt: data.expiresAt ?? data.ExpiresAt,
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
