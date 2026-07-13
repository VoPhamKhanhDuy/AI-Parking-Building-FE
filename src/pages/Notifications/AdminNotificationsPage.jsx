import { useState, useMemo, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getNotifications, filterNotifications, markNotificationRead, markAllNotificationsRead } from './notificationsService'
import { ROUTE_PATHS } from '../../routes/routePaths'
import { formatCurrentTime } from '../Dashboard/dashboardService'
import '../../layouts/MainLayout.css'

const defaultFilters = { search: '', type: 'All Types', status: 'All Statuses', shift: 'All Shifts' }

function AdminNotificationsPage() {
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState(getNotifications())
  const [selectedId, setSelectedId] = useState(notifications[0]?.id)
  const [filters, setFilters] = useState(defaultFilters)
  const [openMenu, setOpenMenu] = useState(null)
  const [time, setTime] = useState(() => formatCurrentTime ? formatCurrentTime() : new Date().toLocaleTimeString('en-GB'))

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(formatCurrentTime ? formatCurrentTime() : new Date().toLocaleTimeString('en-GB'))
    }, 1000)
    return () => clearInterval(timer)
  }, [])
  
  // Custom Toast state
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' })

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type })
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' })
    }, 3000)
  }

  const filteredItems = useMemo(() => filterNotifications(notifications, filters), [notifications, filters])
  const selected = filteredItems.find((item) => item.id === selectedId) || filteredItems[0]
  const unreadCount = notifications.filter((item) => item.status === 'Unread').length

  const updateFilter = (event) => {
    const { name, value } = event.target
    setFilters((current) => ({ ...current, [name]: value }))
  }

  const markSelectedRead = () => {
    if (selected) {
      setNotifications((items) => markNotificationRead(items, selected.id))
      showToast(`Đã đánh dấu thông báo "${selected.message}" là Đã đọc.`, 'success')
    }
  }

  const markAllRead = () => {
    if (!unreadCount) return
    setNotifications((items) => markAllNotificationsRead(items))
    showToast(`Đã đánh dấu toàn bộ ${unreadCount} thông báo là Đã đọc.`, 'success')
  }

  const logout = () => navigate(ROUTE_PATHS.login)

  return (
    <div className="bg-surface text-on-surface flex min-h-screen">
      
      {/* Dynamic styling for glass-card */}
      <style dangerouslySetInnerHTML={{__html: `
        .glass-card {
            background: white;
            border: 1px solid #e2e8f0;
            box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
        }
      `}} />

      {/* SideNavBar (Professional Dark) */}
      <aside className="fixed left-0 top-0 h-full w-[280px] z-40 overflow-y-auto bg-[#1e293b] flex flex-col">
        <div className="px-6 py-8 mb-4">
          <h1 className="text-headline-md font-headline-md font-bold text-white mb-1">AI Command Center</h1>
          <p className="text-slate-400 text-label-md font-label-md">System Administrator Portal</p>
        </div>
        <nav className="flex-1 px-4 space-y-4">
          <div>
            <div className="px-4 mb-2 text-slate-500 text-[10px] font-bold uppercase tracking-widest">Main</div>
            <a className="flex items-center gap-3 px-4 py-2 text-slate-300 hover:text-white transition-colors duration-200 hover:bg-white/5 rounded-lg mx-2 cursor-pointer" onClick={() => navigate(ROUTE_PATHS.adminDashboard)}>
              <span className="material-symbols-outlined text-[20px]">dashboard</span>
              <span className="font-body-md text-body-md">Admin Dashboard</span>
            </a>
          </div>
          <div>
            <div className="px-4 mb-2 text-slate-500 text-[10px] font-bold uppercase tracking-widest">Admin Control</div>
            <div className="space-y-1">
              <a className="flex items-center gap-3 px-4 py-2 text-slate-300 hover:text-white transition-colors duration-200 hover:bg-white/5 rounded-lg mx-2 cursor-pointer" onClick={() => navigate(ROUTE_PATHS.users)}>
                <span className="material-symbols-outlined text-[20px]">group</span>
                <span className="font-body-md text-body-md">Users &amp; Roles</span>
              </a>
              <a className="flex items-center gap-3 px-4 py-2 text-slate-300 hover:text-white transition-colors duration-200 hover:bg-white/5 rounded-lg mx-2 cursor-pointer" onClick={() => navigate(ROUTE_PATHS.auditLogs)}>
                <span className="material-symbols-outlined text-[20px]">list_alt</span>
                <span className="font-body-md text-body-md">Audit Logs</span>
              </a>
            </div>
          </div>
        </nav>
        <div className="p-6 mt-auto border-t border-slate-700/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded bg-primary/20 text-primary flex items-center justify-center font-bold text-sm">NA</div>
            <div>
              <p className="text-white text-body-sm font-medium">Nguyễn Văn Admin</p>
              <p className="text-slate-500 text-[11px] uppercase tracking-tight">System Admin</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 ml-[280px] flex flex-col min-w-0 bg-[#f7f9fc]">
        
        {/* TopNavBar */}
        <header className="h-14 flex items-center justify-between px-8 bg-white border-b border-outline-variant sticky top-0 z-30">
          <div className="flex items-center gap-8">
            <span className="gate-pill"><i></i>Building A</span>
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
            <div className="menu-anchor">
              <button className="icon-button" aria-label="Notifications" onClick={() => navigate(ROUTE_PATHS.adminNotifications)}>
                <span className="material-symbols-outlined">notifications</span>
                <i className="notification-dot" />
              </button>
            </div>
            <div className="menu-anchor">
              <button className="icon-button" aria-label="Settings" onClick={() => setOpenMenu(openMenu === 'settings' ? null : 'settings')}>
                <span className="material-symbols-outlined">settings</span>
              </button>
              {openMenu === 'settings' && (
                <div className="action-menu compact">
                  <button onClick={() => navigate(ROUTE_PATHS.adminProfile)}>Account settings</button>
                </div>
              )}
            </div>
            <span className="top-divider" />
            <div className="menu-anchor">
              <button className="profile-button" onClick={() => setOpenMenu(openMenu === 'profile' ? null : 'profile')}>
                <span><strong>Nguyễn Văn Admin</strong><small>System Admin</small></span>
                <b>A</b>
              </button>
              {openMenu === 'profile' && (
                <div className="action-menu compact profile-menu">
                  <button onClick={() => navigate(ROUTE_PATHS.adminProfile)}>View profile</button>
                  <button onClick={logout}>Sign out</button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content Canvas */}
        <div className="p-6 space-y-4 max-w-[1600px] mx-auto w-full">
          
          {/* Breadcrumb Heading */}
          <header className="space-y-1">
            <div className="flex items-center gap-2 text-body-sm text-on-surface-variant">
              <button className="hover:text-primary transition-colors text-body-sm text-on-surface-variant font-medium" onClick={() => navigate(ROUTE_PATHS.adminDashboard)}>Admin Dashboard</button>
              <span className="material-symbols-outlined text-[16px] text-on-surface-variant">chevron_right</span>
              <strong className="text-on-surface font-semibold text-body-sm">Notifications</strong>
            </div>
            <h2 className="font-headline-lg text-headline-lg text-on-surface">Notifications</h2>
            <p className="font-body-md text-body-md text-on-surface-variant mt-0.5">Review important alerts, gate events, system updates, and task lists.</p>
          </header>

          {/* Filters Bar */}
          <section className="glass-card p-4 rounded-lg flex flex-wrap items-center gap-3 bg-white">
            <div className="relative flex-1 min-w-[200px]">
              <input 
                name="search" 
                value={filters.search} 
                onChange={updateFilter} 
                className="w-full pl-9 pr-4 py-1.5 bg-surface-container-low border border-outline-variant rounded text-body-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none" 
                placeholder="Search plate, ticket, reservation..." 
              />
              <span className="material-symbols-outlined absolute left-2.5 top-2 text-on-surface-variant text-[18px]">search</span>
            </div>
            <select 
              name="type" 
              value={filters.type} 
              onChange={updateFilter}
              className="bg-surface-container-low border border-outline-variant rounded text-body-sm px-3 py-1.5 outline-none"
            >
              <option>All Types</option>
              <option>System Alert</option>
              <option>Gate Issue</option>
              <option>Payment Warning</option>
            </select>
            <select 
              name="status" 
              value={filters.status} 
              onChange={updateFilter}
              className="bg-surface-container-low border border-outline-variant rounded text-body-sm px-3 py-1.5 outline-none"
            >
              <option>All Statuses</option>
              <option>Unread</option>
              <option>Read</option>
            </select>
            <button 
              className="ml-auto bg-primary text-white px-4 py-1.5 rounded text-body-sm font-bold active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none" 
              onClick={markAllRead} 
              disabled={!unreadCount}
            >
              Mark All Read {unreadCount > 0 && <span className="ml-1 px-1.5 py-0.5 rounded bg-white text-primary text-[10px] font-bold">{unreadCount}</span>}
            </button>
          </section>

          {/* Core Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            
            {/* List Table */}
            <section className="lg:col-span-8 glass-card rounded-lg overflow-hidden bg-white">
              <div className="px-5 py-3 border-b border-outline-variant bg-white">
                <h3 className="font-body-lg font-bold text-on-surface m-0">Notification List</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-surface-container-lowest border-b border-outline-variant">
                    <tr>
                      <th className="px-4 py-2.5 font-label-md text-on-surface-variant uppercase text-[10px] tracking-widest font-bold">Time</th>
                      <th className="px-4 py-2.5 font-label-md text-on-surface-variant uppercase text-[10px] tracking-widest font-bold">Type</th>
                      <th className="px-4 py-2.5 font-label-md text-on-surface-variant uppercase text-[10px] tracking-widest font-bold">Message</th>
                      <th className="px-4 py-2.5 font-label-md text-on-surface-variant uppercase text-[10px] tracking-widest font-bold">Priority</th>
                      <th className="px-4 py-2.5 font-label-md text-on-surface-variant uppercase text-[10px] tracking-widest font-bold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant bg-white">
                    {filteredItems.map((item) => (
                      <tr 
                        key={item.id} 
                        className={`cursor-pointer transition-colors ${selected?.id === item.id ? 'bg-primary/5 font-medium' : 'hover:bg-surface-container-low/30'}`} 
                        onClick={() => setSelectedId(item.id)}
                      >
                        <td className="px-4 py-3 text-body-sm text-on-surface-variant">{item.time}</td>
                        <td className="px-4 py-3 text-body-sm text-on-surface-variant">{item.type}</td>
                        <td className="px-4 py-3 text-body-sm text-on-surface"><strong>{item.message}</strong></td>
                        <td className="px-4 py-3 text-body-sm">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            item.priority === 'High' ? 'bg-red-50 text-red-700' :
                            item.priority === 'Medium' ? 'bg-orange-50 text-orange-700' :
                            'bg-slate-100 text-slate-700'
                          }`}>{item.priority}</span>
                        </td>
                        <td className="px-4 py-3 text-body-sm">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            item.status === 'Unread' ? 'bg-blue-50 text-blue-700' :
                            'bg-slate-100 text-slate-600'
                          }`}>{item.status}</span>
                        </td>
                      </tr>
                    ))}
                    {!filteredItems.length && (
                      <tr>
                        <td className="px-4 py-6 text-center text-on-surface-variant" colSpan="5">No notifications match your filters.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Details Panel */}
            <aside className="lg:col-span-4 glass-card rounded-lg p-5 bg-white space-y-4">
              <h3 className="font-body-lg font-bold text-on-surface m-0 border-b border-outline-variant pb-2">Notification Detail</h3>
              {selected ? (
                <div className="space-y-4">
                  <div className="space-y-2 text-body-sm">
                    <div className="flex justify-between"><span className="text-on-surface-variant">Type</span><span className="font-semibold">{selected.type}</span></div>
                    <div className="flex justify-between"><span className="text-on-surface-variant">Priority</span><span className="font-semibold">{selected.priority}</span></div>
                    <div className="flex justify-between"><span className="text-on-surface-variant">Time</span><span className="font-semibold">{selected.fullTime}</span></div>
                    <div className="flex justify-between"><span className="text-on-surface-variant">Reference</span><span className="font-semibold">{selected.reference}</span></div>
                    <div className="flex justify-between"><span className="text-on-surface-variant">License Plate</span><span className="font-semibold">{selected.licensePlate || 'N/A'}</span></div>
                    <div className="flex justify-between"><span className="text-on-surface-variant">Status</span><span className="font-semibold uppercase text-primary">{selected.status}</span></div>
                  </div>
                  
                  <div className="p-3 bg-slate-50 border border-slate-100 rounded text-body-sm leading-relaxed font-medium text-on-surface-variant">
                    {selected.description}
                  </div>

                  <div className="pt-2">
                    <button 
                      className="w-full bg-[#1e293b] hover:bg-slate-800 text-white py-2 rounded text-body-sm font-bold transition-all active:scale-[0.98] disabled:opacity-50"
                      onClick={markSelectedRead}
                      disabled={selected.status === 'Read'}
                    >
                      {selected.status === 'Read' ? 'Đã đọc' : 'Đánh dấu Đã đọc'}
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-body-sm text-on-surface-variant text-center py-6">Chọn thông báo từ danh sách để xem chi tiết.</p>
              )}
            </aside>

          </div>

        </div>

      </main>

      {/* Global custom Toast */}
      {toast.show && (
        <div className={`profile-toast-custom ${toast.type || 'success'}`}>
          <span className="material-symbols-outlined">
            {toast.type === 'error' ? 'cancel' : 'check_circle'}
          </span>
          <span>{toast.message}</span>
        </div>
      )}

    </div>
  )
}

export default AdminNotificationsPage
