import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ROUTE_PATHS } from '../routes/routePaths'
import { formatCurrentTime } from '../pages/Dashboard/dashboardService'
import { useAuth } from '../contexts/useAuth'
import './MainLayout.css'
import './ManagerLayout.css'

const managementItems = [
  ['apartment', 'Parking Structure', ROUTE_PATHS.parkingStructure],
  ['account_balance_wallet', 'Pricing Rules', ROUTE_PATHS.pricing],
  ['assessment', 'Reports', ROUTE_PATHS.reports],
  ['badge', 'Staff Activity', ROUTE_PATHS.staffActivity],
]

function ManagerLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [openMenu, setOpenMenu] = useState(false)
  const [time, setTime] = useState(formatCurrentTime())
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  useEffect(() => {
    const timer = setInterval(() => setTime(formatCurrentTime()), 1000)
    return () => clearInterval(timer)
  }, [])

  const handleLogout = async () => {
    await logout()
    navigate(ROUTE_PATHS.login, { replace: true })
  }

  const getInitials = (name) => {
    if (!name) return '?'
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  const getRoleDisplay = (role) => {
    const roleMap = {
      'Admin': 'Administrator',
      'SystemAdmin': 'System Admin',
      'Manager': 'Facility Manager',
      'Operator': 'Operator',
      'Attendant': 'Attendant',
    }
    return roleMap[role] || role || 'Manager'
  }

  return (
    <div className="main-layout manager-layout">
      {sidebarOpen && <button className="sidebar-overlay" aria-label="Close menu" onClick={() => setSidebarOpen(false)} />}
      <aside className={`sidebar${sidebarOpen ? ' open' : ''}`}>
        <div className="brand">
          <span className="brand-icon material-symbols-outlined">directions_car</span>
          <div><strong>AI Command Center</strong><small>Parking Management System</small></div>
        </div>
        <nav className="side-nav">
          <small className="manager-nav-label">Main</small>
          <Link
            to={ROUTE_PATHS.managerDashboard}
            className={location.pathname === ROUTE_PATHS.managerDashboard && !location.hash ? 'active' : ''}
          >
            <span className="material-symbols-outlined">dashboard</span>
            <span>Manager Dashboard</span>
          </Link>
          <small className="manager-nav-label">Management</small>
          {managementItems.map(([icon, label, path]) => {
            const [pathname, hash = ''] = path.split('#')
            const isReportsSection = pathname === ROUTE_PATHS.reports && location.pathname.startsWith(`${ROUTE_PATHS.reports}/`)
            const active = (location.pathname === pathname && location.hash === (hash ? `#${hash}` : '')) || isReportsSection
            return (
              <Link
                key={label}
                to={path}
                className={active ? 'active' : ''}
                onClick={() => setSidebarOpen(false)}
              >
                <span className="material-symbols-outlined">{icon}</span>
                <span>{label}</span>
              </Link>
            )
          })}
        </nav>
      </aside>

      <header className="topbar">
        <div className="topbar-left">
          <button className="icon-button mobile-menu" onClick={() => setSidebarOpen(true)}>
            <span className="material-symbols-outlined">menu</span>
          </button>
          <span className="gate-pill"><i />Building A</span>
          <span className="clock"><span className="material-symbols-outlined">schedule</span>{time}</span>
          <div className="shift-info">
            <span><small>Operation Mode</small><strong>Normal</strong></span>
            <span><small>System Status</small><strong>Online</strong></span>
          </div>
        </div>
        <div className="topbar-actions">
          <button className="icon-button" onClick={() => navigate(ROUTE_PATHS.notifications)}>
            <span className="material-symbols-outlined">notifications</span>
            <i className="notification-dot" />
          </button>
          <button className="icon-button" onClick={() => navigate(ROUTE_PATHS.managerProfile)}>
            <span className="material-symbols-outlined">settings</span>
          </button>
          <span className="top-divider" />
          <div className="menu-anchor">
            <button className="profile-button" onClick={() => setOpenMenu(!openMenu)}>
              <span>
                <strong>{user?.fullName || user?.FullName || user?.email || 'Manager'}</strong>
                <small>{getRoleDisplay(user?.role || user?.Role)}</small>
              </span>
              <b>{getInitials(user?.fullName || user?.FullName || 'M')}</b>
            </button>
            {openMenu && (
              <div className="action-menu compact profile-menu manager-account-menu">
                <button onClick={() => { setOpenMenu(false); navigate(ROUTE_PATHS.managerProfile) }}>
                  <span className="material-symbols-outlined">person</span>
                  <span>View profile</span>
                </button>
                <button className="manager-sign-out" onClick={handleLogout}>
                  <span className="material-symbols-outlined">logout</span>
                  <span>Sign out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>
      <main className="layout-content">{children}</main>
    </div>
  )
}

export default ManagerLayout
