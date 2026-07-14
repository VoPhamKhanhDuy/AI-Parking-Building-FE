import { notificationItems } from '../../mock-data/notifications'

const STORAGE_KEY = 'parking-notifications'

export const getNotifications = () => {
  try {
    const savedItems = localStorage.getItem(STORAGE_KEY)
    return savedItems ? JSON.parse(savedItems) : notificationItems.map((item) => ({ ...item }))
  } catch {
    return notificationItems.map((item) => ({ ...item }))
  }
}

export const saveNotifications = (items) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  } catch {
    // The page still works when browser storage is unavailable.
  }
}

export const getNotificationTypes = (items) => [...new Set(items.map((item) => item.type))]

export const filterNotifications = (items, { search, type, status, shift }) => {
  const keyword = search.trim().toLowerCase()

  return items.filter((item) => {
    const matchesSearch = !keyword || [item.message, item.reference, item.ticketCode, item.licensePlate]
      .some((value) => value.toLowerCase().includes(keyword))
    const matchesType = type === 'All Types' || item.type === type
    const matchesStatus = status === 'All Statuses' || item.status === status
    const matchesShift = shift === 'All Shifts' || item.currentShift

    return matchesSearch && matchesType && matchesStatus && matchesShift
  })
}

export const markNotificationRead = (items, id) => items.map((item) => (
  item.id === id ? { ...item, status: 'Read' } : item
))

export const markAllNotificationsRead = (items) => items.map((item) => (
  item.status === 'Unread' ? { ...item, status: 'Read' } : item
))

export const getNotificationAction = (notification) => {
  if (!notification) return null

  const actions = {
    Payment: { label: 'View Payment', path: '/payment' },
    Reservation: { label: 'View Reservation', path: '/reservation' },
    System: { label: 'View Parking Structure', path: '/parking-structure' },
    'Lost Ticket': { label: 'View Lost Ticket', path: '/lost-ticket' },
  }

  return actions[notification.type] || null
}
