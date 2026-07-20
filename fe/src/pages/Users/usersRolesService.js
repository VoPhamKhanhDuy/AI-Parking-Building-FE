import { api } from '../../core/api/apiClient'
import logger from '../../core/utils/logger'
import {
  safeArray,
  unwrapList,
  shapeUser,
} from '../../core/models/entities'

export { shapeUser } from '../../core/models/entities'

export async function getUsers() {
  try {
    const { data } = await api.get('/users')
    return { success: true, data: unwrapList(data).map(shapeUser).filter(Boolean) }
  } catch (error) {
    logger.error('Users', `Failed to load: ${error.message}`)
    return { success: false, data: [], error }
  }
}

export async function createUser(userData) {
  try {
    const { data } = await api.post('/users', userData)
    return { success: true, data: shapeUser(data) }
  } catch (error) {
    logger.error('Users', `Failed to create: ${error.message}`)
    return { success: false, message: error.response?.data?.message || 'Failed to create user' }
  }
}

export async function updateUser(id, userData) {
  try {
    const { data } = await api.put(`/users/${id}`, userData)
    return { success: true, data: shapeUser(data) }
  } catch (error) {
    logger.error('Users', `Failed to update: ${error.message}`)
    return { success: false, message: error.response?.data?.message || 'Failed to update user' }
  }
}

export async function deleteUser(id) {
  try {
    await api.delete(`/users/${id}`)
    return { success: true }
  } catch (error) {
    logger.error('Users', `Failed to delete: ${error.message}`)
    return { success: false, message: 'Failed to delete user' }
  }
}

export async function updateUserStatus(id, status) {
  try {
    const { data } = await api.patch(`/users/${id}/status`, { status })
    return { success: true, data: shapeUser(data) }
  } catch (error) {
    logger.error('Users', `Failed to update status: ${error.message}`)
    return { success: false }
  }
}

export async function getRoles() {
  return { success: true, data: safeArray([]) }
}

export const initialUserKPIs = {
  totalAccounts: 0,
  activeAccounts: 0,
  suspendedAccounts: 0,
  pendingInvitations: 0,
}
export const initialUsersList = []
export const initialUserChanges = []
export const rolePermissionMap = {
  Admin: { allowed: 'All modules', limited: '—', denied: '—' },
  Manager: { allowed: 'View / Edit', limited: 'Pricing rules', denied: 'Admin-only modules' },
  Operator: { allowed: 'View', limited: 'Reports', denied: 'User management' },
}
