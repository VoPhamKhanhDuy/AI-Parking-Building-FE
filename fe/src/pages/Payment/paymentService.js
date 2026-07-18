import { api } from '../../core/api/apiClient'
import logger from '../../core/utils/logger'

export async function getPayments(params = {}) {
  try {
    const { data } = await api.get('/payments', { params })
    return { success: true, data }
  } catch (error) {
    logger.error('Payment', `Failed to load: ${error.message}`)
    return { success: false }
  }
}

export async function createPayment(paymentData) {
  try {
    const { data } = await api.post('/payments', paymentData)
    return { success: true, data }
  } catch (error) {
    logger.error('Payment', `Failed to create: ${error.message}`)
    return { success: false, message: error.response?.data?.message || 'Failed to create' }
  }
}

export async function markPaymentPaid(id, paymentData) {
  try {
    const { data } = await api.post(`/payments/${id}/mark-paid`, paymentData)
    return { success: true, data }
  } catch (error) {
    logger.error('Payment', `Failed to mark paid: ${error.message}`)
    return { success: false }
  }
}

export async function waivePayment(id, reason, waivedBy) {
  try {
    const { data } = await api.post(`/payments/${id}/waive`, { reason, waivedByUserId: waivedBy })
    return { success: true, data }
  } catch (error) {
    logger.error('Payment', `Failed to waive: ${error.message}`)
    return { success: false }
  }
}

// Additional functions
export async function getPaymentManagement(params = {}) {
  return getPayments(params)
}

export async function requestPaymentRefund(paymentId, reason) {
  try {
    const { data } = await api.post(`/payments/${paymentId}/refund`, { reason })
    return { success: true, data }
  } catch (error) {
    logger.error('Payment', `Failed to refund: ${error.message}`)
    return { success: false }
  }
}

export function formatPaymentAmount(amount) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0
  }).format(amount)
}

export async function getPaymentById(id) {
  try {
    const { data } = await api.get(`/payments/${id}`)
    return { success: true, data }
  } catch (error) {
    logger.error('Payment', `Failed to get: ${error.message}`)
    return { success: false }
  }
}
