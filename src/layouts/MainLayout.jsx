import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ROUTE_PATHS } from '../routes/routePaths'
import { formatCurrentTime } from '../pages/Dashboard/dashboardService'
import './MainLayout.css'

const navigationItems = [
  ['dashboard', 'Dashboard', ROUTE_PATHS.dashboard],
  ['login', 'Vehicle Entry', ROUTE_PATHS.vehicleEntry],
  ['map', 'Parking Map', '/parking-map'],
  ['logout', 'Vehicle Exit', ROUTE_PATHS.vehicleExit],
  ['payments', 'Payment', '/payment'],
  ['confirmation_number', 'Tickets', ROUTE_PATHS.tickets],
  ['apartment', 'Parking Structure', ROUTE_PATHS.parkingStructure],
  ['account_balance_wallet', 'Pricing Rules', ROUTE_PATHS.pricing],
  ['calendar_month', 'Monthly Pass', ROUTE_PATHS.monthlyPass],
  ['event_available', 'Reservation', ROUTE_PATHS.reservation],
  ['find_replace', 'Lost Ticket', ROUTE_PATHS.lostTicket],
  ['assessment', 'Reports', '/reports'],
  ['group', 'Users & Roles', '/users'],
  ['history', 'System Logs', ROUTE_PATHS.systemLogs],
]

function MainLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [openMenu, setOpenMenu] = useState(null)
  const [time, setTime] = useState(formatCurrentTime())
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    const timer = setInterval(() => setTime(formatCurrentTime()), 1000)
    return () => clearInterval(timer)
  }, [])

  const logout = () => navigate(ROUTE_PATHS.login)

  return (
    <div className="main-layout">
      {sidebarOpen && <button className="sidebar-overlay" aria-label="Close menu" onClick={() => setSidebarOpen(false)} />}
      <aside className={`sidebar${sidebarOpen ? ' open' : ''}`}>
        <div className="brand"><span className="brand-icon material-symbols-outlined">directions_car</span><div><strong>AI Command Center</strong><small>Parking Management System</small></div></div>
        <nav className="side-nav">
          {navigationItems.map(([icon, label, path]) => (
            <Link key={label} to={path} className={location.pathname === path ? 'active' : ''} onClick={() => setSidebarOpen(false)}>
              <span className="material-symbols-outlined">{icon}</span><span>{label}</span>
            </Link>
          ))}
        </nav>
      </aside>

      <header className="topbar">
        <div className="topbar-left">
          <button className="icon-button mobile-menu" aria-label="Open menu" onClick={() => setSidebarOpen(true)}><span className="material-symbols-outlined">menu</span></button>
          <span className="gate-pill"><i />Entry Gate A</span>
          <span className="clock"><span className="material-symbols-outlined">schedule</span>{time}</span>
          <div className="shift-info"><span><small>Current Shift</small><strong>Morning Shift</strong></span><span><small>Staff on Duty</small><strong>Active</strong></span></div>
        </div>
        <div className="topbar-actions">
          <div className="menu-anchor">
            <button className="icon-button" aria-label="Notifications" onClick={() => navigate(ROUTE_PATHS.notifications)}><span className="material-symbols-outlined">notifications</span><i className="notification-dot" /></button>
          </div>
          <div className="menu-anchor">
            <button className="icon-button" aria-label="Settings" onClick={() => setOpenMenu(openMenu === 'settings' ? null : 'settings')}><span className="material-symbols-outlined">settings</span></button>
            {openMenu === 'settings' && <div className="action-menu compact"><button onClick={() => navigate('/settings')}>System settings</button><button onClick={() => navigate(ROUTE_PATHS.profile)}>Account settings</button></div>}
          </div>
          <span className="top-divider" />
          <div className="menu-anchor">
            <button className="profile-button" onClick={() => setOpenMenu(openMenu === 'profile' ? null : 'profile')}><span><strong>Parking Staff</strong><small>Entry Gate Operator</small></span><b>A</b></button>
            {openMenu === 'profile' && <div className="action-menu compact profile-menu"><button onClick={() => navigate(ROUTE_PATHS.profile)}>View profile</button><button onClick={logout}>Sign out</button></div>}
          </div>
        </div>
      </header>
      <main className="layout-content">{children}</main>
    </div>
  )
}

export default MainLayout
