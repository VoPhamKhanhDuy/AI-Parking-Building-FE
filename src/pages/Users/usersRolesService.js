/**
 * Service managing System Admin users, roles, and permission configurations.
 */

export const initialUserKPIs = {
  totalAccounts: 42,
  activeAccounts: 34,
  suspendedAccounts: 2,
  pendingInvitations: 3
}

export const initialUsersList = [
  { name: 'Nguyễn Văn An', email: 'an.nguyen@parking.vn', role: 'Parking Staff', area: 'Entry Gate A', status: 'Active', lastLogin: 'Today 14:20', createdDate: 'Oct 12, 2023' },
  { name: 'Trần Minh Quân', email: 'quan.tran@parking.vn', role: 'Facility Manager', area: 'Building A', status: 'Active', lastLogin: 'Today 13:45', createdDate: 'May 02, 2023' },
  { name: 'Lê Hoàng Nam', email: 'nam.le@parking.vn', role: 'System Admin', area: 'System Control', status: 'Active', lastLogin: 'Today 12:10', createdDate: 'Jan 15, 2023' },
  { name: 'Phạm Thu Hà', email: 'ha.pham@parking.vn', role: 'Parking Staff', area: 'Exit Gate B', status: 'Suspended', lastLogin: 'Yesterday 18:05', createdDate: 'Nov 20, 2023' },
  { name: 'Đỗ Gia Huy', email: 'huy.do@parking.vn', role: 'Parking Staff', area: 'Zone B', status: 'Pending', lastLogin: 'Not logged in', createdDate: 'Dec 11, 2023' },
  { name: 'Bùi Anh Tuấn', email: 'tuan.bui@parking.vn', role: 'Field Support', area: 'Lot D', status: 'Active', lastLogin: 'Today 09:15', createdDate: 'Jul 04, 2023' },
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
