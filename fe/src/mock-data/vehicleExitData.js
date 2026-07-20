import { getOperationalSession, getOperationalVehicle, operationalPayments, operationalSessions } from './operationalRecords.js'

const exitSessionIds = new Set([128, 126, 124, 123])

export const mockExitSessions = operationalSessions.filter((session) => exitSessionIds.has(session.id)).map((session) => ({
  ...session,
  vehicleType: getOperationalVehicle(session.licensePlate).vehicleType,
  ticketType: session.ticketType === 'Normal' ? 'Normal (Visitor)' : session.ticketType,
  zone: session.floorZone.replace(', ', ' · '),
  paymentMethod: operationalPayments.find((payment) => payment.ticketCode === session.ticketCode)?.method || 'Cash',
  isLostTicket: session.ticketType === 'Lost Ticket',
}))

export const mockTicketRecords = operationalSessions.map((session) => ({
  id: session.id,
  ticketCode: session.ticketCode,
  licensePlate: session.licensePlate,
  vehicleType: getOperationalVehicle(session.licensePlate).vehicleType,
  status: session.status,
  entryTime: session.entryTime,
  exitTime: session.exitTime || '—',
  amountDue: session.baseFee + session.surcharge,
  paymentStatus: session.paymentStatus,
}))

export const mockPaymentHistory = operationalPayments.filter((payment) => payment.status === 'PAID').map((payment) => ({
  id: payment.id,
  ticketCode: payment.ticketCode,
  licensePlate: payment.licensePlate,
  amount: payment.amount,
  method: payment.method,
  status: 'Completed',
  paidAt: payment.paidAt,
}))

export const mockRecentExits = operationalPayments.slice(0, 4).map((payment) => {
  const session = getOperationalSession(payment.ticketCode)
  return { id: payment.id, time: payment.time, licensePlate: payment.licensePlate, vehicleType: getOperationalVehicle(payment.licensePlate).vehicleType, ticketType: session.ticketType, paidAmount: payment.amount, status: session.status === 'Closed' ? 'Completed' : session.status }
})

export const mockLostTicketCases = [
  { id: 1, caseCode: 'LT-00008', licensePlate: '59A-77123', ticketCode: 'TCK-2026-000124', submittedAt: '2026-07-13 17:20:00', status: 'Pending Review', note: 'Customer reported the parking ticket was lost.', fee: 50000 },
]

export const mockMonthlyPasses = operationalSessions.filter((session) => session.ticketType === 'Monthly').map((session) => {
  const vehicle = getOperationalVehicle(session.licensePlate)
  return { licensePlate: session.licensePlate, ownerName: vehicle.ownerName, vehicleType: vehicle.vehicleType, status: 'Active', expiryDate: session.id === 127 ? '2026-07-31' : '2026-07-25' }
})

export const mockReservations = [
  { code: 'RSV-2026-00046', licensePlate: '30A-99887', vehicleType: 'Electric Vehicle', name: 'Trần Minh B', slotId: 'EV04', status: 'Checked In' },
  { code: 'RSV-2026-00049', licensePlate: '43A-11229', vehicleType: 'Car', name: 'Đỗ Minh Khang', slotId: 'B3-22', status: 'Confirmed' },
]
