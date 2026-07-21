import { getOperationalVehicle, operationalPayments } from './operationalRecords.js'

export const paymentTransactions = operationalPayments.map((payment) => ({
  ...payment,
  vehicleType: getOperationalVehicle(payment.licensePlate).vehicleType,
}))

export const paymentDashboardStats = { todayRevenue: 12850000, paidTransactions: 284, pendingPayments: 9, failedPayments: 3, refundRequests: 2 }
