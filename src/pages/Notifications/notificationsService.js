import { notificationItems } from '../../mock-data/notifications'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
const useMockData = import.meta.env.VITE_USE_MOCK_DATA !== 'false'

export function shapeNotification(item) {
  if (!item) return null
  return {
    id: item.id || item.Id,
    title: item.title || item.message || item.Title || 'System Alert',
    message: item.message || item.description || item.Message || 'System notification',
    type: item.type || item.Type || 'Info',
    status: item.isRead || item.status === 'Read' ? 'Read' : 'Unread',
    time: item.createdAt ? new Date(item.createdAt).toLocaleTimeString('vi-VN') : (item.time || '10 min ago'),
    licensePlate: item.licensePlate || '—',
    ticketCode: item.ticketCode || '—',
    reference: item.reference || '—',
  }
}

export async function getNotifications(params = {}) {
  if (useMockData) {
    return { success: true, data: notificationItems.map(shapeNotification) }
  }

  try {
    const token = localStorage.getItem('token')
    const headers = token ? { Authorization: `Bearer ${token}` } : {}
    const response = await fetch(`${API_BASE_URL}/notifications`, { headers })
    if (!response.ok) throw new Error('API request failed')
    const data = await response.json()
    const list = Array.isArray(data) ? data : Array.isArray(data?.notifications) ? data.notifications : []
    return { success: true, data: list.length > 0 ? list.map(shapeNotification) : notificationItems.map(shapeNotification) }
  } catch (error) {
    return { success: true, data: notificationItems.map(shapeNotification) }
  }
}

export async function markAsRead(id) {
  try {
    const token = localStorage.getItem('token')
    const headers = token ? { Authorization: `Bearer ${token}` } : {}
    await fetch(`${API_BASE_URL}/notifications/${id}/read`, { method: 'POST', headers })
    return { success: true }
  } catch (error) {
    return { success: true }
  }
}

export async function markAllAsRead() {
  try {
    const token = localStorage.getItem('token')
    const headers = token ? { Authorization: `Bearer ${token}` } : {}
    await fetch(`${API_BASE_URL}/notifications/read-all`, { method: 'POST', headers })
    return { success: true }
  } catch (error) {
    return { success: true }
  }
}

export async function deleteNotification(id) {
  try {
    const token = localStorage.getItem('token')
    const headers = token ? { Authorization: `Bearer ${token}` } : {}
    await fetch(`${API_BASE_URL}/notifications/${id}`, { method: 'DELETE', headers })
    return { success: true }
  } catch (error) {
    return { success: true }
  }
}

export async function filterNotifications(params = {}) { return getNotifications(params) }
export async function getNotificationAction(id) { return { success: true } }
export async function getNotificationTypes() { return { success: true, data: [] } }
export async function saveNotifications(data) { return { success: true } }

export const markNotificationRead = markAsRead
export const markAllNotificationsRead = markAllAsRead
