import { api } from '../../core/api/apiClient'
import logger from '../../core/utils/logger'

export async function getStaffActivities(params = {}) {
  try {
    const { data } = await api.get('/staff-activities', { params })
    const staffList = data?.staff || data?.Staff || []
    const staff = staffList.map((s, i) => ({
      id: s.id || s.staffId || `STF-2026-${String(i + 1).padStart(3, '0')}`,
      name: s.name || s.fullName || `Staff ${i + 1}`,
      role: s.role || 'Staff',
      area: s.area || 'Building A',
      status: s.status || 'Active',
      entries: s.entries || s.entryCount || 0,
      exits: s.exits || s.exitCount || 0,
      payments: s.payments || s.paymentCount || 0,
      pending: s.pending || 0,
      shiftTime: s.shiftTime || '8:00 AM - 4:00 PM',
      lastActivity: s.lastActivity || 'Recently'
    }))
    
    // Deduplicate workload by area, keeping unique keys
    const rawWorkload = data?.workload || data?.Workload || []
    const seenAreas = new Set()
    const workload = rawWorkload.filter(w => {
      if (seenAreas.has(w.area)) return false
      seenAreas.add(w.area)
      return true
    })
    
    return {
      staff,
      summaries: data?.summaries || data?.Summaries || [],
      shift: data?.shift || data?.Shift || { status: 'Active', name: 'Morning', facility: 'Building A', time: '8:00 AM - 4:00 PM', supervisor: 'Manager', coverage: '100%', note: 'Full coverage maintained.' },
      workload,
      pendingReviews: data?.pendingReviews || [],
      activities: data?.activities || [],
      managerNote: data?.managerNote || 'No notes.'
    }
  } catch (error) {
    logger.error('StaffActivity', `Failed to load: ${error.message}`)
    // Return mock data when API is unavailable
    return getMockStaffActivity()
  }
}

export async function submitStaffActivityAction(action, payload) {
  try {
    const { data } = await api.post('/staff-activities', payload)
    return data
  } catch (error) {
    logger.error('StaffActivity', `Failed to submit: ${error.message}`)
    return null
  }
}

export async function getStaffActivity(params = {}) {
  return getStaffActivities(params)
}

function getMockStaffActivity() {
  return {
    staff: [
      { id: '1', staffId: 'STF-2026-001', name: 'John Smith', role: 'Entry Gate Operator', area: 'Entry Gate A', status: 'Active', entries: 45, exits: 42, payments: 38, pending: 2, shiftTime: '8:00 AM - 4:00 PM', lastActivity: '5 mins ago' },
      { id: '2', staffId: 'STF-2026-002', name: 'Sarah Johnson', role: 'Exit Gate Operator', area: 'Exit Gate A', status: 'Active', entries: 40, exits: 48, payments: 45, pending: 1, shiftTime: '8:00 AM - 4:00 PM', lastActivity: '2 mins ago' },
      { id: '3', staffId: 'STF-2026-003', name: 'Mike Wilson', role: 'Parking Support', area: 'Zone B', status: 'On Break', entries: 12, exits: 10, payments: 0, pending: 0, shiftTime: '8:00 AM - 4:00 PM', lastActivity: '15 mins ago' },
      { id: '4', staffId: 'STF-2026-004', name: 'Emily Davis', role: 'Supervisor', area: 'Building A', status: 'Active', entries: 0, exits: 0, payments: 0, pending: 3, shiftTime: '8:00 AM - 4:00 PM', lastActivity: '1 min ago' }
    ],
    summaries: [
      { label: 'Active Staff', value: '3', note: 'On duty', tone: 'success' },
      { label: 'On Break', value: '1', note: 'Currently', tone: 'warning' }
    ],
    shift: { status: 'Active', name: 'Morning Shift', facility: 'Building A', time: '8:00 AM - 4:00 PM', supervisor: 'Manager', coverage: '100%', note: 'Full coverage maintained.' },
    workload: [
      { area: 'Entry Gate A', label: 'Entry Gate Operator', value: 45 },
      { area: 'Exit Gate A', label: 'Exit Gate Operator', value: 48 },
      { area: 'Zone B', label: 'Parking Support', value: 22 }
    ],
    pendingReviews: [
      { reference: 'PRV-001', text: 'Lost ticket report requires review', priority: 'High' },
      { reference: 'PRV-002', text: 'Payment discrepancy flagged', priority: 'Medium' },
      { reference: 'PRV-003', text: 'Gate sensor malfunction reported', priority: 'High' }
    ],
    activities: [
      { time: '12:45 PM', staff: 'John Smith', activity: 'Vehicle Entry', reference: 'VEH-2026-1845', area: 'Entry Gate A', status: 'Completed' },
      { time: '12:42 PM', staff: 'Sarah Johnson', activity: 'Payment Processed', reference: 'PAY-2026-0923', area: 'Exit Gate A', status: 'Completed' },
      { time: '12:38 PM', staff: 'Emily Davis', activity: 'Case Review', reference: 'REV-2026-0156', area: 'Building A', status: 'In Progress' },
      { time: '12:35 PM', staff: 'Mike Wilson', activity: 'Break Started', reference: 'BRK-2026-0023', area: 'Zone B', status: 'On Break' }
    ],
    managerNote: 'All staff performing well. Maintain current coverage levels.'
  }
}
