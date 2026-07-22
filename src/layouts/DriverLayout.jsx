import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ROUTE_PATHS } from '../routes/routePaths'
import { driverProfile, driverVehicles } from '../mock-data/driverData'
import './DriverLayout.css'

const navItems = [
  { path: ROUTE_PATHS.driverPortal, label: 'Dashboard', icon: 'dashboard' },
  { path: ROUTE_PATHS.driverParkVehicle, label: 'Park Vehicle', icon: 'local_parking' },
  { path: ROUTE_PATHS.driverReceiveTicket, label: 'Tickets & Pay Fee', icon: 'confirmation_number' },
  { path: ROUTE_PATHS.driverMonthlyPass, label: 'Monthly Pass', icon: 'calendar_month' },
  { path: ROUTE_PATHS.driverReservation, label: 'Reservation', icon: 'event_available' },
]

function DriverLayout({ children }) {
  const location = useLocation()
  const navigate = useNavigate()
  const [selectedVehicle, setSelectedVehicle] = useState(driverVehicles[0].licensePlate)
  const [profileMenuOpen, setProfileMenuOpen] = useState(false)

  const handleLogout = () => {
    navigate(ROUTE_PATHS.login)
  }

  return (
    <div className="driver-layout">
      {/* Top Header */}
      <header className="driver-topbar">
        <div className="driver-brand">
          <Link to={ROUTE_PATHS.driverPortal} className="brand-logo">
            <span className="material-symbols-outlined logo-icon">directions_car</span>
            <div className="brand-text">
              <strong>Driver Portal</strong>
              <small>AI Parking Member</small>
            </div>
          </Link>
        </div>

        <div className="driver-header-center">
          <div className="vehicle-selector">
            <span className="material-symbols-outlined selector-icon">directions_car</span>
            <select
              value={selectedVehicle}
              onChange={(e) => setSelectedVehicle(e.target.value)}
              title="Select Active Vehicle"
            >
              {driverVehicles.map((v) => (
                <option key={v.licensePlate} value={v.licensePlate}>
                  {v.licensePlate} ({v.brand} {v.model})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="driver-header-actions">
          <button
            className="driver-icon-btn"
            title="Notifications"
            onClick={() => navigate(ROUTE_PATHS.notifications)}
          >
            <span className="material-symbols-outlined">notifications</span>
            <span className="badge-dot" />
          </button>

          <div className="driver-profile-wrap">
            <button
              className="driver-profile-btn"
              onClick={() => setProfileMenuOpen((prev) => !prev)}
            >
              <img src={driverProfile.avatar} alt={driverProfile.name} className="driver-avatar" />
              <div className="driver-profile-info">
                <strong>{driverProfile.name}</strong>
                <small>{driverProfile.membershipTier}</small>
              </div>
              <span className="material-symbols-outlined">expand_more</span>
            </button>

            {profileMenuOpen && (
              <div className="driver-dropdown-menu">
                <div className="dropdown-user-header">
                  <strong>{driverProfile.name}</strong>
                  <p>{driverProfile.email}</p>
                  <span className="tier-badge">{driverProfile.membershipTier} · {driverProfile.rewardPoints} Pts</span>
                </div>
                <hr />
                <button onClick={() => { setProfileMenuOpen(false); navigate(ROUTE_PATHS.driverPortal) }}>
                  <span className="material-symbols-outlined">person</span> Driver Profile
                </button>
                <button onClick={() => { setProfileMenuOpen(false); navigate(ROUTE_PATHS.driverReceiveTicket) }}>
                  <span className="material-symbols-outlined">qr_code_2</span> My Active Ticket
                </button>
                <button onClick={() => { setProfileMenuOpen(false); navigate(ROUTE_PATHS.driverPayFee) }}>
                  <span className="material-symbols-outlined">receipt_long</span> Payment Receipts
                </button>
                <hr />
                <button className="logout-btn" onClick={handleLogout}>
                  <span className="material-symbols-outlined">logout</span> Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="driver-body">
        {/* Desktop Sidebar */}
        <aside className="driver-sidebar">
          <nav className="driver-nav-list">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`driver-nav-link ${isActive ? 'active' : ''}`}
                >
                  <span className="material-symbols-outlined">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </nav>

          <div className="driver-sidebar-footer">
            <div className="support-card">
              <span className="material-symbols-outlined">support_agent</span>
              <div>
                <strong>Need Parking Help?</strong>
                <small>Call Hotline 1900 8888</small>
              </div>
            </div>
          </div>
        </aside>

        {/* Page Content */}
        <main className="driver-content">{children}</main>
      </div>

      {/* Mobile Bottom Nav */}
      <nav className="driver-bottom-nav">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`bottom-nav-item ${isActive ? 'active' : ''}`}
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              <span className="bottom-nav-label">{item.label}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}

export default DriverLayout
