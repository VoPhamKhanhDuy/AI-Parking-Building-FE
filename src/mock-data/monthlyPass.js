export const monthlyPassOverview = [
  { label: 'Active Passes', value: '286' },
  { label: 'Expiring Soon', value: '18' },
  { label: 'Pending Approval', value: '7' },
  { label: 'Expired', value: '12' },
  { label: 'Monthly Revenue', value: '68.5M', unit: 'VND' },
]

export const monthlyPassList = [
  { id: 1, passCode: 'MP-2026-00128', plate: '51A-12345', driver: 'Nguyen Van A', validUntil: '2026-07-31', status: 'Active', location: 'Floor 2, Zone B', type: 'Monthly Car Pass' },
  { id: 2, passCode: 'MP-2026-00129', plate: '61C-23111', driver: 'Le Hoang C', validUntil: '2026-07-25', status: 'Expiring Soon', location: 'Floor 1, Zone C', type: 'Monthly Motorcycle Pass' },
  { id: 3, passCode: 'MP-2026-00130', plate: '30A-99887', driver: 'Tran Minh B', validUntil: '2026-08-15', status: 'Active', location: 'Floor 3, Zone A', type: 'Monthly EV Pass' },
  { id: 4, passCode: 'MP-2026-00131', plate: '59A-77123', driver: 'Pham Gia Huy', validUntil: '2026-07-10', status: 'Pending', location: 'Floor 2, Zone B', type: 'Monthly Car Pass' },
  { id: 5, passCode: 'MP-2026-00132', plate: '43A-11229', driver: 'Do Minh Khang', validUntil: '2026-06-30', status: 'Expired', location: 'Floor 1, Zone A', type: 'Monthly Car Pass' },
]

export const monthlyPassActivities = [
  { time: '14:20:12', passCode: 'MP-2026-00128', plate: '51A-12345', action: 'Pass verified at entry', staff: 'System', status: 'Active' },
  { time: '13:48:40', passCode: 'MP-2026-00129', plate: '61C-23111', action: 'Renewal reminder sent', staff: 'System', status: 'Expiring Soon' },
  { time: '11:30:05', passCode: 'MP-2026-00131', plate: '59A-77123', action: 'Payment pending review', staff: 'Parking Staff', status: 'Pending' },
]

export const defaultMonthlyPassDetail = {
  passCode: 'MP-2026-00128',
  plate: '51A-12345',
  driver: 'Nguyen Van A',
  type: 'Monthly Car Pass',
  validity: '2026-07-01 to 2026-07-31',
  status: 'Active / Paid',
  location: 'Floor 2, Zone B',
  assignedGate: 'Entry Gate A',
  vehicleModel: 'Toyota Camry',
  renewalDate: '2026-07-01',
}
