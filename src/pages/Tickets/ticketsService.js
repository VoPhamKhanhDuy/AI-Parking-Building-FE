import { mockTicketRecords } from '../../mock-data/vehicleExitData'

let ticketRecords = mockTicketRecords.map((record) => ({ ...record }))

export const getTicketRecords = () => ticketRecords.map((record) => ({ ...record }))

export const searchTicketRecords = (query = '') => {
  const cleanedQuery = query.trim().toLowerCase()
  if (!cleanedQuery) return getTicketRecords()

  return getTicketRecords().filter((record) =>
    record.ticketCode.toLowerCase().includes(cleanedQuery) || record.licensePlate.toLowerCase().includes(cleanedQuery)
  )
}
