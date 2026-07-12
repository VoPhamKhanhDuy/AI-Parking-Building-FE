export const adminProfileData = {
  initials: 'NA',
  name: 'Nguyễn Văn Admin',
  role: 'System Administrator',
  gate: 'Control Center Room 301',
  department: 'Information Technology',
  status: 'Active',
  lastLogin: 'Today 09:05',
  shift: { name: 'Main Shift', schedule: '08:00 - 18:00', status: 'Active' },
  systems: ['System Control: Online', 'Security Mode: Normal', 'Database Status: Healthy', 'API Gateways: Online'],
  security: [
    ['Password', 'Last changed 14 days ago'], ['Current Session', 'Active (Admin Portal)'],
    ['Login Method', '2FA Authenticator'], ['Device', 'IT Admin Workstation'], ['Last Login', 'Today 09:05'],
  ],
  permissions: {
    allowed: ['Full Access', 'Users & Roles Management', 'Audit Logs Read/Export', 'Security Rules configuration', 'Database Backup'],
    limited: [['Billing & Pricing', 'Full Edit'], ['IoT Devices', 'Remote Control']],
    denied: ['Root Core SSH Access'],
  },
  activities: [
    ['Today 17:30', 'Updated Nguyễn Văn An role permissions', 'Nguyễn Văn An / Parking Staff', 'Success'],
    ['Today 15:20', 'Suspended Lê Minh Khoa account', 'Lê Minh Khoa / Facility Manager', 'Success'],
    ['Today 09:05', 'System Administrator portal login', 'IT Admin Workstation', 'Success'],
  ],
}
