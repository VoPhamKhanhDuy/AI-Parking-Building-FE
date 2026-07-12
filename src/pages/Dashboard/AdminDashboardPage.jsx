import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { mockAdminKPIs, mockAdminUsers, mockAccountDistribution, mockSecurityOverview, mockAuditActivity } from './adminDashboardService'
import { ROUTE_PATHS } from '../../routes/routePaths'

function AdminDashboardPage() {
  const navigate = useNavigate()

  // Dynamic state management
  const [filterQuery, setFilterQuery] = useState('')
  const [users, setUsers] = useState(mockAdminUsers)
  const [kpis, setKpis] = useState(mockAdminKPIs)
  const [auditLogs, setAuditLogs] = useState(mockAuditActivity)

  // Filtered Users list
  const filteredUsers = users.filter((u) => 
    u.name.toLowerCase().includes(filterQuery.toLowerCase()) || 
    u.email.toLowerCase().includes(filterQuery.toLowerCase()) || 
    u.role.toLowerCase().includes(filterQuery.toLowerCase()) || 
    u.area.toLowerCase().includes(filterQuery.toLowerCase())
  )

  // Admin action triggers
  const handleNewUser = () => {
    const name = window.prompt('Nhập họ tên tài khoản mới:')
    if (!name) return
    const email = window.prompt('Nhập email tài khoản mới:')
    if (!email) return
    const role = window.prompt('Nhập vai trò (vd: Parking Staff, Facility Manager):', 'Parking Staff')
    const area = window.prompt('Nhập khu vực làm việc (vd: Entry Gate A, Zone B):', 'Entry Gate A')

    const newUser = {
      name,
      email,
      role,
      area,
      status: 'Active',
      lastLogin: 'Today'
    }

    setUsers([newUser, ...users])
    setKpis((prev) => ({
      ...prev,
      totalAccounts: prev.totalAccounts + 1,
      activeUsers: prev.activeUsers + 1
    }))

    // Audit Log Row
    const timeStr = new Date().toTimeString().split(' ')[0]
    const newLog = {
      timestamp: `Today ${timeStr}`,
      action: 'Role Authorization Updated',
      subject: name,
      origin: '192.168.1.14',
      result: 'Success',
      resultClass: 'text-green-700'
    }
    setAuditLogs([newLog, ...auditLogs])
    window.alert(`Đã tạo thành công tài khoản quản trị cho: ${name}!`)
  }

  const handlePolicyConfig = () => {
    window.alert('Mở hộp cấu hình bảo mật chính sách truy cập mật khẩu. (Yêu cầu quyền root admin)')
  }

  const handleResetCredentials = () => {
    const targetEmail = window.prompt('Nhập email tài khoản cần reset mật khẩu:')
    if (!targetEmail) return
    const matched = users.find((u) => u.email.toLowerCase() === targetEmail.toLowerCase())
    if (!matched) {
      window.alert('Không tìm thấy tài khoản với email đã nhập!')
      return
    }

    const timeStr = new Date().toTimeString().split(' ')[0]
    const newLog = {
      timestamp: `Today ${timeStr}`,
      action: 'Credential Reset Requested',
      subject: matched.name,
      origin: '192.168.1.14',
      result: 'Success',
      resultClass: 'text-green-700'
    }
    setAuditLogs([newLog, ...auditLogs])
    window.alert(`Đã gửi yêu cầu Reset thông tin mật khẩu tới tài khoản: ${matched.name}.`)
  }

  const handleRestrictAccess = () => {
    const targetEmail = window.prompt('Nhập email tài khoản cần hạn chế truy cập (Suspend):')
    if (!targetEmail) return
    const matched = users.find((u) => u.email.toLowerCase() === targetEmail.toLowerCase())
    if (!matched) {
      window.alert('Không tìm thấy tài khoản với email đã nhập!')
      return
    }

    setUsers((prev) => 
      prev.map((u) => 
        u.email === matched.email ? { ...u, status: 'Suspended' } : u
      )
    )

    setKpis((prev) => ({
      ...prev,
      activeUsers: matched.status === 'Active' ? prev.activeUsers - 1 : prev.activeUsers,
      suspendedAccounts: matched.status !== 'Suspended' ? prev.suspendedAccounts + 1 : prev.suspendedAccounts
    }))

    const timeStr = new Date().toTimeString().split(' ')[0]
    const newLog = {
      timestamp: `Today ${timeStr}`,
      action: 'Account Suspension Issued',
      subject: matched.name,
      origin: '192.168.1.14',
      result: 'Success',
      resultClass: 'text-green-700'
    }
    setAuditLogs([newLog, ...auditLogs])
    window.alert(`Đã tạm khóa tài khoản: ${matched.name}.`)
  }

  return (
    <div className="bg-surface text-on-surface flex min-h-screen w-full relative">
      
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
            <a className="flex items-center gap-3 px-4 py-2 text-white bg-primary rounded-lg mx-2 transition-all duration-200" href="#">
              <span className="material-symbols-outlined text-[20px]">dashboard</span>
              <span className="font-body-md text-body-md font-medium">Admin Dashboard</span>
            </a>
          </div>
          <div>
            <div className="px-4 mb-2 text-slate-500 text-[10px] font-bold uppercase tracking-widest">Admin Control</div>
            <div className="space-y-1">
              <a className="flex items-center gap-3 px-4 py-2 text-slate-300 hover:text-white transition-colors duration-200 hover:bg-white/5 rounded-lg mx-2 cursor-pointer" onClick={() => navigate(ROUTE_PATHS.users)}>
                <span className="material-symbols-outlined text-[20px]">group</span>
                <span className="font-body-md text-body-md">Users &amp; Roles</span>
              </a>
              <a className="flex items-center gap-3 px-4 py-2 text-slate-300 hover:text-white transition-colors duration-200 hover:bg-white/5 rounded-lg mx-2 cursor-pointer" onClick={() => window.alert('Mở lịch sử kiểm toán log')}>
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
          <div className="flex items-center gap-4">
            <button className="text-on-surface-variant hover:bg-surface-container p-2 rounded-full transition-colors relative">
              <span className="material-symbols-outlined text-[22px]">notifications</span>
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500"></span>
            </button>
            <button className="text-on-surface-variant hover:bg-surface-container p-2 rounded-full transition-colors">
              <span className="material-symbols-outlined text-[22px]">settings</span>
            </button>
            <div className="flex items-center gap-3 pl-4 border-l border-outline-variant">
              <div className="text-right hidden sm:block">
                <p className="text-body-sm font-bold text-on-surface leading-tight">Nguyễn Văn Admin</p>
                <p className="text-[10px] text-primary font-bold uppercase">System Administrator</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center">
                <span className="material-symbols-outlined text-slate-500">person</span>
              </div>
            </div>
          </div>
        </header>

        {/* Content Canvas */}
        <div className="p-6 space-y-4 max-w-[1600px] mx-auto w-full">
          
          {/* Page Header */}
          <section>
            <h2 className="font-headline-lg text-headline-lg text-on-surface">Admin Dashboard</h2>
            <p className="font-body-md text-body-md text-on-surface-variant mt-0.5">Monitor system users, account status, security alerts, and administrative activity.</p>
          </section>

          {/* KPI Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="glass-card p-4 rounded-lg flex items-center justify-between">
              <div>
                <p className="text-on-surface-variant font-label-md uppercase tracking-wider text-[11px]">Total Accounts</p>
                <p className="text-2xl font-bold text-on-surface mt-1">{kpis.totalAccounts}</p>
              </div>
              <span className="material-symbols-outlined text-on-surface-variant text-[24px]">people</span>
            </div>
            <div className="glass-card p-4 rounded-lg flex items-center justify-between">
              <div>
                <p className="text-on-surface-variant font-label-md uppercase tracking-wider text-[11px]">Active Users</p>
                <p className="text-2xl font-bold text-on-surface mt-1">{kpis.activeUsers}</p>
              </div>
              <span className="material-symbols-outlined text-green-600 text-[24px]">check_circle</span>
            </div>
            <div className="glass-card p-4 rounded-lg border-l-4 border-error flex items-center justify-between">
              <div>
                <p className="text-on-surface-variant font-label-md uppercase tracking-wider text-[11px]">Suspended Accounts</p>
                <p className="text-2xl font-bold text-on-surface mt-1">{kpis.suspendedAccounts}</p>
              </div>
              <span className="material-symbols-outlined text-error text-[24px]">block</span>
            </div>
            <div className="glass-card p-4 rounded-lg border-l-4 border-secondary flex items-center justify-between">
              <div>
                <p className="text-on-surface-variant font-label-md uppercase tracking-wider text-[11px]">Pending Requests</p>
                <p className="text-2xl font-bold text-on-surface mt-1">{kpis.pendingRequests}</p>
              </div>
              <span className="material-symbols-outlined text-secondary text-[24px]">pending</span>
            </div>
          </div>

          {/* Main Section */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            
            {/* Left: User & Role Overview */}
            <div className="lg:col-span-8 space-y-4">
              <div className="glass-card rounded-lg overflow-hidden flex flex-col">
                <div className="px-5 py-3 border-b border-outline-variant flex justify-between items-center bg-white">
                  <h3 className="font-body-lg font-bold text-on-surface">User &amp; Role Overview</h3>
                  <div className="relative">
                    <input 
                      className="pl-9 pr-4 py-1 bg-surface-container-low border border-outline-variant rounded text-body-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none" 
                      placeholder="Filter users..." 
                      type="text"
                      value={filterQuery}
                      onChange={(e) => setFilterQuery(e.target.value)}
                    />
                    <span className="material-symbols-outlined absolute left-2.5 top-1.5 text-on-surface-variant text-[16px]">search</span>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-surface-container-lowest border-b border-outline-variant">
                      <tr>
                        <th className="px-6 py-2.5 font-label-md text-on-surface-variant uppercase text-[10px] tracking-widest font-bold">User</th>
                        <th className="px-6 py-2.5 font-label-md text-on-surface-variant uppercase text-[10px] tracking-widest font-bold">Role</th>
                        <th className="px-6 py-2.5 font-label-md text-on-surface-variant uppercase text-[10px] tracking-widest font-bold">Area</th>
                        <th className="px-6 py-2.5 font-label-md text-on-surface-variant uppercase text-[10px] tracking-widest font-bold">Status</th>
                        <th className="px-6 py-2.5 font-label-md text-on-surface-variant uppercase text-[10px] tracking-widest font-bold">Last Login</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant">
                      {filteredUsers.map((user, index) => (
                        <tr key={index} className="hover:bg-surface-container-low/30 transition-colors">
                          <td className="px-6 py-2.5">
                            <div className="font-body-sm text-on-surface font-medium">{user.name}</div>
                            <div className="text-[10px] text-on-surface-variant">{user.email}</div>
                          </td>
                          <td className="px-6 py-2.5 text-body-sm text-on-surface-variant">{user.role}</td>
                          <td className="px-6 py-2.5 text-body-sm text-on-surface-variant">{user.area}</td>
                          <td className="px-6 py-2.5">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                              user.status === 'Active' ? 'bg-green-50 text-green-700' :
                              user.status === 'Suspended' ? 'bg-red-50 text-red-700' :
                              'bg-slate-100 text-slate-600'
                            }`}>
                              {user.status}
                            </span>
                          </td>
                          <td className="px-6 py-2.5 text-body-sm text-on-surface-variant">{user.lastLogin}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="p-2.5 bg-surface-container-lowest border-t border-outline-variant flex justify-center">
                  <button className="text-primary font-bold text-[10px] uppercase tracking-wider hover:underline" onClick={() => window.alert('Đang tải danh sách tài khoản')}>
                    View Full User Directory
                  </button>
                </div>
              </div>

              {/* Account Distribution (Simplified horizontal) */}
              <div className="glass-card rounded-lg px-5 py-4">
                <h3 className="font-body-lg font-bold text-on-surface mb-3">Account Distribution</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
                  {mockAccountDistribution.map((dist) => (
                    <div key={dist.label} className="space-y-1">
                      <div className="flex justify-between text-[11px] font-bold uppercase text-on-surface-variant">
                        <span>{dist.label}</span>
                        <span>{dist.count}</span>
                      </div>
                      <div className="h-1.5 w-full bg-surface-container rounded-full overflow-hidden">
                        <div className={`h-full ${dist.bgClass}`} style={{ width: dist.percentage }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Status & Actions */}
            <div className="lg:col-span-4 space-y-4">
              
              {/* Security Overview */}
              <div className="glass-card rounded-lg p-5">
                <h3 className="font-body-lg font-bold text-on-surface mb-3">Security Overview</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center pb-1.5 border-b border-outline-variant text-sm">
                    <span className="text-body-sm text-on-surface-variant">Login Policy</span>
                    <span className="px-2 py-0.5 bg-green-50 text-green-700 text-[9px] font-bold uppercase rounded">
                      {mockSecurityOverview.loginPolicy}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-body-sm text-on-surface-variant">Failed Logins (24h)</span>
                    <span className="font-bold text-on-surface">{mockSecurityOverview.failedLogins}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-body-sm text-on-surface-variant">Locked Accounts</span>
                    <span className="font-bold text-error">{kpis.suspendedAccounts}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-body-sm text-on-surface-variant">Pending Resets</span>
                    <span className="font-bold text-on-surface">{mockSecurityOverview.pendingResets}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-body-sm text-on-surface-variant">Admin Privilege Grants</span>
                    <span className="font-bold text-primary">{mockSecurityOverview.adminGrants}</span>
                  </div>
                </div>
              </div>

              {/* Admin Actions */}
              <div className="glass-card rounded-lg p-5">
                <h3 className="font-body-lg font-bold text-on-surface mb-3">Admin Actions</h3>
                <div className="grid grid-cols-1 gap-2">
                  <button 
                    className="flex items-center justify-center gap-2 bg-[#1e293b] text-white py-2 px-4 rounded text-sm font-bold transition-all hover:bg-slate-800 active:scale-[0.98]"
                    onClick={handleNewUser}
                  >
                    New User Account
                  </button>
                  <button 
                    className="flex items-center justify-center gap-2 border border-outline-variant text-on-surface py-2 px-4 rounded text-sm font-bold transition-all hover:bg-surface-container active:scale-[0.98]"
                    onClick={handlePolicyConfig}
                  >
                    Policy Configuration
                  </button>
                  <button 
                    className="flex items-center justify-center gap-2 border border-outline-variant text-on-surface py-2 px-4 rounded text-sm font-bold transition-all hover:bg-surface-container active:scale-[0.98]"
                    onClick={handleResetCredentials}
                  >
                    Reset Credentials
                  </button>
                  <button 
                    className="flex items-center justify-center gap-2 border border-error/30 text-error py-2 px-4 rounded text-sm font-bold transition-all hover:bg-error/5 active:scale-[0.98]"
                    onClick={handleRestrictAccess}
                  >
                    Restrict Access
                  </button>
                </div>
              </div>

              {/* Policy notes */}
              <div className="glass-card rounded-lg p-4 bg-slate-50 border-dashed border-2 border-slate-200">
                <div className="flex items-start gap-3 text-slate-500">
                  <span className="material-symbols-outlined text-[18px] mt-0.5">info</span>
                  <p className="text-[10px] leading-relaxed m-0">Administrator actions are logged in accordance with system policy and are subject to periodic audit review.</p>
                </div>
              </div>
            </div>

          </div>

          {/* Bottom Section: Recent Audit Activity */}
          <section className="glass-card rounded-lg overflow-hidden bg-white">
            <div className="px-5 py-3 border-b border-outline-variant flex justify-between items-center bg-white">
              <h3 className="font-body-lg font-bold text-on-surface">Recent Audit Activity</h3>
              <button className="text-primary font-bold text-[10px] uppercase tracking-wider hover:underline" onClick={() => window.alert('Đang tải danh sách log đầy đủ')}>
                Full Audit Log
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-surface-container-lowest border-b border-outline-variant">
                  <tr>
                    <th className="px-6 py-2.5 font-label-md text-on-surface-variant uppercase text-[10px] tracking-widest font-bold">Timestamp</th>
                    <th className="px-6 py-2.5 font-label-md text-on-surface-variant uppercase text-[10px] tracking-widest font-bold">Admin Action</th>
                    <th className="px-6 py-2.5 font-label-md text-on-surface-variant uppercase text-[10px] tracking-widest font-bold">Subject</th>
                    <th className="px-6 py-2.5 font-label-md text-on-surface-variant uppercase text-[10px] tracking-widest font-bold">Origin</th>
                    <th className="px-6 py-2.5 font-label-md text-on-surface-variant uppercase text-[10px] tracking-widest font-bold">Result</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant">
                  {auditLogs.map((log, index) => (
                    <tr key={index} className="hover:bg-surface-container-low/30 transition-colors">
                      <td className="px-6 py-2.5 text-body-sm text-on-surface-variant">{log.timestamp}</td>
                      <td className="px-6 py-2.5 font-medium text-on-surface text-body-sm">{log.action}</td>
                      <td className="px-6 py-2.5 text-body-sm text-on-surface-variant">{log.subject}</td>
                      <td className="px-6 py-2.5 text-body-sm text-on-surface-variant">{log.origin}</td>
                      <td className="px-6 py-2.5">
                        <span className={`font-bold text-[9px] uppercase ${log.resultClass}`}>
                          {log.result}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

        </div>

      </main>

    </div>
  )
}

export default AdminDashboardPage
