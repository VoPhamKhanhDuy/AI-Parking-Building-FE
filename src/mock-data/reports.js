export const reportsOverview = [
  { label: 'Total Revenue', value: '12,850,000 VND', status: 'Improved' },
  { label: 'Vehicle Entries', value: '892', status: 'Normal' },
  { label: 'Vehicle Exits', value: '764', status: 'Normal' },
  { label: 'Occupancy Rate', value: '73%', status: 'Stable' },
]

export const reportCategories = [
  'Daily Operations',
  'Revenue Report',
  'Occupancy Report',
  'Ticket Activity',
  'Payment Report',
  'Lost Ticket Report',
  'Reservation Report',
  'Monthly Pass Report',
]

export const reportList = [
  { id: 1, name: 'Daily Operations Report', range: 'Today', generatedBy: 'Parking Staff', updatedAt: '17:50:00', status: 'READY', type: 'Daily Operations' },
  { id: 2, name: 'Revenue Report', range: 'Today', generatedBy: 'System', updatedAt: '17:48:20', status: 'READY', type: 'Revenue Report' },
  { id: 3, name: 'Occupancy Report', range: 'Today', generatedBy: 'System', updatedAt: '17:32:05', status: 'READY', type: 'Occupancy Report' },
  { id: 4, name: 'Lost Ticket Report', range: 'Today', generatedBy: 'Manager', updatedAt: '16:20:11', status: 'REVIEWED', type: 'Lost Ticket Report' },
  { id: 5, name: 'Reservation Report', range: 'Today', generatedBy: 'Parking Staff', updatedAt: '15:00:00', status: 'READY', type: 'Reservation Report' },
]

export const dailyOperationsDetail = {
  metadata: {
    reportName: 'Daily Operations Report',
    dateRange: 'Today',
    building: 'Building A',
    generatedBy: 'Parking Staff',
    generatedAt: '17:50:00',
    status: 'Ready',
  },
  metrics: [
    { metric: 'Total Revenue', today: '12,850,000 VND', yesterday: '11,200,000 VND', change: '+14.7%', status: 'Improved' },
    { metric: 'Vehicle Entries', today: '892', yesterday: '845', change: '+5.5%', status: 'Normal' },
    { metric: 'Vehicle Exits', today: '764', yesterday: '790', change: '-3.2%', status: 'Normal' },
    { metric: 'Active Sessions', today: '342', yesterday: '315', change: '+8.5%', status: 'Normal' },
    { metric: 'Pending Payments', today: '9', yesterday: '12', change: '-25%', status: 'Review' },
    { metric: 'Lost Ticket Cases', today: '5', yesterday: '2', change: '+150%', status: 'High' },
    { metric: 'Manual Slot Overrides', today: '14', yesterday: '8', change: '+75%', status: 'Monitor' },
  ],
  revenueBreakdown: [
    { source: 'Parking Fees', amount: '9,850,000 VND', share: '76.6%', status: 'Active' },
    { source: 'Monthly Pass', amount: '1,800,000 VND', share: '14.0%', status: 'Active' },
    { source: 'Reservation Fees', amount: '450,000 VND', share: '3.5%', status: 'Active' },
    { source: 'Lost Ticket Penalties', amount: '750,000 VND', share: '5.9%', status: 'Reviewed' },
  ],
  ticketActivity: [
    { type: 'Normal Tickets', count: '612', revenue: '8,450,000 VND', status: 'Active' },
    { type: 'Monthly Pass', count: '84', revenue: '1,800,000 VND', status: 'Active' },
    { type: 'Reservation Tickets', count: '36', revenue: '450,000 VND', status: 'Active' },
    { type: 'Lost Ticket Cases', count: '5', revenue: '750,000 VND', status: 'Reviewed' },
    { type: 'Pending Payment', count: '9', revenue: '0 VND', status: 'Pending' },
  ],
  keyFindings: [
    'Revenue increased compared to yesterday.',
    'Lost ticket cases are higher than normal.',
    'Manual overrides should be monitored.',
  ],
  recommendedActions: [
    'Review pending payments before shift handover.',
    'Check Floor 1 Zone B occupancy.',
    'Follow up on lost ticket cases.',
    'Monitor manual slot selection frequency.',
  ],
  exportHistory: [
    { time: '17:48:20', report: 'Daily Operations', action: 'Exported PDF', staff: 'Parking Staff', status: 'Success' },
    { time: '16:30:00', report: 'Revenue Report', action: 'Scheduled export', staff: 'System', status: 'Completed' },
    { time: '15:15:45', report: 'Occupancy Report', action: 'Viewed report', staff: 'Manager', status: 'Logged' },
    { time: '14:00:12', report: 'Ticket Activity', action: 'Exported Excel', staff: 'Parking Staff', status: 'Success' },
  ],
}
