export const demoUsers = [
  { role: 'Admin', icon: 'admin_panel_settings', target: '/users' },
  { role: 'Manager', icon: 'manage_accounts', target: '/dashboard' },
  { role: 'Parking Staff', icon: 'badge', target: '/vehicle-entry', featured: true },
]

export const mockUsers = [
  { id: 1, email: 'admin@parking.com', password: '123456', name: 'System Admin', role: 'Admin' },
  { id: 2, email: 'staff@parking.com', password: '123456', name: 'Parking Staff', role: 'Parking Staff' },
]
