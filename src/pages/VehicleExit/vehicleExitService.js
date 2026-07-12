import {
  mockExitSessions,
  mockPaymentHistory,
  mockTicketRecords
} from '../../mock-data/vehicleExitData'

let exitSessions = mockExitSessions.map((session) => ({ ...session }))
let ticketRecords = mockTicketRecords.map((record) => ({ ...record }))
let paymentHistory = mockPaymentHistory.map((entry) => ({ ...entry }))

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const formatCurrency = (value) => new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND'
}).format(value)

export const getVehicleExitSessions = () => exitSessions.map((session) => ({ ...session }))

export const getPendingVehicleSessions = () => getVehicleExitSessions().filter((session) => session.paymentStatus === 'Pending')

export const getTicketRecords = () => ticketRecords.map((record) => ({ ...record }))

export const getPaymentHistory = () => paymentHistory.map((entry) => ({ ...entry }))

export const findVehicleExitSession = (value) => {
  const search = value?.trim().toUpperCase()
  if (!search) return null

  return exitSessions.find((session) => session.ticketCode.toUpperCase() === search || session.licensePlate.toUpperCase() === search) || null
}

export const getPaymentSummary = (session) => {
  if (!session) return null
  const total = session.baseFee + session.surcharge
  return {
    total,
    formattedTotal: formatCurrency(total),
    baseFee: formatCurrency(session.baseFee),
    surcharge: formatCurrency(session.surcharge)
  }
}

export const processVehicleExit = async (sessionId) => {
  await wait(900)
  const target = exitSessions.find((session) => session.id === sessionId)
  if (!target) return null

  target.status = 'Completed'
  target.paymentStatus = 'Paid'
  target.exitTime = new Date().toLocaleString('vi-VN', { hour12: false })

  const ticket = ticketRecords.find((record) => record.ticketCode === target.ticketCode)
  if (ticket) {
    ticket.status = 'Completed'
    ticket.paymentStatus = 'Paid'
    ticket.exitTime = target.exitTime
  }

  return { ...target }
}

export const processPayment = async (sessionId, method) => {
  await wait(900)
  const target = exitSessions.find((session) => session.id === sessionId)
  if (!target) return null

  target.paymentStatus = 'Paid'
  target.paymentMethod = method
  target.status = 'ReadyToExit'

  const ticket = ticketRecords.find((record) => record.ticketCode === target.ticketCode)
  if (ticket) {
    ticket.status = 'Ready to Exit'
    ticket.paymentStatus = 'Paid'
  }

  paymentHistory.unshift({
    id: paymentHistory.length + 1,
    ticketCode: target.ticketCode,
    licensePlate: target.licensePlate,
    amount: target.baseFee + target.surcharge,
    method,
    status: 'Completed',
    paidAt: new Date().toLocaleString('vi-VN', { hour12: false })
  })

  return { ...target }
}
