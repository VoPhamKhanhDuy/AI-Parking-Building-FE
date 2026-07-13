import axios from 'axios'
import {
  managerActivities,
  managerAlerts,
  managerFacilityBreakdown,
  managerKpis,
  managerRevenue,
  managerStaff,
  managerZones,
} from '../../mock-data/managerDashboardData'

const mockDashboard = {
  kpis: managerKpis,
  zones: managerZones,
  revenue: managerRevenue,
  alerts: managerAlerts,
  staff: managerStaff,
  activities: managerActivities,
  facilityBreakdown: managerFacilityBreakdown,
}

export async function getManagerDashboard() {
  if (import.meta.env.VITE_USE_MOCK_DATA !== 'false') {
    return Promise.resolve(mockDashboard)
  }

  const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/manager/dashboard`)
  return data
}
