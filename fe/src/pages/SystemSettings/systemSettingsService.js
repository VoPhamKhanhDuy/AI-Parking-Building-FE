import { api } from '../../core/api/apiClient'
import logger from '../../core/utils/logger'

export const defaultSystemSettings = {
  facilityName: 'AI Parking Building A',
  operatingMode: 'Normal',
  totalCapacityLimit: 450,
  passwordExpirationDays: 90,
  failedLockoutThreshold: 5,
  sessionTimeoutMinutes: 30,
  aiConfidenceThreshold: 88,
  autoCheckInApproval: true,
  logRetentionDays: 365,
  exportFormat: 'CSV',
}

/**
 * Fetch current system settings from Backend GET /api/system-settings
 */
export async function fetchSystemSettings() {
  try {
    const { data } = await api.get('/system-settings')
    if (data) {
      return { success: true, data: { ...defaultSystemSettings, ...data } }
    }
    return { success: false, data: defaultSystemSettings }
  } catch (error) {
    logger.warn('SystemSettingsService', `Backend GET /system-settings failed: ${error.message}. Operating in LocalStorage mode.`)
    return { success: false, data: defaultSystemSettings }
  }
}

/**
 * Update system configuration parameters via Backend PUT /api/system-settings
 */
export async function updateSystemSettingsApi(settings) {
  try {
    const { data } = await api.put('/system-settings', settings)
    return { success: true, data: { ...defaultSystemSettings, ...data } }
  } catch (error) {
    logger.warn('SystemSettingsService', `Backend PUT /system-settings failed: ${error.message}. Operating in LocalStorage mode.`)
    return { success: false, error: error.message }
  }
}
