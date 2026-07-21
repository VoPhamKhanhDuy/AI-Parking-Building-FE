import { systemLogData } from '../../mock-data/systemLogs'

export const getSystemLogData = () => systemLogData

export const getLogModules = (logs) => [...new Set(logs.map((log) => log.module))]

export const filterSystemLogs = (logs, filters) => {
  const keyword = filters.search.trim().toLowerCase()

  return logs.filter((log) => {
    const matchesSearch = !keyword || [log.activity, log.reference, log.staff, log.licensePlate, log.ticketCode, log.receiptId]
      .some((value) => value.toLowerCase().includes(keyword))
    const matchesModule = filters.module === 'All Modules' || log.module === filters.module
    const matchesStatus = filters.status === 'All Statuses' || log.status === filters.status
    const matchesPeriod = filters.period === 'Last 7 Days' || filters.period === 'Today' || log.shift === 'Current Shift'

    return matchesSearch && matchesModule && matchesStatus && matchesPeriod
  })
}
