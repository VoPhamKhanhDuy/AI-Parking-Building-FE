import { staffProfileData } from '../../mock-data/staffProfile'
import { ROLE_CREDENTIALS } from '../../mock-data/users'

const PASSWORD_KEY = 'parking-staff-password-updated'

export const getStaffProfile = () => staffProfileData

export const changeStaffPassword = ({ currentPassword, newPassword, confirmPassword }) => {
  if (currentPassword !== ROLE_CREDENTIALS['Parking Staff'].password) return { success: false, message: 'Current password is incorrect.' }
  if (newPassword.length < 6) return { success: false, message: 'New password must contain at least 6 characters.' }
  if (newPassword === currentPassword) return { success: false, message: 'New password must be different from the current password.' }
  if (newPassword !== confirmPassword) return { success: false, message: 'Password confirmation does not match.' }

  localStorage.setItem(PASSWORD_KEY, new Date().toISOString())
  return { success: true, message: 'Password changed successfully.' }
}
