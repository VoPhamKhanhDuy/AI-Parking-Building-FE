import { getOperationalVehicle, operationalMonthlyPasses, operationalSessions } from './operationalRecords.js'
import { reservations } from './reservationsData.js'

const entryStatus = {
  128: ['Waiting Confirmation', 'yellow'],
  127: ['Checked In', 'green'],
  126: ['Pending AI', 'purple'],
  125: ['Completed', 'gray'],
}

export const initialRecentEntries = [127, 126, 128, 125].map((id) => {
  const session = operationalSessions.find((item) => item.id === id)
  const vehicle = getOperationalVehicle(session.licensePlate)
  const [status, statusClass] = entryStatus[id]
  return {
    time: session.entryTime.slice(11),
    licensePlate: session.licensePlate,
    vehicleType: vehicle.vehicleType === 'Electric Vehicle' ? 'EV' : vehicle.vehicleType,
    ticketType: session.ticketType,
    assignedSlot: session.slotId,
    status,
    statusClass,
    isAiAssigned: session.method === 'AI Recommended',
    highlight: id === 128,
  }
})

export const mockMonthlyPasses = operationalMonthlyPasses.map((pass) => {
  const vehicle = getOperationalVehicle(pass.licensePlate)
  return { licensePlate: pass.licensePlate, ownerName: vehicle.ownerName, vehicleType: vehicle.vehicleType, status: pass.status, expiryDate: pass.validUntil }
})

export const mockReservations = reservations.map((item) => ({ code: item.code, licensePlate: item.plate, vehicleType: item.vehicleType, name: item.driver, slotId: item.slot, status: item.status }))
