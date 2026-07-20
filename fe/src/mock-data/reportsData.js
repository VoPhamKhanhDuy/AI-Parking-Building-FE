export const reportsData = {
  summaries: [
    { label: 'Reports Today', value: '12', note: 'Generated since 00:00' },
    { label: 'Total Revenue', value: '12,850,000 VND', note: 'Today across Building A' },
    { label: 'Vehicle Entries', value: '284', note: 'Today' },
    { label: 'Vehicle Exits', value: '271', note: 'Today' },
    { label: 'Pending Reviews', value: '3', note: 'Manager action required', tone: 'warning' },
  ],
  categories: ['Daily Operations', 'Revenue Reports', 'Occupancy Reports', 'Ticket Reports', 'Lost Ticket Reports', 'Staff Performance'],
  reports: [
    { id: 'RPT-2026-00012', type: 'Daily Operations', date: 'Today', time: '17:30', generatedBy: 'Manager', facility: 'Building A', status: 'Ready' },
    { id: 'RPT-2026-00011', type: 'Revenue Report', date: 'Today', time: '16:45', generatedBy: 'System', facility: 'Building A', status: 'Ready' },
    { id: 'RPT-2026-00010', type: 'Occupancy Report', date: 'Today', time: '15:20', generatedBy: 'System', facility: 'Building A', status: 'Ready' },
    { id: 'RPT-2026-00009', type: 'Lost Ticket Report', date: 'Today', time: '14:05', generatedBy: 'Manager', facility: 'Building A', status: 'Review Needed' },
    { id: 'RPT-2026-00008', type: 'Staff Performance', date: 'Yesterday', time: '18:00', generatedBy: 'Manager', facility: 'Building A', status: 'Ready' },
  ],
  metrics: [
    { label: 'Total Revenue', value: '12,850,000 VND' },
    { label: 'Entries', value: '284' },
    { label: 'Exits', value: '271' },
    { label: 'Occupancy Rate', value: '76%' },
    { label: 'Lost Ticket Cases', value: '2' },
    { label: 'Pending Payments', value: '3' },
  ],
  notes: ['Zone B reached high occupancy during peak hours.', 'Lost ticket cases require manager review.', 'Pending payments should be checked before shift closing.', 'EV charging zone has maintenance activity.'],
  exports: [
    { time: 'Today 17:35', report: 'RPT-2026-00012', type: 'PDF', user: 'Manager', status: 'Exported' },
    { time: 'Today 16:50', report: 'RPT-2026-00011', type: 'Excel', user: 'Manager', status: 'Exported' },
    { time: 'Today 15:30', report: 'RPT-2026-00010', type: 'PDF', user: 'System', status: 'Exported' },
    { time: 'Yesterday 18:10', report: 'RPT-2026-00008', type: 'Excel', user: 'Manager', status: 'Exported' },
  ],
}
