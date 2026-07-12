export const mockMonthlyPasses = [
  { licensePlate: '29B-87654', ownerName: 'Nguyen Van A', vehicleType: 'Car', status: 'Active', expiryDate: '2026-12-31' },
  { licensePlate: '30H-99999', ownerName: 'Tran Thi B', vehicleType: 'Car', status: 'Active', expiryDate: '2026-10-15' },
  { licensePlate: '59A-11111', ownerName: 'Le Van C', vehicleType: 'Motorcycle', status: 'Active', expiryDate: '2026-08-20' },
  { licensePlate: '79A-88888', ownerName: 'Pham Van D', vehicleType: 'Electric Vehicle', status: 'Active', expiryDate: '2027-01-01' },
]

export const mockReservations = [
  { code: 'RSV-001', licensePlate: '30A-99887', vehicleType: 'Electric Vehicle', name: 'Hoang Van E', slotId: 'EV-04', status: 'Confirmed' },
  { code: 'RSV-002', licensePlate: '51F-55555', vehicleType: 'Car', name: 'Nguyen Van F', slotId: 'F2-05', status: 'Confirmed' },
  { code: 'RSV-003', licensePlate: '43A-66666', vehicleType: 'Car', name: 'Le Thi G', slotId: 'F1-VIP02', status: 'Confirmed' },
]

export const initialRecentEntries = [
  {
    time: '14:30:12',
    licensePlate: '29B-87654',
    vehicleType: 'Car',
    ticketType: 'Monthly',
    assignedSlot: 'A1-45',
    status: 'Checked In',
    statusClass: 'green'
  },
  {
    time: '14:28:45',
    licensePlate: '61C-23111',
    vehicleType: 'Motorcycle',
    ticketType: 'Normal',
    assignedSlot: 'M-12',
    status: 'Pending AI',
    statusClass: 'purple'
  },
  {
    time: '14:32:05',
    licensePlate: '51A-12345',
    vehicleType: 'Car',
    ticketType: 'Normal',
    assignedSlot: 'B2-18',
    status: 'Waiting Confirmation',
    statusClass: 'yellow',
    isAiAssigned: true,
    highlight: true
  },
  {
    time: '14:25:33',
    licensePlate: '30A-99887',
    vehicleType: 'EV',
    ticketType: 'Reservation',
    assignedSlot: 'EV-04',
    status: 'Completed',
    statusClass: 'gray'
  }
]
