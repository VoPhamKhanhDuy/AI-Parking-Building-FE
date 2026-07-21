import { api } from '../../core/api/apiClient'
import logger from '../../core/utils/logger'

function formatCurrency(amount) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
  }).format(amount || 0)
}

function formatTime(date) {
  if (!date) return '—'
  const d = new Date(date)
  return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
}

function buildMockAdminDashboard() {
  return {
    kpis: [
      { label: 'Total Accounts', value: 0 },
      { label: 'Active Users', value: 0 },
      { label: 'Suspended', value: 0 },
      { label: 'Total Slots', value: 524 },
      { label: 'Occupancy Rate', value: '76%' },
      { label: 'Today Revenue', value: '12,850,000 VND' },
    ],
    userOverview: {
      totalAccounts: 0,
      activeUsers: 0,
      suspendedAccounts: 0,
      pendingRequests: 2,
    },
    occupancy: {
      zones: [
        { zone: 'Zone A', vehicleType: 'Motorcycle', total: 120, occupied: 82, available: 38, occupancy: '68%', status: 'Normal' },
        { zone: 'Zone B', vehicleType: 'Car', total: 284, occupied: 220, available: 64, occupancy: '77%', status: 'High' },
        { zone: 'Zone C', vehicleType: 'EV Charging', total: 80, occupied: 60, available: 20, occupancy: '75%', status: 'Normal' },
        { zone: 'Zone D', vehicleType: 'Reserved / VIP', total: 40, occupied: 30, available: 10, occupancy: '75%', status: 'Normal' },
      ],
      facilityBreakdown: [
        { label: 'Floor 1', value: '82%', note: 'High occupancy' },
        { label: 'Floor 2', value: '73%', note: 'Normal' },
        { label: 'Floor 3', value: '34%', note: 'Maintenance monitored' },
      ],
    },
    revenue: [
      { label: 'Today Revenue', value: '12,850,000 VND' },
      { label: 'Cash Payment', value: '3,200,000 VND' },
      { label: 'QR Payment', value: '7,550,000 VND' },
      { label: 'Card Payment', value: '2,100,000 VND' },
    ],
    adminActivity: [
      { time: 'Today 17:30', activity: 'Updated Nguyễn Văn An role permissions', reference: 'USR-0042', performedBy: 'admin@parking.local', status: 'Success' },
      { time: 'Today 15:20', activity: 'Suspended Lê Minh Khoa account', reference: 'USR-0017', performedBy: 'admin@parking.local', status: 'Success' },
      { time: 'Today 09:05', activity: 'Administrator portal login', reference: 'IT Admin Workstation', performedBy: 'admin@parking.local', status: 'Success' },
    ],
    alerts: [
      { text: 'Zone B occupancy is high', severity: 'High' },
      { text: '3 pending payment cases need review', severity: 'Medium' },
      { text: '1 lost ticket case waiting for confirmation', severity: 'Medium' },
    ],
  }
}

export async function getAdminDashboard() {
  try {
    const [usersRes, dashRes, occupancyRes] = await Promise.allSettled([
      api.get('/users'),
      api.get('/dashboard'),
      api.get('/dashboard/occupancy'),
    ])

    const rawUsers = usersRes.status === 'fulfilled' ? usersRes.value.data : null
    const users = Array.isArray(rawUsers)
      ? rawUsers
      : Array.isArray(rawUsers?.value)
      ? rawUsers.value
      : Array.isArray(rawUsers?.items)
      ? rawUsers.items
      : []

    const dashData = dashRes.status === 'fulfilled' ? dashRes.value.data : null
    const occupancyData = occupancyRes.status === 'fulfilled' ? occupancyRes.value.data : null

    const stats = dashData?.stats || dashData?.Stats || {}
    const userOverview = {
      totalAccounts: users.length,
      activeUsers: users.filter((u) => (u.status || u.Status) === 'Active').length,
      suspendedAccounts: users.filter((u) => ['Suspended', 'Locked'].includes(u.status || u.Status)).length,
      pendingRequests: stats.pendingPayments ?? stats.PendingPayments ?? 0,
    }

    const zones = []
    const buildings = Array.isArray(occupancyData?.buildings) ? occupancyData.buildings : []
    buildings.forEach((building) => {
      const floors = building.floors || building.Floors
      if (!Array.isArray(floors)) return
      floors.forEach((floor) => {
        const total = Number(floor.TotalSlots ?? floor.totalSlots ?? 0) || 0
        const occupied = Number(floor.OccupiedSlots ?? floor.occupiedSlots ?? 0) || 0
        const pctRaw = Number(floor.OccupancyRate ?? floor.occupancyRate ?? 0) || 0
        zones.push({
          zone: floor.FloorName || floor.floorName || `Floor`,
          vehicleType: 'Mixed',
          total,
          occupied,
          available: Math.max(0, total - occupied),
          occupancy: `${Math.round(pctRaw)}%`,
          status: pctRaw > 85 ? 'High' : 'Normal',
        })
      })
    })

    const num = (v) => (Number.isFinite(Number(v)) ? Number(v) : 0)
    const kpis = [
      { label: 'Total Accounts', value: userOverview.totalAccounts },
      { label: 'Active Users', value: userOverview.activeUsers },
      { label: 'Suspended', value: userOverview.suspendedAccounts },
      { label: 'Total Slots', value: num(stats.TotalSlots ?? stats.totalSlots) },
      { label: 'Occupancy Rate', value: `${num(stats.OccupancyRate ?? stats.occupancyRate)}%` },
      { label: 'Today Revenue', value: formatCurrency(num(stats.TodayRevenue ?? stats.todayRevenue)) },
    ]

    const mock = buildMockAdminDashboard()

    return {
      kpis,
      userOverview,
      occupancy: {
        zones: zones.length ? zones : mock.occupancy.zones,
        facilityBreakdown: mock.occupancy.facilityBreakdown,
      },
      revenue: Array.isArray(dashData?.revenue) && dashData.revenue.length ? dashData.revenue : mock.revenue,
      adminActivity: mock.adminActivity,
      alerts: Array.isArray(dashData?.alerts) && dashData.alerts.length ? dashData.alerts : mock.alerts,
    }
  } catch (error) {
    logger.error('AdminDashboard', `Failed to load: ${error.message}`)
    return buildMockAdminDashboard()
  }
}

export { formatCurrency, formatTime }