import { ROUTE_PATHS } from './routePaths'

// Role hierarchy - higher roles have access to lower role routes
export const ROLE_HIERARCHY = {
  SystemAdmin: ['SystemAdmin', 'Admin', 'Manager', 'Operator', 'Attendant'],
  Admin: ['Admin', 'Manager', 'Operator', 'Attendant'],
  Manager: ['Manager', 'Operator', 'Attendant'],
  Operator: ['Operator', 'Attendant'],
  Attendant: ['Attendant'],
}

export const getAllowedRoles = (userRole) => {
  return ROLE_HIERARCHY[userRole] || [userRole]
}

export const hasRoleAccess = (userRole, allowedRoles) => {
  if (!allowedRoles || allowedRoles.length === 0) return true
  const userRoles = getAllowedRoles(userRole)
  return allowedRoles.some((role) => userRoles.includes(role))
}

export const getDashboardByRole = (role) => {
  if (role === 'Admin' || role === 'SystemAdmin') {
    return ROUTE_PATHS.adminDashboard
  }
  if (role === 'Manager') {
    return ROUTE_PATHS.managerDashboard
  }
  return ROUTE_PATHS.dashboard
}
