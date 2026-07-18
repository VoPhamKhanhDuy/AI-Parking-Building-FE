import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/useAuth'
import { ROUTE_PATHS } from './routePaths'
import { RequireAuth, RedirectIfAuth } from './AuthGuard'

// Lazy-loaded page imports
import LoginPage from '../pages/Login/LoginPage'
import AdminDashboardPage from '../pages/Dashboard/AdminDashboardPage'
import ManagerDashboardPage from '../pages/ManagerDashboard/ManagerDashboardPage'
import ManagerProfilePage from '../pages/ManagerProfile/ManagerProfilePage'
import ParkingStructurePage from '../pages/ParkingStructure/ParkingStructurePage'
import PricingRulesPage from '../pages/Pricing/PricingRulesPage'
import ReportsManagementPage from '../pages/Reports/ReportsManagementPage'
import DailyOperationsReportPage from '../pages/Reports/DailyOperationsReportPage'
import StaffActivityPage from '../pages/StaffActivity/StaffActivityPage'
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
import MonthlyPassPage from '../pages/MonthlyPass/MonthlyPassPage'
import LostTicketPage from '../pages/LostTicket/LostTicketPage'
import ReservationPage from '../pages/Reservation/ReservationPage'

// Loading spinner component
function LoadingScreen() {
  return (
    <div className="loading-screen">
      <div className="loading-content">
        <div className="spinner" />
        <p>Loading...</p>
      </div>
    </div>
  )
}

// Coming soon page
function ComingSoonPage() {
  const location = useLocation()
  const title = location.pathname.slice(1).replaceAll('-', ' ') || 'Page'

  return (
    <div className="coming-soon-page">
      <div className="coming-soon-content">
        <span className="material-symbols-outlined">construction</span>
        <h1 style={{ textTransform: 'capitalize' }}>{title}</h1>
        <p>This screen is under development.</p>
        <a href={ROUTE_PATHS.dashboard}>Back to Dashboard</a>
      </div>
    </div>
  )
}

// Role-based dashboard redirect
function DashboardRedirect() {
  const { user } = useAuth()
  const role = user?.role

  if (role === 'Admin' || role === 'SystemAdmin') {
    return <Navigate to={ROUTE_PATHS.adminDashboard} replace />
  }
  if (role === 'Manager') {
    return <Navigate to={ROUTE_PATHS.managerDashboard} replace />
  }
  return <Navigate to={ROUTE_PATHS.dashboard} replace />
}

// Role constants
const ROLES = {
  ADMIN: ['Admin', 'SystemAdmin'],
  MANAGER: ['Admin', 'Manager', 'SystemAdmin'],
  STAFF: ['Admin', 'Manager', 'Operator', 'Attendant'],
  OPERATOR: ['Admin', 'Manager', 'Operator', 'SystemAdmin'],
  ALL_AUTH: [], // No role restriction
}

function AppRoutes() {
  const { loading } = useAuth()

  if (loading) {
    return <LoadingScreen />
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route
        path={ROUTE_PATHS.login}
        element={
          <RedirectIfAuth>
            <LoginPage />
          </RedirectIfAuth>
        }
      />

      {/* Protected routes - All authenticated users */}
      <Route
        path={ROUTE_PATHS.dashboard}
        element={
          <RequireAuth>
            <DashboardRedirect />
          </RequireAuth>
        }
      />

      {/* Admin dashboard */}
      <Route
        path={ROUTE_PATHS.adminDashboard}
        element={
          <RequireAuth allowedRoles={ROLES.ADMIN}>
            <AdminDashboardPage />
          </RequireAuth>
        }
      />

      {/* Manager dashboard */}
      <Route
        path={ROUTE_PATHS.managerDashboard}
        element={
          <RequireAuth allowedRoles={ROLES.MANAGER}>
            <ManagerDashboardPage />
          </RequireAuth>
        }
      />

      {/* Staff profile */}
      <Route
        path={ROUTE_PATHS.profile}
        element={
          <RequireAuth>
            <StaffProfilePage />
          </RequireAuth>
        }
      />

      {/* Manager profile */}
      <Route
        path={ROUTE_PATHS.managerProfile}
        element={
          <RequireAuth allowedRoles={ROLES.MANAGER}>
            <ManagerProfilePage />
          </RequireAuth>
        }
      />

      {/* Admin profile */}
      <Route
        path={ROUTE_PATHS.adminProfile}
        element={
          <RequireAuth allowedRoles={ROLES.ADMIN}>
            <AdminProfilePage />
          </RequireAuth>
        }
      />

      {/* Parking operations - Staff+ */}
      <Route
        path={ROUTE_PATHS.vehicleEntry}
        element={
          <RequireAuth allowedRoles={ROLES.STAFF}>
            <VehicleEntryPage />
          </RequireAuth>
        }
      />
      <Route
        path={ROUTE_PATHS.manualSlot}
        element={
          <RequireAuth>
            <ManualSlotPage />
          </RequireAuth>
        }
      />
      <Route
        path={ROUTE_PATHS.checkinSuccess}
        element={
          <RequireAuth>
            <CheckinSuccessPage />
          </RequireAuth>
        }
      />
      <Route
        path={ROUTE_PATHS.aiRecommendation}
        element={
          <RequireAuth>
            <AIRecommendationPage />
          </RequireAuth>
        }
      />
      <Route
        path={ROUTE_PATHS.vehicleExit}
        element={
          <RequireAuth>
            <VehicleExitPage />
          </RequireAuth>
        }
      />
      <Route
        path={ROUTE_PATHS.vehicleExitSuccess}
        element={
          <RequireAuth>
            <ExitSuccessPage />
          </RequireAuth>
        }
      />

      {/* Parking management - Manager+ */}
      <Route
        path={ROUTE_PATHS.parkingStructure}
        element={
          <RequireAuth allowedRoles={ROLES.MANAGER}>
            <ParkingStructurePage />
          </RequireAuth>
        }
      />
      <Route
        path={ROUTE_PATHS.parkingMap}
        element={
          <RequireAuth allowedRoles={ROLES.OPERATOR}>
            <ParkingMapPage />
          </RequireAuth>
        }
      />

      {/* Billing & Payments - Staff+ */}
      <Route
        path={ROUTE_PATHS.payment}
        element={
          <RequireAuth allowedRoles={ROLES.STAFF}>
            <PaymentPage />
          </RequireAuth>
        }
      />
      <Route
        path={ROUTE_PATHS.pricing}
        element={
          <RequireAuth allowedRoles={ROLES.ADMIN}>
            <PricingRulesPage />
          </RequireAuth>
        }
      />
      <Route
        path={ROUTE_PATHS.tickets}
        element={
          <RequireAuth allowedRoles={ROLES.OPERATOR}>
            <TicketsPage />
          </RequireAuth>
        }
      />

      {/* Monthly Pass & Reservations - All authenticated */}
      <Route
        path={ROUTE_PATHS.monthlyPass}
        element={
          <RequireAuth>
            <MonthlyPassPage />
          </RequireAuth>
        }
      />
      <Route
        path={ROUTE_PATHS.reservation}
        element={
          <RequireAuth>
            <ReservationPage />
          </RequireAuth>
        }
      />
      <Route
        path={ROUTE_PATHS.lostTicket}
        element={
          <RequireAuth>
            <LostTicketPage />
          </RequireAuth>
        }
      />

      {/* Reports - Manager+ */}
      <Route
        path={ROUTE_PATHS.reports}
        element={
          <RequireAuth allowedRoles={ROLES.MANAGER}>
            <ReportsManagementPage />
          </RequireAuth>
        }
      />
      <Route
        path={ROUTE_PATHS.dailyOperationsReport}
        element={
          <RequireAuth allowedRoles={ROLES.MANAGER}>
            <DailyOperationsReportPage />
          </RequireAuth>
        }
      />
      <Route
        path={ROUTE_PATHS.staffActivity}
        element={
          <RequireAuth>
            <StaffActivityPage />
          </RequireAuth>
        }
      />

      {/* Notifications - All authenticated */}
      <Route
        path={ROUTE_PATHS.notifications}
        element={
          <RequireAuth>
            <NotificationsPage />
          </RequireAuth>
        }
      />
      <Route
        path={ROUTE_PATHS.adminNotifications}
        element={
          <RequireAuth allowedRoles={ROLES.MANAGER}>
            <AdminNotificationsPage />
          </RequireAuth>
        }
      />

      {/* Admin only */}
      <Route
        path={ROUTE_PATHS.users}
        element={
          <RequireAuth allowedRoles={ROLES.ADMIN}>
            <UsersRolesPage />
          </RequireAuth>
        }
      />
      <Route
        path={ROUTE_PATHS.auditLogs}
        element={
          <RequireAuth allowedRoles={ROLES.ADMIN}>
            <AuditLogsPage />
          </RequireAuth>
        }
      />
      <Route
        path={ROUTE_PATHS.systemLogs}
        element={
          <RequireAuth allowedRoles={ROLES.ADMIN}>
            <SystemLogPage />
          </RequireAuth>
        }
      />

      {/* Fallback routes */}
      <Route path="/not-found" element={<ComingSoonPage />} />
      <Route path="*" element={<Navigate to={ROUTE_PATHS.login} replace />} />
    </Routes>
  )
}

export default AppRoutes
