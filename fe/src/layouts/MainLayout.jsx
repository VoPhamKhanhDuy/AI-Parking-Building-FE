import { useState, useCallback } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ROUTE_PATHS } from '../routes/routePaths'
import { useAuth } from '../contexts/useAuth'
import { useClock } from '../hooks/useClock'
import './MainLayout.css'

const NAVIGATION_ITEMS = [
  { icon: 'login', label: 'Vehicle Entry', path: ROUTE_PATHS.vehicleEntry },
  { icon: 'psychology', label: 'AI Recommendation', path: ROUTE_PATHS.aiRecommendation },
  { icon: 'map', label: 'Parking Map', path: ROUTE_PATHS.parkingMap },
  { icon: 'logout', label: 'Vehicle Exit', path: ROUTE_PATHS.vehicleExit },
  { icon: 'payments', label: 'Payment', path: ROUTE_PATHS.payment },
  { icon: 'confirmation_number', label: 'Tickets', path: ROUTE_PATHS.tickets },
  { icon: 'calendar_month', label: 'Monthly Pass', path: ROUTE_PATHS.monthlyPass },
  { icon: 'event_available', label: 'Reservation', path: ROUTE_PATHS.reservation },
  { icon: 'find_replace', label: 'Lost Ticket', path: ROUTE_PATHS.lostTicket },
]

const ROLE_DISPLAY_MAP = {
  Admin: 'Administrator',
  SystemAdmin: 'System Admin',
  Manager: 'Facility Manager',
  Operator: 'Operator',
  Attendant: 'Parking Attendant',
}

const getRoleDisplay = (role) => ROLE_DISPLAY_MAP[role] || role || 'Staff'

const getInitials = (name) => {
  if (!name) return '?'
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function MainLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [openMenu, setOpenMenu] = useState(null)
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const time = useClock()

  const handleLogout = useCallback(async () => {
    await logout()
    navigate(ROUTE_PATHS.login, { replace: true })
  }, [logout, navigate])

  const toggleMenu = useCallback((menu) => {
    setOpenMenu((prev) => (prev === menu ? null : menu))
  }, [])

  const closeMenu = useCallback(() => {
    setOpenMenu(null)
  }, [])

  const closeSidebar = useCallback(() => {
    setSidebarOpen(false)
  }, [])

  const userDisplayName = user?.fullName || user?.FullName || user?.email || 'User'
  const userRole = user?.role || user?.Role
  const userInitials = getInitials(user?.fullName || user?.FullName || 'U')

  return (
    <div className="main-layout">
      {sidebarOpen && (
        <button
          className="sidebar-overlay"
          aria-label="Close menu"
          onClick={closeSidebar}
        />
      )}

      <aside className={`sidebar${sidebarOpen ? ' open' : ''}`}>
        <div className="brand">
          <span className="brand-icon material-symbols-outlined">directions_car</span>
          <div>
            <strong>AI Command Center</strong>
            <small>Parking Management System</small>
          </div>
        </div>

        <nav className="side-nav">
          {NAVIGATION_ITEMS.map((item) => (
            <Link
              key={item.label}
              to={item.path}
              className={location.pathname === item.path ? 'active' : ''}
              onClick={closeSidebar}
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
      </aside>

      <header className="topbar">
        <div className="topbar-left">
          <button
            className="icon-button mobile-menu"
            aria-label="Open menu"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="material-symbols-outlined">menu</span>
          </button>
          <span className="gate-pill">
            <i />
            Entry Gate A
          </span>
          <span className="clock">
            <span className="material-symbols-outlined">schedule</span>
            {time}
          </span>
          <div className="shift-info">
            <span>
              <small>Current Shift</small>
              <strong>Morning Shift</strong>
            </span>
            <span>
              <small>Staff on Duty</small>
              <strong>Active</strong>
            </span>
          </div>
        </div>

        <div className="topbar-actions">
          <div className="menu-anchor">
            <button
              className="profile-button"
              onClick={() => toggleMenu('profile')}
            >
              <span>
                <strong>{userDisplayName}</strong>
                <small>{getRoleDisplay(userRole)}</small>
              </span>
              <b>{userInitials}</b>
            </button>
            {openMenu === 'profile' && (
              <div className="action-menu compact profile-menu">
                <button onClick={() => { closeMenu(); navigate(ROUTE_PATHS.profile) }}>
                  View profile
                </button>
                <button onClick={handleLogout}>Sign out</button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="layout-content">{children}</main>
    </div>
  )
}

export default MainLayout
