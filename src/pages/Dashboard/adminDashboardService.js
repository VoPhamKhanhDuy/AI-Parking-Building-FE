/**
 * Service managing System Admin dashboard statistics, user directories, and audit activity.
 */

export const mockAdminKPIs = {
  totalAccounts: 42,
  activeUsers: 34,
  suspendedAccounts: 2,
  pendingRequests: 3
}

export const mockAdminUsers = [
  { name: 'Nguyễn Văn An', email: 'an.nguyen@parking.vn', role: 'Parking Staff', area: 'Entry Gate A', status: 'Active', lastLogin: 'Today 14:20' },
  { name: 'Trần Minh Quân', email: 'quan.tran@parking.vn', role: 'Facility Manager', area: 'Building A', status: 'Active', lastLogin: 'Today 13:45' },
  { name: 'Lê Hoàng Nam', email: 'nam.le@parking.vn', role: 'System Admin', area: 'System Control', status: 'Active', lastLogin: 'Today 12:10' },
  { name: 'Phạm Thu Hà', email: 'ha.pham@parking.vn', role: 'Parking Staff', area: 'Exit Gate B', status: 'Suspended', lastLogin: 'Yesterday 18:05' },
  { name: 'Đỗ Gia Huy', email: 'huy.do@parking.vn', role: 'Parking Staff', area: 'Zone B', status: 'Pending', lastLogin: 'Not logged in' },
  { name: 'Bùi Anh Tuấn', email: 'tuan.bui@parking.vn', role: 'Field Support', area: 'Lot D', status: 'Active', lastLogin: 'Today 09:15' },
  { name: 'Ngô Thùy Linh', email: 'linh.ngo@parking.vn', role: 'Manager', area: 'Building C', status: 'Active', lastLogin: 'Yesterday 14:10' },
  { name: 'Hoàng Kim Ngân', email: 'ngan.hoang@parking.vn', role: 'Field Support', area: 'Building A', status: 'Active', lastLogin: 'Today 08:30' },
]

export const mockAccountDistribution = [
  { label: 'Parking Staff', count: 28, percentage: '66%', bgClass: 'bg-primary' },
  { label: 'Facility Managers', count: 6, percentage: '14%', bgClass: 'bg-secondary' },
  { label: 'System Administrators', count: 3, percentage: '7%', bgClass: 'bg-slate-500' },
  { label: 'Support Accounts', count: 5, percentage: '12%', bgClass: 'bg-outline' },
]

export const mockSecurityOverview = {
  loginPolicy: 'Compliance',
  failedLogins: 4,
  lockedAccounts: 2,
  pendingResets: 1,
  adminGrants: 0
}

export const mockAuditActivity = [
  { timestamp: 'Today 17:30:11', action: 'Role Authorization Updated', subject: 'Nguyễn Văn An', origin: '192.168.1.14', result: 'Success', resultClass: 'text-green-700' },
  { timestamp: 'Today 16:45:05', action: 'Credential Reset Requested', subject: 'Phạm Thu Hà', origin: '192.168.1.14', result: 'Pending', resultClass: 'text-slate-500' },
  { timestamp: 'Today 15:20:44', action: 'Account Suspension Issued', subject: 'Lê Minh Khoa', origin: '192.168.1.14', result: 'Success', resultClass: 'text-green-700' }
]
