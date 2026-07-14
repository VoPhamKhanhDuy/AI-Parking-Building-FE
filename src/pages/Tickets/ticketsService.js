import axios from 'axios'
import { ticketActivities, ticketItems, ticketStats } from '../../mock-data/ticketsData'
const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api', timeout: 8000 })
const useMockData = import.meta.env.VITE_USE_MOCK_DATA !== 'false'
const wait = (value, delay = 250) => new Promise((resolve) => setTimeout(() => resolve(value), delay))
let tickets = ticketItems.map((item) => ({ ...item }))

export async function getTickets(params = {}) {
  if (!useMockData) { const { data } = await api.get('/tickets', { params }); return data.data || data }
  const query = params.search?.trim().toUpperCase()
  const items = tickets.filter((item) => (!query || item.ticketCode.includes(query) || item.licensePlate.includes(query)) && (!params.type || params.type === 'All Types' || item.ticketType === params.type) && (!params.status || params.status === 'All Statuses' || item.status === params.status))
  return wait({ stats: { ...ticketStats }, tickets: items, activities: ticketActivities.map((item) => ({ ...item })) })
}

export async function markTicketLost(ticketId) {
  if (!useMockData) { const { data } = await api.post(`/tickets/${ticketId}/lost`); return data.data || data }
  const ticket = tickets.find((item) => item.id === ticketId)
  if (!ticket) throw new Error('Ticket not found.')
  ticket.ticketType = 'Lost Ticket'; ticket.status = 'Pending Payment'; ticket.method = 'Manual Review'
  return wait({ ...ticket })
}
