import { dailyOperationsDetail, reportCategories, reportList, reportsOverview } from '../../mock-data/reports'

export const getReportsOverview = () => reportsOverview
export const getReportCategories = () => reportCategories
export const getReportList = () => reportList
export const getDailyOperationsDetail = () => dailyOperationsDetail

export const filterReports = (items, { query, type }) => {
  const keyword = query.trim().toLowerCase()

  return items.filter((item) => {
    const matchesSearch = !keyword || [item.name, item.range, item.generatedBy, item.status]
      .some((value) => value.toLowerCase().includes(keyword))
    const matchesType = type === 'All Types' || item.type === type

    return matchesSearch && matchesType
  })
}
