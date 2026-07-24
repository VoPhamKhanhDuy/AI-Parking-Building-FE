import { api } from '../../core/api/apiClient'
import logger from '../../core/utils/logger'
import {
  safeArray,
  sanitizeParams,
  unwrapList,
  shapeNotification,
  translateNotificationFilters,
} from '../../core/models/entities'

export { shapeNotification } from '../../core/models/entities'

export async function getNotifications(params = {}) {
  try {
    const translated = translateNotificationFilters(params)
    const safeParams = sanitizeParams(translated)
    const { data } = await api.get('/notifications', { params: safeParams })
    const list = Array.isArray(data) ? data : unwrapList(data)
    return { success: true, data: list.map(shapeNotification).filter(Boolean) }
  } catch (error) {
    logger.error('Notifications', `Failed to load: ${error.message}`)
    return { success: false, data: [], error }
  }
}

export async function markAsRead(id) {
  try {
    await api.post(`/notifications/${id}/read`)
    return { success: true }
  } catch (error) {
    logger.error('Notifications', `Failed to mark read: ${error.message}`)
    return { success: false, message: 'Failed to mark as read' }
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

export async function deleteNotification(id) {
  try {
    await api.delete(`/notifications/${id}`)
    return { success: true }
  } catch (error) {
    logger.error('Notifications', `Failed to delete notification: ${error.message}`)
    return { success: false, message: 'Failed to delete notification' }
  }
}

export async function filterNotifications(params = {}) {
  return getNotifications(params)
}

export async function getNotificationAction(notificationId) {
  try {
    const { data } = await api.get(`/notifications/${notificationId}`)
    return { success: true, data: shapeNotification(data) }
  } catch (error) {
    logger.error('Notifications', `Failed to get action: ${error.message}`)
    return { success: false }
  }
}

export async function getNotificationTypes() {
  return { success: true, data: safeArray([]) }
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
    return { success: true, data: shapeNotification(data) }
  } catch (error) {
    logger.error('Notifications', `Failed to save: ${error.message}`)
    return { success: false }
  }
}

export const markNotificationRead = markAsRead
export const markAllNotificationsRead = markAllAsRead
export const saveNotifications = saveNotification
