import { api } from '../../core/api/apiClient'
import logger from '../../core/utils/logger'
import {
  shapeStats,
  shapeDashboard,
  FALLBACK_DASHBOARD,
  FALLBACK_STATS,
} from '../../core/models/entities'

export { shapeStats, shapeDashboard, FALLBACK_DASHBOARD, FALLBACK_STATS } from '../../core/models/entities'

export function formatCurrency(amount) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
  }).format(amount)
}

export function shapeDashboardEntry(entry) {
  if (!entry) return null
  const time = entry.time instanceof Date ? entry.time : new Date(entry.time)
  return {
    id: entry.id || `entry-${entry.ticketCode || ''}-${entry.time || ''}`,
    time: Number.isNaN(time.getTime()) ? '—' : time.toLocaleTimeString('en-GB'),
    event: entry.action || 'Vehicle Entry',
    vehicle: entry.ticketCode || '—',
    plate: entry.licensePlate || '—',
    slot: entry.slotCode || '—',
    status: entry.status || '—',
  }
}

export const formatCurrentTime = (date = new Date()) => date.toLocaleTimeString('en-GB')

export async function getDashboardData() {
  try {
    const { data } = await api.get('/dashboard')
    return shapeDashboard(data)
  } catch (error) {
    logger.error('Dashboard', `Failed to fetch: ${error.message}`)
    return { ...FALLBACK_DASHBOARD }
  }
}

export async function getDashboardStats() {
  try {
    const { data } = await api.get('/dashboard/stats')
    return shapeStats(data)
  } catch (error) {
    logger.error('Dashboard', `Failed to fetch stats: ${error.message}`)
    return { ...FALLBACK_STATS }
  }
}

export async function getOccupancy() {
  try {
    const { data } = await api.get('/dashboard/occupancy')
    return data || { buildings: [] }
  } catch (error) {
    logger.error('Dashboard', `Failed to fetch occupancy: ${error.message}`)
    return { buildings: [] }
  }
}
