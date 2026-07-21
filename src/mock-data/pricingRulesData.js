export const pricingRulesData = {
  summaries: [
    { label: 'Active Pricing Rules', value: '18', note: 'Currently applied' },
    { label: 'Vehicle Types', value: '4', note: 'Car, motorcycle, EV, all' },
    { label: 'Monthly Pass Plans', value: '3', note: '30-day validity' },
    { label: 'Penalty Rules', value: '2', note: 'Lost ticket and overtime' },
    { label: 'Pending Updates', value: '1', note: 'Awaiting approval', tone: 'warning' },
  ],
  categories: ['Standard Parking', 'Motorcycle Parking', 'Car Parking', 'EV Charging', 'Monthly Pass', 'Reservation Fee', 'Lost Ticket Penalty', 'Overtime Rules'],
  rules: [
    { code: 'PRC-001', category: 'Standard', detailCategory: 'Standard Parking', vehicleType: 'Car', baseFee: '10,000 VND', additionalFee: '5,000 VND / hr', gracePeriod: '15 min', effectiveDate: '2026-07-01', appliedTo: 'Visitors', status: 'Active' },
    { code: 'PRC-002', category: 'Standard', detailCategory: 'Standard Parking', vehicleType: 'Motorcycle', baseFee: '5,000 VND', additionalFee: '2,000 VND / hr', gracePeriod: '15 min', effectiveDate: '2026-07-01', appliedTo: 'Visitors', status: 'Active' },
    { code: 'PRC-003', category: 'EV Charging', detailCategory: 'EV Charging', vehicleType: 'EV', baseFee: '15,000 VND', additionalFee: '7,000 VND / hr', gracePeriod: '10 min', effectiveDate: '2026-07-01', appliedTo: 'Visitors', status: 'Active' },
    { code: 'PRC-004', category: 'Reservation', detailCategory: 'Reservation Fee', vehicleType: 'Car', baseFee: '10,000 VND', additionalFee: '0 VND', gracePeriod: '30 min', effectiveDate: '2026-07-01', appliedTo: 'Reservations', status: 'Active' },
    { code: 'PRC-005', category: 'Lost Ticket Penalty', detailCategory: 'Lost Ticket Penalty', vehicleType: 'All', baseFee: '50,000 VND', additionalFee: 'Standard fee applies', gracePeriod: 'None', effectiveDate: '2026-07-01', appliedTo: 'All visitors', status: 'Active' },
  ],
  monthlyPasses: [
    { name: 'Motorcycle Pass', vehicleType: 'Motorcycle', monthlyFee: '150,000 VND', validity: '30 days', status: 'Active' },
    { name: 'Car Pass', vehicleType: 'Car', monthlyFee: '600,000 VND', validity: '30 days', status: 'Active' },
    { name: 'EV Pass', vehicleType: 'EV', monthlyFee: '750,000 VND', validity: '30 days', status: 'Active' },
  ],
  recentUpdates: [
    { time: '17:20', rule: 'PRC-001', action: 'Car additional fee updated to 5,000 VND / hr', user: 'Manager', status: 'Updated' },
    { time: '16:05', rule: 'PRC-005', action: 'Lost ticket penalty reviewed at 50,000 VND', user: 'Manager', status: 'Reviewed' },
    { time: '14:32', rule: 'PRC-004', action: 'Reservation fee activated at 10,000 VND', user: 'Manager', status: 'Active' },
    { time: '10:15', rule: 'PRC-003', action: 'EV charging fee adjusted to 7,000 VND / hr', user: 'Manager', status: 'Updated' },
  ],
}
