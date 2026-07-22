import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ROUTE_PATHS } from '../routes/routePaths'
import { formatCurrentTime } from '../pages/Dashboard/dashboardService'
import { useAuth } from '../contexts/useAuth'
import './MainLayout.css'
import './AdminLayout.css'

const adminControlItems = [
  ['group', 'Users & Roles', ROUTE_PATHS.users],
  ['list_alt', 'Audit Logs', ROUTE_PATHS.auditLogs],
]

function AdminLayout({ children }) {
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
    if (!name) return 'TV'
    return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
  }

  const getRoleDisplay = (role) => {
    const roleMap = {
      'Admin': 'System Admin',
      'SystemAdmin': 'System Admin',
    }
    return roleMap[role] || role || 'System Admin'
  }

  const isActive = (path) => {
    if (path === ROUTE_PATHS.adminDashboard) {
      return location.pathname === path
    }
    return location.pathname === path || location.pathname.startsWith(`${path}/`)
  }

  const userDisplayName = user?.fullName || user?.FullName || 'Trần Thanh Vân'

  return (
    <div className="main-layout admin-layout">
      {sidebarOpen && (
        <button
          className="sidebar-overlay"
          aria-label="Close menu"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={`sidebar${sidebarOpen ? ' open' : ''}`}>
        <div className="brand">
          <span className="brand-icon material-symbols-outlined">directions_car</span>
          <div>
            <strong>AI Command Center</strong>
            <small>System Administrator Portal</small>
          </div>
        </div>

        <nav className="side-nav">
          <small className="admin-nav-label">Main</small>
          <Link
            to={ROUTE_PATHS.adminDashboard}
            className={isActive(ROUTE_PATHS.adminDashboard) ? 'active' : ''}
            onClick={() => setSidebarOpen(false)}
          >
            <span className="material-symbols-outlined">dashboard</span>
            <span>Admin Dashboard</span>
          </Link>

          <small className="admin-nav-label">Admin Control</small>
          {adminControlItems.map(([icon, label, path]) => (
            <Link
              key={label}
              to={path}
              className={isActive(path) ? 'active' : ''}
              onClick={() => setSidebarOpen(false)}
            >
              <span className="material-symbols-outlined">{icon}</span>
              <span>{label}</span>
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
          <span className="gate-pill"><i />Building A</span>
          <span className="clock">
            <span className="material-symbols-outlined">schedule</span>
            {time}
          </span>
          <div className="shift-info">
            <span>
              <small>Operation Mode</small>
              <strong>Normal</strong>
            </span>
            <span>
              <small>System Status</small>
              <strong>Online</strong>
            </span>
          </div>
        </div>

        <div className="topbar-actions">
          <button
            className="icon-button"
            aria-label="Notifications"
            onClick={() => navigate(ROUTE_PATHS.adminNotifications || ROUTE_PATHS.notifications)}
          >
            <span className="material-symbols-outlined">notifications</span>
            <i className="notification-dot" />
          </button>
          <button
            className="icon-button"
            aria-label="Settings"
            onClick={() => navigate(ROUTE_PATHS.adminProfile)}
          >
            <span className="material-symbols-outlined">settings</span>
          </button>
          <span className="top-divider" />
          <div className="menu-anchor">
            <button className="profile-button" onClick={() => setOpenMenu(!openMenu)}>
              <span>
                <strong>{userDisplayName}</strong>
                <small>{getRoleDisplay(user?.role || user?.Role)}</small>
              </span>
              <b>{getInitials(userDisplayName)}</b>
            </button>
            {openMenu && (
              <div className="action-menu compact profile-menu admin-account-menu">
                <button onClick={() => { setOpenMenu(false); navigate(ROUTE_PATHS.adminProfile) }}>
                  <span className="material-symbols-outlined">person</span>
                  <span>View profile</span>
                </button>
                <button className="admin-sign-out" onClick={handleLogout}>
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

export default AdminLayout