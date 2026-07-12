export const ticketStats = { activeTickets: 342, closedToday: 128, lostTicketCases: 5, reservationTickets: 36, monthlyTickets: 84 }
export const ticketItems = [
  { id: 128, ticketCode: 'TCK-2026-000128', licensePlate: '51A-12345', vehicleType: 'Car', ticketType: 'Normal', slotId: 'B2-18', floorZone: 'Floor 2, Zone B', entryGate: 'Gate A', entryTime: '14:32:05', status: 'Active', paymentStatus: 'Unpaid', method: 'AI Recommended', staff: 'Parking Staff' },
  { id: 127, ticketCode: 'TCK-2026-000127', licensePlate: '29B-87654', vehicleType: 'Car', ticketType: 'Monthly', slotId: 'A1-45', floorZone: 'Floor 1, Zone A', entryGate: 'Gate A', entryTime: '14:30:12', status: 'Active', paymentStatus: 'Covered', method: 'Manual Selection', staff: 'Parking Staff' },
  { id: 126, ticketCode: 'TCK-2026-000126', licensePlate: '61C-23111', vehicleType: 'Motorcycle', ticketType: 'Normal', slotId: 'M-12', floorZone: 'Basement, Zone A', entryGate: 'Gate B', entryTime: '14:28:45', status: 'Pending Exit', paymentStatus: 'Pending', method: 'Auto Assigned', staff: 'Parking Staff' },
  { id: 125, ticketCode: 'TCK-2026-000125', licensePlate: '30A-99887', vehicleType: 'Electric Vehicle', ticketType: 'Reservation', slotId: 'EV-04', floorZone: 'Floor 1, Zone C', entryGate: 'Gate A', entryTime: '14:25:33', status: 'Closed', paymentStatus: 'Paid', method: 'Reservation', staff: 'Parking Staff' },
  { id: 124, ticketCode: 'TCK-2026-000124', licensePlate: '59A-77123', vehicleType: 'Car', ticketType: 'Lost Ticket', slotId: 'B1-09', floorZone: 'Floor 1, Zone B', entryGate: 'Gate A', entryTime: '13:50:05', status: 'Pending Payment', paymentStatus: 'Unpaid', method: 'Manual Review', staff: 'Parking Staff' },
  { id: 123, ticketCode: 'TCK-2026-000123', licensePlate: '88A-44512', vehicleType: 'Car', ticketType: 'Normal', slotId: 'B2-24', floorZone: 'Floor 2, Zone B', entryGate: 'Gate B', entryTime: '13:42:10', status: 'Active', paymentStatus: 'Unpaid', method: 'AI Recommended', staff: 'Parking Staff' },
  { id: 122, ticketCode: 'TCK-2026-000122', licensePlate: '77C-90211', vehicleType: 'Motorcycle', ticketType: 'Monthly', slotId: 'M-18', floorZone: 'Basement, Zone A', entryGate: 'Gate A', entryTime: '13:25:44', status: 'Active', paymentStatus: 'Covered', method: 'Auto Assigned', staff: 'Parking Staff' },
]
export const ticketActivities = [
  { id: 1, time: '14:32:05', ticketCode: 'TCK-2026-000128', licensePlate: '51A-12345', action: 'Ticket created', staff: 'Parking Staff', status: 'Active' },
  { id: 2, time: '14:28:45', ticketCode: 'TCK-2026-000126', licensePlate: '61C-23111', action: 'Exit requested', staff: 'Parking Staff', status: 'Pending Exit' },
  { id: 3, time: '13:50:05', ticketCode: 'TCK-2026-000124', licensePlate: '59A-77123', action: 'Marked as lost ticket', staff: 'Parking Staff', status: 'Lost Ticket' },
]
