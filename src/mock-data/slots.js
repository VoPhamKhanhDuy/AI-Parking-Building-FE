export const initialSlots = [
  // Basement (Mostly Motorbike & Standard)
  { id: 'B-01', floor: 'Basement', type: 'Motorbike', status: 'Occupied' },
  { id: 'B-02', floor: 'Basement', type: 'Motorbike', status: 'Occupied' },
  { id: 'B-03', floor: 'Basement', type: 'Motorbike', status: 'Available' },
  { id: 'B-04', floor: 'Basement', type: 'Motorbike', status: 'Available' },
  { id: 'B-05', floor: 'Basement', type: 'Motorbike', status: 'Available' },
  { id: 'B-06', floor: 'Basement', type: 'Standard', status: 'Occupied' },
  { id: 'B-07', floor: 'Basement', type: 'Standard', status: 'Occupied' },
  { id: 'B-08', floor: 'Basement', type: 'Standard', status: 'Available' },
  { id: 'B-09', floor: 'Basement', type: 'Standard', status: 'Available' },
  { id: 'B-10', floor: 'Basement', type: 'Disabled', status: 'Available' },
  { id: 'B-11', floor: 'Basement', type: 'Disabled', status: 'Occupied' },

  // Floor 1 (VIP, EV, and Standard)
  { id: 'F1-VIP01', floor: 'Floor 1', type: 'VIP', status: 'Occupied' },
  { id: 'F1-VIP02', floor: 'Floor 1', type: 'VIP', status: 'Available' },
  { id: 'F1-VIP03', floor: 'Floor 1', type: 'VIP', status: 'Available' },
  { id: 'F1-EV01', floor: 'Floor 1', type: 'EV', status: 'Occupied' },
  { id: 'F1-EV02', floor: 'Floor 1', type: 'EV', status: 'Occupied' },
  { id: 'F1-EV03', floor: 'Floor 1', type: 'EV', status: 'Available' },
  { id: 'F1-EV04', floor: 'Floor 1', type: 'EV', status: 'Available' },
  { id: 'F1-01', floor: 'Floor 1', type: 'Standard', status: 'Occupied' },
  { id: 'F1-02', floor: 'Floor 1', type: 'Standard', status: 'Occupied' },
  { id: 'F1-03', floor: 'Floor 1', type: 'Standard', status: 'Occupied' },
  { id: 'F1-04', floor: 'Floor 1', type: 'Standard', status: 'Available' },
  { id: 'F1-05', floor: 'Floor 1', type: 'Standard', status: 'Available' },

  // Floor 2 (Standard & Reserved)
  { id: 'F2-01', floor: 'Floor 2', type: 'Standard', status: 'Occupied' },
  { id: 'F2-02', floor: 'Floor 2', type: 'Standard', status: 'Occupied' },
  { id: 'F2-03', floor: 'Floor 2', type: 'Standard', status: 'Occupied' },
  { id: 'F2-04', floor: 'Floor 2', type: 'Standard', status: 'Occupied' },
  { id: 'F2-05', floor: 'Floor 2', type: 'Standard', status: 'Reserved' }, // reserved for plate in presets
  { id: 'F2-06', floor: 'Floor 2', type: 'Standard', status: 'Available' },
  { id: 'F2-07', floor: 'Floor 2', type: 'Standard', status: 'Available' },
  { id: 'F2-08', floor: 'Floor 2', type: 'Standard', status: 'Available' },
  { id: 'F2-09', floor: 'Floor 2', type: 'Standard', status: 'Available' },
  { id: 'F2-10', floor: 'Floor 2', type: 'Standard', status: 'Available' },

  // Floor 3 (Standard)
  { id: 'F3-01', floor: 'Floor 3', type: 'Standard', status: 'Occupied' },
  { id: 'F3-02', floor: 'Floor 3', type: 'Standard', status: 'Available' },
  { id: 'F3-03', floor: 'Floor 3', type: 'Standard', status: 'Available' },
  { id: 'F3-04', floor: 'Floor 3', type: 'Standard', status: 'Available' },
  { id: 'F3-05', floor: 'Floor 3', type: 'Standard', status: 'Available' },
  { id: 'F3-06', floor: 'Floor 3', type: 'Standard', status: 'Available' },
]

const makeSlots = (prefix, count, type, floor, statuses = {}) =>
  Array.from({ length: count }, (_, index) => {
    const id = `${prefix}${String(index + 1).padStart(2, '0')}`
    return {
      id,
      floor,
      zone: type === 'motorcycle' ? 'A' : type === 'car' ? 'B' : 'C',
      type,
      status: statuses[id] || 'available',
      distanceToExit: 28 + (index + 1) * 2,
      distanceToElevator: 7 + ((index + 1) % 6) * 3,
    }
  })

const floorStatuses = {
  floor2: {
    M03: 'occupied', M06: 'occupied', M08: 'reserved', M13: 'occupied', M17: 'reserved', M20: 'occupied',
    C03: 'occupied', C04: 'occupied', C06: 'reserved', C09: 'maintenance', C10: 'occupied', C15: 'occupied', C19: 'reserved', C22: 'occupied',
    EV03: 'occupied', EV04: 'reserved',
  },
}

export const manualSlotLayouts = [
  {
    id: 'basement', name: 'Basement',
    slots: [
      ...makeSlots('BM', 32, 'motorcycle', 'Basement', { BM01: 'occupied', BM06: 'occupied', BM11: 'reserved', BM16: 'occupied', BM21: 'occupied', BM26: 'reserved' }),
      ...makeSlots('BC', 12, 'car', 'Basement', { BC01: 'occupied', BC03: 'occupied', BC07: 'maintenance', BC09: 'reserved' }),
    ],
  },
  {
    id: 'floor-1', name: 'Floor 1',
    slots: [
      ...makeSlots('1M', 20, 'motorcycle', 'Floor 1', { '1M01': 'occupied', '1M05': 'occupied', '1M09': 'reserved', '1M13': 'occupied' }),
      ...makeSlots('1C', 20, 'car', 'Floor 1', { '1C01': 'occupied', '1C04': 'occupied', '1C08': 'reserved', '1C12': 'occupied', '1C16': 'maintenance' }),
      ...makeSlots('1E', 8, 'ev', 'Floor 1', { '1E01': 'occupied', '1E04': 'reserved' }),
    ],
  },
  {
    id: 'floor-2', name: 'Floor 2',
    slots: [
      ...makeSlots('M', 32, 'motorcycle', 'Floor 2', floorStatuses.floor2),
      ...makeSlots('C', 24, 'car', 'Floor 2', floorStatuses.floor2),
      ...makeSlots('EV', 6, 'ev', 'Floor 2', floorStatuses.floor2),
    ],
  },
  {
    id: 'floor-3', name: 'Floor 3',
    slots: makeSlots('3C', 30, 'car', 'Floor 3', { '3C03': 'occupied', '3C09': 'occupied', '3C15': 'reserved', '3C21': 'maintenance' }),
  },
]
