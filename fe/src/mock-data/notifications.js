export const notificationItems = [
  {
    id: 1, time: '17:48', fullTime: '17:48:20', type: 'Payment', message: 'Payment pending confirmation', reference: 'PAY-000128', priority: 'High', status: 'Unread', ticketCode: 'TCK-2026-000128', licensePlate: '51A-12345', staff: 'Parking Staff', gate: 'Exit Gate B', currentShift: true,
    description: 'Payment was initiated but confirmation has not been received from the payment gateway. Please review before vehicle exit is finalized.',
  },
  {
    id: 2, time: '17:32', fullTime: '17:32:05', type: 'Reservation', message: 'Reservation arriving in 15 minutes', reference: 'RSV-2026-00045', priority: 'Medium', status: 'Unread', ticketCode: '—', licensePlate: '30H-56789', staff: 'Parking Staff', gate: 'Entry Gate A', currentShift: true,
    description: 'A reserved vehicle is expected to arrive within 15 minutes. Please keep the assigned slot available.',
  },
  {
    id: 3, time: '16:40', fullTime: '16:40:12', type: 'System', message: 'Floor 1 occupancy above 80%', reference: 'FLR-1', priority: 'Medium', status: 'Acknowledged', ticketCode: '—', licensePlate: '—', staff: 'System', gate: 'All Gates', currentShift: true,
    description: 'Floor 1 has exceeded the recommended occupancy threshold. Direct new vehicles to another floor.',
  },
  {
    id: 4, time: '17:20', fullTime: '17:20:00', type: 'Lost Ticket', message: 'Lost ticket case submitted', reference: 'LT-00008', priority: 'High', status: 'Unread', ticketCode: 'TCK-2026-000124', licensePlate: '59A-77123', staff: 'Parking Staff', gate: 'Exit Gate B', currentShift: true,
    description: 'The lost ticket case has new verification information and is waiting for staff review.',
  },
  {
    id: 5, time: '14:10', fullTime: '14:10:08', type: 'Camera', message: 'Camera scan retry detected', reference: 'CAM-GATE-A', priority: 'Low', status: 'Resolved', ticketCode: '—', licensePlate: '—', staff: 'System', gate: 'Entry Gate A', currentShift: false,
    description: 'The entry camera required an additional scan. The retry succeeded and no action is required.',
  },
]
