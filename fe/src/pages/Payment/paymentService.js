import { api } from '../../core/api/apiClient'
import logger from '../../core/utils/logger'
import {
  translatePaymentFilters,
  normalizePaymentDto,
} from '../../core/models/entities'

export { normalizePaymentDto, methodDisplay } from '../../core/models/entities'

const ALL_SENTINELS = new Set([
  '',
  'All Statuses',
  'All Methods',
  'All Types',
  'All Buildings',
  'All Floors',
  'All Zones',
  'All Vehicles',
])

function sanitizePaymentParams(params = {}) {
  const cleaned = {}
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null) continue
    if (typeof value === 'string' && ALL_SENTINELS.has(value.trim())) continue
    if (typeof value === 'string' && value.trim() === '') continue
    cleaned[key] = value
  }
  return cleaned
}

function normalizePaymentList(payload) {
  const list = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.items) ? payload.items
    : Array.isArray(payload?.data) ? payload.data
    : Array.isArray(payload?.transactions) ? payload.transactions
    : []
  return list.map(normalizePaymentDto)
}

export async function getPayments(params = {}) {
  try {
    const translated = translatePaymentFilters(params)
    const safeParams = sanitizePaymentParams(translated)
    const { data } = await api.get('/payments', { params: safeParams })
    const transactions = normalizePaymentList(data)
    const stats = (data && !Array.isArray(data) && data.stats) || {}
    return { success: true, data: { transactions, stats, raw: data } }
  } catch (error) {
    logger.error('Payment', `Failed to load: ${error.message}`)
    return { success: false, error, data: { transactions: [], stats: {} } }
  }
}

export async function createPayment(paymentData) {
  try {
    const { data } = await api.post('/payments', paymentData)
    return { success: true, data: normalizePaymentDto(data) }
  } catch (error) {
    logger.error('Payment', `Failed to create: ${error.message}`)
    return { success: false, message: error.response?.data?.message || 'Failed to create' }
  }
}

export async function markPaymentPaid(id, paymentData) {
  try {
    const { data } = await api.post(`/payments/${id}/mark-paid`, paymentData)
    return { success: true, data: normalizePaymentDto(data) }
  } catch (error) {
    logger.error('Payment', `Failed to mark paid: ${error.message}`)
    return { success: false }
  }
}

export async function waivePayment(id, reason, waivedBy) {
  try {
    const { data } = await api.post(`/payments/${id}/waive`, { reason, waivedByUserId: waivedBy })
    return { success: true, data: normalizePaymentDto(data) }
  } catch (error) {
    logger.error('Payment', `Failed to waive: ${error.message}`)
    return { success: false }
  }
}

export async function getPaymentManagement(params = {}) {
  return getPayments(params)
}

export async function requestPaymentRefund(paymentId, reason) {
  try {
    const { data } = await api.post(`/payments/${paymentId}/refund`, { reason })
    return { success: true, data: normalizePaymentDto(data) }
  } catch (error) {
    logger.error('Payment', `Failed to refund: ${error.message}`)
    return { success: false }
  }
}

export function formatPaymentAmount(amount) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
  }).format(amount)
}

export async function getPaymentById(id) {
  try {
    const { data } = await api.get(`/payments/${id}`)
    return { success: true, data: normalizePaymentDto(data) }
  } catch (error) {
    logger.error('Payment', `Failed to get: ${error.message}`)
    return { success: false }
  }
}
