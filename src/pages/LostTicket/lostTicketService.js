import { mockLostTicketCases } from '../../mock-data/vehicleExitData'

let lostTicketCases = mockLostTicketCases.map((item) => ({ ...item }))

export const getLostTicketCases = () => lostTicketCases.map((item) => ({ ...item }))

export const processLostTicketCase = (caseId) => {
  const target = lostTicketCases.find((item) => item.id === caseId)
  if (!target) return null

  target.status = 'Processed'
  return { ...target }
}
