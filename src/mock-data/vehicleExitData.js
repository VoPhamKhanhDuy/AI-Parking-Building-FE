export const mockExitSessions = [
  {
    id: 1,
    ticketCode: 'TCK-2026-100001',
    licensePlate: '51A-12345',
    vehicleType: 'Car',
    entryTime: '2026-07-12 08:15:00',
    slotId: 'B2-18',
    baseFee: 30000,
    surcharge: 5000,
    status: 'PendingPayment',
    paymentStatus: 'Pending',
    paymentMethod: 'Card',
    isLostTicket: false,
    exitTime: null
  },
  {
    id: 2,
    ticketCode: 'TCK-2026-100002',
    licensePlate: '29B-87654',
    vehicleType: 'Car',
    entryTime: '2026-07-12 07:45:00',
    slotId: 'A1-45',
    baseFee: 22000,
    surcharge: 0,
    status: 'Completed',
    paymentStatus: 'Paid',
    paymentMethod: 'Cash',
    isLostTicket: false,
    exitTime: '2026-07-12 12:10:00'
  },
  {
    id: 3,
    ticketCode: 'TCK-2026-100003',
    licensePlate: '30A-99887',
    vehicleType: 'Electric Vehicle',
    entryTime: '2026-07-12 09:20:00',
    slotId: 'EV-04',
    baseFee: 45000,
    surcharge: 12000,
    status: 'PendingPayment',
    paymentStatus: 'Pending',
    paymentMethod: 'Card',
    isLostTicket: false,
    exitTime: null
  }
]

export const mockTicketRecords = [
  {
    id: 1,
    ticketCode: 'TCK-2026-100001',
    licensePlate: '51A-12345',
    vehicleType: 'Car',
    status: 'Pending Payment',
    entryTime: '2026-07-12 08:15:00',
    exitTime: '—',
    amountDue: 35000,
    paymentStatus: 'Pending'
  },
  {
    id: 2,
    ticketCode: 'TCK-2026-100002',
    licensePlate: '29B-87654',
    vehicleType: 'Car',
    status: 'Completed',
    entryTime: '2026-07-12 07:45:00',
    exitTime: '2026-07-12 12:10:00',
    amountDue: 22000,
    paymentStatus: 'Paid'
  },
  {
    id: 3,
    ticketCode: 'TCK-2026-100003',
    licensePlate: '30A-99887',
    vehicleType: 'Electric Vehicle',
    status: 'Pending Payment',
    entryTime: '2026-07-12 09:20:00',
    exitTime: '—',
    amountDue: 57000,
    paymentStatus: 'Pending'
  },
  {
    id: 4,
    ticketCode: 'TCK-2026-100004',
    licensePlate: '59A-11111',
    vehicleType: 'Motorcycle',
    status: 'Completed',
    entryTime: '2026-07-12 06:50:00',
    exitTime: '2026-07-12 13:15:00',
    amountDue: 18000,
    paymentStatus: 'Paid'
  }
]

export const mockPaymentHistory = [
  {
    id: 1,
    ticketCode: 'TCK-2026-100002',
    licensePlate: '29B-87654',
    amount: 22000,
    method: 'Cash',
    status: 'Completed',
    paidAt: '2026-07-12 12:10:00'
  },
  {
    id: 2,
    ticketCode: 'TCK-2026-100004',
    licensePlate: '59A-11111',
    amount: 18000,
    method: 'Card',
    status: 'Completed',
    paidAt: '2026-07-12 13:15:00'
  }
]

export const mockLostTicketCases = [
  {
    id: 1,
    caseCode: 'LT-1001',
    licensePlate: '29B-87654',
    ticketCode: 'TCK-2026-100002',
    submittedAt: '2026-07-12 11:50:00',
    status: 'Under Review',
    note: 'Customer reported the paper ticket was misplaced at the gate.',
    fee: 40000
  },
  {
    id: 2,
    caseCode: 'LT-1002',
    licensePlate: '51A-12345',
    ticketCode: 'TCK-2026-100001',
    submittedAt: '2026-07-12 12:05:00',
    status: 'Pending Review',
    note: 'Ticket was not found in the vehicle glovebox.',
    fee: 35000
  }
]
