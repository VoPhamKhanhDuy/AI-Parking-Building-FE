import axios from 'axios'
import { reportsData } from '../../mock-data/reportsData'

export async function getReports() {
  if (import.meta.env.VITE_USE_MOCK_DATA !== 'false') return Promise.resolve(reportsData)
  const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/manager/reports`)
  return data
}

export async function exportReport(reportId, exportType) {
  if (import.meta.env.VITE_USE_MOCK_DATA !== 'false') return Promise.resolve({ success: true, reportId, exportType })
  const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/manager/reports/${reportId}/exports`, { exportType })
  return data
}
