import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import LoginPage from '../pages/Login/LoginPage'
import DashboardPage from '../pages/Dashboard/DashboardPage'
import NotificationsPage from '../pages/Notifications/NotificationsPage'
import StaffProfilePage from '../pages/StaffProfile/StaffProfilePage'
import SystemLogPage from '../pages/SystemLog/SystemLogPage'
import { ROUTE_PATHS } from './routePaths'

function ComingSoonPage() {
  const location = useLocation()
  const title = location.pathname.slice(1).replaceAll('-', ' ') || 'Page'

  return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24, textAlign: 'center' }}>
      <div>
        <span className="material-symbols-outlined" style={{ fontSize: 48, color: '#004ac6' }}>construction</span>
        <h1 style={{ margin: '12px 0 6px', textTransform: 'capitalize' }}>{title}</h1>
        <p style={{ color: '#737686' }}>This screen is under development.</p>
        <a href={ROUTE_PATHS.dashboard} style={{ color: '#004ac6', fontWeight: 600 }}>Back to Dashboard</a>
      </div>
    </div>
  )
}

function AppRoutes() {
  return (
    <Routes>
      <Route path={ROUTE_PATHS.login} element={<LoginPage />} />
      <Route path={ROUTE_PATHS.dashboard} element={<DashboardPage />} />
      <Route path={ROUTE_PATHS.notifications} element={<NotificationsPage />} />
      <Route path={ROUTE_PATHS.profile} element={<StaffProfilePage />} />
      <Route path={ROUTE_PATHS.systemLogs} element={<SystemLogPage />} />
      <Route path="/not-found" element={<ComingSoonPage />} />
      <Route path="/*" element={<ComingSoonPage />} />
      <Route path="*" element={<Navigate to="/not-found" replace />} />
    </Routes>
  )
}

export default AppRoutes
