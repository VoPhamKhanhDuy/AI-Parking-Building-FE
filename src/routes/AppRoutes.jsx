import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import { ROUTE_PATHS } from './routePaths';

// Real Page Components
import LoginPage from '../pages/Login/LoginPage';
import DashboardPage from '../pages/Dashboard/DashboardPage';
import ParkingStructurePage from '../pages/ParkingStructure/ParkingStructurePage';
import PricingPage from '../pages/Pricing/PricingPage';
import VehicleEntryPage from '../pages/VehicleEntry/VehicleEntryPage';
import VehicleExitPage from '../pages/VehicleExit/VehicleExitPage';
import TicketsPage from '../pages/Tickets/TicketsPage';
import SessionsPage from '../pages/Sessions/SessionsPage';
import MonthlyPassPage from '../pages/MonthlyPass/MonthlyPassPage';
import ReservationPage from '../pages/Reservation/ReservationPage';
import LostTicketPage from '../pages/LostTicket/LostTicketPage';
import SystemLogPage from '../pages/SystemLog/SystemLogPage';

// Simple Route Guard to protect layout routes and redirect unauthenticated users to /login
const RequireAuth = ({ children }) => {
  const user = localStorage.getItem('aps_user');
  if (!user) {
    return <Navigate to={ROUTE_PATHS.LOGIN} replace />;
  }
  return children;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Auth-protected layouts (unauthenticated) */}
      <Route path={ROUTE_PATHS.LOGIN} element={<LoginPage />} />

      {/* Main dashboard panel routes (requires authentication) */}
      <Route
        element={
          <RequireAuth>
            <MainLayout />
          </RequireAuth>
        }
      >
        <Route path={ROUTE_PATHS.DASHBOARD} element={<DashboardPage />} />
        <Route path={ROUTE_PATHS.PARKING_STRUCTURE} element={<ParkingStructurePage />} />
        <Route path={ROUTE_PATHS.PRICING} element={<PricingPage />} />
        <Route path={ROUTE_PATHS.VEHICLE_ENTRY} element={<VehicleEntryPage />} />
        <Route path={ROUTE_PATHS.VEHICLE_EXIT} element={<VehicleExitPage />} />
        <Route path={ROUTE_PATHS.TICKETS} element={<TicketsPage />} />
        <Route path={ROUTE_PATHS.SESSIONS} element={<SessionsPage />} />
        <Route path={ROUTE_PATHS.MONTHLY_PASS} element={<MonthlyPassPage />} />
        <Route path={ROUTE_PATHS.RESERVATION} element={<ReservationPage />} />
        <Route path={ROUTE_PATHS.LOST_TICKET} element={<LostTicketPage />} />
        <Route path={ROUTE_PATHS.SYSTEM_LOG} element={<SystemLogPage />} />
      </Route>

      {/* Fallback routing */}
      <Route path="*" element={<Navigate to={ROUTE_PATHS.DASHBOARD} replace />} />
    </Routes>
  );
};

export default AppRoutes;
