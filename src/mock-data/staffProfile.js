export const staffProfileData = {
  initials: 'PS',
  name: 'Parking Staff',
  role: 'Entry Gate Operator',
  gate: 'Entry Gate A',
  department: 'Parking Operations',
  status: 'Active',
  lastLogin: 'Today 14:20',
  shift: { name: 'Morning Shift', schedule: '08:00 - 17:00', status: 'Active' },
  systems: ['Area: Entry Gate A', 'Gate Status: Online', 'Camera Scan: Active', 'Payment: Online'],
  security: [
    ['Password', 'Last changed 30 days ago'], ['Current Session', 'Active'],
    ['Login Method', 'Staff Account'], ['Device', 'Entry Gate Terminal'], ['Last Login', 'Today 14:20'],
  ],
  permissions: {
    allowed: ['Vehicle Entry', 'Vehicle Exit', 'Tickets', 'Payment', 'Lost Ticket'],
    limited: [['Parking Map', 'View Only'], ['Reservation', 'Check-in Only'], ['System Logs', 'View Shift Logs']],
    denied: ['Pricing Rules', 'Users & Roles'],
  },
  activities: [
    ['17:48:20', 'Payment completed', 'PAY-000128 / 51A-12345', 'Completed'],
    ['17:45:10', 'Vehicle exit processed', 'TCK-000128 / 51A-12345', 'Completed'],
    ['14:32:05', 'Ticket created', 'TCK-000128 / 51A-12345', 'Created'],
  ],
}
