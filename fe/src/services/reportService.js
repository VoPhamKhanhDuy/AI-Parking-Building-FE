import { api } from '../core/api/apiClient'
import logger from '../core/utils/logger'

// ==================== Reports APIs ====================

export async function getDailyOperationsReport(date = null) {
  try {
    const params = date ? { date } : {}
    const { data } = await api.get('/reports/daily-operations', { params })
    return { success: true, data }
  } catch (error) {
    logger.error('ReportService', `Failed to load daily report: ${error.message}`)
    return { success: false, message: error.response?.data?.message || 'Failed to load report' }
  }
}

export async function getFinancialReport(startDate, endDate) {
  try {
    const { data } = await api.get('/reports/financial', {
      params: { startDate, endDate }
    })
    return { success: true, data }
  } catch (error) {
    logger.error('ReportService', `Failed to load financial report: ${error.message}`)
    return { success: false, message: error.response?.data?.message || 'Failed to load report' }
  }
}

export async function getOccupancyReport() {
  try {
    const { data } = await api.get('/reports/occupancy')
    return { success: true, data }
  } catch (error) {
    logger.error('ReportService', `Failed to load occupancy report: ${error.message}`)
    return { success: false, message: error.response?.data?.message || 'Failed to load report' }
  }
}

export async function getStaffActivityReport() {
  try {
    const { data } = await api.get('/reports/staff-activity')
    return { success: true, data }
  } catch (error) {
    logger.error('ReportService', `Failed to load staff activity report: ${error.message}`)
    return { success: false, message: error.response?.data?.message || 'Failed to load report' }
  }
}

// ==================== Notifications APIs ====================

export async function getNotifications() {
  try {
    const { data } = await api.get('/notifications')
    return { success: true, data }
  } catch (error) {
    logger.error('ReportService', `Failed to load notifications: ${error.message}`)
    return { success: false, message: error.response?.data?.message || 'Failed to load notifications' }
  }
}

export async function markNotificationRead(id) {
  try {
    await api.patch(`/notifications/${id}/read`)
    return { success: true }
  } catch (error) {
    logger.error('ReportService', `Failed to mark notification read: ${error.message}`)
    return { success: false, message: 'Failed to mark notification as read' }
  }
}

export async function markAllNotificationsRead() {
  try {
    await api.post('/notifications/mark-all-read')
    return { success: true }
  } catch (error) {
    logger.error('ReportService', `Failed to mark all notifications read: ${error.message}`)
    return { success: false, message: 'Failed to mark all notifications as read' }
  }
}

// ==================== Payments APIs ====================

export async function getPayments(params = {}) {
  try {
    const { data } = await api.get('/payments', { params })
    return { success: true, data }
  } catch (error) {
    logger.error('ReportService', `Failed to load payments: ${error.message}`)
    return { success: false, message: error.response?.data?.message || 'Failed to load payments' }
  }
}

export async function getPaymentById(id) {
  try {
    const { data } = await api.get(`/payments/${id}`)
    return { success: true, data }
  } catch (error) {
    logger.error('ReportService', `Failed to get payment: ${error.message}`)
    return { success: false, message: 'Payment not found' }
  }
}

export async function createPayment(sessionId, method) {
  try {
    const { data } = await api.post('/payments', { parkingSessionId: sessionId, paymentMethod: method })
    return { success: true, data }
  } catch (error) {
    logger.error('ReportService', `Failed to create payment: ${error.message}`)
    return { success: false, message: error.response?.data?.message || 'Failed to create payment' }
  }
}

// ==================== Reservations APIs ====================

export async function getReservations(params = {}) {
  try {
    const { data } = await api.get('/reservations', { params })
    return { success: true, data }
  } catch (error) {
    logger.error('ReportService', `Failed to load reservations: ${error.message}`)
    return { success: false, message: error.response?.data?.message || 'Failed to load reservations' }
  }
}

export async function createReservation(reservationData) {
  try {
    const { data } = await api.post('/reservations', reservationData)
    return { success: true, data }
  } catch (error) {
    logger.error('ReportService', `Failed to create reservation: ${error.message}`)
    return { success: false, message: error.response?.data?.message || 'Failed to create reservation' }
  }
}

export async function cancelReservation(id) {
  try {
    await api.delete(`/reservations/${id}`)
    return { success: true }
  } catch (error) {
    logger.error('ReportService', `Failed to cancel reservation: ${error.message}`)
    return { success: false, message: error.response?.data?.message || 'Failed to cancel reservation' }
  }
}

// ==================== Monthly Pass APIs ====================

export async function getMonthlyPasses(params = {}) {
  try {
    const { data } = await api.get('/monthly-passes', { params })
    return { success: true, data }
  } catch (error) {
    logger.error('ReportService', `Failed to load monthly passes: ${error.message}`)
    return { success: false, message: error.response?.data?.message || 'Failed to load passes' }
  }
}

export async function createMonthlyPass(passData) {
  try {
    const { data } = await api.post('/monthly-passes', passData)
    return { success: true, data }
  } catch (error) {
    logger.error('ReportService', `Failed to create monthly pass: ${error.message}`)
    return { success: false, message: error.response?.data?.message || 'Failed to create pass' }
  }
}

// ==================== Reports APIs (aliases for compatibility) ====================

export async function getReports(params = {}) {
  try {
    const { data } = await api.get('/reports', { params })
    return { success: true, data }
  } catch (error) {
    logger.error('ReportService', `Failed to load reports: ${error.message}`)
    return { success: false, message: error.response?.data?.message || 'Failed to load reports' }
  }
}

export async function getReportById(id) {
  try {
    const { data } = await api.get(`/reports/${id}`)
    return { success: true, data }
  } catch (error) {
    logger.error('ReportService', `Failed to get report: ${error.message}`)
    return { success: false, message: 'Report not found' }
  }
}

export async function getReportTypes() {
  try {
    const { data } = await api.get('/reports/types')
    return { success: true, data }
  } catch (error) {
    logger.error('ReportService', `Failed to get report types: ${error.message}`)
    return { success: false, data: [] }
  }
}
