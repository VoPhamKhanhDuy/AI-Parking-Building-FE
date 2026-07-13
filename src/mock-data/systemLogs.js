export const systemLogData = {
  summary: [
    { label: 'Today Logs', value: 186, icon: 'receipt_long' },
    { label: 'My Actions', value: 42, icon: 'person_check' },
    { label: 'System Events', value: 98, icon: 'dns' },
    { label: 'Warnings', value: 3, icon: 'warning', warning: true },
  ],
  logs: [
    { id: 1, time: '17:48:20', module: 'Payment', activity: 'Payment pending confirmation', reference: 'TCK-2026-000128', staff: 'Parking Staff', status: 'Warning', shift: 'Current Shift', receiptId: 'PAY-000128', ticketCode: 'TCK-2026-000128', licensePlate: '51A-12345', gate: 'Exit Gate B', description: 'QR payment is waiting for gateway confirmation. The ticket remains active.' },
    { id: 2, time: '14:30:12', module: 'Entry', activity: 'Monthly pass validated', reference: '29B-87654', staff: 'Parking Staff', status: 'Completed', shift: 'Current Shift', receiptId: 'PAY-000127', ticketCode: 'TCK-2026-000127', licensePlate: '29B-87654', gate: 'Entry Gate A', description: 'Monthly pass MP-2026-00128 was validated and slot A1-07 was assigned.' },
    { id: 3, time: '14:28:45', module: 'Exit', activity: 'Vehicle exit requested', reference: 'M12', staff: 'Parking Staff', status: 'Pending', shift: 'Current Shift', receiptId: 'PAY-000126', ticketCode: 'TCK-2026-000126', licensePlate: '61C-23111', gate: 'Exit Gate B', description: 'The motorcycle exit is waiting for payment confirmation.' },
    { id: 4, time: '14:25:33', module: 'Entry', activity: 'Camera scan retry', reference: 'Gate B', staff: 'System', status: 'Warning', shift: 'Current Shift', receiptId: '—', ticketCode: '—', licensePlate: '—', gate: 'Entry Gate B', description: 'The camera required a second scan. The retry was completed successfully.' },
    { id: 5, time: '16:55:30', module: 'Payment', activity: 'Reservation payment completed', reference: 'TCK-2026-000125', staff: 'Parking Staff', status: 'Completed', shift: 'Current Shift', receiptId: 'PAY-000125', ticketCode: 'TCK-2026-000125', licensePlate: '30A-99887', gate: 'Exit Gate A', description: 'Reservation payment was confirmed and the EV parking ticket was closed.' },
    { id: 6, time: '14:15:00', module: 'Facility', activity: 'Floor 1 occupancy > 90%', reference: 'Area 1', staff: 'System', status: 'Warning', shift: 'Current Shift', receiptId: '—', ticketCode: '—', licensePlate: '—', gate: 'Floor 1', description: 'Floor 1 occupancy passed the 90% operational warning threshold.' },
    { id: 7, time: '11:42:18', module: 'Entry', activity: 'Vehicle entry processed', reference: '51G-99887', staff: 'Parking Staff', status: 'Completed', shift: 'Today', receiptId: '—', ticketCode: 'TCK-2026-000101', licensePlate: '51G-99887', gate: 'Entry Gate A', description: 'Vehicle entry ticket was created and a slot was assigned.' },
  ],
  shiftSummary: [
    ['Shift Name', 'Morning Shift'], ['Time', '06:00 - 14:00'], ['Total Entries', '452'],
    ['Total Exits', '389'], ['Revenue Collected', '31.2M VND'], ['Active Staff', '4'], ['Exceptions / Overrides', '12'],
  ],
  warnings: [
    ['14:15:00', 'Floor 1 occupancy > 90%', 'Area 1', 'Active'],
    ['16:55:30', 'Reservation payment completed', 'TCK-2026-000125', 'Completed'],
    ['14:25:33', 'Camera scan retry', 'Gate B', 'Resolved'],
  ],
}
