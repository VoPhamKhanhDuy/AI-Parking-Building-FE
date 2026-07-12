import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import LoginPage from '../pages/Login/LoginPage'
import DashboardPage from '../pages/Dashboard/DashboardPage'
import AdminDashboardPage from '../pages/Dashboard/AdminDashboardPage'
import NotificationsPage from '../pages/Notifications/NotificationsPage'
import UsersRolesPage from '../pages/Users/UsersRolesPage'
import AuditLogsPage from '../pages/AuditLogs/AuditLogsPage'
import AdminProfilePage from '../pages/StaffProfile/AdminProfilePage'
import AdminNotificationsPage from '../pages/Notifications/AdminNotificationsPage'
import StaffProfilePage from '../pages/StaffProfile/StaffProfilePage'
import SystemLogPage from '../pages/SystemLog/SystemLogPage'
import VehicleEntryPage from '../pages/VehicleEntry/VehicleEntryPage'
import ManualSlotPage from '../pages/VehicleEntry/ManualSlotPage'
import AIRecommendationPage from '../pages/AIRecommendation/AIRecommendationPage'
import CheckinSuccessPage from '../pages/VehicleEntry/CheckinSuccessPage'
import ParkingMapPage from '../pages/ParkingMap/ParkingMapPage'
import VehicleExitPage from '../pages/VehicleExit/VehicleExitPage'
import ExitSuccessPage from '../pages/VehicleExit/ExitSuccessPage'
import PaymentPage from '../pages/Payment/PaymentPage'
import TicketsPage from '../pages/Tickets/TicketsPage'
import LostTicketPage from '../pages/LostTicket/LostTicketPage'
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
      <Route path={ROUTE_PATHS.adminDashboard} element={<AdminDashboardPage />} />
      <Route path={ROUTE_PATHS.users} element={<UsersRolesPage />} />
      <Route path={ROUTE_PATHS.auditLogs} element={<AuditLogsPage />} />
      <Route path={ROUTE_PATHS.adminNotifications} element={<AdminNotificationsPage />} />
      <Route path={ROUTE_PATHS.adminProfile} element={<AdminProfilePage />} />
      <Route path={ROUTE_PATHS.notifications} element={<NotificationsPage />} />
      <Route path={ROUTE_PATHS.profile} element={<StaffProfilePage />} />
      <Route path={ROUTE_PATHS.systemLogs} element={<SystemLogPage />} />
      <Route path={ROUTE_PATHS.vehicleEntry} element={<VehicleEntryPage />} />
      <Route path={ROUTE_PATHS.manualSlot} element={<ManualSlotPage />} />
      <Route path={ROUTE_PATHS.aiRecommendation} element={<AIRecommendationPage />} />
      <Route path={ROUTE_PATHS.checkinSuccess} element={<CheckinSuccessPage />} />
      <Route path={ROUTE_PATHS.parkingMap} element={<ParkingMapPage />} />
      <Route path={ROUTE_PATHS.vehicleExit} element={<VehicleExitPage />} />
      <Route path={ROUTE_PATHS.vehicleExitSuccess} element={<ExitSuccessPage />} />
      <Route path={ROUTE_PATHS.payment} element={<PaymentPage />} />
      <Route path={ROUTE_PATHS.tickets} element={<TicketsPage />} />
      <Route path={ROUTE_PATHS.lostTicket} element={<LostTicketPage />} />
      <Route path="/not-found" element={<ComingSoonPage />} />
      <Route path="/*" element={<ComingSoonPage />} />
      <Route path="*" element={<Navigate to="/not-found" replace />} />
    </Routes>
  )
}

export default AppRoutes
