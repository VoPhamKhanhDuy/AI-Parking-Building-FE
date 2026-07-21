import { getOperationalVehicle, operationalSessions } from './operationalRecords.js'

export const ticketStats = { activeTickets: 342, closedToday: 128, lostTicketCases: 5, reservationTickets: 36, monthlyTickets: 84 }

export const ticketItems = operationalSessions.map((session) => {
  const vehicle = getOperationalVehicle(session.licensePlate)
  return {
    id: session.id,
    ticketCode: session.ticketCode,
    licensePlate: session.licensePlate,
    vehicleType: vehicle.vehicleType,
    ticketType: session.ticketType,
    slotId: session.slotId,
    floorZone: session.floorZone,
    entryGate: session.entryGate.replace('Entry ', ''),
    entryTime: session.entryTime.slice(11),
    status: session.status,
    paymentStatus: session.paymentStatus,
    method: session.method,
    staff: session.staff,
  }
})

export const ticketActivities = [
  { id: 1, time: '14:32:05', ticketCode: 'TCK-2026-000128', licensePlate: '51A-12345', action: 'Ticket created', staff: 'Parking Staff', status: 'Active' },
  { id: 2, time: '14:28:45', ticketCode: 'TCK-2026-000126', licensePlate: '61C-23111', action: 'Exit requested', staff: 'Parking Staff', status: 'Pending Exit' },
  { id: 3, time: '13:50:05', ticketCode: 'TCK-2026-000124', licensePlate: '59A-77123', action: 'Marked as lost ticket', staff: 'Parking Staff', status: 'Lost Ticket' },
]
