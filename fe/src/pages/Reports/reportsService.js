import { api } from '../../core/api/apiClient'
import logger from '../../core/utils/logger'

export async function getReports(params = {}) {
  try {
    const { data } = await api.get('/reports', { params })
    // Transform API response to match frontend expectations
    const reports = data?.transactions?.map((t, i) => ({
      id: `RPT-${new Date(t.createdAt).getFullYear()}-${String(i + 1).padStart(5, '0')}`,
      type: t.method || 'Transaction',
      date: new Date(t.createdAt).toLocaleDateString(),
      time: new Date(t.createdAt).toLocaleTimeString(),
      generatedBy: t.processedBy || 'System',
      status: t.status || 'Completed',
      facility: 'Building A'
    })) || []
    
    return {
      reports,
      summaries: data?.summaries || [{
        label: 'Total Revenue',
        value: data?.stats?.totalRevenue?.toString() || '0',
        note: 'All time',
        tone: 'success'
      }, {
        label: 'Pending',
        value: data?.stats?.pendingRevenue?.toString() || '0',
        note: 'Awaiting',
        tone: 'warning'
      }],
      categories: data?.categories || ['Daily Operations', 'Revenue Reports', 'Occupancy Reports'],
      exports: data?.exports || [],
      metrics: data?.metrics || [],
      notes: data?.notes || []
    }
  } catch (error) {
    logger.error('Reports', `Failed to load: ${error.message}`)
    return getMockReports()
  }
}

export async function getDailyOperationsReport(date) {
  try {
    const { data } = await api.get('/reports/daily-operations', { params: { date } })
    return data
  } catch (error) {
    logger.error('Reports', `Failed to load daily report: ${error.message}`)
    return null
  }
}

export async function getFinancialReport(startDate, endDate) {
  try {
    const { data } = await api.get('/reports/financial', { params: { startDate, endDate } })
    return data
  } catch (error) {
    logger.error('Reports', `Failed to load financial report: ${error.message}`)
    return null
  }
}

export async function exportReport(reportId, format = 'pdf') {
  try {
    const { data } = await api.get(`/reports/${reportId}/export`, {
      params: { format },
      responseType: 'blob'
    })
    return data
  } catch (error) {
    logger.error('Reports', `Failed to export report: ${error.message}`)
    return null
  }
}

function getMockReports() {
  return {
    reports: [
      { id: 'RPT-2026-00012', type: 'Daily Operations', date: new Date().toLocaleDateString(), time: '10:00 AM', generatedBy: 'System', status: 'Completed', facility: 'Building A' },
      { id: 'RPT-2026-00011', type: 'Revenue Report', date: new Date(Date.now() - 86400000).toLocaleDateString(), time: '5:00 PM', generatedBy: 'Admin', status: 'Completed', facility: 'Building A' },
      { id: 'RPT-2026-00010', type: 'Occupancy Report', date: new Date(Date.now() - 172800000).toLocaleDateString(), time: '6:00 PM', generatedBy: 'System', status: 'Completed', facility: 'Building A' },
      { id: 'RPT-2026-00009', type: 'Lost Ticket Report', date: new Date(Date.now() - 259200000).toLocaleDateString(), time: '3:00 PM', generatedBy: 'Manager', status: 'Pending', facility: 'Building A' },
      { id: 'RPT-2026-00008', type: 'Staff Performance', date: new Date(Date.now() - 345600000).toLocaleDateString(), time: '4:00 PM', generatedBy: 'Admin', status: 'Completed', facility: 'Building A' }
    ],
    summaries: [
      { label: 'Total Revenue', value: '$12,450', note: 'All time', tone: 'success' },
      { label: 'Pending', value: '2', note: 'Awaiting', tone: 'warning' }
    ],
    categories: ['Daily Operations', 'Revenue Reports', 'Occupancy Reports', 'Lost Ticket Reports', 'Staff Performance'],
    exports: [
      { time: '2 hours ago', report: 'RPT-2026-00011', type: 'PDF', user: 'Admin', status: 'Completed' },
      { time: '5 hours ago', report: 'RPT-2026-00010', type: 'Excel', user: 'Manager', status: 'Completed' },
      { time: '1 day ago', report: 'RPT-2026-00008', type: 'PDF', user: 'Admin', status: 'Completed' }
    ],
    metrics: [
      { label: 'Total Entries', value: '1,245' },
      { label: 'Total Exits', value: '1,180' },
      { label: 'Revenue Today', value: '$890' },
      { label: 'Active Sessions', value: '65' }
    ],
    notes: [
      'Peak hours: 8-10 AM and 5-7 PM',
      'EV charging zone at 80% capacity',
      '3 pending lost ticket reports require attention'
    ]
  }
}
