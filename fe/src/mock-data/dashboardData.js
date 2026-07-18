export const dashboardData = {
  kpis: [
    { label: 'Current Utilization', value: '76%', detail: '388 of 511 operational slots in use' },
    { label: 'Available Slots', value: '123', detail: 'Across all floors' },
    { label: 'Active Sessions', value: '342', detail: 'Vehicles currently parked' },
    { label: 'Today Revenue', value: '12.85M', unit: 'VND', detail: '284 paid transactions', accent: true },
  ],
  floors: [
    { area: 'Basement', capacity: 120, occupied: 82, available: 31, reserved: 7, status: 'Normal' },
    { area: 'Floor 1', capacity: 140, occupied: 115, available: 18, reserved: 7, status: 'High Occupancy' },
    { area: 'Floor 2', capacity: 144, occupied: 105, available: 27, reserved: 12, status: 'Normal' },
    { area: 'Floor 3', capacity: 120, occupied: 41, available: 47, reserved: 19, status: 'Normal' },
  ],
  systemStatuses: [
    ['AI Slot Engine', 'Ready'], ['Camera Scan', 'Active'], ['Payment Gateway', 'Online'], ['Gate A', 'Online'],
  ],
  alerts: [
    { type: 'warning', text: 'Floor 1 occupancy above 80%' },
    { type: 'info', text: '3 payments waiting for confirmation' },
  ],
  operations: [
    ['Active Sessions', '342'], ['Pending Payments', '9'], ['Lost Ticket Cases', '5'],
    ['Reservations Today', '21'], ['Vehicle Entries', '284'], ['Vehicle Exits', '271'],
  ],
  activities: [
    ['17:48:20', 'Payment pending confirmation', '51A-12345 / PAY-000128', 'Parking Staff', 'Pending'],
    ['14:32:05', 'Ticket created', '51A-12345 / TCK-2026-000128', 'Parking Staff', 'Active'],
    ['14:32:05', 'Slot assigned', 'B2-18', 'System', 'Occupied'],
    ['16:20:11', 'Lost ticket processed', '29B-87654', 'Parking Staff', 'Completed'],
    ['15:00:00', 'Reservation checked in', 'RSV-2026-00046', 'Parking Staff', 'Checked In'],
  ],
}
