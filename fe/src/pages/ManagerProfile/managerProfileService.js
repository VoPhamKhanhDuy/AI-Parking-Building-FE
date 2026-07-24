import { api } from '../../core/api/apiClient'
import logger from '../../core/utils/logger'
import { managerProfileData } from '../../mock-data/managerProfile'

export { managerProfileData }

function getInitials(name) {
  if (!name) return 'MG'
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (!parts.length) return 'MG'
  return ((parts[0][0] || '') + (parts[parts.length - 1][0] || '')).toUpperCase()
}

export async function fetchCurrentManagerProfile() {
  try {
    const { data } = await api.get('/auth/me')
    if (data) {
      return {
        success: true,
        data: {
          ...managerProfileData,
          name: data.fullName || data.FullName || data.name || managerProfileData.name,
          email: data.email || data.Email || managerProfileData.email,
          phone: data.phoneNumber || data.phone || managerProfileData.phone,
          department: data.department || data.Department || managerProfileData.department,
          role: data.role || data.Role || managerProfileData.role,
          managerId: data.id ? `MGR-${String(data.id).slice(0, 8).toUpperCase()}` : managerProfileData.managerId,
          initials: getInitials(data.fullName || data.FullName || managerProfileData.name)
        }
      }
    }
    return { success: true, data: managerProfileData }
  } catch (error) {
    logger.warn('ManagerProfile', `Failed to fetch profile: ${error.message}. Operating in client mode.`)
    return { success: true, data: managerProfileData }
  }
}

export async function changeManagerPasswordApi(currentPassword, newPassword) {
  try {
    await api.post('/auth/change-password', { currentPassword, newPassword })
    return { success: true, message: 'Change password completed successfully.' }
  } catch (error) {
    logger.warn('ManagerProfile', `Failed to change password via API: ${error.message}`)
    return { success: false, message: error.response?.data?.message || 'Failed to update password.' }
  }
}

export async function getManagerProfile(managerId) {
  return fetchCurrentManagerProfile()
}

export async function changeManagerPassword(passwordData) {
  return changeManagerPasswordApi(passwordData.currentPassword, passwordData.newPassword)
}
