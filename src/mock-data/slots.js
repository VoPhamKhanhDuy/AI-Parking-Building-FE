export const initialSlots = [
  { id: 'A1-01', floor: 'Basement', type: 'Motorbike', status: 'Available', zone: 'A' },
  { id: 'A1-02', floor: 'Basement', type: 'Motorbike', status: 'Occupied', zone: 'A' },
  { id: 'A1-03', floor: 'Basement', type: 'Motorbike', status: 'Available', zone: 'A' },
  { id: 'B1-05', floor: 'Floor 1', type: 'Standard', status: 'Available', zone: 'B' },
  { id: 'B1-06', floor: 'Floor 1', type: 'EV', status: 'Available', zone: 'C' },
  { id: 'B1-07', floor: 'Floor 1', type: 'VIP', status: 'Occupied', zone: 'D' },
  { id: 'B2-18', floor: 'Floor 2', type: 'Standard', status: 'Available', zone: 'B' },
  { id: 'B2-19', floor: 'Floor 2', type: 'Standard', status: 'Occupied', zone: 'B' },
  { id: 'B2-20', floor: 'Floor 2', type: 'Standard', status: 'Reserved', zone: 'B' },
  { id: 'C3-01', floor: 'Floor 3', type: 'EV', status: 'Available', zone: 'C' },
  { id: 'C3-02', floor: 'Floor 3', type: 'VIP', status: 'Available', zone: 'D' },
  { id: 'C3-03', floor: 'Floor 3', type: 'Standard', status: 'Maintenance', zone: 'B' },
]

export const manualSlotLayouts = [
  {
    id: 'basement',
    name: 'Basement',
    slots: [
      { id: 'A01', type: 'motorcycle', status: 'available', floor: 'Basement', zone: 'A', distanceToExit: 15, distanceToElevator: 10 },
      { id: 'A02', type: 'motorcycle', status: 'occupied', floor: 'Basement', zone: 'A', distanceToExit: 18, distanceToElevator: 12 },
      { id: 'A03', type: 'motorcycle', status: 'available', floor: 'Basement', zone: 'A', distanceToExit: 20, distanceToElevator: 15 },
      { id: 'A04', type: 'motorcycle', status: 'reserved', floor: 'Basement', zone: 'A', distanceToExit: 22, distanceToElevator: 17 },
      { id: 'A05', type: 'motorcycle', status: 'available', floor: 'Basement', zone: 'A', distanceToExit: 25, distanceToElevator: 20 },
    ],
  },
  {
    id: 'floor-1',
    name: 'Floor 1',
    slots: [
      { id: 'B01', type: 'car', status: 'available', floor: 'Floor 1', zone: 'B', distanceToExit: 12, distanceToElevator: 8 },
      { id: 'B02', type: 'car', status: 'occupied', floor: 'Floor 1', zone: 'B', distanceToExit: 14, distanceToElevator: 10 },
      { id: 'B03', type: 'car', status: 'available', floor: 'Floor 1', zone: 'B', distanceToExit: 16, distanceToElevator: 12 },
      { id: 'E01', type: 'ev', status: 'available', floor: 'Floor 1', zone: 'C', distanceToExit: 20, distanceToElevator: 5 },
      { id: 'E02', type: 'ev', status: 'occupied', floor: 'Floor 1', zone: 'C', distanceToExit: 22, distanceToElevator: 7 },
    ],
  },
  {
    id: 'floor-2',
    name: 'Floor 2 (Recommended)',
    slots: [
      { id: 'C17', type: 'car', status: 'occupied', floor: 'Floor 2', zone: 'B', distanceToExit: 30, distanceToElevator: 15 },
      { id: 'C18', type: 'car', status: 'available', floor: 'Floor 2', zone: 'B', distanceToExit: 25, distanceToElevator: 12 },
      { id: 'C19', type: 'car', status: 'available', floor: 'Floor 2', zone: 'B', distanceToExit: 28, distanceToElevator: 14 },
      { id: 'C20', type: 'car', status: 'reserved', floor: 'Floor 2', zone: 'B', distanceToExit: 32, distanceToElevator: 18 },
      { id: 'E10', type: 'ev', status: 'available', floor: 'Floor 2', zone: 'C', distanceToExit: 35, distanceToElevator: 8 },
    ],
  },
  {
    id: 'floor-3',
    name: 'Floor 3',
    slots: [
      { id: 'D01', type: 'car', status: 'available', floor: 'Floor 3', zone: 'B', distanceToExit: 40, distanceToElevator: 20 },
      { id: 'D02', type: 'car', status: 'maintenance', floor: 'Floor 3', zone: 'B', distanceToExit: 42, distanceToElevator: 22 },
      { id: 'E20', type: 'ev', status: 'available', floor: 'Floor 3', zone: 'C', distanceToExit: 45, distanceToElevator: 10 },
    ],
  },
]
