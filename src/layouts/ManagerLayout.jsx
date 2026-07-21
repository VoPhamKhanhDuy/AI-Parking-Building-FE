import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ROUTE_PATHS } from '../routes/routePaths'
import { formatCurrentTime } from '../pages/Dashboard/dashboardService'
import './MainLayout.css'
import './ManagerLayout.css'

const managementItems = [
  ['apartment', 'Parking Structure', ROUTE_PATHS.parkingStructure],
  ['account_balance_wallet', 'Pricing Rules', ROUTE_PATHS.pricing],
  ['assessment', 'Reports', ROUTE_PATHS.reports],
  ['badge', 'Staff Activity', ROUTE_PATHS.staffActivity],
]

const managerNotifications = [
  { id: 1, title: 'High Occupancy Alert', desc: 'Zone B Floor 2 reached 92% capacity', time: '10 min ago', unread: true },
  { id: 2, title: 'Maintenance Complete', desc: 'EV Charger #3 in Zone C is back online', time: '45 min ago', unread: true },
  { id: 3, title: 'Shift Handover Ready', desc: 'Morning shift report has been generated', time: '2 hours ago', unread: false },
]

function ManagerLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [openMenu, setOpenMenu] = useState(null) // 'notifications' | 'settings' | 'profile' | null
  const [time, setTime] = useState(formatCurrentTime())
  const location = useLocation()
  const navigate = useNavigate()
  useEffect(() => { const timer = setInterval(() => setTime(formatCurrentTime()), 1000); return () => clearInterval(timer) }, [])
  return <div className="main-layout manager-layout">
    {sidebarOpen && <button className="sidebar-overlay" aria-label="Close menu" onClick={() => setSidebarOpen(false)}/>}
    <aside className={`sidebar${sidebarOpen?' open':''}`}>
      <div className="brand"><span className="brand-icon material-symbols-outlined">directions_car</span><div><strong>AI Command Center</strong><small>Parking Management System</small></div></div>
      <nav className="side-nav">
        <small className="manager-nav-label">Main</small>
        <Link to={ROUTE_PATHS.managerDashboard} className={location.pathname===ROUTE_PATHS.managerDashboard&&!location.hash?'active':''}><span className="material-symbols-outlined">dashboard</span><span>Manager Dashboard</span></Link>
        <small className="manager-nav-label">Management</small>
        {managementItems.map(([icon,label,path])=>{const [pathname,hash='']=path.split('#');const isReportsSection=pathname===ROUTE_PATHS.reports&&location.pathname.startsWith(`${ROUTE_PATHS.reports}/`);const active=(location.pathname===pathname&&location.hash===(hash?`#${hash}`:''))||isReportsSection;return <Link key={label} to={path} className={active?'active':''} onClick={()=>setSidebarOpen(false)}><span className="material-symbols-outlined">{icon}</span><span>{label}</span></Link>})}
      </nav>
    </aside>

    <header className="topbar">
      <div className="topbar-left">
        <button className="icon-button mobile-menu" onClick={()=>setSidebarOpen(true)}><span className="material-symbols-outlined">menu</span></button>
        <span className="gate-pill"><i/>Building A</span>
        <span className="clock"><span className="material-symbols-outlined">schedule</span>{time}</span>
        <div className="shift-info"><span><small>Operation Mode</small><strong>Normal</strong></span><span><small>System Status</small><strong>Online</strong></span></div>
      </div>
      <div className="topbar-actions">
        <div className="menu-anchor">
          <button className="icon-button" aria-label="Notifications" onClick={() => setOpenMenu(openMenu === 'notifications' ? null : 'notifications')}>
            <span className="material-symbols-outlined">notifications</span>
            <i className="notification-dot"/>
          </button>
          {openMenu === 'notifications' && (
            <div className="action-menu manager-notifications-menu" style={{ width: 280, right: 0, padding: '12px' }}>
              <div style={{ fontWeight: 'bold', fontSize: 13, marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Facility Alerts</span>
                <small style={{ color: '#2563eb' }}>3 New</small>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {managerNotifications.map((item) => (
                  <div key={item.id} style={{ padding: '8px', borderRadius: 6, background: '#f8fafc', borderLeft: item.unread ? '3px solid #2563eb' : 'none' }}>
                    <div style={{ fontWeight: 600, fontSize: 12, color: '#1e293b' }}>{item.title}</div>
                    <div style={{ fontSize: 11, color: '#64748b', margin: '2px 0' }}>{item.desc}</div>
                    <div style={{ fontSize: 10, color: '#94a3b8' }}>{item.time}</div>
                  </div>
                ))}
              </div>
              <button style={{ marginTop: 10, width: '100%', padding: '6px', fontSize: 11, fontWeight: 'bold', color: '#2563eb', border: '1px solid #e2e8f0', borderRadius: 6, background: '#fff', cursor: 'pointer' }} onClick={() => { setOpenMenu(null); navigate(ROUTE_PATHS.reports); }}>
                View All Reports
              </button>
            </div>
          )}
        </div>

        <div className="menu-anchor">
          <button className="icon-button" aria-label="Settings" onClick={() => setOpenMenu(openMenu === 'settings' ? null : 'settings')}>
            <span className="material-symbols-outlined">settings</span>
          </button>
          {openMenu === 'settings' && (
            <div className="action-menu compact manager-account-menu">
              <button onClick={() => { setOpenMenu(null); navigate(ROUTE_PATHS.managerProfile); }}>
                <span className="material-symbols-outlined">person</span>
                <span>Manager Profile</span>
              </button>
              <button onClick={() => { setOpenMenu(null); navigate(ROUTE_PATHS.pricing); }}>
                <span className="material-symbols-outlined">sell</span>
                <span>Pricing Rules</span>
              </button>
              <button className="manager-sign-out" onClick={() => navigate(ROUTE_PATHS.login)}>
                <span className="material-symbols-outlined">logout</span>
                <span>Sign out</span>
              </button>
            </div>
          )}
        </div>

        <span className="top-divider"/>

        <div className="menu-anchor">
          <button className="profile-button" onClick={() => setOpenMenu(openMenu === 'profile' ? null : 'profile')}>
            <span><strong>Parking Facility Manager</strong><small>Operations Manager</small></span>
            <b>M</b>
          </button>
          {openMenu === 'profile' && (
            <div className="action-menu compact profile-menu manager-account-menu">
              <button onClick={() => { setOpenMenu(null); navigate(ROUTE_PATHS.managerProfile); }}>
                <span className="material-symbols-outlined">person</span>
                <span>View profile</span>
              </button>
              <button className="manager-sign-out" onClick={() => navigate(ROUTE_PATHS.login)}>
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
}
export default ManagerLayout
