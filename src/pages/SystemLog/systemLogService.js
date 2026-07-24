import { systemLogData } from '../../mock-data/systemLogs'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export function shapeLog(data) {
  if (!data) return null
  const id = data.id || data.Id || `LOG-${Date.now()}`
  const moduleName = data.module || data.Module || data.targetEntity || data.TargetEntity || 'System'
  const activityName = data.activity || data.Activity || data.action || data.Action || 'System Activity'
  const staffName = data.staff || data.Staff || data.userName || data.UserName || 'System Staff'
  const statusName = data.status || data.Status || 'Completed'
  const descriptionText = data.description || data.Description || activityName
  const refText = data.reference || data.Reference || (data.targetEntityId ? String(data.targetEntityId).slice(0, 8) : 'SYS-LOG')
  const timeStr = data.time || (data.createdAt ? new Date(data.createdAt).toLocaleTimeString('vi-VN') : '14:20:00')

  return {
    id,
    module: moduleName,
    activity: activityName,
    reference: refText,
    receiptId: data.receiptId || '—',
    ticketCode: data.ticketCode || '—',
    licensePlate: data.licensePlate || '—',
    staff: staffName,
    gate: data.gate || data.ipAddress || data.IpAddress || 'Entry Gate A',
    status: statusName,
    description: descriptionText,
    time: timeStr,
    createdAt: data.createdAt ? new Date(data.createdAt) : null
  }
}

export async function getSystemLogs(params = {}) {
  try {
    const token = localStorage.getItem('token')
    const headers = token ? { Authorization: `Bearer ${token}` } : {}
    const response = await fetch(`${API_BASE_URL}/system-logs`, { headers })
    if (!response.ok) throw new Error('API request failed')
    const data = await response.json()
    const rawList = Array.isArray(data) ? data : Array.isArray(data?.logs) ? data.logs : Array.isArray(data?.items) ? data.items : []
    const shaped = rawList.map(shapeLog).filter(Boolean)
    return { success: true, data: shaped.length > 0 ? shaped : systemLogData.logs.map(shapeLog) }
  } catch (error) {
    return { success: true, data: systemLogData.logs.map(shapeLog) }
  }
}

export async function getLogById(id) {
  const item = systemLogData.logs.find((l) => String(l.id) === String(id))
  return item ? { success: true, data: shapeLog(item) } : { success: false }
}

export async function filterSystemLogs(params = {}) { return getSystemLogs(params) }
export async function getLogModules() { return { success: true, data: ['Auth', 'Entry', 'Exit', 'Payment', 'Ticket', 'System', 'Vehicle'] } }
export const getSystemLogData = getSystemLogs
