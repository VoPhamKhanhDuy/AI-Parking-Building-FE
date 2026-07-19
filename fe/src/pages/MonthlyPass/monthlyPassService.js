import { api } from '../../core/api/apiClient'
import logger from '../../core/utils/logger'
import {
  sanitizeParams,
  stripUnsupportedParams,
  translateEnum,
  unwrapList,
  shapePass,
  PASS_STATUS_MAP,
} from '../../core/models/entities'

export { shapePass } from '../../core/models/entities'

export async function getMonthlyPasses(params = {}) {
  try {
    const out = { ...params }
    if (typeof out.status === 'string') {
      out.status = translateEnum(out.status, PASS_STATUS_MAP)
    }
    const safeParams = sanitizeParams(stripUnsupportedParams(out, null, ['vehicleType']))
    const { data } = await api.get('/monthly-passes', { params: safeParams })
    const rawPasses = Array.isArray(data) ? data
      : Array.isArray(data?.passes) ? data.passes
      : unwrapList(data)
    const activities = Array.isArray(data?.activities) ? data.activities : []
    const stats = data?.stats && typeof data.stats === 'object' ? data.stats : {}
    return { success: true, data: { passes: rawPasses.map(shapePass), activities, stats } }
  } catch (error) {
    logger.error('MonthlyPass', `Failed to load: ${error.message}`)
    return { success: false, data: { passes: [], activities: [], stats: {} }, error }
  }
}

export async function createMonthlyPass(passData) {
  try {
    const { data } = await api.post('/monthly-passes', passData)
    return { success: true, data: shapePass(data) }
  } catch (error) {
    logger.error('MonthlyPass', `Failed to create: ${error.message}`)
    return { success: false, message: error.response?.data?.message || 'Failed to create' }
  }
}

export async function verifyMonthlyPass(id) {
  try {
    const { data } = await api.post(`/monthly-passes/${id}/verify`)
    return { success: true, data: shapePass(data) }
  } catch (error) {
    logger.error('MonthlyPass', `Failed to verify: ${error.message}`)
    return { success: false }
  }
}

export async function renewMonthlyPass(id, renewalData) {
  try {
    const { data } = await api.post(`/monthly-passes/${id}/renew`, renewalData || {})
    return { success: true, data: shapePass(data) }
  } catch (error) {
    logger.error('MonthlyPass', `Failed to renew: ${error.message}`)
    return { success: false }
  }
}

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
    return { success: true, data: shapePass(data) }
  } catch (error) {
    logger.error('MonthlyPass', `Failed to update vehicle: ${error.message}`)
    return { success: false }
  }
}

export async function getMonthlyPassById(id) {
  try {
    const { data } = await api.get(`/monthly-passes/${id}`)
    return { success: true, data: shapePass(data) }
  } catch (error) {
    logger.error('MonthlyPass', `Failed to get: ${error.message}`)
    return { success: false }
  }
}

export async function approveMonthlyPass(id) {
  try {
    const { data } = await api.patch(`/monthly-passes/${id}/approve`)
    return { success: true, data: shapePass(data) }
  } catch (error) {
    logger.error('MonthlyPass', `Failed to approve: ${error.message}`)
    return { success: false }
  }
}
