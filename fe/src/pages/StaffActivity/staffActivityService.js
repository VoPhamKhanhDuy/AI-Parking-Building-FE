import { api } from '../../core/api/apiClient'
import logger from '../../core/utils/logger'
import {
  normalizeFields,
  sanitizeParams,
  shapeStaff,
  WORKLOAD_SCHEMA,
  FALLBACK_STAFF,
} from '../../core/models/entities'

export async function getStaffActivities(params = {}) {
  try {
    const safeParams = sanitizeParams(params)
    const { data } = await api.get('/staff-activities', { params: safeParams })
    const rawStaff = Array.isArray(data?.staff)
      ? data.staff
      : Array.isArray(data?.Staff) ? data.Staff : []
    const staff = rawStaff.map(shapeStaff)
    const seen = new Set()
    const workload = (Array.isArray(data?.workload) ? data.workload : Array.isArray(data?.Workload) ? data.Workload : [])
      .map((w) => normalizeFields(w, WORKLOAD_SCHEMA))
      .filter((w) => {
        if (!w.area || seen.has(w.area)) return false
        seen.add(w.area)
        return true
      })
    return {
      staff,
      summaries: data?.summaries || data?.Summaries || FALLBACK_STAFF.summaries,
      shift: data?.shift || data?.Shift || FALLBACK_STAFF.shift,
      workload,
      pendingReviews: data?.pendingReviews || FALLBACK_STAFF.pendingReviews,
      activities: data?.activities || FALLBACK_STAFF.activities,
      managerNote: data?.managerNote || FALLBACK_STAFF.managerNote,
    }
  } catch (error) {
    logger.warn('StaffActivity', `getStaffActivities fallback: ${error.message}`)
    return { ...FALLBACK_STAFF }
  }
}

export async function submitStaffActivityAction(action, payload) {
  try {
    await api.post('/staff-activities', { ...payload, action })
    return { success: true }
  } catch (error) {
    logger.warn('StaffActivity', `submitStaffActivityAction: ${error.message}`)
    return { success: false }
  }
}

export const getStaffActivity = getStaffActivities
