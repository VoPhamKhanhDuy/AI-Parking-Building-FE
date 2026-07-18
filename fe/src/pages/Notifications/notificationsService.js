import { api } from '../../core/api/apiClient'
import logger from '../../core/utils/logger'

export async function getNotifications(params = {}) {
  try {
    const { data } = await api.get('/notifications', { params })
    return { success: true, data }
  } catch (error) {
    logger.error('Notifications', `Failed to load: ${error.message}`)
    return { success: false }
  }
}

export async function markAsRead(id) {
  try {
    await api.post(`/notifications/${id}/read`)
    return { success: true }
  } catch (error) {
    logger.error('Notifications', `Failed to mark read: ${error.message}`)
    return { success: false }
  }
}

export async function markAllAsRead() {
  try {
    await api.post('/notifications/read-all')
    return { success: true }
  } catch (error) {
    logger.error('Notifications', `Failed to mark all read: ${error.message}`)
    return { success: false }
  }
}

export async function filterNotifications(params = {}) {
  return getNotifications(params)
}

export async function getNotificationAction(notificationId) {
  try {
    const { data } = await api.get(`/notifications/${notificationId}`)
    return { success: true, data }
  } catch (error) {
    logger.error('Notifications', `Failed to get action: ${error.message}`)
    return { success: false }
  }
}

export async function getNotificationTypes() {
  try {
    const { data } = await api.get('/notifications/types')
    return { success: true, data }
  } catch (error) {
    logger.error('Notifications', `Failed to get types: ${error.message}`)
    return { success: false, data: [] }
  }
}

export async function markAsReadAction(id) {
  return markAsRead(id)
}

export async function markAllAsReadAction() {
  return markAllAsRead()
}

export async function saveNotification(notificationData) {
  try {
    const { data } = await api.post('/notifications', notificationData)
    return { success: true, data }
  } catch (error) {
    logger.error('Notifications', `Failed to save: ${error.message}`)
    return { success: false }
  }
}

// Aliases for backward compatibility
export const markNotificationRead = markAsRead
export const markAllNotificationsRead = markAllAsRead
export const saveNotifications = saveNotification
