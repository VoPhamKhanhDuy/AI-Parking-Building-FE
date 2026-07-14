import axios from 'axios'
import { lostTicketPolicy, lostTicketSessions, recentLostTicketCases } from '../../mock-data/lostTicketsData'
const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api', timeout: 8000 })
const useMockData = import.meta.env.VITE_USE_MOCK_DATA !== 'false'
const wait = (value, delay = 300) => new Promise((resolve) => setTimeout(() => resolve(value), delay))

export async function findLostTicketSession({ method, query }) {
  if (!useMockData) { const { data } = await api.get('/lost-tickets/session', { params: { method, query } }); return data.data || data }
  const value = query.trim().toUpperCase()
  const session = lostTicketSessions.find((item) => method === 'Ticket Code' ? item.ticketCode === value : item.licensePlate === value)
  return wait(session ? { ...session, verification: ['Plate matched with entry record', 'Vehicle type matched', 'Active parking session found'] } : null)
}
export async function calculateLostTicketFee(sessionId) {
  if (!useMockData) { const { data } = await api.post(`/lost-tickets/sessions/${sessionId}/fee`); return data.data || data }
  const session = lostTicketSessions.find((item) => item.id === sessionId)
  if (!session) throw new Error('Active session not found.')
  const penalty = session.vehicleType === 'Motorcycle' ? lostTicketPolicy.motorcyclePenalty : session.vehicleType === 'Electric Vehicle' ? lostTicketPolicy.evPenalty : lostTicketPolicy.carPenalty
  return wait({ parkingFee: session.parkingFee, penalty, discount: 0, total: session.parkingFee + penalty, paymentStatus: 'Pending' })
}
export async function createLostTicketCase(sessionId, customer) {
  if (!useMockData) { const { data } = await api.post('/lost-tickets', { sessionId, ...customer }); return data.data || data }
  return wait({ caseId: `LT-${String(Date.now()).slice(-6)}`, sessionId, status: 'Pending Payment', ...customer })
}
export async function getLostTicketPageData() {
  if (!useMockData) { const { data } = await api.get('/lost-tickets'); return data.data || data }
  return wait({ policy: { ...lostTicketPolicy }, recentCases: recentLostTicketCases.map((item) => ({ ...item })) }, 200)
}
export const formatLostTicketMoney = (value) => new Intl.NumberFormat('vi-VN').format(value || 0) + ' VND'
