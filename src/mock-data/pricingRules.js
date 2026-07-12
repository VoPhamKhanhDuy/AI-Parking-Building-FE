export const pricingOverview = [
  { label: 'Active Pricing Rules', value: '18' },
  { label: 'Vehicle Types', value: '4' },
  { label: 'Monthly Pass Plans', value: '3' },
  { label: 'Penalty Rules', value: '2' },
]

export const pricingRulesList = [
  { id: 1, code: 'PRC-001', category: 'Standard Parking', vehicleType: 'Car', baseFee: '10,000 VND', additionalFee: '5,000 VND / hr', status: 'Active', appliedTo: 'Visitors', effectiveDate: '2026-07-01' },
  { id: 2, code: 'PRC-002', category: 'Standard Parking', vehicleType: 'Motorcycle', baseFee: '5,000 VND', additionalFee: '2,000 VND / hr', status: 'Active', appliedTo: 'Visitors', effectiveDate: '2026-07-01' },
  { id: 3, code: 'PRC-003', category: 'EV Charging', vehicleType: 'EV', baseFee: '15,000 VND', additionalFee: '7,000 VND / hr', status: 'Active', appliedTo: 'Electric Vehicles', effectiveDate: '2026-06-15' },
  { id: 4, code: 'PRC-004', category: 'Reservation', vehicleType: 'Car', baseFee: '10,000 VND', additionalFee: '0 VND', status: 'Active', appliedTo: 'Booked Slots', effectiveDate: '2026-07-10' },
  { id: 5, code: 'PRC-005', category: 'Lost Ticket Penalty', vehicleType: 'All', baseFee: '50,000 VND', additionalFee: 'Standard', status: 'Active', appliedTo: 'Lost Ticket', effectiveDate: '2026-05-12' },
]

export const monthlyPassPlans = [
  { id: 1, planName: 'Motorcycle Pass', vehicleType: 'Motorcycle', monthlyFee: '150,000 VND', validity: '30 days', status: 'Active' },
  { id: 2, planName: 'Car Pass', vehicleType: 'Car', monthlyFee: '600,000 VND', validity: '30 days', status: 'Active' },
  { id: 3, planName: 'EV Pass', vehicleType: 'EV', monthlyFee: '750,000 VND', validity: '30 days', status: 'Active' },
]

export const pricingUpdates = [
  { time: '17:20:11', rule: 'PRC-001', action: 'Car additional fee updated to 5,000 VND / hr', user: 'Manager', status: 'Updated' },
  { time: '16:05:44', rule: 'PRC-005', action: 'Lost ticket penalty reviewed at 50,000 VND', user: 'Manager', status: 'Reviewed' },
  { time: '14:32:18', rule: 'PRC-004', action: 'Reservation fee activated at 10,000 VND', user: 'Parking Staff', status: 'Active' },
  { time: '10:15:09', rule: 'PRC-003', action: 'EV charging rate adjusted to 7,000 VND / hr', user: 'Manager', status: 'Updated' },
]
