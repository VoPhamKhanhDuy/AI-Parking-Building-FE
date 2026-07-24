import { managerProfileData } from '../../mock-data/managerProfile'

export { managerProfileData }

export async function fetchCurrentManagerProfile() {
  return { success: true, data: managerProfileData }
}

export async function changeManagerPasswordApi(currentPassword, newPassword) {
  return { success: true, message: 'Password updated successfully.' }
}

export async function getManagerProfile(managerId) {
  return fetchCurrentManagerProfile()
}

export async function changeManagerPassword(passwordData) {
  return changeManagerPasswordApi(passwordData.currentPassword, passwordData.newPassword)
}
