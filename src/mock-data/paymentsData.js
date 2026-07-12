export const paymentTransactions = [
  { id: 128, receiptId: 'PAY-000128', ticketCode: 'TCK-2026-000128', licensePlate: '51A-12345', vehicleType: 'Car', amount: 25000, method: 'QR Payment', type: 'Parking Fee', status: 'PAID', time: '17:48:20', staff: 'Parking Staff', paidAt: '2026-07-13 17:48:20' },
  { id: 127, receiptId: 'PAY-000127', ticketCode: 'TCK-2026-000127', licensePlate: '29B-87654', vehicleType: 'Car', amount: 0, method: 'Monthly Pass', type: 'Pass Validation', status: 'PAID', time: '17:32:10', staff: 'Parking Staff', paidAt: '2026-07-13 17:32:10' },
  { id: 126, receiptId: 'PAY-000126', ticketCode: 'TCK-2026-000126', licensePlate: '61C-23111', vehicleType: 'Motorcycle', amount: 10000, method: 'Cash', type: 'Parking Fee', status: 'PAID', time: '17:18:45', staff: 'Parking Staff', paidAt: '2026-07-13 17:18:45' },
  { id: 125, receiptId: 'PAY-000125', ticketCode: 'TCK-2026-000125', licensePlate: '30A-99887', vehicleType: 'Electric Vehicle', amount: 20000, method: 'QR Payment', type: 'Reservation', status: 'PENDING', time: '17:05:12', staff: 'Parking Staff', paidAt: null },
  { id: 124, receiptId: 'PAY-000124', ticketCode: 'TCK-2026-000124', licensePlate: '59A-11111', vehicleType: 'Motorcycle', amount: 15000, method: 'Card', type: 'Parking Fee', status: 'FAILED', time: '16:58:30', staff: 'Parking Staff', paidAt: null },
  { id: 123, receiptId: 'PAY-000123', ticketCode: 'TCK-2026-000123', licensePlate: '43A-55667', vehicleType: 'Car', amount: 15000, method: 'Card', type: 'Parking Fee', status: 'PAID', time: '16:38:55', staff: 'Parking Staff', paidAt: '2026-07-13 16:38:55' },
]

export const paymentDashboardStats = { todayRevenue: 12850000, paidTransactions: 284, pendingPayments: 9, failedPayments: 3, refundRequests: 2 }
