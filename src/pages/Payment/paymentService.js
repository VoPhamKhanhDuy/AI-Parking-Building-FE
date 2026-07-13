import axios from 'axios'
import { paymentDashboardStats, paymentTransactions } from '../../mock-data/paymentsData'

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api', timeout: 8000 })
const useMockData = import.meta.env.VITE_USE_MOCK_DATA !== 'false'
const wait = (value, delay = 280) => new Promise((resolve) => setTimeout(() => resolve(value), delay))
let transactions = paymentTransactions.map((item) => ({ ...item }))

export async function getPaymentManagement(params = {}) {
  if (!useMockData) { const { data } = await api.get('/payments', { params }); return data.data || data }
  const query = params.search?.trim().toUpperCase()
  const items = transactions.filter((item) => (!query || item.ticketCode.includes(query) || item.licensePlate.includes(query) || item.receiptId.includes(query)) && (!params.status || params.status === 'All Statuses' || item.status === params.status) && (!params.method || params.method === 'All Methods' || item.method === params.method) && (!params.type || params.type === 'All Types' || item.type === params.type))
  return wait({ stats: { ...paymentDashboardStats }, transactions: items, activities: transactions.slice(0, 4) })
}

export async function requestPaymentRefund(paymentId, reason = 'Staff requested refund') {
  if (!useMockData) { const { data } = await api.post(`/payments/${paymentId}/refunds`, { reason }); return data.data || data }
  const item = transactions.find((payment) => payment.id === paymentId)
  if (!item || item.status !== 'PAID') throw new Error('Only paid transactions can be refunded.')
  item.status = 'REFUND_PENDING'
  return wait({ ...item })
}

export const formatPaymentAmount = (value) => new Intl.NumberFormat('vi-VN').format(value || 0) + ' VND'
