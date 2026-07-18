import { api } from '../../core/api/apiClient'
import logger from '../../core/utils/logger'

const useMockData = import.meta.env.VITE_USE_MOCK_DATA === 'true'

export async function getDashboardData() {
  if (useMockData) {
    const mockData = await import('../../mock-data/dashboardData').then(m => m.dashboardData)
    return mockData
  }
  try {
    const { data } = await api.get('/dashboard')
    return data
  } catch (error) {
    logger.error('Dashboard', `Failed to fetch: ${error.message}`)
    throw error
  }
}

export async function getDashboardStats() {
  if (useMockData) {
    const mockData = await import('../../mock-data/dashboardData').then(m => m.dashboardData)
    return mockData.stats
  }
  try {
    const { data } = await api.get('/dashboard/stats')
    return data
  } catch (error) {
    logger.error('Dashboard', `Failed to fetch stats: ${error.message}`)
    throw error
  }
}

export async function getOccupancy() {
  if (useMockData) {
    return null
  }
  try {
    const { data } = await api.get('/dashboard/occupancy')
    return data
  } catch (error) {
    logger.error('Dashboard', `Failed to fetch occupancy: ${error.message}`)
    throw error
  }
}

export const formatCurrentTime = (date = new Date()) => date.toLocaleTimeString('en-GB')

export function formatCurrency(amount) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0
  }).format(amount)
}
