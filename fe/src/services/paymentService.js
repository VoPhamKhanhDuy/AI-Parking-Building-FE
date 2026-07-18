import { api } from './authService'

// Get all payments
export async function getPayments(params = {}) {
  try {
    const { data } = await api.get('/payments', { params })
    return { success: true, data }
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to load payments'
    }
  }
}

// Get payment by ID
export async function getPaymentById(id) {
  try {
    const { data } = await api.get(`/payments/${id}`)
    return { success: true, data }
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Payment not found'
    }
  }
}

// Get payment by session ID
export async function getPaymentBySession(sessionId) {
  try {
    const { data } = await api.get(`/payments/by-session/${sessionId}`)
    return { success: true, data }
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Payment not found'
    }
  }
}

// Create payment (for manual/cash payments)
export async function createPayment(sessionId, method = 'Cash') {
  try {
    const { data } = await api.post('/payments', {
      parkingSessionId: sessionId,
      paymentMethod: method
    })
    return { success: true, data }
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Payment failed'
    }
  }
}

// Process payment
export async function processPayment(paymentId, method = 'Cash') {
  try {
    const { data } = await api.post(`/payments/${paymentId}/process`, {
      paymentMethod: method
    })
    return { success: true, data }
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Payment processing failed'
    }
  }
}

// Refund payment
export async function refundPayment(paymentId, reason) {
  try {
    const { data } = await api.post(`/payments/${paymentId}/refund`, {
      reason
    })
    return { success: true, data }
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Refund failed'
    }
  }
}

// Get payment methods
export const paymentMethods = [
  { value: 'Cash', label: 'Cash' },
  { value: 'CreditCard', label: 'Credit Card' },
  { value: 'DebitCard', label: 'Debit Card' },
  { value: 'E_Wallet', label: 'E-Wallet' },
  { value: 'QRCode', label: 'QR Code' },
  { value: 'BankTransfer', label: 'Bank Transfer' }
]

// Format payment status
export function formatPaymentStatus(status) {
  const statusMap = {
    'Pending': { label: 'Pending', class: 'pending' },
    'Processing': { label: 'Processing', class: 'processing' },
    'Paid': { label: 'Paid', class: 'paid' },
    'Failed': { label: 'Failed', class: 'failed' },
    'Refunded': { label: 'Refunded', class: 'refunded' },
    'Cancelled': { label: 'Cancelled', class: 'cancelled' }
  }
  return statusMap[status] || { label: status, class: '' }
}

// Format payment method
export function formatPaymentMethod(method) {
  const methodMap = {
    'Cash': 'Cash',
    'CreditCard': 'Credit Card',
    'DebitCard': 'Debit Card',
    'E_Wallet': 'E-Wallet',
    'QRCode': 'QR Code',
    'BankTransfer': 'Bank Transfer'
  }
  return methodMap[method] || method
}
