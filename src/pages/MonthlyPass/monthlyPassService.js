import { defaultMonthlyPassDetail, monthlyPassActivities, monthlyPassList, monthlyPassOverview } from '../../mock-data/monthlyPass'

export const getMonthlyPassOverview = () => monthlyPassOverview
export const getMonthlyPasses = () => monthlyPassList
export const getMonthlyPassDetail = () => defaultMonthlyPassDetail
export const getMonthlyPassActivity = () => monthlyPassActivities

export const filterMonthlyPasses = (items, { query, status, type, payment }) => {
  const keyword = query.trim().toLowerCase()

  return items.filter((item) => {
    const matchesSearch = !keyword || [item.passCode, item.plate, item.driver, item.location]
      .some((value) => value.toLowerCase().includes(keyword))
    const matchesStatus = status === 'All Statuses' || item.status === status
    const matchesType = type === 'All Types' || item.type === type
    const matchesPayment = payment === 'All Payments' || item.payment === payment

    return matchesSearch && matchesStatus && matchesType && matchesPayment
  })
}
