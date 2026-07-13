export const operationalVehicles = {
  '51A-12345': { licensePlate: '51A-12345', ownerName: 'Nguyễn Văn A', phone: '0901 234 567', vehicleType: 'Car' },
  '29B-87654': { licensePlate: '29B-87654', ownerName: 'Nguyễn Thị Mai', phone: '0908 765 432', vehicleType: 'Car' },
  '61C-23111': { licensePlate: '61C-23111', ownerName: 'Lê Hoàng C', phone: '0988 110 221', vehicleType: 'Motorcycle' },
  '30A-99887': { licensePlate: '30A-99887', ownerName: 'Trần Minh B', phone: '0912 556 778', vehicleType: 'Electric Vehicle' },
  '59A-77123': { licensePlate: '59A-77123', ownerName: 'Phạm Gia Huy', phone: '0903 445 667', vehicleType: 'Car' },
  '88A-44512': { licensePlate: '88A-44512', ownerName: 'Hoàng Minh Đức', phone: '0977 440 221', vehicleType: 'Car' },
  '77C-90211': { licensePlate: '77C-90211', ownerName: 'Võ Thanh Lâm', phone: '0918 660 112', vehicleType: 'Motorcycle' },
  '43A-11229': { licensePlate: '43A-11229', ownerName: 'Đỗ Minh Khang', phone: '0938 119 002', vehicleType: 'Car' },
}

export const operationalSessions = [
  { id: 128, ticketCode: 'TCK-2026-000128', licensePlate: '51A-12345', ticketType: 'Normal', slotId: 'B2-18', floorZone: 'Floor 2, Zone B', entryGate: 'Entry Gate A', entryTime: '2026-07-13 14:32:05', status: 'Active', paymentStatus: 'Pending', method: 'AI Recommended', staff: 'Parking Staff', baseFee: 25000, surcharge: 0, exitTime: null },
  { id: 127, ticketCode: 'TCK-2026-000127', licensePlate: '29B-87654', ticketType: 'Monthly', slotId: 'A1-07', floorZone: 'Floor 1, Zone A', entryGate: 'Entry Gate A', entryTime: '2026-07-13 14:30:12', status: 'Active', paymentStatus: 'Covered', method: 'Manual Selection', staff: 'Parking Staff', baseFee: 0, surcharge: 0, exitTime: null },
  { id: 126, ticketCode: 'TCK-2026-000126', licensePlate: '61C-23111', ticketType: 'Normal', slotId: 'M12', floorZone: 'Basement, Zone A', entryGate: 'Entry Gate B', entryTime: '2026-07-13 14:28:45', status: 'Pending Exit', paymentStatus: 'Pending', method: 'Auto Assigned', staff: 'Parking Staff', baseFee: 10000, surcharge: 0, exitTime: null },
  { id: 125, ticketCode: 'TCK-2026-000125', licensePlate: '30A-99887', ticketType: 'Reservation', slotId: 'EV04', floorZone: 'Floor 1, Zone C', entryGate: 'Entry Gate A', entryTime: '2026-07-13 14:25:33', status: 'Closed', paymentStatus: 'Paid', method: 'Reservation', staff: 'Parking Staff', baseFee: 20000, surcharge: 0, exitTime: '2026-07-13 16:55:30' },
  { id: 124, ticketCode: 'TCK-2026-000124', licensePlate: '59A-77123', ticketType: 'Lost Ticket', slotId: 'B2-19', floorZone: 'Floor 2, Zone B', entryGate: 'Entry Gate A', entryTime: '2026-07-13 13:50:05', status: 'Pending Payment', paymentStatus: 'Unpaid', method: 'Manual Review', staff: 'Parking Staff', baseFee: 15000, surcharge: 50000, exitTime: null },
  { id: 123, ticketCode: 'TCK-2026-000123', licensePlate: '88A-44512', ticketType: 'Normal', slotId: 'B2-24', floorZone: 'Floor 2, Zone B', entryGate: 'Entry Gate B', entryTime: '2026-07-13 13:42:10', status: 'Active', paymentStatus: 'Unpaid', method: 'AI Recommended', staff: 'Parking Staff', baseFee: 15000, surcharge: 0, exitTime: null },
  { id: 122, ticketCode: 'TCK-2026-000122', licensePlate: '77C-90211', ticketType: 'Monthly', slotId: 'M18', floorZone: 'Basement, Zone A', entryGate: 'Entry Gate A', entryTime: '2026-07-13 13:25:44', status: 'Active', paymentStatus: 'Covered', method: 'Auto Assigned', staff: 'Parking Staff', baseFee: 0, surcharge: 0, exitTime: null },
]

export const operationalPayments = [
  { id: 128, receiptId: 'PAY-000128', ticketCode: 'TCK-2026-000128', licensePlate: '51A-12345', amount: 25000, method: 'QR Payment', type: 'Parking Fee', status: 'PENDING', time: '17:48:20', staff: 'Parking Staff', paidAt: null },
  { id: 127, receiptId: 'PAY-000127', ticketCode: 'TCK-2026-000127', licensePlate: '29B-87654', amount: 0, method: 'Monthly Pass', type: 'Pass Validation', status: 'PAID', time: '17:32:10', staff: 'Parking Staff', paidAt: '2026-07-13 17:32:10' },
  { id: 126, receiptId: 'PAY-000126', ticketCode: 'TCK-2026-000126', licensePlate: '61C-23111', amount: 10000, method: 'Cash', type: 'Parking Fee', status: 'PENDING', time: '17:18:45', staff: 'Parking Staff', paidAt: null },
  { id: 125, receiptId: 'PAY-000125', ticketCode: 'TCK-2026-000125', licensePlate: '30A-99887', amount: 20000, method: 'QR Payment', type: 'Reservation', status: 'PAID', time: '16:55:30', staff: 'Parking Staff', paidAt: '2026-07-13 16:55:30' },
  { id: 124, receiptId: 'PAY-000124', ticketCode: 'TCK-2026-000124', licensePlate: '59A-77123', amount: 65000, method: 'Card', type: 'Lost Ticket', status: 'FAILED', time: '16:58:30', staff: 'Parking Staff', paidAt: null },
  { id: 123, receiptId: 'PAY-000123', ticketCode: 'TCK-2026-000123', licensePlate: '88A-44512', amount: 15000, method: 'Card', type: 'Parking Fee', status: 'PENDING', time: '16:38:55', staff: 'Parking Staff', paidAt: null },
  { id: 122, receiptId: 'PAY-000122', ticketCode: 'TCK-2026-000122', licensePlate: '77C-90211', amount: 0, method: 'Monthly Pass', type: 'Pass Validation', status: 'PAID', time: '16:25:44', staff: 'Parking Staff', paidAt: '2026-07-13 16:25:44' },
]

export const operationalMonthlyPasses = [
  { id: 128, passCode: 'MP-2026-00128', licensePlate: '29B-87654', validFrom: '2026-07-01', validUntil: '2026-07-31', status: 'Active', paymentStatus: 'Paid', assignedLocation: 'Floor 1, Zone A', lastVerified: 'Today 14:30' },
  { id: 129, passCode: 'MP-2026-00129', licensePlate: '77C-90211', validFrom: '2026-06-26', validUntil: '2026-07-25', status: 'Expiring Soon', paymentStatus: 'Paid', assignedLocation: 'Basement, Zone A', lastVerified: 'Today 13:25' },
  { id: 130, passCode: 'MP-2026-00130', licensePlate: '30A-99887', validFrom: '2026-07-16', validUntil: '2026-08-15', status: 'Active', paymentStatus: 'Paid', assignedLocation: 'Floor 1, Zone C', lastVerified: 'Yesterday 17:10' },
  { id: 131, passCode: 'MP-2026-00131', licensePlate: '59A-77123', validFrom: '2026-07-11', validUntil: '2026-08-10', status: 'Pending Approval', paymentStatus: 'Pending', assignedLocation: 'Floor 2, Zone B', lastVerified: 'Not verified' },
  { id: 132, passCode: 'MP-2026-00132', licensePlate: '43A-11229', validFrom: '2026-06-01', validUntil: '2026-06-30', status: 'Expired', paymentStatus: 'Expired', assignedLocation: 'Floor 3, Zone B', lastVerified: '2026-06-29 16:05' },
]

export const getOperationalVehicle = (licensePlate) => operationalVehicles[licensePlate]
export const getOperationalSession = (ticketCode) => operationalSessions.find((item) => item.ticketCode === ticketCode)
