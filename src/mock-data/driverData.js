// Mock data for Parking User / Driver role and functional pages

export const driverProfile = {
  id: 10,
  name: 'Nguyễn Văn A',
  email: 'driver.user@gmail.com',
  phone: '0901 234 567',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
  membershipTier: 'Gold Member',
  rewardPoints: 1250,
  primaryLicensePlate: '51A-12345',
}

export const driverVehicles = [
  {
    id: 1,
    licensePlate: '51A-12345',
    brand: 'VinFast',
    model: 'VF 8',
    color: 'White',
    vehicleType: 'EV',
    isPrimary: true,
    hasMonthlyPass: false,
  },
  {
    id: 2,
    licensePlate: '30A-99887',
    brand: 'Toyota',
    model: 'Camry',
    color: 'Black',
    vehicleType: 'Car',
    isPrimary: false,
    hasMonthlyPass: true,
  },
  {
    id: 3,
    licensePlate: '59X2-44018',
    brand: 'Honda',
    model: 'SH 150i',
    color: 'Silver',
    vehicleType: 'Motorcycle',
    isPrimary: false,
    hasMonthlyPass: false,
  },
]

// 1. Park Vehicle - Available Parking Zones & Realtime Slots overview for Driver
export const driverParkingZones = [
  { id: 'zone-f1', floor: 'Floor 1', zone: 'Zone A - VIP & Monthly', totalSlots: 40, availableSlots: 8, evCharging: true, isRecommended: true, rate: '25,000đ/2h' },
  { id: 'zone-f2', floor: 'Floor 2', zone: 'Zone B - Standard Car', totalSlots: 60, availableSlots: 22, evCharging: false, rate: '20,000đ/2h' },
  { id: 'zone-f3', floor: 'Floor 3', zone: 'Zone C - Standard Car', totalSlots: 60, availableSlots: 35, evCharging: false, rate: '20,000đ/2h' },
  { id: 'zone-b1', floor: 'Basement 1', zone: 'Zone M - Motorcycle', totalSlots: 150, availableSlots: 45, evCharging: true, rate: '10,000đ/2h' },
]

export const driverParkSimulations = [
  {
    id: 'SIM-001',
    gate: 'Entry Gate A',
    licensePlate: '51A-12345',
    detectedVehicle: 'VinFast VF 8 (EV)',
    recommendedSlot: 'EV-04',
    floorZone: 'Floor 1 · Zone C (EV Fast Charge)',
    aiConfidence: '98.5%',
    estimatedWalkingTime: '1 min to Elevator A',
  },
]

// 2. Receive Ticket - Digital Active Ticket & Ticket History for Driver
export const driverActiveTicket = {
  ticketCode: 'TCK-2026-000128',
  licensePlate: '51A-12345',
  vehicleType: 'Car (EV)',
  ticketType: 'Normal',
  slotId: 'B2-18',
  floorZone: 'Floor 2, Zone B',
  entryGate: 'Entry Gate A',
  entryTime: '2026-07-22 14:32:05',
  durationMinutes: 195, // 3h 15m
  currentFee: 35000,
  status: 'Active',
  qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=TCK-2026-000128',
  locationDetails: {
    floor: 'Floor 2',
    zone: 'Zone B',
    pillar: 'Pillar B2-18',
    nearestElevator: 'Elevator East B',
  },
}

export const driverTicketHistory = [
  {
    id: 128,
    ticketCode: 'TCK-2026-000128',
    licensePlate: '51A-12345',
    vehicleType: 'Car',
    entryTime: '2026-07-22 14:32:05',
    exitTime: null,
    duration: '3h 15m (Ongoing)',
    slotId: 'B2-18',
    totalFee: 35000,
    status: 'Active',
    paymentStatus: 'Pending',
  },
  {
    id: 120,
    ticketCode: 'TCK-2026-000120',
    licensePlate: '51A-12345',
    vehicleType: 'Car',
    entryTime: '2026-07-20 09:15:00',
    exitTime: '2026-07-20 17:45:00',
    duration: '8h 30m',
    slotId: 'A1-05',
    totalFee: 85000,
    status: 'Completed',
    paymentStatus: 'Paid',
    paidVia: 'MBBank QR',
  },
  {
    id: 112,
    ticketCode: 'TCK-2026-000112',
    licensePlate: '51A-12345',
    vehicleType: 'Car',
    entryTime: '2026-07-18 18:00:00',
    exitTime: '2026-07-18 21:30:00',
    duration: '3h 30m',
    slotId: 'B3-12',
    totalFee: 40000,
    status: 'Completed',
    paymentStatus: 'Paid',
    paidVia: 'MoMo E-Wallet',
  },
]

// 3. Register Monthly Pass - Subscriptions & Driver Monthly Passes
export const driverPassPackages = [
  {
    id: 'pkg-car-std',
    name: 'Standard Car Monthly Pass',
    vehicleType: 'Car',
    price: 1500000,
    unit: '/month',
    perks: ['Unlimited entry & exit', 'Guaranteed floor allocation', '24/7 CCTV surveillance'],
    popular: true,
  },
  {
    id: 'pkg-car-ev',
    name: 'EV Premium Monthly Pass',
    vehicleType: 'EV',
    price: 2000000,
    unit: '/month',
    perks: ['Unlimited entry & exit', 'Priority EV Charging access', 'Dedicated Floor 1 Zone C spot'],
    popular: false,
  },
  {
    id: 'pkg-bike',
    name: 'Motorcycle Monthly Pass',
    vehicleType: 'Motorcycle',
    price: 250000,
    unit: '/month',
    perks: ['Fast RFID scan lane', 'Basement 1 reserved area', 'Weather-protected parking'],
    popular: false,
  },
]

export const driverMonthlyPasses = [
  {
    id: 1,
    passCode: 'MP-2026-00130',
    licensePlate: '30A-99887',
    vehicleName: 'Toyota Camry (Car)',
    package: 'Standard Car Monthly Pass',
    validFrom: '2026-07-01',
    validUntil: '2026-07-31',
    assignedZone: 'Floor 1, Zone C',
    status: 'Active',
    daysRemaining: 9,
    price: 1500000,
    autoRenew: true,
  },
  {
    id: 2,
    passCode: 'MP-2026-00135',
    licensePlate: '51A-12345',
    vehicleName: 'VinFast VF 8 (EV)',
    package: 'EV Premium Monthly Pass',
    validFrom: '2026-08-01',
    validUntil: '2026-08-31',
    assignedZone: 'Floor 1, Zone C (EV)',
    status: 'Pending Approval',
    daysRemaining: 30,
    price: 2000000,
    autoRenew: false,
  },
]

// 4. Make Reservation - Advance Spot Booking Mock Data
export const driverReservations = [
  {
    id: 52,
    code: 'RSV-2026-00052',
    licensePlate: '51A-12345',
    vehicleType: 'EV',
    slot: 'EV-04',
    floorZone: 'Floor 1 · Zone C (EV Charge)',
    date: '2026-07-23',
    timeWindow: '09:00 - 18:00',
    status: 'Confirmed',
    depositAmount: 50000,
    paymentStatus: 'Paid',
    qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=RSV-2026-00052',
    notes: 'EV charging slot requested.',
  },
  {
    id: 46,
    code: 'RSV-2026-00046',
    licensePlate: '51A-12345',
    vehicleType: 'Car',
    slot: 'B2-18',
    floorZone: 'Floor 2 · Zone B',
    date: '2026-07-22',
    timeWindow: '14:30 - 18:30',
    status: 'Checked In',
    depositAmount: 20000,
    paymentStatus: 'Paid',
    qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=RSV-2026-00046',
    notes: 'Arrived on time.',
  },
  {
    id: 38,
    code: 'RSV-2026-00038',
    licensePlate: '51A-12345',
    vehicleType: 'Car',
    slot: 'B3-10',
    floorZone: 'Floor 3 · Zone B',
    date: '2026-07-15',
    timeWindow: '10:00 - 14:00',
    status: 'Completed',
    depositAmount: 20000,
    paymentStatus: 'Paid',
    qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=RSV-2026-00038',
    notes: 'Completed successfully.',
  },
]

// 5. Pay Parking Fee - Current Unpaid Fee, Rates & Payment Gateways
export const driverCurrentUnpaidFee = {
  ticketCode: 'TCK-2026-000128',
  licensePlate: '51A-12345',
  slotId: 'B2-18',
  floorZone: 'Floor 2, Zone B',
  entryTime: '2026-07-22 14:32:05',
  calculatedAt: '2026-07-22 17:47:05',
  durationText: '3 hours 15 minutes',
  baseRateText: '20,000đ first 2 hours + 15,000đ/hour after',
  feeBreakdown: [
    { label: 'First 2 Hours', amount: 20000 },
    { label: 'Additional 1h 15m (rounded 2h)', amount: 15000 },
    { label: 'EV Charging Service (if used)', amount: 0 },
    { label: 'Member Discount (Gold)', amount: -5000 },
  ],
  subtotal: 35000,
  discount: 5000,
  totalToPay: 30000,
  qrPayment: {
    bankName: 'MBBank (Ngân Hàng Quân Đội)',
    accountNumber: '999988882026',
    accountName: 'AI PARKING BUILDING SYSTEM',
    amount: 30000,
    transferContent: 'PARK TCK128 51A12345',
    qrImageUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=00020101021238580010A0000007270127000697042201129999888820260208QRIBFTTA53037045405300005802VN5925AI%20PARKING%20BUILDING6007HA%20NOI62280524PARK%20TCK128%2051A123456304',
  },
}

export const driverPaymentMethods = [
  { id: 'momo', name: 'MoMo E-Wallet', icon: 'account_balance_wallet', type: 'E-Wallet', recommended: true },
  { id: 'banking_qr', name: 'VietQR / Mobile Banking', icon: 'qr_code_2', type: 'Banking App', recommended: true },
  { id: 'vnpay', name: 'VNPay QR', icon: 'payments', type: 'E-Wallet', recommended: false },
  { id: 'credit_card', name: 'Visa / Mastercard / JCB', icon: 'credit_card', type: 'Card', recommended: false },
]

export const driverPaymentHistory = [
  {
    id: 'PAY-2026-8801',
    ticketCode: 'TCK-2026-000120',
    date: '2026-07-20 17:45',
    licensePlate: '51A-12345',
    amount: 85000,
    method: 'VietQR',
    type: 'Parking Fee',
    status: 'SUCCESS',
  },
  {
    id: 'PAY-2026-8790',
    ticketCode: 'MP-2026-00130',
    date: '2026-07-01 10:15',
    licensePlate: '30A-99887',
    amount: 1500000,
    method: 'MoMo E-Wallet',
    type: 'Monthly Pass Renewal',
    status: 'SUCCESS',
  },
  {
    id: 'PAY-2026-8722',
    ticketCode: 'RSV-2026-00052',
    date: '2026-07-22 08:30',
    licensePlate: '51A-12345',
    amount: 50000,
    method: 'Credit Card',
    type: 'Reservation Deposit',
    status: 'SUCCESS',
  },
]
