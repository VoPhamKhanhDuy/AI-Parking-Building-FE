import { api } from '../core/api/apiClient'
import logger from '../core/utils/logger'

export async function getDashboard() {
  try {
    const { data } = await api.get('/dashboard')
    return { success: true, data }
  } catch (error) {
    logger.error('Dashboard', `Failed to load: ${error.message}`)
    return { success: false, message: 'Failed to load dashboard' }
  }
}

export async function getDashboardStats() {
  try {
    const { data } = await api.get('/dashboard/stats')
    return { success: true, data }
  } catch (error) {
    logger.error('Dashboard', `Failed to load stats: ${error.message}`)
    return { success: false }
  }
}

export async function getOccupancy() {
  try {
    const { data } = await api.get('/dashboard/occupancy')
    return { success: true, data }
  } catch (error) {
    logger.error('Dashboard', `Failed to load occupancy: ${error.message}`)
    return { success: false }
  }
}

export function formatCurrency(amount) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0
  }).format(amount)
}

export function formatPercentage(value) {
  return `${value?.toFixed(1) || 0}%`
}

export function formatTime(date) {
  if (!date) return ''
  return new Date(date).toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

export function formatDate(date) {
  if (!date) return ''
  return new Date(date).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

export function formatDateTime(date) {
  if (!date) return ''
  return `${formatDate(date)} ${formatTime(date)}`
}

export function formatCurrentTime() {
  return new Date().toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}
