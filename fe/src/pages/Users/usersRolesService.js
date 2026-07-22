import { api } from '../../core/api/apiClient'
import logger from '../../core/utils/logger'

export const initialUserKPIs = {
  totalAccounts: 42,
  activeAccounts: 34,
  suspendedAccounts: 2,
  pendingInvitations: 3
}

export const initialUsersList = [
  { id: 'usr-1', name: 'Nguyễn Văn An', email: 'an.nguyen@parking.vn', role: 'Parking Staff', area: 'Entry Gate A', status: 'Active', lastLogin: 'Today 14:20', createdDate: 'Oct 12, 2023' },
  { id: 'usr-2', name: 'Trần Minh Quân', email: 'quan.tran@parking.vn', role: 'Facility Manager', area: 'Building A', status: 'Active', lastLogin: 'Today 13:45', createdDate: 'May 02, 2023' },
  { id: 'usr-3', name: 'Lê Hoàng Nam', email: 'nam.le@parking.vn', role: 'System Admin', area: 'System Control', status: 'Active', lastLogin: 'Today 12:10', createdDate: 'Jan 15, 2023' },
  { id: 'usr-4', name: 'Phạm Thu Hà', email: 'ha.pham@parking.vn', role: 'Parking Staff', area: 'Exit Gate B', status: 'Suspended', lastLogin: 'Yesterday 18:05', createdDate: 'Nov 20, 2023' },
  { id: 'usr-5', name: 'Đỗ Gia Huy', email: 'huy.do@parking.vn', role: 'Parking Staff', area: 'Zone B', status: 'Pending', lastLogin: 'Not logged in', createdDate: 'Dec 11, 2023' },
  { id: 'usr-6', name: 'Bùi Anh Tuấn', email: 'tuan.bui@parking.vn', role: 'Field Support', area: 'Lot D', status: 'Active', lastLogin: 'Today 09:15', createdDate: 'Jul 04, 2023' },
]

export const rolePermissionMap = {
  'Parking Staff': {
    allowed: 'Entry/Exit Logs, Basic Reports',
    limited: 'User Directory (View Only)',
    denied: 'System Settings, Audit Logs'
  },
  'Facility Manager': {
    allowed: 'Floor Status, Entry/Exit Logs, Pricing Rules Edit',
    limited: 'User Directory (Edit), Reports (Export)',
    denied: 'System Control Settings'
  },
  'System Admin': {
    allowed: 'System Settings, User Directory (Full Access), Audit Logs, Control Panels',
    limited: 'None',
    denied: 'None'
  },
  'Field Support': {
    allowed: 'Basic Maintenance Panel, Floor Status View',
    limited: 'Incident Log Reporting',
    denied: 'System Settings, User Directory, Payments'
  },
  'Manager': {
    allowed: 'Full Reports, Dashboard View, Staff Scheduling',
    limited: 'System Configuration',
    denied: 'Database Backup & System Reset'
  }
}

export const initialUserChanges = [
  { time: '17:30:11', action: 'Role Updated', target: 'Nguyễn Văn An', changedBy: 'System Admin', result: 'Success' },
  { time: '16:45:05', action: 'Password Reset', target: 'Phạm Thu Hà', changedBy: 'System Admin', result: 'Success' },
  { time: '15:20:44', action: 'Account Created', target: 'Lê Minh Khoa', changedBy: 'System Admin', result: 'Success' },
  { time: '14:10:22', action: 'Status Changed', target: 'Đỗ Gia Huy', changedBy: 'System Admin', result: 'Success' }
]

/**
 * Shape backend User DTO to frontend user object
 */
export function shapeUser(dto) {
  if (!dto) return null
  return {
    id: dto.id || dto.Id || `usr-${Date.now()}`,
    name: dto.fullName || dto.FullName || dto.name || 'User',
    email: dto.email || dto.Email || '',
    role: dto.role || dto.Role || 'Parking Staff',
    area: dto.department || dto.Department || dto.area || 'Entry Gate A',
    status: dto.status === 0 || dto.status === 'Active' ? 'Active' : dto.status === 1 || dto.status === 'Suspended' ? 'Suspended' : dto.status || 'Active',
    lastLogin: dto.lastLoginAt ? new Date(dto.lastLoginAt).toLocaleString('en-GB') : (dto.lastLogin || 'Not logged in'),
    createdDate: dto.createdAt ? new Date(dto.createdAt).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) : (dto.createdDate || 'Oct 12, 2023')
  }
}

/**
 * API Call: Fetch list of users from Backend API GET /api/users
 */
export async function fetchUsersList(params = {}) {
  try {
    const { data } = await api.get('/users', { params })
    const items = Array.isArray(data) ? data.map(shapeUser) : (data?.items || []).map(shapeUser)
    return { success: true, data: items }
  } catch (error) {
    logger.warn('UsersService', `Failed to fetch users from backend API: ${error.message}. Using fallback.`)
    return { success: false, data: initialUsersList, error: error.message }
  }
}

/**
 * API Call: Create new user via Backend API POST /api/users
 */
export async function createUserApi(userData) {
  try {
    const payload = {
      fullName: userData.name,
      email: userData.email,
      role: userData.role,
      department: userData.area,
      password: userData.password || 'User@123'
    }
    const { data } = await api.post('/users', payload)
    return { success: true, data: shapeUser(data) }
  } catch (error) {
    logger.warn('UsersService', `Backend API POST /users failed: ${error.message}. Operating in client mode.`)
    return { success: false, error: error.message }
  }
}

/**
 * API Call: Update user details via Backend API PUT /api/users/{id}
 */
export async function updateUserApi(id, userData) {
  try {
    const payload = {
      fullName: userData.name,
      email: userData.email,
      role: userData.role,
      department: userData.area
    }
    const { data } = await api.put(`/users/${id}`, payload)
    return { success: true, data: shapeUser(data) }
  } catch (error) {
    logger.warn('UsersService', `Backend API PUT /users/${id} failed: ${error.message}. Operating in client mode.`)
    return { success: false, error: error.message }
  }
}

/**
 * API Call: Lock / Unlock / Set user status via Backend API PATCH /api/users/{id}/status
 */
export async function setUserStatusApi(id, status) {
  try {
    const payload = { status: status === 'Active' ? 0 : status === 'Suspended' ? 1 : 2 }
    const { data } = await api.patch(`/users/${id}/status`, payload)
    return { success: true, data: shapeUser(data) }
  } catch (error) {
    logger.warn('UsersService', `Backend API PATCH /users/${id}/status failed: ${error.message}. Operating in client mode.`)
    return { success: false, error: error.message }
  }
}

/**
 * API Call: Fetch list of system roles from Backend API GET /api/roles
 */
export async function fetchRolesList() {
  try {
    const { data } = await api.get('/roles')
    if (Array.isArray(data)) {
      const map = {}
      data.forEach((r) => {
        map[r.name] = {
          allowed: r.allowedPermissions,
          limited: r.limitedPermissions,
          denied: r.deniedPermissions
        }
      })
      return { success: true, data: map, raw: data }
    }
    return { success: false, data: rolePermissionMap }
  } catch (error) {
    logger.warn('UsersService', `Backend API GET /roles failed: ${error.message}. Operating in client mode.`)
    return { success: false, data: rolePermissionMap }
  }
}

/**
 * API Call: Update role permissions via Backend API PUT /api/roles/{id}/permissions
 */
export async function updateRolePermissionsApi(roleName, permissions) {
  try {
    const payload = {
      allowedPermissions: permissions.allowed,
      limitedPermissions: permissions.limited,
      deniedPermissions: permissions.denied
    }
    const { data } = await api.put(`/roles/${encodeURIComponent(roleName)}/permissions`, payload)
    return { success: true, data }
  } catch (error) {
    logger.warn('UsersService', `Backend API PUT /roles/${roleName}/permissions failed: ${error.message}. Operating in client mode.`)
    return { success: false, error: error.message }
  }
}
