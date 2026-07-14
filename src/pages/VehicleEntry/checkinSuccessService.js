import axios from 'axios'
import { mockQrPayment } from '../../mock-data/qrPayments'

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api', timeout: 8000 })
const useMockData = import.meta.env.VITE_USE_MOCK_DATA !== 'false'
const wait = (value, delay = 350) => new Promise((resolve) => setTimeout(() => resolve(value), delay))

const qrPattern = (seed) => {
  let value = [...seed].reduce((total, char) => total + char.charCodeAt(0), 0)
  return Array.from({ length: 21 }, (_, row) => Array.from({ length: 21 }, (_, column) => {
    value = (value * 9301 + 49297) % 233280
    const finder = (row < 7 && column < 7) || (row < 7 && column > 13) || (row > 13 && column < 7)
    const finderEdge = finder && (row % 7 === 0 || row % 7 === 6 || column % 7 === 0 || column % 7 === 6)
    const finderCore = finder && row % 7 > 1 && row % 7 < 5 && column % 7 > 1 && column % 7 < 5
    return finderEdge || finderCore || (!finder && value / 233280 > 0.52)
  }))
}

const createQrDataUrl = (content) => {
  const cells = qrPattern(content).flatMap((row, y) => row.map((filled, x) => filled ? `<rect x="${x + 2}" y="${y + 2}" width="1" height="1"/>` : '')).join('')
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 25 25"><rect width="25" height="25" fill="white"/><g fill="#111827">${cells}</g></svg>`)}`
}

export async function createCheckinPayment({ ticketCode, licensePlate }) {
  if (!useMockData) {
    const { data } = await api.post('/payments/qr', { ticketCode, licensePlate, paymentType: 'PARKING_DEPOSIT' })
    return data.data || data
  }
  const createdAt = new Date()
  const payment = { ...mockQrPayment, paymentId: `PAY-${String(Date.now()).slice(-8)}`, description: `PARKING ${ticketCode}`, createdAt: createdAt.toISOString(), expiresAt: new Date(createdAt.getTime() + mockQrPayment.expiresInSeconds * 1000).toISOString() }
  return wait({ ...payment, qrImageUrl: createQrDataUrl(`${payment.paymentId}|${licensePlate}|${payment.amount}`) })
}

export async function getCheckinPaymentStatus(paymentId) {
  if (!useMockData) {
    const { data } = await api.get(`/payments/${paymentId}/status`)
    return data.data || data
  }
  return wait({ paymentId, status: 'PENDING', checkedAt: new Date().toISOString() }, 200)
}

export const formatMoney = (amount) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount)
export const formatSessionTime = (value) => value ? new Intl.DateTimeFormat('vi-VN', { dateStyle: 'short', timeStyle: 'medium' }).format(new Date(value)) : '—'
