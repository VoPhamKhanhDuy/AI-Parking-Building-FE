import { api } from './authService'

// Get all tickets
export async function getTickets(params = {}) {
  try {
    const { data } = await api.get('/parking-tickets', { params })
    return { success: true, data }
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to load tickets'
    }
  }
}

// Get ticket by code
export async function getTicketByCode(ticketCode) {
  try {
    const { data } = await api.get(`/parking-tickets/by-code/${ticketCode}`)
    return { success: true, data }
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Ticket not found'
    }
  }
}

// Get ticket by ID
export async function getTicketById(id) {
  try {
    const { data } = await api.get(`/parking-tickets/${id}`)
    return { success: true, data }
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Ticket not found'
    }
  }
}

// Create new ticket
export async function createTicket(data) {
  try {
    const result = await api.post('/parking-tickets', data)
    return { success: true, data: result.data }
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to create ticket'
    }
  }
}

// Update ticket
export async function updateTicket(id, data) {
  try {
    const result = await api.put(`/parking-tickets/${id}`, data)
    return { success: true, data: result.data }
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to update ticket'
    }
  }
}

// Format ticket status
export function formatTicketStatus(status) {
  const statusMap = {
    'Active': { label: 'Active', class: 'active' },
    'Completed': { label: 'Completed', class: 'completed' },
    'Cancelled': { label: 'Cancelled', class: 'cancelled' },
    'Lost': { label: 'Lost', class: 'lost' }
  }
  return statusMap[status] || { label: status, class: '' }
}

// Format ticket type
export function formatTicketType(type) {
  const typeMap = {
    'Hourly': 'Hourly',
    'Daily': 'Daily',
    'MonthlyPass': 'Monthly Pass'
  }
  return typeMap[type] || type
}
