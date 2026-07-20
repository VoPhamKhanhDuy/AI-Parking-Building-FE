import { Navigate, Outlet } from 'react-router-dom'
import { isAuthenticated, getUserRole } from '../services/authService'
import { ROUTE_PATHS } from './routePaths'
import { hasRoleAccess, getDashboardByRole } from './roleUtils'

// Higher-order component for protected routes
export function RequireAuth({ allowedRoles, children }) {
  const auth = isAuthenticated()
  console.log('RequireAuth - isAuthenticated:', auth)
  
  if (!auth) {
    return <Navigate to={ROUTE_PATHS.login} replace />
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const userRole = getUserRole()
    console.log('RequireAuth - userRole:', userRole, 'allowedRoles:', allowedRoles)
    if (!hasRoleAccess(userRole, allowedRoles)) {
      return <Navigate to={ROUTE_PATHS.login} replace />
    }
  }

  return children || <Outlet />
}

// Redirect authenticated users away from login
export function RedirectIfAuth({ children }) {
  const auth = isAuthenticated()
  console.log('RedirectIfAuth - isAuthenticated:', auth)
  
  if (auth) {
    const userRole = getUserRole()
    const redirectTo = getDashboardByRole(userRole)
    console.log('RedirectIfAuth - redirecting to:', redirectTo)
    return <Navigate to={redirectTo} replace />
  }

  return children || <Outlet />
}
