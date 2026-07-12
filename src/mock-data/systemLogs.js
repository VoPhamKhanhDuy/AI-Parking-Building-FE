export const systemLogData = {
  summary: [
    { label: 'Today Logs', value: 186, icon: 'receipt_long' },
    { label: 'My Actions', value: 42, icon: 'person_check' },
    { label: 'System Events', value: 98, icon: 'dns' },
    { label: 'Warnings', value: 3, icon: 'warning', warning: true },
  ],
  logs: [
    { id: 1, time: '14:32:05', module: 'Payment', activity: 'Payment completed', reference: 'TCK-000128', staff: 'Parking Staff', status: 'Completed', shift: 'Current Shift', receiptId: 'PAY-000128', ticketCode: 'TCK-000128', licensePlate: '51A-12345', gate: 'Entry Gate A', description: 'Successfully processed normal visitor payment via credit card terminal. Ticket closed.' },
    { id: 2, time: '14:30:12', module: 'Exit', activity: 'Vehicle exit processed', reference: '29B-87654', staff: 'Parking Staff', status: 'Completed', shift: 'Current Shift', receiptId: 'PAY-000127', ticketCode: 'TCK-000127', licensePlate: '29B-87654', gate: 'Exit Gate A', description: 'Vehicle exit was validated and the barrier opened successfully.' },
    { id: 3, time: '14:28:45', module: 'Slot Engine', activity: 'Slot released', reference: 'M-12', staff: 'System', status: 'Completed', shift: 'Current Shift', receiptId: '—', ticketCode: 'TCK-000126', licensePlate: '51F-24680', gate: 'Floor 2', description: 'Parking slot M-12 was released after the vehicle exit completed.' },
    { id: 4, time: '14:25:33', module: 'Entry', activity: 'Camera scan retry', reference: 'Gate B', staff: 'System', status: 'Warning', shift: 'Current Shift', receiptId: '—', ticketCode: '—', licensePlate: '—', gate: 'Entry Gate B', description: 'The camera required a second scan. The retry was completed successfully.' },
    { id: 5, time: '14:20:10', module: 'Payment', activity: 'Payment confirmation delayed', reference: 'TCK-000125', staff: 'System', status: 'Warning', shift: 'Current Shift', receiptId: 'PAY-000125', ticketCode: 'TCK-000125', licensePlate: '30A-11223', gate: 'Exit Gate B', description: 'Payment gateway confirmation exceeded the expected response time.' },
    { id: 6, time: '14:15:00', module: 'Facility', activity: 'Floor 1 occupancy > 90%', reference: 'Area 1', staff: 'System', status: 'Warning', shift: 'Current Shift', receiptId: '—', ticketCode: '—', licensePlate: '—', gate: 'Floor 1', description: 'Floor 1 occupancy passed the 90% operational warning threshold.' },
    { id: 7, time: '11:42:18', module: 'Entry', activity: 'Vehicle entry processed', reference: '51G-99887', staff: 'Parking Staff', status: 'Completed', shift: 'Today', receiptId: '—', ticketCode: 'TCK-000101', licensePlate: '51G-99887', gate: 'Entry Gate A', description: 'Vehicle entry ticket was created and a slot was assigned.' },
  ],
  shiftSummary: [
    ['Shift Name', 'Morning Shift'], ['Time', '06:00 - 14:00'], ['Total Entries', '452'],
    ['Total Exits', '389'], ['Revenue Collected', '31.2M VND'], ['Active Staff', '4'], ['Exceptions / Overrides', '12'],
  ],
  warnings: [
    ['14:15:00', 'Floor 1 occupancy > 90%', 'Area 1', 'Active'],
    ['14:20:10', 'Payment confirmation delayed', 'TCK-000125', 'Resolved'],
    ['14:25:33', 'Camera scan retry', 'Gate B', 'Resolved'],
  ],
}
