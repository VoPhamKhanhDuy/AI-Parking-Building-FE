import { mockPaymentHistory } from '../../mock-data/vehicleExitData'

let paymentHistory = mockPaymentHistory.map((entry) => ({ ...entry }))

export const getPaymentHistory = () => paymentHistory.map((entry) => ({ ...entry }))
