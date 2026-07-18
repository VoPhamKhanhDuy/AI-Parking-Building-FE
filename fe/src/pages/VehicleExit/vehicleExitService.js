import { api } from '../../core/api/apiClient'
import logger from '../../core/utils/logger'

export async function getVehicleExit(licensePlate) {
  try {
    const { data } = await api.get('/parking-sessions/active-by-plate', {
      params: { licensePlate }
    })
    return { success: true, data }
  } catch {
    logger.error('VehicleExit', `Not found: ${licensePlate}`)
    return { success: false, message: 'No active session found' }
  }
}

export async function processVehicleExit(sessionId, exitTime) {
  try {
    const { data } = await api.post('/parking-sessions/end', {
      id: sessionId,
      exitTime
    })
    return { success: true, data }
  } catch (error) {
    logger.error('VehicleExit', `Exit failed: ${error.response?.data?.message || error.message}`)
    return { success: false, message: error.response?.data?.message || 'Exit failed' }
  }
}

// Additional functions
export async function lookupVehicleExitSession(sessionId) {
  try {
    const { data } = await api.get(`/parking-sessions/${sessionId}`)
    return { success: true, data }
  } catch {
    logger.error('VehicleExit', `Session not found: ${sessionId}`)
    return { success: false }
  }
}

export async function fetchVehicleExitData(licensePlate) {
  return getVehicleExit(licensePlate)
}

export async function checkExitPaymentStatus(sessionId) {
  try {
    const { data } = await api.get(`/parking-sessions/${sessionId}/payment-status`)
    return { success: true, data }
  } catch (error) {
    logger.error('VehicleExit', `Payment status check failed: ${error.message}`)
    return { success: false }
  }
}

export async function createExitPayment(paymentData) {
  try {
    const { data } = await api.post('/payments', paymentData)
    return { success: true, data }
  } catch (error) {
    logger.error('VehicleExit', `Payment creation failed: ${error.message}`)
    return { success: false }
  }
}

export async function getPaymentSummary(sessionId) {
  try {
    const { data } = await api.get(`/parking-sessions/${sessionId}/payment-summary`)
    return { success: true, data }
  } catch (error) {
    logger.error('VehicleExit', `Payment summary failed: ${error.message}`)
    return { success: false }
  }
}

export function calculateExitFee(durationMinutes, hourlyRate = 10000) {
  const hours = Math.ceil(durationMinutes / 60)
  return hours * hourlyRate
}
