export const ROLE_CREDENTIALS = {
  Admin: { email: 'sysadmin.parking@gmail.com', password: 'Admin@2026' },
  Manager: { email: 'facility.manager.a@gmail.com', password: 'Manager@2026' },
  'Parking Staff': { email: 'entry.staff.a@gmail.com', password: 'Staff@2026' },
}

export const demoUsers = [
  { role: 'Admin', icon: 'admin_panel_settings', ...ROLE_CREDENTIALS.Admin },
  { role: 'Manager', icon: 'manage_accounts', ...ROLE_CREDENTIALS.Manager },
  { role: 'Parking Staff', icon: 'badge', featured: true, ...ROLE_CREDENTIALS['Parking Staff'] },
]

export const mockUsers = [
  { id: 1, email: 'sysadmin.parking@gmail.com', password: 'Admin@2026', name: 'Nguyễn Văn Admin', role: 'Admin' },
  { id: 2, email: 'security.admin.parking@gmail.com', password: 'Admin@2026', name: 'Trần Quốc Bảo', role: 'Admin' },
  { id: 3, email: 'support.admin.parking@gmail.com', password: 'Admin@2026', name: 'Lê Minh Hưng', role: 'Admin' },

  { id: 4, email: 'facility.manager.a@gmail.com', password: 'Manager@2026', name: 'Nguyễn Hoàng Minh', role: 'Manager' },
  { id: 5, email: 'operations.manager@gmail.com', password: 'Manager@2026', name: 'Lê Hoàng Nam', role: 'Manager' },
  { id: 6, email: 'parking.manager@gmail.com', password: 'Manager@2026', name: 'Phạm Thanh Sơn', role: 'Manager' },

  { id: 7, email: 'entry.staff.a@gmail.com', password: 'Staff@2026', name: 'Nguyễn Văn An', role: 'Parking Staff' },
  { id: 8, email: 'exit.staff.b@gmail.com', password: 'Staff@2026', name: 'Phạm Thu Hà', role: 'Parking Staff' },
  { id: 9, email: 'parking.support@gmail.com', password: 'Staff@2026', name: 'Trần Minh Đức', role: 'Parking Staff' },
]
