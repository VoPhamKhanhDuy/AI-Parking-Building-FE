import { getOperationalVehicle, operationalSessions } from './operationalRecords.js'

const lostTicketCandidateIds = new Set([128, 126, 124])
export const lostTicketSessions = operationalSessions.filter((session) => lostTicketCandidateIds.has(session.id)).map((session) => {
  const vehicle = getOperationalVehicle(session.licensePlate)
  return { id: session.id, ticketCode: session.ticketCode, licensePlate: session.licensePlate, vehicleType: vehicle.vehicleType, ownerName: vehicle.ownerName, phone: vehicle.phone, entryTime: session.entryTime, slotId: session.slotId, duration: session.id === 128 ? '3h 16m' : session.id === 126 ? '4h 05m' : '4h 20m', floorZone: session.floorZone, entryGate: session.entryGate, assignmentMethod: session.method, parkingFee: session.baseFee }
})

export const lostTicketPolicy = { carPenalty: 50000, motorcyclePenalty: 20000, evPenalty: 50000, verificationRequired: true, paymentBeforeExit: true }

export const recentLostTicketCases = [
  { id: 1, time: '17:20:00', licensePlate: '59A-77123', vehicleType: 'Car', slotId: 'B2-19', totalPaid: 65000, status: 'Pending Payment' },
  { id: 2, time: '16:20:11', licensePlate: '61C-23111', vehicleType: 'Motorcycle', slotId: 'M12', totalPaid: 30000, status: 'Completed' },
]
