import { api } from '../../core/api/apiClient'
import logger from '../../core/utils/logger'

export async function getMonthlyPasses(params = {}) {
  try {
    const { data } = await api.get('/monthly-passes', { params })
    return { success: true, data }
  } catch (error) {
    logger.error('MonthlyPass', `Failed to load: ${error.message}`)
    return { success: false }
  }
}

export async function createMonthlyPass(passData) {
  try {
    const { data } = await api.post('/monthly-passes', passData)
    return { success: true, data }
  } catch (error) {
    logger.error('MonthlyPass', `Failed to create: ${error.message}`)
    return { success: false, message: error.response?.data?.message || 'Failed to create' }
  }
}

export async function verifyMonthlyPass(id) {
  try {
    const { data } = await api.post(`/monthly-passes/${id}/verify`)
    return { success: true, data }
  } catch (error) {
    logger.error('MonthlyPass', `Failed to verify: ${error.message}`)
    return { success: false }
  }
}

export async function renewMonthlyPass(id, renewalData) {
  try {
    const { data } = await api.post(`/monthly-passes/${id}/renew`, renewalData)
    return { success: true, data }
  } catch (error) {
    logger.error('MonthlyPass', `Failed to renew: ${error.message}`)
    return { success: false }
  }
}

// Additional functions
export async function requestPassSuspension(passId, reason) {
  try {
    const { data } = await api.post(`/monthly-passes/${passId}/suspension-requests`, { reason })
    return { success: true, data }
  } catch (error) {
    logger.error('MonthlyPass', `Failed to request suspension: ${error.message}`)
    return { success: false }
  }
}

export async function updateMonthlyPassVehicle(passId, vehicleData) {
  try {
    const { data } = await api.patch(`/monthly-passes/${passId}/vehicle`, vehicleData)
    return { success: true, data }
  } catch (error) {
    logger.error('MonthlyPass', `Failed to update vehicle: ${error.message}`)
    return { success: false }
  }
}

export async function getMonthlyPassById(id) {
  try {
    const { data } = await api.get(`/monthly-passes/${id}`)
    return { success: true, data }
  } catch (error) {
    logger.error('MonthlyPass', `Failed to get: ${error.message}`)
    return { success: false }
  }
}

export async function approveMonthlyPass(id) {
  try {
    const { data } = await api.patch(`/monthly-passes/${id}/approve`)
    return { success: true, data }
  } catch (error) {
    logger.error('MonthlyPass', `Failed to approve: ${error.message}`)
    return { success: false }
  }
}
