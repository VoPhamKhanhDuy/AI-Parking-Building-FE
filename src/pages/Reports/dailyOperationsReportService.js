import axios from 'axios'
import { dailyOperationsReportData } from '../../mock-data/dailyOperationsReportData'

export async function getDailyOperationsReport(reportId = 'RPT-2026-00012') {
  if (import.meta.env.VITE_USE_MOCK_DATA !== 'false') return Promise.resolve(dailyOperationsReportData)
  const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/manager/reports/${reportId}`)
  return data
}

export async function reviewDailyOperationsReport(reportId, action) {
  if (import.meta.env.VITE_USE_MOCK_DATA !== 'false') return Promise.resolve({ success: true, reportId, action })
  const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/manager/reports/${reportId}/reviews`, { action })
  return data
}
