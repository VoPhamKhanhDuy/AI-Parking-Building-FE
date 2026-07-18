import { api } from '../../core/api/apiClient'
import logger from '../../core/utils/logger'

export async function getUsers(params = {}) {
  try {
    const { data } = await api.get('/users', { params })
    return { success: true, data }
  } catch (error) {
    logger.error('Users', `Failed to load: ${error.message}`)
    return { success: false }
  }
}

export async function createUser(userData) {
  try {
    const { data } = await api.post('/users', userData)
    return { success: true, data }
  } catch (error) {
    logger.error('Users', `Failed to create: ${error.message}`)
    return { success: false, message: error.response?.data?.message || 'Failed to create' }
  }
}

export async function updateUser(id, userData) {
  try {
    const { data } = await api.put(`/users/${id}`, userData)
    return { success: true, data }
  } catch (error) {
    logger.error('Users', `Failed to update: ${error.message}`)
    return { success: false, message: error.response?.data?.message || 'Failed to update' }
  }
}

export async function deleteUser(id) {
  try {
    await api.delete(`/users/${id}`)
    return { success: true }
  } catch (error) {
    logger.error('Users', `Failed to delete: ${error.message}`)
    return { success: false, message: 'Failed to delete' }
  }
}

export async function getRoles() {
  try {
    const { data } = await api.get('/users/roles')
    return { success: true, data }
  } catch (error) {
    logger.error('Users', `Failed to get roles: ${error.message}`)
    return { success: false }
  }
}

// Mock data for development
export const initialUserKPIs = [
  { label: 'Total Users', value: 0, trend: 'up' },
  { label: 'Active Today', value: 0, trend: 'up' },
  { label: 'Admins', value: 0, trend: 'neutral' }
]

export const initialUsersList = []

export const rolePermissionMap = {
  Admin: ['All'],
  Manager: ['View', 'Edit'],
  Operator: ['View']
}

export const initialUserChanges = []

export async function updateUserStatus(id, status) {
  try {
    const { data } = await api.patch(`/users/${id}/status`, { status })
    return { success: true, data }
  } catch (error) {
    logger.error('Users', `Failed to update status: ${error.message}`)
    return { success: false }
  }
}
