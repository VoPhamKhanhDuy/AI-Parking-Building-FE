import { api } from '../../core/api/apiClient'
import logger from '../../core/utils/logger'
import { getVehicleTypes } from '../../services/vehicleService'
import {
  sanitizeParams,
  stripUnsupportedParams,
  translateEnum,
  unwrapList,
  shapePass,
  PASS_STATUS_MAP,
} from '../../core/models/entities'

export { shapePass } from '../../core/models/entities'

const VEHICLE_TYPE_LABEL_BY_CATEGORY = {
  Car: 'Car',
  Motorbike: 'Motorbike',
  Motorcycle: 'Motorbike',
  ElectricVehicle: 'Electric Vehicle',
  EV: 'Electric Vehicle',
}

let vehicleTypeCache = null

async function loadVehicleTypeMap() {
  if (!vehicleTypeCache) {
    const result = await getVehicleTypes()
    const list = Array.isArray(result?.data)
      ? result.data
      : Array.isArray(result?.data?.items)
        ? result.data.items
        : []
    vehicleTypeCache = list.map((t) => ({
      id: t.id || t.Id,
      name: t.name || t.Name,
      category: t.category ?? t.Category,
    }))
  }
  return vehicleTypeCache
}

async function resolveVehicleTypeId(category) {
  if (!category) throw new Error('Vehicle type is required.')
  const map = await loadVehicleTypeMap()
  const label = VEHICLE_TYPE_LABEL_BY_CATEGORY[category] || category
  const match = map.find(
    (t) => (t.name || '').toLowerCase() === String(label).toLowerCase() || t.category === category
  )
  if (!match) throw new Error(`VehicleType not seeded for "${category}".`)
  return match.id
}

function defaultValidity() {
  const now = new Date()
  const validFrom = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0))
  const validUntil = new Date(validFrom)
  validUntil.setUTCMonth(validUntil.getUTCMonth() + 1)
  return { validFrom: validFrom.toISOString(), validUntil: validUntil.toISOString() }
}

function extractErrorMessage(error, fallback) {
  const data = error?.response?.data
  const candidate = data?.message ?? data?.error ?? data?.title ?? data?.Message ?? data?.Error
  if (typeof candidate === 'string') return candidate
  if (candidate && typeof candidate === 'object') return candidate.message || candidate.error || fallback
  return error?.message || fallback
}

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
    const vehicleTypeId = await resolveVehicleTypeId(passData.vehicleType)
    const validity = defaultValidity()
    const payload = {
      licensePlate: String(passData.licensePlate || '').trim().toUpperCase(),
      vehicleTypeId,
      driverName: String(passData.driver || passData.driverName || '').trim(),
      driverEmail: passData.driverEmail || undefined,
      driverPhone: passData.driverPhone || undefined,
      validFrom: passData.validFrom || validity.validFrom,
      validUntil: passData.validUntil || validity.validUntil,
    }
    const { data } = await api.post('/monthly-passes', payload)
    return { success: true, data: shapePass(data) }
  } catch (error) {
    const message = extractErrorMessage(error, 'Failed to create pass')
    logger.error('MonthlyPass', `Failed to create: ${message}`)
    return { success: false, message }
  }
}

export async function verifyMonthlyPass(id) {
  try {
    const { data } = await api.post(`/monthly-passes/${id}/verify`)
    return { success: true, data: shapePass(data) }
  } catch (error) {
    const message = extractErrorMessage(error, 'Failed to verify')
    logger.error('MonthlyPass', `Failed to verify: ${message}`)
    return { success: false, message }
  }
}

export async function renewMonthlyPass(id, renewalData) {
  try {
    const { data } = await api.post(`/monthly-passes/${id}/renew`, renewalData || {})
    return { success: true, data: shapePass(data) }
  } catch (error) {
    const message = extractErrorMessage(error, 'Failed to renew')
    logger.error('MonthlyPass', `Failed to renew: ${message}`)
    return { success: false, message }
  }
}

export async function requestPassSuspension(passId, reason) {
  try {
    const { data } = await api.post(`/monthly-passes/${passId}/suspension-requests`, { reason })
    return { success: true, data }
  } catch (error) {
    const message = extractErrorMessage(error, 'Failed to request suspension')
    logger.error('MonthlyPass', `Failed to request suspension: ${message}`)
    return { success: false, message }
  }
}

export async function updateMonthlyPassVehicle(passId, vehicleData) {
  try {
    const vehicleTypeId = await resolveVehicleTypeId(vehicleData.vehicleType)
    const payload = {
      licensePlate: String(vehicleData.licensePlate || '').trim().toUpperCase(),
      vehicleTypeId,
    }
    const { data } = await api.patch(`/monthly-passes/${passId}/vehicle`, payload)
    return { success: true, data: shapePass(data) }
  } catch (error) {
    const message = extractErrorMessage(error, 'Failed to update vehicle')
    logger.error('MonthlyPass', `Failed to update vehicle: ${message}`)
    return { success: false, message }
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
