export const monthlyPassStats = {
  activePasses: 286,
  expiringSoon: 18,
  pendingApproval: 7,
  verifiedToday: 42,
  expiredPasses: 12,
}

export const monthlyPassItems = [
  { id: 128, passCode: 'MP-2026-00128', licensePlate: '51A-12345', driver: 'Nguyễn Văn A', vehicleType: 'Car', passType: 'Monthly Car Pass', validFrom: '2026-07-01', validUntil: '2026-07-31', status: 'Active', paymentStatus: 'Paid', assignedLocation: 'Floor 2, Zone B', lastVerified: 'Today 14:20' },
  { id: 129, passCode: 'MP-2026-00129', licensePlate: '61C-23111', driver: 'Lê Hoàng C', vehicleType: 'Car', passType: 'Monthly Car Pass', validFrom: '2026-06-26', validUntil: '2026-07-25', status: 'Expiring Soon', paymentStatus: 'Paid', assignedLocation: 'Floor 1, Zone B', lastVerified: 'Today 09:45' },
  { id: 130, passCode: 'MP-2026-00130', licensePlate: '30A-99887', driver: 'Trần Minh B', vehicleType: 'EV', passType: 'Monthly EV Pass', validFrom: '2026-07-16', validUntil: '2026-08-15', status: 'Active', paymentStatus: 'Paid', assignedLocation: 'Floor 3, Zone C', lastVerified: 'Yesterday 17:10' },
  { id: 131, passCode: 'MP-2026-00131', licensePlate: '59A-77123', driver: 'Phạm Gia Huy', vehicleType: 'Motorcycle', passType: 'Monthly Motorcycle Pass', validFrom: '2026-07-11', validUntil: '2026-08-10', status: 'Pending Approval', paymentStatus: 'Pending', assignedLocation: 'Basement, Zone A', lastVerified: 'Not verified' },
  { id: 132, passCode: 'MP-2026-00132', licensePlate: '43A-11229', driver: 'Đỗ Minh Khang', vehicleType: 'Car', passType: 'Monthly Car Pass', validFrom: '2026-06-01', validUntil: '2026-06-30', status: 'Expired', paymentStatus: 'Expired', assignedLocation: 'Floor 2, Zone B', lastVerified: '2026-06-29 16:05' },
]

export const monthlyPassActivities = [
  { id: 1, time: '14:20', passCode: 'MP-2026-00128', licensePlate: '51A-12345', action: 'Pass verified at entry', staff: 'Parking Staff', status: 'Completed' },
  { id: 2, time: '13:48', passCode: 'MP-2026-00129', licensePlate: '61C-23111', action: 'Renewal reminder sent', staff: 'System', status: 'Expiring Soon' },
  { id: 3, time: '11:30', passCode: 'MP-2026-00131', licensePlate: '59A-77123', action: 'New pass submitted for approval', staff: 'Parking Staff', status: 'Pending Approval' },
  { id: 4, time: '10:15', passCode: 'MP-2026-00132', licensePlate: '43A-11229', action: 'Expired pass checked', staff: 'Parking Staff', status: 'Expired' },
]
