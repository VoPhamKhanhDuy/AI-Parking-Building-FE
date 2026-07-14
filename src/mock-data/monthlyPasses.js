import { getOperationalVehicle, operationalMonthlyPasses } from './operationalRecords.js'

export const monthlyPassStats = { activePasses: 286, expiringSoon: 18, pendingApproval: 7, verifiedToday: 42, expiredPasses: 12 }

export const monthlyPassItems = operationalMonthlyPasses.map((pass) => {
  const vehicle = getOperationalVehicle(pass.licensePlate)
  const passVehicleType = vehicle.vehicleType === 'Electric Vehicle' ? 'EV' : vehicle.vehicleType
  return { ...pass, driver: vehicle.ownerName, vehicleType: passVehicleType, passType: `Monthly ${passVehicleType} Pass` }
})

export const monthlyPassActivities = [
  { id: 1, time: '14:30', passCode: 'MP-2026-00128', licensePlate: '29B-87654', action: 'Pass verified at entry', staff: 'Parking Staff', status: 'Completed' },
  { id: 2, time: '13:25', passCode: 'MP-2026-00129', licensePlate: '77C-90211', action: 'Renewal reminder sent', staff: 'System', status: 'Expiring Soon' },
  { id: 3, time: '11:30', passCode: 'MP-2026-00131', licensePlate: '59A-77123', action: 'New pass submitted for approval', staff: 'Parking Staff', status: 'Pending Approval' },
  { id: 4, time: '10:15', passCode: 'MP-2026-00132', licensePlate: '43A-11229', action: 'Expired pass checked', staff: 'Parking Staff', status: 'Expired' },
]
