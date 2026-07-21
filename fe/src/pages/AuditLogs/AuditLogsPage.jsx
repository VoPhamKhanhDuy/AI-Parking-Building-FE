import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { initialAuditKPIs, initialAuditRecords, initialSecurityEvents } from './auditLogsService'
import { ROUTE_PATHS } from '../../routes/routePaths'
import '../../layouts/MainLayout.css'

function AuditLogsPage() {
  const navigate = useNavigate()

  // Real-time states
  const [kpis, setKpis] = useState(initialAuditKPIs)
  const [records] = useState(initialAuditRecords)
  const [securityEvents] = useState(initialSecurityEvents)
  const [selectedLogId, setSelectedLogId] = useState('AUD-2026-00128')
  const [openMenu, setOpenMenu] = useState(null)

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('')
  const [actionFilter, setActionFilter] = useState('All Actions')
  const [resultFilter, setResultFilter] = useState('All Results')

  // Selected Log Record Detail
  const selectedLog = records.find((r) => r.id === selectedLogId) || records[0] || {
    id: 'AUD-2026-00128',
    timestamp: 'N/A',
    action: 'Role Authorization Updated',
    target: 'Nguyễn Văn An',
    performedBy: 'System Administrator',
    origin: '192.168.1.14',
    result: 'Success',
    resultClass: 'bg-green-50 text-green-700',
    description: 'Parking Staff role permissions were reviewed and updated according to the current access policy.'
  }

  // Filter logs list
  const filteredRecords = records.filter((r) => {
    const matchesSearch = r.action.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          r.target.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          r.performedBy.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          r.origin.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesAction = actionFilter === 'All Actions' || r.action.includes(actionFilter)
    const matchesResult = resultFilter === 'All Results' || r.result === resultFilter

    return matchesSearch && matchesAction && matchesResult
  })

  // Professional Toast State
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' })

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type })
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' })
    }, 3000)
  }

  // Action: Mark Reviewed
  const handleMarkReviewed = () => {
    showToast(`Đã đánh dấu nhật ký kiểm toán ${selectedLog.id} là Đã kiểm duyệt (Reviewed) thành công!`, 'success')
    
    // Decrement pending review count
    setKpis((prev) => ({
      ...prev,
      pendingReviews: Math.max(0, prev.pendingReviews - 1)
    }))
  }

  // Action: View Target User
  const handleViewTargetUser = () => {
    navigate(ROUTE_PATHS.users)
  }

  // Action: Export Record
  const handleExportRecord = () => {
    showToast(`Đang xuất dữ liệu chi tiết của log record ${selectedLog.id} sang định dạng JSON/CSV...`, 'success')
  }

  // Action: Export All Logs
  const handleExportAll = () => {
    showToast(`Đang xuất toàn bộ ${filteredRecords.length} dòng dữ liệu nhật ký kiểm toán hôm nay...`, 'success')
  }

  // List of filters
  const uniqueActions = ['All Actions', 'Role', 'Reset', 'Suspension', 'Login', 'Invitation']
  const uniqueResults = ['All Results', 'Success', 'Pending', 'Failed', 'Sent']

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
      <aside className="fixed left-0 top-0 h-full w-[240px] z-40 overflow-y-auto bg-[#1e293b] flex flex-col">
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
              <a className="flex items-center gap-3 px-4 py-2 text-white bg-primary rounded-lg mx-2 transition-all duration-200" href="#">
                <span className="material-symbols-outlined text-[20px]">list_alt</span>
                <span className="font-body-md text-body-md font-medium">Audit Logs</span>
              </a>
            </div>
          </div>
        </nav>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 ml-[240px] flex flex-col min-w-0">
        
        {/* TopNavBar */}
        <header className="h-14 flex items-center justify-between px-8 bg-white border-b border-outline-variant sticky top-0 z-30">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2 text-on-surface-variant font-label-md">
              <span className="w-2 h-2 rounded-full bg-primary"></span>
              <span>System Control</span>
            </div>
            <div className="h-4 w-px bg-outline-variant"></div>
            <div className="flex items-center gap-2 text-on-surface-variant font-label-md">
              <span className="material-symbols-outlined text-[18px]">verified_user</span>
              <span>Security Mode: Normal</span>
            </div>
            <div className="h-4 w-px bg-outline-variant"></div>
            <div className="flex items-center gap-2 text-on-surface-variant font-label-md">
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
              <span>System Status: Online</span>
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
          </div>
        </header>

        {/* Content Canvas */}
        <div className="p-4 space-y-4 max-w-[1280px] mx-auto w-full">
          
          {/* Page Header */}
          <section>
            <h2 className="font-headline-md text-headline-md text-on-surface">Audit Logs</h2>
            <p className="font-body-md text-body-md text-on-surface-variant mt-0.5">Review administrative actions, account changes, access events, and security-related activities.</p>
          </section>

          {/* KPI Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="glass-card p-4 rounded-lg">
              <div className="flex items-center justify-between mb-1">
                <p className="text-on-surface-variant font-label-md uppercase tracking-wider text-[11px]">Total Logs Today</p>
                <span className="material-symbols-outlined text-on-surface-variant text-[18px]">history</span>
              </div>
              <p className="text-2xl font-bold text-on-surface">{kpis.totalLogsToday}</p>
            </div>
            <div className="glass-card p-4 rounded-lg border-l-4 border-green-500">
              <div className="flex items-center justify-between mb-1">
                <p className="text-on-surface-variant font-label-md uppercase tracking-wider text-[11px]">Successful Actions</p>
                <span className="material-symbols-outlined text-green-600 text-[18px]">check_circle</span>
              </div>
              <p className="text-2xl font-bold text-on-surface">{kpis.successfulActions}</p>
            </div>
            <div className="glass-card p-4 rounded-lg border-l-4 border-secondary">
              <div className="flex items-center justify-between mb-1">
                <p className="text-on-surface-variant font-label-md uppercase tracking-wider text-[11px]">Pending Reviews</p>
                <span className="material-symbols-outlined text-secondary text-[18px]">pending</span>
              </div>
              <p className="text-2xl font-bold text-on-surface">{kpis.pendingReviews}</p>
            </div>
            <div className="glass-card p-4 rounded-lg border-l-4 border-error">
              <div className="flex items-center justify-between mb-1">
                <p className="text-on-surface-variant font-label-md uppercase tracking-wider text-[11px]">Failed Attempts</p>
                <span className="material-symbols-outlined text-error text-[18px]">error</span>
              </div>
              <p className="text-2xl font-bold text-on-surface">{kpis.failedAttempts}</p>
            </div>
          </div>

          {/* Main Section */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            
            {/* Left: User & Role Overview */}
            <div className="lg:col-span-8 space-y-4">
              
              {/* Filter controls panel */}
              <div className="glass-card rounded-lg p-4 flex flex-wrap items-center gap-3 mb-4 bg-white">
                <div className="relative flex-1 min-w-[200px]">
                  <input 
                    className="w-full pl-9 pr-4 py-1.5 bg-surface-container-low border border-outline-variant rounded text-body-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none" 
                    placeholder="Search logs..." 
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <span className="material-symbols-outlined absolute left-2.5 top-2 text-on-surface-variant text-[18px]">search</span>
                </div>
                <select 
                  className="bg-surface-container-low border border-outline-variant rounded text-body-sm px-3 py-1.5 outline-none"
                  value={actionFilter}
                  onChange={(e) => setActionFilter(e.target.value)}
                >
                  {uniqueActions.map((act) => <option key={act}>{act}</option>)}
                </select>
                <select 
                  className="bg-surface-container-low border border-outline-variant rounded text-body-sm px-3 py-1.5 outline-none"
                  value={resultFilter}
                  onChange={(e) => setResultFilter(e.target.value)}
                >
                  {uniqueResults.map((res) => <option key={res}>{res}</option>)}
                </select>
                <button className="flex items-center gap-2 border border-outline-variant px-3 py-1.5 rounded text-body-sm font-medium hover:bg-surface-container transition-colors">
                  <span className="material-symbols-outlined text-[18px]">calendar_today</span>
                  Today
                </button>
                <button 
                  className="ml-auto flex items-center gap-2 bg-primary text-white px-4 py-1.5 rounded text-body-sm font-bold active:scale-[0.98] transition-all"
                  onClick={handleExportAll}
                >
                  <span className="material-symbols-outlined text-[18px]">download</span>
                  Export
                </button>
              </div>

              {/* Log Records Table */}
              <div className="glass-card rounded-lg overflow-hidden bg-white">
                <div className="px-5 py-3 border-b border-outline-variant bg-white">
                  <h3 className="font-body-lg font-bold text-on-surface m-0">Audit Log Records</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-surface-container-lowest border-b border-outline-variant">
                      <tr>
                        <th className="px-6 py-2.5 font-label-md text-on-surface-variant uppercase text-[10px] tracking-widest font-bold">Timestamp</th>
                        <th className="px-6 py-2.5 font-label-md text-on-surface-variant uppercase text-[10px] tracking-widest font-bold">Action</th>
                        <th className="px-6 py-2.5 font-label-md text-on-surface-variant uppercase text-[10px] tracking-widest font-bold">Target</th>
                        <th className="px-6 py-2.5 font-label-md text-on-surface-variant uppercase text-[10px] tracking-widest font-bold">Performed By</th>
                        <th className="px-6 py-2.5 font-label-md text-on-surface-variant uppercase text-[10px] tracking-widest font-bold">Origin</th>
                        <th className="px-6 py-2.5 font-label-md text-on-surface-variant uppercase text-[10px] tracking-widest font-bold">Result</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant bg-white">
                      {filteredRecords.map((log) => {
                        const isSelected = selectedLog.id === log.id
                        return (
                          <tr 
                            key={log.id} 
                            className={`cursor-pointer transition-colors ${isSelected ? 'bg-primary/5 font-medium' : 'hover:bg-surface-container-low/30'}`}
                            onClick={() => setSelectedLogId(log.id)}
                          >
                            <td className="px-6 py-3 text-body-sm text-on-surface-variant">{log.timestamp}</td>
                            <td className="px-6 py-3 text-body-sm font-semibold text-on-surface">{log.action}</td>
                            <td className="px-6 py-3 text-body-sm text-on-surface-variant">{log.target}</td>
                            <td className="px-6 py-3 text-body-sm text-on-surface-variant">{log.performedBy}</td>
                            <td className="px-6 py-3 text-body-sm text-on-surface-variant">{log.origin}</td>
                            <td className="px-6 py-3">
                              <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                                log.result === 'Success' ? 'bg-green-50 text-green-700' :
                                log.result === 'Failed' ? 'bg-red-50 text-red-700' :
                                log.result === 'Pending' ? 'bg-slate-105 text-slate-600 bg-slate-100' :
                                'bg-primary/10 text-primary'
                              }`}>
                                {log.result}
                              </span>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>

            {/* Right Column: Detailed Inspector */}
            <div className="lg:col-span-4 space-y-4">
              
              {/* Selected log details */}
              <div className="glass-card rounded-lg p-5 bg-white">
                <h3 className="font-body-lg font-bold text-on-surface mb-4 leading-snug">{selectedLog.action}</h3>
                
                <div className="space-y-3 mb-6 text-sm">
                  <div className="flex justify-between text-body-sm">
                    <span className="text-on-surface-variant">Log ID</span>
                    <span className="font-medium text-slate-900">{selectedLog.id}</span>
                  </div>
                  <div className="flex justify-between text-body-sm">
                    <span className="text-on-surface-variant">Timestamp</span>
                    <span className="font-medium text-slate-900">{selectedLog.timestamp}</span>
                  </div>
                  <div className="flex justify-between text-body-sm">
                    <span className="text-on-surface-variant">Action Type</span>
                    <span className="font-medium text-slate-900">{selectedLog.action.split(' ')[0]} Action</span>
                  </div>
                  <div className="flex justify-between text-body-sm">
                    <span className="text-on-surface-variant">Target User</span>
                    <span className="font-medium text-slate-900">{selectedLog.target}</span>
                  </div>
                  <div className="flex justify-between text-body-sm">
                    <span className="text-on-surface-variant">Performed By</span>
                    <span className="font-medium text-slate-900">{selectedLog.performedBy}</span>
                  </div>
                  <div className="flex justify-between text-body-sm">
                    <span className="text-on-surface-variant">Origin IP</span>
                    <span className="font-medium text-slate-900">{selectedLog.origin}</span>
                  </div>
                  <div className="flex justify-between items-center text-body-sm">
                    <span className="text-on-surface-variant">Result</span>
                    <span className={`font-bold ${
                      selectedLog.result === 'Success' ? 'text-green-700' :
                      selectedLog.result === 'Failed' ? 'text-red-600' : 'text-slate-600'
                    }`}>{selectedLog.result}</span>
                  </div>
                </div>

                <p className="text-body-sm text-on-surface-variant leading-relaxed mb-6 bg-slate-50 p-3 rounded border border-slate-100 font-medium">
                  {selectedLog.description}
                </p>

                <div className="space-y-2">
                  <button 
                    className="w-full bg-primary hover:bg-blue-700 text-white py-2 rounded text-sm font-bold transition-all active:scale-[0.98]"
                    onClick={handleMarkReviewed}
                  >
                    Mark Reviewed
                  </button>
                  <button 
                    className="w-full border border-outline-variant hover:bg-slate-50 text-on-surface py-2 rounded text-sm font-bold transition-all active:scale-[0.98]"
                    onClick={handleViewTargetUser}
                  >
                    View Target User
                  </button>
                  <button 
                    className="w-full border border-outline-variant hover:bg-slate-50 text-on-surface py-2 rounded text-sm font-bold transition-all active:scale-[0.98]"
                    onClick={handleExportRecord}
                  >
                    Export Record
                  </button>
                </div>
              </div>

              {/* Review notes */}
              <div className="glass-card rounded-lg p-5 bg-white">
                <h3 className="font-body-lg font-bold text-on-surface mb-3">Security Review Notes</h3>
                <ul className="space-y-2 text-body-sm text-on-surface-variant list-disc pl-4 font-medium leading-relaxed">
                  <li>Administrative actions recorded automatically</li>
                  <li>Review failed logins before shift handover</li>
                  <li>Periodic audit for role changes</li>
                  <li>Keep suspended records for tracking</li>
                </ul>
              </div>

            </div>

          </div>

          {/* Bottom Section: Recent Security Events */}
          <section className="glass-card rounded-lg overflow-hidden bg-white">
            <div className="px-5 py-3 border-b border-outline-variant bg-white">
              <h3 className="font-body-lg font-bold text-on-surface m-0">Recent Security Events</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-surface-container-lowest border-b border-outline-variant">
                  <tr>
                    <th className="px-6 py-2.5 font-label-md text-on-surface-variant uppercase text-[10px] tracking-widest font-bold">Time</th>
                    <th className="px-6 py-2.5 font-label-md text-on-surface-variant uppercase text-[10px] tracking-widest font-bold">Event</th>
                    <th className="px-6 py-2.5 font-label-md text-on-surface-variant uppercase text-[10px] tracking-widest font-bold">Account</th>
                    <th className="px-6 py-2.5 font-label-md text-on-surface-variant uppercase text-[10px] tracking-widest font-bold">Severity</th>
                    <th className="px-6 py-2.5 font-label-md text-on-surface-variant uppercase text-[10px] tracking-widest font-bold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant bg-white">
                  {securityEvents.map((evt, index) => (
                    <tr key={index} className="hover:bg-surface-container-low/30 transition-colors">
                      <td className="px-6 py-2.5 text-body-sm text-on-surface-variant">{evt.time}</td>
                      <td className="px-6 py-2.5 text-body-sm font-semibold text-on-surface">{evt.event}</td>
                      <td className="px-6 py-2.5 text-body-sm text-on-surface-variant">{evt.account}</td>
                      <td className={`px-6 py-2.5 text-body-sm font-bold ${evt.severityClass}`}>{evt.severity}</td>
                      <td className="px-6 py-2.5 text-body-sm text-on-surface-variant font-medium">{evt.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

        </div>

      </main>

      {toast.show && (
        <div className="profile-toast-custom animate-fadeIn">
          <span className="material-symbols-outlined text-green-500">check_circle</span>
          <span>{toast.message}</span>
        </div>
      )}

    </div>
  )
}

export default AuditLogsPage
