const occupied = {
  'B2-18': ['51A-12345', 'TCK-2026-000128', '14:32:05', 'AI Recommended'],
  'A1-07': ['29B-44444', 'TCK-2026-000120', '14:10:05', 'Manual Selection'],
  'A1-08': ['29B-55555', 'TCK-2026-000121', '14:15:10', 'Manual Selection'],
  'A1-11': ['59C-99887', 'TCK-2026-000122', '14:18:22', 'AI Recommended'],
  'A1-12': ['43A-66551', 'TCK-2026-000123', '14:20:00', 'AI Recommended'],
  'B2-19': ['29B-87654', 'TCK-2026-000124', '14:30:12', 'Manual Selection'],
  'B2-24': ['61C-23111', 'TCK-2026-000127', '14:28:45', 'AI Recommended'],
  'C3-07': ['51F-99900', 'TCK-2026-000109', '13:50:00', 'AI Recommended'],
  'C3-08': ['30L-11223', 'TCK-2026-000110', '13:55:00', 'Manual Selection'],
  'D4-19': ['75A-09876', 'TCK-2026-000111', '14:02:11', 'AI Recommended'],
  'D4-20': ['37C-55432', 'TCK-2026-000112', '14:05:00', 'AI Recommended'],
  'D4-21': ['47A-88776', 'TCK-2026-000113', '14:08:15', 'Manual Selection'],
  'D4-24': ['92A-44332', 'TCK-2026-000114', '14:09:44', 'Manual Selection'],
}
const reserved = new Set(['A1-06', 'B2-20', 'B2-21', 'C3-11', 'C3-12'])
const maintenance = new Set(['A1-05', 'C3-05', 'C3-06'])
const groups = [['A1', 1], ['B2', 13], ['C3', 1], ['D4', 13]]

const carSlots = groups.flatMap(([prefix, start]) => Array.from({ length: 12 }, (_, index) => {
  const id = `${prefix}-${String(start + index).padStart(2, '0')}`
  const session = occupied[id]
  const status = session ? 'Occupied' : reserved.has(id) ? 'Reserved' : maintenance.has(id) ? 'Maintenance' : 'Available'
  return { id, building: index < 10 ? 'Building A' : 'Building B', floor: `Floor ${prefix[1]}`, zone: 'Car', type: 'Car', status, vehicle: session?.[0] || '', ticketId: session?.[1] || '', entryTime: session?.[2] || '', method: session?.[3] || (status === 'Reserved' ? 'Reservation' : ''), processedBy: session ? 'Parking Staff' : status === 'Reserved' ? 'System' : '' }
}))

const createTypedSlots = (prefix, count, type, zone, floors) => Array.from({ length: count }, (_, index) => {
  const id = `${prefix}${String(index + 1).padStart(2, '0')}`
  const status = index % 9 === 2 ? 'Maintenance' : index % 7 === 3 ? 'Reserved' : index % 4 === 1 ? 'Occupied' : 'Available'
  return { id, building: index < Math.ceil(count * .7) ? 'Building A' : 'Building B', floor: floors[index % floors.length], zone, type, status, vehicle: status === 'Occupied' ? `${type === 'Motorcycle' ? '59X2' : '51E'}-${String(12000 + index * 73)}` : '', ticketId: status === 'Occupied' ? `TCK-2026-${String(300 + index).padStart(6, '0')}` : '', entryTime: status === 'Occupied' ? `13:${String(10 + index).padStart(2, '0')}:00` : '', method: status === 'Occupied' ? 'Auto Assigned' : status === 'Reserved' ? 'Reservation' : '', processedBy: status === 'Occupied' ? 'Parking Staff' : status === 'Reserved' ? 'System' : '' }
})

export const parkingMapSlots = [
  ...carSlots,
  ...createTypedSlots('M', 36, 'Motorcycle', 'Motorcycle', ['Basement', 'Floor 1', 'Floor 2']),
  ...createTypedSlots('EV', 18, 'Electric Vehicle', 'EV Charging', ['Floor 1', 'Floor 2', 'Floor 3']),
]

export const parkingMapSummary = { totalSlots: 524, available: 123, occupied: 343, reserved: 45, maintenance: 13, occupancyRate: 73 }

export const parkingMapUpdates = [
  { id: 1, time: '14:32:05', slot: 'B2-18', vehicle: '51A-12345', action: 'Assigned (AI)', staff: 'Parking Staff', status: 'Occupied' },
  { id: 2, time: '14:30:12', slot: 'B2-19', vehicle: '29B-87654', action: 'Assigned (Manual)', staff: 'Parking Staff', status: 'Checked In' },
  { id: 3, time: '14:28:45', slot: 'B2-24', vehicle: '61C-23111', action: 'Assigned (AI)', staff: 'System', status: 'Occupied' },
]
