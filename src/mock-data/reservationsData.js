import { getOperationalVehicle } from './operationalRecords.js'

const reservation = (id, plate, overrides) => {
  const vehicle = getOperationalVehicle(plate)
  return { id, code: `RSV-2026-${String(id).padStart(5, '0')}`, driver: vehicle?.ownerName || overrides.driver, phone: vehicle?.phone || overrides.phone, plate, vehicleType: vehicle?.vehicleType || overrides.vehicleType, ...overrides }
}

export const reservations = [
  reservation(46, '30A-99887', { slot: 'EV04', floorZone: 'Floor 1 · Zone C', window: '15:00–15:30', status: 'Checked In', payment: 'Paid', amount: 20000 }),
  reservation(49, '43A-11229', { slot: 'B3-22', floorZone: 'Floor 3 · Zone B', window: '17:00–17:30', status: 'Confirmed', payment: 'Paid', amount: 25000 }),
  reservation(50, '90A-55661', { driver: 'Mai Thanh Hà', phone: '0905 441 228', vehicleType: 'Car', slot: 'B3-24', floorZone: 'Floor 3 · Zone B', window: '17:30–18:00', status: 'Waiting', payment: 'Pending', amount: 25000 }),
  reservation(51, '59X2-44018', { driver: 'Vũ Đức Long', phone: '0918 660 113', vehicleType: 'Motorcycle', slot: 'M25', floorZone: 'Floor 2 · Zone A', window: '18:00–18:30', status: 'Confirmed', payment: 'Paid', amount: 10000 }),
]

export const reservationActivities = [
  { id: 1, time: '14:25:33', code: 'RSV-2026-00046', plate: '30A-99887', action: 'Checked In', staff: 'Parking Staff', status: 'Completed' },
  { id: 2, time: '13:50:05', code: 'RSV-2026-00049', plate: '43A-11229', action: 'Reservation confirmed', staff: 'Parking Staff', status: 'Completed' },
]
