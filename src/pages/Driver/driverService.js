import {
  driverProfile,
  driverVehicles,
  driverParkingZones,
  driverParkSimulations,
  driverActiveTicket,
  driverTicketHistory,
  driverPassPackages,
  driverMonthlyPasses,
  driverReservations,
  driverCurrentUnpaidFee,
  driverPaymentMethods,
  driverPaymentHistory,
} from '../../mock-data/driverData'

export const getDriverProfile = () => driverProfile
export const getDriverVehicles = () => driverVehicles
export const getDriverParkingZones = () => driverParkingZones
export const getDriverParkSimulations = () => driverParkSimulations
export const getDriverActiveTicket = () => driverActiveTicket
export const getDriverTicketHistory = () => driverTicketHistory
export const getDriverPassPackages = () => driverPassPackages
export const getDriverMonthlyPasses = () => driverMonthlyPasses
export const getDriverReservations = () => driverReservations
export const getDriverCurrentUnpaidFee = () => driverCurrentUnpaidFee
export const getDriverPaymentMethods = () => driverPaymentMethods
export const getDriverPaymentHistory = () => driverPaymentHistory

// Simulate Park Vehicle & AI Recommendation flow for Driver
export const simulateParkVehicle = (licensePlate, vehicleType) => {
  const isEV = vehicleType === 'EV'
  const recommendedSlot = isEV ? 'EV-04' : 'B2-18'
  const floorZone = isEV ? 'Floor 1 · Zone C (EV Charging)' : 'Floor 2 · Zone B'

  return {
    success: true,
    message: `Vehicle ${licensePlate} recognized at Entry Gate A.`,
    session: {
      ticketCode: `TCK-2026-${Math.floor(100000 + Math.random() * 900000)}`,
      licensePlate,
      vehicleType,
      recommendedSlot,
      floorZone,
      aiConfidence: '98.5%',
      entryTime: new Date().toLocaleString(),
      status: 'Active',
      qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${licensePlate}`,
    },
  }
}

// Simulate Monthly Pass Registration
export const registerMonthlyPass = (data) => {
  if (!data.licensePlate || !data.packageId) {
    return { success: false, message: 'Please select your vehicle and pass package.' }
  }

  const pkg = driverPassPackages.find((p) => p.id === data.packageId)
  const newPass = {
    id: Date.now(),
    passCode: `MP-2026-${Math.floor(10000 + Math.random() * 90000)}`,
    licensePlate: data.licensePlate,
    vehicleName: data.licensePlate,
    package: pkg ? pkg.name : 'Monthly Pass',
    validFrom: new Date().toISOString().split('T')[0],
    validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    assignedZone: 'Floor 1, Zone C',
    status: 'Pending Approval',
    daysRemaining: 30,
    price: pkg ? pkg.price : 1500000,
    autoRenew: !!data.autoRenew,
  }

  return {
    success: true,
    message: 'Monthly pass application submitted successfully! Pending manager review.',
    pass: newPass,
  }
}

// Simulate Advance Reservation
export const makeReservation = (data) => {
  if (!data.licensePlate || !data.date || !data.timeWindow) {
    return { success: false, message: 'Please complete all reservation details.' }
  }

  const newReservation = {
    id: Date.now(),
    code: `RSV-2026-${Math.floor(10000 + Math.random() * 90000)}`,
    licensePlate: data.licensePlate,
    vehicleType: data.vehicleType || 'Car',
    slot: data.slot || 'B3-15',
    floorZone: data.floorZone || 'Floor 3 · Zone B',
    date: data.date,
    timeWindow: data.timeWindow,
    status: 'Confirmed',
    depositAmount: 20000,
    paymentStatus: 'Paid',
    qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=RSV-${Date.now()}`,
    notes: data.notes || 'Reserved via Driver Portal.',
  }

  return {
    success: true,
    message: 'Reservation created successfully! Slot status set to Reserved.',
    reservation: newReservation,
  }
}

// Simulate Pay Parking Fee
export const processFeePayment = (ticketCode, methodId) => {
  if (!ticketCode || !methodId) {
    return { success: false, message: 'Invalid payment parameters.' }
  }

  return {
    success: true,
    message: 'Payment completed successfully! Parking session closed & gate opening authorized.',
    receipt: {
      receiptId: `REC-2026-${Math.floor(100000 + Math.random() * 900000)}`,
      ticketCode,
      paidAt: new Date().toLocaleString(),
      amount: driverCurrentUnpaidFee.totalToPay,
      method: methodId.toUpperCase(),
      status: 'SUCCESS',
    },
  }
}
