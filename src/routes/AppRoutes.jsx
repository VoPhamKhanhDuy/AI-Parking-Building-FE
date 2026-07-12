import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import LoginPage from '../pages/Login/LoginPage'
import DashboardPage from '../pages/Dashboard/DashboardPage'
import NotificationsPage from '../pages/Notifications/NotificationsPage'
import MonthlyPassPage from '../pages/MonthlyPass/MonthlyPassPage'
import ReservationPage from '../pages/Reservation/ReservationPage'
import StaffProfilePage from '../pages/StaffProfile/StaffProfilePage'
import SystemLogPage from '../pages/SystemLog/SystemLogPage'
import VehicleEntryPage from '../pages/VehicleEntry/VehicleEntryPage'
import ManualSlotPage from '../pages/VehicleEntry/ManualSlotPage'
import AIRecommendationPage from '../pages/AIRecommendation/AIRecommendationPage'
import CheckinSuccessPage from '../pages/VehicleEntry/CheckinSuccessPage'
import ParkingMapPage from '../pages/ParkingMap/ParkingMapPage'
import ParkingStructurePage from '../pages/ParkingStructure/ParkingStructurePage'
import PricingRulesPage from '../pages/PricingRules/PricingRulesPage'
import ReportsPage from '../pages/Reports/ReportsPage'
import DailyOperationsReportPage from '../pages/Reports/DailyOperationsReportPage'
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
      <Route path={ROUTE_PATHS.monthlyPass} element={<MonthlyPassPage />} />
      <Route path={ROUTE_PATHS.reservation} element={<ReservationPage />} />
      <Route path={ROUTE_PATHS.profile} element={<StaffProfilePage />} />
      <Route path={ROUTE_PATHS.systemLogs} element={<SystemLogPage />} />
      <Route path={ROUTE_PATHS.vehicleEntry} element={<VehicleEntryPage />} />
      <Route path={ROUTE_PATHS.manualSlot} element={<ManualSlotPage />} />
      <Route path={ROUTE_PATHS.aiRecommendation} element={<AIRecommendationPage />} />
      <Route path={ROUTE_PATHS.checkinSuccess} element={<CheckinSuccessPage />} />
      <Route path={ROUTE_PATHS.parkingMap} element={<ParkingMapPage />} />
      <Route path={ROUTE_PATHS.parkingStructure} element={<ParkingStructurePage />} />
      <Route path={ROUTE_PATHS.pricing} element={<PricingRulesPage />} />
      <Route path={ROUTE_PATHS.reports} element={<ReportsPage />} />
      <Route path={ROUTE_PATHS.dailyOperationsReport} element={<DailyOperationsReportPage />} />
      <Route path="/not-found" element={<ComingSoonPage />} />
      <Route path="/*" element={<ComingSoonPage />} />
      <Route path="*" element={<Navigate to="/not-found" replace />} />
    </Routes>
  )
}

export default AppRoutes
