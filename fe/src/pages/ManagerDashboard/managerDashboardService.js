import { api } from '../../core/api/apiClient'
import logger from '../../core/utils/logger'

export async function getManagerDashboard() {
  try {
    const { data } = await api.get('/dashboard')
    return data
  } catch (error) {
    logger.error('ManagerDashboard', `Failed to load: ${error.message}`)
    return getDefaultDashboardData()
  }
}

function getDefaultDashboardData() {
  return {
    kpis: [
      { label: 'Total Slots', value: 0 },
      { label: 'Available', value: 0 },
      { label: 'Occupied', value: 0 },
      { label: 'Occupancy Rate', value: '0%' }
    ],
    zones: [],
    facilityBreakdown: [],
    revenue: [],
    alerts: [],
    staff: [],
    activities: []
  }
}

export async function getParkingStructure() {
  try {
    const { data } = await api.get('/parking-structure')
    return { success: true, data }
  } catch (error) {
    logger.error('ManagerDashboard', `Failed to get structure: ${error.message}`)
    return { success: false }
  }
}

export async function getOccupancyData() {
  try {
    const { data } = await api.get('/dashboard/occupancy')
    return { success: true, data }
  } catch (error) {
    logger.error('ManagerDashboard', `Failed to get occupancy: ${error.message}`)
    return { success: false }
  }
}

export async function getRevenueData(params = {}) {
  try {
    const { data } = await api.get('/reports/financial', { params })
    return { success: true, data }
  } catch (error) {
    logger.error('ManagerDashboard', `Failed to get revenue: ${error.message}`)
    return { success: false }
  }
}
