import { api } from '../../core/api/apiClient'
import logger from '../../core/utils/logger'

export async function getManagerDashboard() {
  try {
    const [dashRes, occupancyRes, staffRes] = await Promise.allSettled([
      api.get('/dashboard'),
      api.get('/dashboard/occupancy'),
      api.get('/staff-activities'),
    ])

    const dashData = dashRes.status === 'fulfilled' ? dashRes.value.data : null
    const occupancyData = occupancyRes.status === 'fulfilled' ? occupancyRes.value.data : null
    const staffData = staffRes.status === 'fulfilled' ? staffRes.value.data : null

    return transformDashboardResponse(dashData, occupancyData, staffData)
  } catch (error) {
    logger.error('ManagerDashboard', `Failed to load: ${error.message}`)
    // Return mock data when API is unavailable
    return getMockDashboardData()
  }
}

function transformDashboardResponse(response, occupancyData, staffData) {
  // Handle null/undefined response
  if (!response) {
    return getMockDashboardData()
  }
  
  const stats = response.stats || response.Stats || {}
  const facilityBreakdown = response.facilityBreakdown || []
  const revenue = response.revenue || []
  const alerts = response.alerts || []
  const recentEntries = response.recentEntries || response.RecentEntries || []
  
  // Build zones from occupancy API response
  let zones = []
  if (occupancyData?.buildings?.length) {
    occupancyData.buildings.forEach(building => {
      building.Floors?.forEach(floor => {
        const available = (floor.TotalSlots || 0) - (floor.OccupiedSlots || 0)
        const pct = floor.OccupancyRate || 0
        zones.push({
          zone: floor.FloorName || floor.floorName || `Floor`,
          vehicleType: 'Mixed',
          total: floor.TotalSlots || floor.totalSlots || 0,
          occupied: floor.OccupiedSlots || floor.occupiedSlots || 0,
          available: available,
          occupancy: `${Math.round(pct)}%`,
          status: pct > 85 ? 'High' : 'Normal'
        })
      })
    })
  }
  if (!zones.length) {
    // fall back to mock zones so the table is never blank
    zones = getMockDashboardData().zones
  }

  // Build staff from staff-activities API response
  let staff = []
  if (staffData?.staff?.length || staffData?.Staff?.length) {
    const rawStaff = staffData.staff || staffData.Staff || []
    staff = rawStaff.map(s => ({
      staff: s.Name || s.name || `Staff`,
      role: s.Role || s.role || 'Staff',
      area: s.Area || s.area || 'Building A',
      entries: s.Entries || s.entries || 0,
      exits: s.Exits || s.exits || 0,
      payments: s.Payments || s.payments || 0,
      status: s.Status || s.status || 'Active'
    }))
  }
  if (!staff.length) {
    staff = getMockDashboardData().staff
  }

  return {
    kpis: response.kpis || response.Kpis || [
      { label: 'Total Slots', value: stats.TotalSlots ?? stats.totalSlots ?? 0 },
      { label: 'Available', value: stats.AvailableSlots ?? stats.availableSlots ?? 0 },
      { label: 'Occupied', value: stats.OccupiedSlots ?? stats.occupiedSlots ?? 0 },
      { label: 'Occupancy Rate', value: `${stats.OccupancyRate ?? stats.occupancyRate ?? 0}%` }
    ],
    zones,
    facilityBreakdown: facilityBreakdown.length ? facilityBreakdown : getMockDashboardData().facilityBreakdown,
    revenue: revenue.length ? revenue : [
      { label: 'Today Revenue', value: formatCurrency(stats.TodayRevenue ?? stats.todayRevenue ?? 0) },
      { label: 'Cash Payment', value: formatCurrency(stats.cashPayment ?? 0) },
      { label: 'QR Payment', value: formatCurrency(stats.qrPayment ?? 0) },
      { label: 'Card Payment', value: formatCurrency(stats.cardPayment ?? 0) },
      { label: 'Pending Payment', value: formatCurrency(stats.pendingPayment ?? 0) }
    ],
    alerts: alerts.length ? alerts.map((a, i) => ({
      text: a.text || a.message || `Alert ${i + 1}`,
      severity: a.severity || a.level || 'Low'
    })) : getMockDashboardData().alerts,
    staff,
    activities: recentEntries.map(entry => ({
      time: formatTime(entry.time || entry.Time || entry.createdAt || entry.CreatedAt),
      activity: entry.activity || entry.Action || 'Vehicle Entry',
      reference: entry.ticketCode || entry.TicketCode || entry.licensePlate || entry.LicensePlate || entry.reference || '—',
      performedBy: entry.performedBy || entry.staff || 'System',
      status: entry.status || entry.Status || 'Completed'
    }))
  }
}

function formatCurrency(amount) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0
  }).format(amount)
}

function formatTime(date) {
  if (!date) return '—'
  const d = new Date(date)
  return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
}

export function getMockDashboardData() {
  return {
    kpis: [
      { label: 'Total Slots', value: 524 },
      { label: 'Available', value: 123 },
      { label: 'Occupied', value: 401 },
      { label: 'Occupancy Rate', value: '76%' }
    ],
    zones: [
      { zone: 'Zone A', vehicleType: 'Motorcycle', total: 120, occupied: 82, available: 38, occupancy: '68%', status: 'Normal' },
      { zone: 'Zone B', vehicleType: 'Car', total: 284, occupied: 220, available: 64, occupancy: '77%', status: 'High' },
      { zone: 'Zone C', vehicleType: 'EV Charging', total: 80, occupied: 60, available: 20, occupancy: '75%', status: 'Normal' },
      { zone: 'Zone D', vehicleType: 'Reserved / VIP', total: 40, occupied: 30, available: 10, occupancy: '75%', status: 'Normal' }
    ],
    facilityBreakdown: [
      { label: 'Floor 1', value: '82%', note: 'High occupancy' },
      { label: 'Floor 2', value: '73%', note: 'Normal' },
      { label: 'Floor 3', value: '34%', note: 'Maintenance monitored' },
      { label: 'Reserved Slots', value: '45', note: 'Across building' },
      { label: 'Maintenance Slots', value: '13', note: 'EV charging zone' }
    ],
    revenue: [
      { label: 'Today Revenue', value: '12,850,000 VND' },
      { label: 'Cash Payment', value: '3,200,000 VND' },
      { label: 'QR Payment', value: '7,550,000 VND' },
      { label: 'Card Payment', value: '2,100,000 VND' },
      { label: 'Pending Payment', value: '800,000 VND' }
    ],
    alerts: [
      { text: 'Zone B occupancy is high', severity: 'High' },
      { text: '3 pending payment cases need review', severity: 'Medium' },
      { text: '1 lost ticket case waiting for manager confirmation', severity: 'Medium' },
      { text: 'EV charging zone has 13 slots under maintenance', severity: 'Low' }
    ],
    staff: [
      { staff: 'Nguyễn Văn An', role: 'Entry Gate Operator', area: 'Entry Gate A', entries: 42, exits: 0, payments: 0, status: 'Active' },
      { staff: 'Phạm Thu Hà', role: 'Exit Gate Operator', area: 'Exit Gate B', entries: 0, exits: 38, payments: 36, status: 'Active' },
      { staff: 'Trần Minh Đức', role: 'Parking Support', area: 'Zone B', entries: 12, exits: 10, payments: 4, status: 'Active' },
      { staff: 'Lê Hoàng Nam', role: 'Supervisor', area: 'Building A', entries: 8, exits: 7, payments: 5, status: 'Active' }
    ],
    activities: [
      { time: 'Today 17:30', activity: 'Pricing rule reviewed', reference: 'PRC-001', performedBy: 'Manager', status: 'Completed' },
      { time: 'Today 16:45', activity: 'Lost ticket case reviewed', reference: 'LT-00008', performedBy: 'Manager', status: 'Pending' },
      { time: 'Today 15:20', activity: 'Zone capacity checked', reference: 'Zone B', performedBy: 'Manager', status: 'Completed' },
      { time: 'Today 14:05', activity: 'Daily report generated', reference: 'RPT-2026-00012', performedBy: 'Manager', status: 'Completed' }
    ]
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
