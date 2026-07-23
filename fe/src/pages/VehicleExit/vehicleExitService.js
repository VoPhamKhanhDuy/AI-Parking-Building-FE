import { api } from '../../core/api/apiClient'
import logger from '../../core/utils/logger'
import {
  shapeSession,
  formatVnd,
} from '../../core/models/entities'
import { normalizePlate } from '../../core/utils/vehicleValidation'
import QRCode from 'qrcode'

export { shapeSession, formatVnd } from '../../core/models/entities'

// Payment statuses we are willing to reuse from a 409 conflict.
// Refunded / Waived are terminal; Failed / Cancelled are NOT reusable because
// the backend will already let the cashier create a fresh payment (409 never fires).
const REUSABLE_STATUSES = new Set(['PENDING', 'PAID'])

// /payments/by-session/{id} returns Status as the numeric PaymentStatus enum
// (0=Pending, 1=Paid, 2=Failed, 3=Refunded, 4=Waived, 5=Cancelled) while
// /vehicle-exits/{id}/payments returns the string form. Normalise both shapes.
const PAYMENT_STATUS_NAMES = {
  0: 'PENDING',
  1: 'PAID',
  2: 'FAILED',
  3: 'REFUNDED',
  4: 'WAIVED',
  5: 'CANCELLED',
}

function normalizePaymentStatus(raw) {
  if (raw === null || raw === undefined) return ''
  const asString = String(raw).trim().toUpperCase()
  if (!asString) return ''
  if (PAYMENT_STATUS_NAMES[asString]) return PAYMENT_STATUS_NAMES[asString]
  return asString
}

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
  // Send both raw and normalized so backend (which may store UPPERCASE) can match.
  const raw = String(query).trim()
  const normalized = normalizePlate(raw)
  try {
    const { data } = await api.get('/vehicle-exits/lookup', { params: { query: normalized !== raw ? normalized : raw } })
    const shaped = shapeSession(data)
    if (shaped) return shaped
  } catch (error) {
    logger.warn('VehicleExit', `lookup fallback: ${error.message}`)
  }
  // Fallback: client-side scan against the active sessions list, normalising plates.
  const matches = await fetchActiveSessions()
  const needle = normalized
  return matches.sessions.find((s) =>
    normalizePlate(s.licensePlate || '') === needle ||
    String(s.ticketCode || '').trim().toUpperCase() === raw.toUpperCase(),
  ) || null
}

export async function calculateExitFee(sessionId) {
  if (!sessionId) {
    const error = new Error('Missing session id for fee calculation')
    throw error
  }
  try {
    const { data } = await api.post(`/vehicle-exits/${sessionId}/calculate-fee`)
    return {
      baseFee: formatVnd(data.unitPricePerHour ?? data.UnitPricePerHour),
      surcharge: formatVnd(data.surcharge ?? data.Surcharge),
      discount: '0 VND',
      total: data.totalFee ?? data.TotalFee,
      formattedTotal: formatVnd(data.totalFee ?? data.TotalFee),
      hours: data.durationHours ?? data.DurationHours,
      pricePerHour: data.unitPricePerHour ?? data.UnitPricePerHour,
      overtimeSurchargePerHour: data.overtimeSurchargePerHour ?? data.OvertimeSurchargePerHour,
      ruleDescription: data.pricingRuleDescription ?? data.PricingRuleDescription,
      raw: data,
    }
  } catch (error) {
    logger.error('VehicleExit', `calculateExitFee failed: ${error.message}`)
    throw new Error(extractErrorMessage(error, 'Failed to calculate exit fee'), { cause: error })
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
      status: normalizePaymentStatus(data.status ?? data.Status),
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
        if (existing?.paymentId && REUSABLE_STATUSES.has(normalizePaymentStatus(existing.status))) {
          return { ...existing, reused: true }
        }
      } catch {
        // surface a friendly message below
      }
      const message = extractErrorMessage(error, 'A payment already exists for this session and cannot be replaced.')
      throw new Error(message, { cause: error })
    }
    const message = extractErrorMessage(error, 'Failed to create payment')
    throw new Error(message, { cause: error })
  }
}

// Optimistic reuse: skip the POST entirely if an existing PENDING/PAID payment is
// already attached to the session. Avoids the 409 console error on repeat clicks
// (browser DevTools logs every 4xx response regardless of JS handling).
export async function getOrCreateExitPayment(sessionId) {
  if (!sessionId) return null
  try {
    const existing = await fetchExitPaymentBySession(sessionId)
    if (existing?.paymentId && REUSABLE_STATUSES.has(normalizePaymentStatus(existing.status))) {
      return { ...existing, reused: true }
    }
  } catch {
    // fall through and try to create
  }
  return createExitPayment(sessionId)
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
    status: normalizePaymentStatus(data.status ?? data.Status),
    transactionCode: data.transactionReference || data.TransactionReference || `TXN-${String(id).slice(0, 8)}`,
    qrImageUrl,
    bankName: 'Mock Bank',
    expiresAt: data.expiresAt ?? data.ExpiresAt,
  }
}

export async function processVehicleExit(sessionId) {
  if (!sessionId) throw new Error('Missing session id for vehicle exit')
  try {
    const { data } = await api.post(`/vehicle-exits/${sessionId}/complete`)
    return data
  } catch (error) {
    logger.error('VehicleExit', `processVehicleExit failed: ${error.message}`)
    throw new Error(extractErrorMessage(error, 'Failed to complete vehicle exit'), { cause: error })
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
