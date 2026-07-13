export const lostTicketSessions = [
  { id: 1, ticketCode: 'TCK-2026-000128', licensePlate: '51A-12345', vehicleType: 'Car', ownerName: 'Nguyen Van A', phone: '0901 234 567', entryTime: '2026-07-13 14:32:05', slotId: 'B2-18', duration: '3h 16m', floorZone: 'Floor 2, Zone B - Car', entryGate: 'Entry Gate A', assignmentMethod: 'AI Recommended', parkingFee: 25000 },
  { id: 2, ticketCode: 'TCK-2026-000126', licensePlate: '61C-23111', vehicleType: 'Motorcycle', ownerName: 'Tran Minh Khoa', phone: '0988 110 221', entryTime: '2026-07-13 13:10:00', slotId: 'M-12', duration: '4h 05m', floorZone: 'Basement, Zone A', entryGate: 'Entry Gate B', assignmentMethod: 'Auto Assigned', parkingFee: 10000 },
  { id: 3, ticketCode: 'TCK-2026-000125', licensePlate: '30A-99887', vehicleType: 'Electric Vehicle', ownerName: 'Le Hoang Nam', phone: '0912 778 899', entryTime: '2026-07-13 12:45:00', slotId: 'EV-04', duration: '4h 40m', floorZone: 'Floor 1, Zone C', entryGate: 'Entry Gate A', assignmentMethod: 'Reservation', parkingFee: 20000 },
]
export const lostTicketPolicy = { carPenalty: 50000, motorcyclePenalty: 20000, evPenalty: 50000, verificationRequired: true, paymentBeforeExit: true }
export const recentLostTicketCases = [
  { id: 1, time: '14:55:30', licensePlate: '30A-99887', vehicleType: 'Electric Vehicle', slotId: 'EV-04', totalPaid: 70000, status: 'Completed' },
  { id: 2, time: '17:48:20', licensePlate: '51A-12345', vehicleType: 'Car', slotId: 'B2-18', totalPaid: 75000, status: 'Pending Payment' },
  { id: 3, time: '16:20:11', licensePlate: '29B-87654', vehicleType: 'Car', slotId: 'A1-45', totalPaid: 50000, status: 'Completed' },
  { id: 4, time: '15:42:08', licensePlate: '61C-23111', vehicleType: 'Motorcycle', slotId: 'M-12', totalPaid: 30000, status: 'Completed' },
]
