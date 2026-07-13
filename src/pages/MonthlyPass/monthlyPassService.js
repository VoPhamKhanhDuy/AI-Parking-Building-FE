import axios from 'axios'
import { monthlyPassActivities, monthlyPassItems, monthlyPassStats } from '../../mock-data/monthlyPasses'

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api', timeout: 8000 })
const useMockData = import.meta.env.VITE_USE_MOCK_DATA !== 'false'
const wait = (value, delay = 220) => new Promise((resolve) => setTimeout(() => resolve(value), delay))
let passes = monthlyPassItems.map((item) => ({ ...item }))

export async function getMonthlyPasses(params = {}) {
  if (!useMockData) {
    const { data } = await api.get('/monthly-passes', { params })
    return data.data || data
  }
  const query = params.search?.trim().toLocaleUpperCase('vi-VN')
  const items = passes.filter((item) => {
    const matchesQuery = !query || item.passCode.includes(query) || item.licensePlate.includes(query) || item.driver.toLocaleUpperCase('vi-VN').includes(query)
    const matchesStatus = !params.status || params.status === 'All Statuses' || item.status === params.status
    const matchesType = !params.vehicleType || params.vehicleType === 'All Types' || item.vehicleType === params.vehicleType
    return matchesQuery && matchesStatus && matchesType
  })
  return wait({ stats: { ...monthlyPassStats }, passes: items.map((item) => ({ ...item })), activities: monthlyPassActivities.map((item) => ({ ...item })) })
}

export async function verifyMonthlyPass(passId) {
  if (!useMockData) {
    const { data } = await api.post(`/monthly-passes/${passId}/verify`)
    return data.data || data
  }
  const pass = passes.find((item) => item.id === passId)
  if (!pass) throw new Error('Monthly pass not found.')
  if (pass.status === 'Expired') throw new Error('Expired passes must be renewed before verification.')
  if (pass.status === 'Pending Approval') throw new Error('This pass is waiting for manager approval.')
  pass.lastVerified = 'Just now'
  return wait({ ...pass })
}

export async function renewMonthlyPass(passId) {
  if (!useMockData) {
    const { data } = await api.post(`/monthly-passes/${passId}/renew`)
    return data.data || data
  }
  const pass = passes.find((item) => item.id === passId)
  if (!pass) throw new Error('Monthly pass not found.')
  pass.validFrom = '2026-08-01'
  pass.validUntil = '2026-08-31'
  pass.status = 'Active'
  pass.paymentStatus = 'Paid'
  return wait({ ...pass })
}

export async function updateMonthlyPassVehicle(passId, vehicle) {
  if (!useMockData) {
    const { data } = await api.patch(`/monthly-passes/${passId}/vehicle`, vehicle)
    return data.data || data
  }
  const pass = passes.find((item) => item.id === passId)
  if (!pass) throw new Error('Monthly pass not found.')
  pass.licensePlate = vehicle.licensePlate.trim().toUpperCase()
  pass.vehicleType = vehicle.vehicleType
  pass.passType = `Monthly ${vehicle.vehicleType} Pass`
  return wait({ ...pass })
}

export async function createMonthlyPass(payload) {
  if (!useMockData) {
    const { data } = await api.post('/monthly-passes', payload)
    return data.data || data
  }
  const id = Math.max(...passes.map((item) => item.id)) + 1
  const created = { id, passCode: `MP-2026-${String(id).padStart(5, '0')}`, licensePlate: payload.licensePlate.trim().toUpperCase(), driver: payload.driver.trim(), vehicleType: payload.vehicleType, passType: `Monthly ${payload.vehicleType} Pass`, validFrom: '2026-07-13', validUntil: '2026-08-12', status: 'Pending Approval', paymentStatus: 'Pending', assignedLocation: 'Pending assignment', lastVerified: 'Not verified' }
  passes = [created, ...passes]
  return wait({ ...created })
}

export async function requestPassSuspension(passId) {
  if (!useMockData) {
    const { data } = await api.post(`/monthly-passes/${passId}/suspension-requests`)
    return data.data || data
  }
  const pass = passes.find((item) => item.id === passId)
  if (!pass) throw new Error('Monthly pass not found.')
  return wait({ requestId: `MPR-${pass.id}`, passId, status: 'Pending Manager Approval' })
}
