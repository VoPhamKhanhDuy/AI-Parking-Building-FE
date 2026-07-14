import {
  mockExitSessions,
  mockPaymentHistory,
  mockRecentExits,
  mockTicketRecords
} from '../../mock-data/vehicleExitData'
import axios from 'axios'

let exitSessions = mockExitSessions.map((session) => ({ ...session }))
let ticketRecords = mockTicketRecords.map((record) => ({ ...record }))
let paymentHistory = mockPaymentHistory.map((entry) => ({ ...entry }))
const paymentChecks = new Map()

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api', timeout: 8000 })
const useMockData = import.meta.env.VITE_USE_MOCK_DATA !== 'false'

const formatCurrency = (value) => new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND'
}).format(value)

const createQrImage = (content) => {
  let seed = [...content].reduce((total, char) => total + char.charCodeAt(0), 0)
  const cells = Array.from({ length: 21 }, (_, y) => Array.from({ length: 21 }, (_, x) => {
    seed = (seed * 9301 + 49297) % 233280
    const finder = (x < 7 && y < 7) || (x > 13 && y < 7) || (x < 7 && y > 13)
    return finder ? x % 7 === 0 || x % 7 === 6 || y % 7 === 0 || y % 7 === 6 || (x % 7 > 1 && x % 7 < 5 && y % 7 > 1 && y % 7 < 5) : seed / 233280 > .52
  })).flatMap((row, y) => row.map((filled, x) => filled ? `<rect x="${x + 2}" y="${y + 2}" width="1" height="1"/>` : '')).join('')
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 25 25"><rect width="25" height="25" fill="white"/><g fill="#111827">${cells}</g></svg>`)}`
}

export const getVehicleExitSessions = () => exitSessions.map((session) => ({ ...session }))

export const fetchVehicleExitData = async () => {
  if (!useMockData) { const { data } = await api.get('/vehicle-exits/active'); return data.data || data }
  await wait(300)
  return { sessions: getVehicleExitSessions(), recentExits: mockRecentExits.map((item) => ({ ...item })) }
}

export const getPendingVehicleSessions = () => getVehicleExitSessions().filter((session) => session.paymentStatus === 'Pending')

export const getTicketRecords = () => ticketRecords.map((record) => ({ ...record }))

export const getPaymentHistory = () => paymentHistory.map((entry) => ({ ...entry }))

export const findVehicleExitSession = (value) => {
  const search = value?.trim().toUpperCase()
  if (!search) return null

  return exitSessions.find((session) => session.ticketCode.toUpperCase() === search || session.licensePlate.toUpperCase() === search) || null
}

export const lookupVehicleExitSession = async (value) => {
  if (!useMockData) { const { data } = await api.get('/vehicle-exits/lookup', { params: { query: value } }); return data.data || data }
  await wait(350)
  return findVehicleExitSession(value)
}

export const calculateExitFee = async (sessionId) => {
  if (!useMockData) { const { data } = await api.post(`/vehicle-exits/${sessionId}/calculate-fee`); return data.data || data }
  await wait(300)
  const session = exitSessions.find((item) => item.id === sessionId)
  if (!session) throw new Error('Active parking session not found.')
  return { ...getPaymentSummary(session), discount: formatCurrency(0), calculatedAt: new Date().toISOString() }
}

export const createExitPayment = async (sessionId) => {
  if (!useMockData) { const { data } = await api.post(`/vehicle-exits/${sessionId}/payments`, { method: 'QR' }); return data.data || data }
  await wait(350)
  const session = exitSessions.find((item) => item.id === sessionId)
  if (!session) throw new Error('Active parking session not found.')
  const paymentId = `PAY-EXIT-${String(Date.now()).slice(-8)}`
  const transactionCode = `PKEXIT${session.id}${String(Date.now()).slice(-5)}`
  const amount = session.baseFee + session.surcharge
  paymentChecks.set(paymentId, 0)
  return { paymentId, transactionCode, amount, status: 'PENDING', method: 'QR Payment', bankName: 'MB Bank', accountName: 'AI PARKING BUILDING', expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(), qrImageUrl: createQrImage(`${paymentId}|${transactionCode}|${amount}`) }
}

export const checkExitPaymentStatus = async (paymentId, sessionId) => {
  if (!useMockData) { const { data } = await api.get(`/payments/${paymentId}/status`); return data.data || data }
  await wait(300)
  const checks = (paymentChecks.get(paymentId) || 0) + 1
  paymentChecks.set(paymentId, checks)
  const status = checks >= 2 ? 'PAID' : 'PENDING'
  if (status === 'PAID') {
    const session = exitSessions.find((item) => item.id === sessionId)
    if (session) { session.paymentStatus = 'Paid'; session.paymentMethod = 'QR Payment'; session.status = 'ReadyToExit' }
  }
  return { paymentId, status, paidAt: status === 'PAID' ? new Date().toISOString() : null }
}

export const getPaymentSummary = (session) => {
  if (!session) return null
  const total = session.baseFee + session.surcharge
  return {
    total,
    formattedTotal: formatCurrency(total),
    baseFee: formatCurrency(session.baseFee),
    surcharge: formatCurrency(session.surcharge)
  }
}

export const processVehicleExit = async (sessionId) => {
  if (!useMockData) { const { data } = await api.post(`/vehicle-exits/${sessionId}/complete`); return data.data || data }
  await wait(900)
  const target = exitSessions.find((session) => session.id === sessionId)
  if (!target) return null

  target.status = 'Completed'
  target.paymentStatus = 'Paid'
  target.exitTime = new Date().toLocaleString('vi-VN', { hour12: false })

  const ticket = ticketRecords.find((record) => record.ticketCode === target.ticketCode)
  if (ticket) {
    ticket.status = 'Completed'
    ticket.paymentStatus = 'Paid'
    ticket.exitTime = target.exitTime
  }

  return { ...target }
}

export const processPayment = async (sessionId, method) => {
  await wait(900)
  const target = exitSessions.find((session) => session.id === sessionId)
  if (!target) return null

  target.paymentStatus = 'Paid'
  target.paymentMethod = method
  target.status = 'ReadyToExit'

  const ticket = ticketRecords.find((record) => record.ticketCode === target.ticketCode)
  if (ticket) {
    ticket.status = 'Ready to Exit'
    ticket.paymentStatus = 'Paid'
  }

  paymentHistory.unshift({
    id: paymentHistory.length + 1,
    ticketCode: target.ticketCode,
    licensePlate: target.licensePlate,
    amount: target.baseFee + target.surcharge,
    method,
    status: 'Completed',
    paidAt: new Date().toLocaleString('vi-VN', { hour12: false })
  })

  return { ...target }
}
