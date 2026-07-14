import axios from 'axios'
import { staffActivityData } from '../../mock-data/staffActivityData'

export async function getStaffActivity() {
  if (import.meta.env.VITE_USE_MOCK_DATA !== 'false') return Promise.resolve(staffActivityData)
  const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/manager/staff-activity`)
  return data
}

export async function submitStaffActivityAction(action, payload = {}) {
  if (import.meta.env.VITE_USE_MOCK_DATA !== 'false') return Promise.resolve({ success: true, action, ...payload })
  const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/manager/staff-activity/actions`, { action, ...payload })
  return data
}
