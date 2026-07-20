import { operationalSessions } from './operationalRecords.js'

const activeSessionsBySlot = Object.fromEntries(operationalSessions.filter((session) => session.status !== 'Closed').map((session) => [session.slotId, session]))
const reserved = new Set(['A1-06', 'B2-20', 'B2-21', 'C3-11', 'C3-12', 'EV11'])
const maintenance = new Set(['A1-05', 'C3-05', 'C3-06', 'M03', 'M21'])
const groups = [['A1', 1], ['B2', 13], ['C3', 1], ['D4', 13]]

const sessionFields = (session, status) => ({
  vehicle: session?.licensePlate || '',
  ticketId: session?.ticketCode || '',
  entryTime: session?.entryTime.slice(11) || '',
  method: session?.method || (status === 'Reserved' ? 'Reservation' : ''),
  processedBy: session?.staff || (status === 'Reserved' ? 'System' : ''),
})

const carSlots = groups.flatMap(([prefix, start]) => Array.from({ length: 12 }, (_, index) => {
  const id = `${prefix}-${String(start + index).padStart(2, '0')}`
  const session = activeSessionsBySlot[id]
  const status = session ? 'Occupied' : reserved.has(id) ? 'Reserved' : maintenance.has(id) ? 'Maintenance' : 'Available'
  return { id, building: 'Building A', floor: `Floor ${prefix[1]}`, zone: 'Car', type: 'Car', status, ...sessionFields(session, status) }
}))

const createTypedSlots = (prefix, count, type, zone, floors) => Array.from({ length: count }, (_, index) => {
  const id = `${prefix}${String(index + 1).padStart(2, '0')}`
  const session = activeSessionsBySlot[id]
  const generatedStatus = index % 9 === 2 ? 'Maintenance' : index % 7 === 3 ? 'Reserved' : index % 4 === 1 ? 'Occupied' : 'Available'
  const status = session ? 'Occupied' : reserved.has(id) ? 'Reserved' : maintenance.has(id) ? 'Maintenance' : generatedStatus
  const generatedVehicle = status === 'Occupied' && !session ? `${type === 'Motorcycle' ? '59X2' : '51E'}-${String(12000 + index * 73)}` : ''
  const generatedTicket = status === 'Occupied' && !session ? `TCK-2026-${String(300 + index).padStart(6, '0')}` : ''
  return { id, building: 'Building A', floor: floors[index % floors.length], zone, type, status, ...sessionFields(session, status), vehicle: session?.licensePlate || generatedVehicle, ticketId: session?.ticketCode || generatedTicket }
})

export const parkingMapSlots = [
  ...carSlots,
  ...createTypedSlots('M', 36, 'Motorcycle', 'Motorcycle', ['Basement', 'Floor 1', 'Floor 2']),
  ...createTypedSlots('EV', 18, 'Electric Vehicle', 'EV Charging', ['Floor 1', 'Floor 2', 'Floor 3']),
]

export const parkingMapSummary = { totalSlots: 524, available: 123, occupied: 343, reserved: 45, maintenance: 13, occupancyRate: 76 }

export const parkingMapUpdates = operationalSessions.slice(0, 3).map((session) => ({
  id: session.id,
  time: session.entryTime.slice(11),
  slot: session.slotId,
  vehicle: session.licensePlate,
  action: session.method === 'AI Recommended' ? 'Assigned (AI)' : session.method === 'Manual Selection' ? 'Assigned (Manual)' : 'Assigned',
  staff: session.staff,
  status: session.status === 'Active' ? 'Occupied' : session.status,
}))
