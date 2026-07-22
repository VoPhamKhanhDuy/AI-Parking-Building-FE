import { api } from '../../core/api/apiClient'
import logger from '../../core/utils/logger'

export const initialAuditKPIs = {
  totalLogsToday: 128,
  successfulActions: 112,
  pendingReviews: 9,
  failedAttempts: 7
}

export const initialAuditRecords = [
  { 
    id: 'AUD-2026-00128', 
    timestamp: 'Today 17:30:11', 
    action: 'Role Authorization Updated', 
    target: 'Nguyễn Văn An', 
    performedBy: 'System Administrator', 
    origin: '192.168.1.14', 
    result: 'Success', 
    resultClass: 'bg-green-50 text-green-700',
    description: 'Parking Staff role permissions were reviewed and updated according to the current access policy.'
  },
  { 
    id: 'AUD-2026-00127', 
    timestamp: 'Today 16:45:05', 
    action: 'Credential Reset Requested', 
    target: 'Phạm Thu Hà', 
    performedBy: 'System Administrator', 
    origin: '192.168.1.14', 
    result: 'Pending', 
    resultClass: 'bg-slate-100 text-slate-600',
    description: 'A temporary passcode was requested and sent to staff email for validation.'
  },
  { 
    id: 'AUD-2026-00126', 
    timestamp: 'Today 15:20:44', 
    action: 'Account Suspension Issued', 
    target: 'Lê Minh Khoa', 
    performedBy: 'System Administrator', 
    origin: '192.168.1.14', 
    result: 'Success', 
    resultClass: 'bg-green-50 text-green-700',
    description: 'Account was suspended due to policy violation or security risk review.'
  },
  { 
    id: 'AUD-2026-00125', 
    timestamp: 'Today 14:10:22', 
    action: 'Failed Login Attempt', 
    target: 'Unknown Account', 
    performedBy: 'System Control', 
    origin: '192.168.1.28', 
    result: 'Failed', 
    resultClass: 'bg-red-50 text-red-700',
    description: 'Multiple incorrect password inputs detected from origin IP.'
  },
  { 
    id: 'AUD-2026-00124', 
    timestamp: 'Today 13:55:08', 
    action: 'New Account Invitation Sent', 
    target: 'Đỗ Gia Huy', 
    performedBy: 'System Administrator', 
    origin: '192.168.1.14', 
    result: 'Sent', 
    resultClass: 'bg-primary/10 text-primary',
    description: 'Invitation link was dispatched to initiate account registration.'
  },
  { 
    id: 'AUD-2026-00123', 
    timestamp: 'Today 11:40:33', 
    action: 'User Role Reviewed', 
    target: 'Trần Minh Quân', 
    performedBy: 'System Administrator', 
    origin: '192.168.1.14', 
    result: 'Success', 
    resultClass: 'bg-green-50 text-green-700',
    description: 'Periodic access level confirmation completed successfully.'
  },
  { 
    id: 'AUD-2026-00122', 
    timestamp: 'Today 09:25:18', 
    action: 'Account Status Changed', 
    target: 'Phạm Thu Hà', 
    performedBy: 'System Administrator', 
    origin: '192.168.1.14', 
    result: 'Success', 
    resultClass: 'bg-green-50 text-green-700',
    description: 'System status updated during shift transition.'
  }
]

export const initialSecurityEvents = [
  { time: 'Today 14:10', event: 'Failed login attempt', account: 'unknown@parking.vn', severity: 'Medium', severityClass: 'text-secondary', status: 'Review' },
  { time: 'Today 12:45', event: 'Password reset request', account: 'Phạm Thu Hà', severity: 'Low', severityClass: 'text-slate-500', status: 'Pending' },
  { time: 'Today 10:30', event: 'Suspended account access blocked', account: 'Lê Minh Khoa', severity: 'High', severityClass: 'text-error', status: 'Resolved' },
  { time: 'Today 09:05', event: 'Admin login verified', account: 'Trần Thanh Vân', severity: 'Low', severityClass: 'text-slate-500', status: 'Success' }
]

export function shapeAuditRecord(log) {
  if (!log) return null
  const result = log.status || log.level || 'Success'
  return {
    id: log.id || `AUD-2026-${String(Math.floor(Math.random() * 90000 + 10000))}`,
    timestamp: log.createdAt ? new Date(log.createdAt).toLocaleString('en-GB') : (log.timestamp || 'Today'),
    action: log.action || log.message || 'System Audit Record',
    target: log.target || log.user || 'System User',
    performedBy: log.performedBy || log.userName || 'System Administrator',
    origin: log.ipAddress || log.origin || '192.168.1.14',
    result: result,
    resultClass: result === 'Failed' ? 'bg-red-50 text-red-700' : result === 'Pending' ? 'bg-slate-100 text-slate-600' : 'bg-green-50 text-green-700',
    description: log.details || log.description || log.message || 'System log audit entry recorded.'
  }
}

/**
 * Fetch Audit Logs from Backend GET /api/system-logs
 */
export async function fetchAuditLogs(params = {}) {
  try {
    const { data } = await api.get('/system-logs', { params })
    const items = Array.isArray(data?.items) ? data.items : Array.isArray(data) ? data : []
    const mapped = items.map(shapeAuditRecord)
    return { success: true, data: mapped }
  } catch (error) {
    logger.warn('AuditLogsService', `API GET /system-logs failed: ${error.message}. Using fallback.`)
    return { success: false, data: initialAuditRecords }
  }
}
