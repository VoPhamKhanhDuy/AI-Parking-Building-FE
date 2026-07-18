import { api } from '../../core/api/apiClient'
import logger from '../../core/utils/logger'

export async function getManagerDashboard() {
  try {
    const { data } = await api.get('/dashboard')
    return transformDashboardResponse(data)
  } catch (error) {
    logger.error('ManagerDashboard', `Failed to load: ${error.message}`)
    // Return mock data when API is unavailable
    return getMockDashboardData()
  }
}

function transformDashboardResponse(response) {
  // Handle null/undefined response
  if (!response) {
    return getMockDashboardData()
  }
  
  const stats = response.stats || {}
  const zones = response.zones || []
  const facilityBreakdown = response.facilityBreakdown || []
  const revenue = response.revenue || []
  const alerts = response.alerts || []
  const staff = response.staff || []
  const recentEntries = response.recentEntries || []
  
  return {
    kpis: response.kpis || [
      { label: 'Total Slots', value: stats.totalSlots ?? 0 },
      { label: 'Available', value: stats.availableSlots ?? 0 },
      { label: 'Occupied', value: stats.occupiedSlots ?? 0 },
      { label: 'Occupancy Rate', value: `${stats.occupancyRate ?? 0}%` }
    ],
    zones: zones.map(z => ({
      zone: z.zone || z.name || 'Unknown',
      vehicleType: z.vehicleType || z.type || 'Car',
      total: z.total || z.totalSlots || 0,
      occupied: z.occupied || z.occupiedSlots || 0,
      available: z.available || z.availableSlots || 0,
      occupancy: z.occupancy || `${z.occupancyRate || 0}%`,
      status: z.status || 'Normal'
    })),
    facilityBreakdown: facilityBreakdown.map(f => ({
      label: f.label || f.floor || 'Unknown',
      value: f.value || f.occupancy || '—',
      note: f.note || ''
    })),
    revenue: revenue.length ? revenue : [
      { label: 'Today Revenue', value: formatCurrency(stats.todayRevenue ?? 0) },
      { label: 'Cash Payment', value: formatCurrency(stats.cashPayment ?? 0) },
      { label: 'QR Payment', value: formatCurrency(stats.qrPayment ?? 0) },
      { label: 'Card Payment', value: formatCurrency(stats.cardPayment ?? 0) },
      { label: 'Pending Payment', value: formatCurrency(stats.pendingPayment ?? 0) }
    ],
    alerts: alerts.map((a, i) => ({
      text: a.text || a.message || `Alert ${i + 1}`,
      severity: a.severity || a.level || 'Low'
    })),
    staff: staff.map(s => ({
      staff: s.name || s.staff || `Staff ${s.id || ''}`,
      role: s.role || 'Staff',
      area: s.area || 'Unknown',
      entries: s.entries || 0,
      exits: s.exits || 0,
      payments: s.payments || 0,
      status: s.status || 'Active'
    })),
    activities: recentEntries.map(entry => ({
      time: formatTime(entry.time || entry.createdAt),
      activity: entry.activity || 'Vehicle Entry',
      reference: entry.ticketCode || entry.licensePlate || entry.reference || '—',
      performedBy: entry.performedBy || entry.staff || 'System',
      status: entry.status || 'Completed'
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
