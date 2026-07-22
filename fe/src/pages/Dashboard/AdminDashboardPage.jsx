import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import AdminLayout from '../../layouts/AdminLayout'
import SystemSettingsModal from '../../components/common/SystemSettingsModal'
import {
  mockAdminKPIs,
  mockAdminUsers,
  mockAccountDistribution,
  mockSecurityOverview,
  mockAuditActivity,
  fetchAdminDashboardStats,
  fetchAdminUsers,
  fetchAdminAuditLogs,
} from './adminDashboardService'
import { ROUTE_PATHS } from '../../routes/routePaths'

function AdminDashboardPage() {
  const navigate = useNavigate()

  // Dynamic state management
  const [filterQuery, setFilterQuery] = useState('')
  const [users, setUsers] = useState(() => {
    const saved = localStorage.getItem('ai_parking_users_list')
    if (saved) {
      try { return JSON.parse(saved) } catch (e) { console.error(e) }
    }
    return mockAdminUsers
  })

  const [kpis, setKpis] = useState(mockAdminKPIs)
  const [auditLogs, setAuditLogs] = useState(mockAuditActivity)

  useEffect(() => {
    let active = true
    Promise.all([
      fetchAdminDashboardStats(),
      fetchAdminUsers(),
      fetchAdminAuditLogs(),
    ]).then(([statsRes, usersRes, logsRes]) => {
      if (!active) return
      if (statsRes.success && statsRes.data) {
        setKpis(statsRes.data)
      }
      if (usersRes.success && Array.isArray(usersRes.data) && usersRes.data.length > 0) {
        setUsers(usersRes.data)
      }
      if (logsRes.success && Array.isArray(logsRes.data) && logsRes.data.length > 0) {
        setAuditLogs(logsRes.data)
      }
    })
    return () => { active = false }
  }, [])

  useEffect(() => {
    localStorage.setItem('ai_parking_users_list', JSON.stringify(users))
  }, [users])

  // System Settings Modal State
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)

  // Professional Modal State
  const [modal, setModal] = useState({
    isOpen: false,
    type: '', // 'newUser' | 'resetCredentials' | 'restrictAccess'
    inputVal1: '',
    inputVal2: '',
    inputVal3: '',
    inputVal4: ''
  })

  // Executive Toast State
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' })

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type })
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' })
    }, 3500)
  }

  // Filtered Users list
  const filteredUsers = users.filter((u) => 
    u.name.toLowerCase().includes(filterQuery.toLowerCase()) || 
    u.email.toLowerCase().includes(filterQuery.toLowerCase()) || 
    u.role.toLowerCase().includes(filterQuery.toLowerCase()) || 
    u.area.toLowerCase().includes(filterQuery.toLowerCase())
  )

  // Handlers
  const handleNewUser = () => {
    setModal({
      isOpen: true,
      type: 'newUser',
      inputVal1: '',
      inputVal2: '',
      inputVal3: 'Parking Staff',
      inputVal4: 'Entry Gate A'
    })
  }

  const handlePolicyConfig = () => {
    setIsSettingsOpen(true)
  }

  const handleResetCredentials = () => {
    setModal({
      isOpen: true,
      type: 'resetCredentials',
      inputVal1: '',
      inputVal2: '',
      inputVal3: '',
      inputVal4: ''
    })
  }

  const handleRestrictAccess = () => {
    setModal({
      isOpen: true,
      type: 'restrictAccess',
      inputVal1: '',
      inputVal2: '',
      inputVal3: '',
      inputVal4: ''
    })
  }

  const handleSettingsSaved = (newSettings) => {
    const timeStr = new Date().toTimeString().split(' ')[0]
    const newLog = {
      timestamp: `Today ${timeStr}`,
      action: 'System Configuration Updated',
      subject: `Mode: ${newSettings.operatingMode}`,
      origin: '192.168.1.14',
      result: 'Success',
      resultClass: 'text-green-700'
    }
    setAuditLogs([newLog, ...auditLogs])
    showToast(`Đã lưu cấu hình hệ thống (Chế độ: ${newSettings.operatingMode}).`, 'success')
  }

  // Modal confirm processor
  const handleModalConfirm = () => {
    const timeStr = new Date().toTimeString().split(' ')[0]

    if (modal.type === 'newUser') {
      const name = modal.inputVal1.trim()
      const email = modal.inputVal2.trim()
      const role = modal.inputVal3.trim()
      const area = modal.inputVal4.trim()

      if (!name || !email) {
        showToast('Vui lòng điền họ tên và email hợp lệ.', 'error')
        return
      }

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

      const newLog = {
        timestamp: `Today ${timeStr}`,
        action: 'Create User',
        subject: name,
        origin: '192.168.1.14',
        result: 'Success',
        resultClass: 'text-green-700'
      }
      setAuditLogs([newLog, ...auditLogs])
      setModal({ ...modal, isOpen: false })
      showToast(`Tạo thành công tài khoản quản trị mới cho ${name}!`, 'success')
    }

    else if (modal.type === 'resetCredentials') {
      const targetEmail = modal.inputVal1.trim()
      if (!targetEmail) {
        showToast('Vui lòng nhập địa chỉ email.', 'error')
        return
      }
      const matched = users.find((u) => u.email.toLowerCase() === targetEmail.toLowerCase())
      if (!matched) {
        showToast('Không tìm thấy tài khoản với email đã nhập!', 'error')
        return
      }

      const newLog = {
        timestamp: `Today ${timeStr}`,
        action: 'Credential Reset Requested',
        subject: matched.name,
        origin: '192.168.1.14',
        result: 'Success',
        resultClass: 'text-green-700'
      }
      setAuditLogs([newLog, ...auditLogs])
      setModal({ ...modal, isOpen: false })
      showToast(`Đã gửi yêu cầu Reset mật khẩu tới tài khoản ${matched.name}.`, 'success')
    }

    else if (modal.type === 'restrictAccess') {
      const targetEmail = modal.inputVal1.trim()
      if (!targetEmail) {
        showToast('Vui lòng nhập địa chỉ email.', 'error')
        return
      }
      const matched = users.find((u) => u.email.toLowerCase() === targetEmail.toLowerCase())
      if (!matched) {
        showToast('Không tìm thấy tài khoản với email đã nhập!', 'error')
        return
      }

      setUsers((prev) => 
        prev.map((u) => 
          u.email === matched.email ? { ...u, status: 'Suspended' } : u
        )
      )

      setKpis((prev) => ({
        ...prev,
        activeUsers: matched.status === 'Active' ? Math.max(0, prev.activeUsers - 1) : prev.activeUsers,
        suspendedAccounts: matched.status !== 'Suspended' ? prev.suspendedAccounts + 1 : prev.suspendedAccounts
      }))

      const newLog = {
        timestamp: `Today ${timeStr}`,
        action: 'Lock User (Account Suspended)',
        subject: matched.name,
        origin: '192.168.1.14',
        result: 'Success',
        resultClass: 'text-green-700'
      }
      setAuditLogs([newLog, ...auditLogs])
      setModal({ ...modal, isOpen: false })
      showToast(`Đã khóa tạm thời (Lock User) quyền truy cập tài khoản: ${matched.name}.`, 'success')
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        
        {/* Dynamic styling for glass-card */}
        <style dangerouslySetInnerHTML={{__html: `
          .glass-card {
              background: white;
              border: 1px solid #e2e8f0;
              box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
          }
        `}} />

        {/* Page Header */}
        <section className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="font-headline-md text-headline-md font-bold text-on-surface">Admin Dashboard</h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">System Administration: Monitor accounts, configure system settings, manage role access, and view audit history.</p>
          </div>
          <button
            className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-body-sm font-bold shadow transition-all active:scale-[0.98]"
            onClick={handlePolicyConfig}
          >
            <span className="material-symbols-outlined text-[18px]">settings_applications</span>
            Configure System Settings
          </button>
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
                <div className="flex items-center gap-2">
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
                  <button
                    className="text-xs text-primary font-bold hover:underline"
                    onClick={() => navigate(ROUTE_PATHS.users)}
                  >
                    Manage Users
                  </button>
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
                  <tbody className="divide-y divide-outline-variant bg-white">
                    {filteredUsers.map((user, index) => (
                      <tr key={index} className="hover:bg-surface-container-low/30 transition-colors cursor-pointer" onClick={() => navigate(ROUTE_PATHS.users)}>
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
            </div>

            {/* Account Distribution */}
            <div className="glass-card rounded-lg px-5 py-4 bg-white">
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
            <div className="glass-card rounded-lg p-5 bg-white">
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
            <div className="glass-card rounded-lg p-5 bg-white">
              <h3 className="font-body-lg font-bold text-on-surface mb-3">Admin Actions</h3>
              <div className="grid grid-cols-1 gap-2">
                <button 
                  className="flex items-center justify-center gap-2 bg-[#1e293b] text-white py-2 px-4 rounded text-sm font-bold transition-all hover:bg-slate-800 active:scale-[0.98]"
                  onClick={handleNewUser}
                >
                  Create User Account
                </button>
                <button 
                  className="flex items-center justify-center gap-2 border border-outline-variant text-on-surface py-2 px-4 rounded text-sm font-bold transition-all hover:bg-surface-container active:scale-[0.98]"
                  onClick={handlePolicyConfig}
                >
                  Configure System Settings
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
                  Lock User Account
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
            <button className="text-primary font-bold text-[10px] uppercase tracking-wider hover:underline" onClick={() => navigate(ROUTE_PATHS.auditLogs)}>
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

      {/* System Settings Configuration Modal */}
      <SystemSettingsModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSave={handleSettingsSaved}
      />

      {/* Quick Action Modals */}
      {modal.isOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden border border-outline-variant">
            <header className="px-6 py-4 border-b border-outline-variant flex justify-between items-center bg-slate-50">
              <h3 className="font-body-lg font-bold text-on-surface">
                {modal.type === 'newUser' && 'Tạo tài khoản quản trị mới (Create User)'}
                {modal.type === 'resetCredentials' && 'Reset mật khẩu nhân viên'}
                {modal.type === 'restrictAccess' && 'Khóa tài khoản người dùng (Lock User)'}
              </h3>
              <button className="text-on-surface-variant hover:bg-slate-200 p-1.5 rounded-full" onClick={() => setModal({ ...modal, isOpen: false })}>
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </header>
            
            <div className="p-6 space-y-4">
              {modal.type === 'newUser' && (
                <>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-on-surface-variant uppercase">Họ và tên</label>
                    <input className="w-full px-3.5 py-2 border border-outline-variant rounded text-body-sm outline-none focus:ring-1 focus:ring-primary focus:border-primary" value={modal.inputVal1} onChange={(e) => setModal({...modal, inputVal1: e.target.value})} placeholder="Họ và tên..." />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-on-surface-variant uppercase">Email</label>
                    <input className="w-full px-3.5 py-2 border border-outline-variant rounded text-body-sm outline-none focus:ring-1 focus:ring-primary focus:border-primary" value={modal.inputVal2} onChange={(e) => setModal({...modal, inputVal2: e.target.value})} placeholder="email@parking.com..." />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-on-surface-variant uppercase">Vai trò</label>
                    <input className="w-full px-3.5 py-2 border border-outline-variant rounded text-body-sm outline-none focus:ring-1 focus:ring-primary focus:border-primary" value={modal.inputVal3} onChange={(e) => setModal({...modal, inputVal3: e.target.value})} placeholder="Parking Staff..." />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-on-surface-variant uppercase">Khu vực làm việc</label>
                    <input className="w-full px-3.5 py-2 border border-outline-variant rounded text-body-sm outline-none focus:ring-1 focus:ring-primary focus:border-primary" value={modal.inputVal4} onChange={(e) => setModal({...modal, inputVal4: e.target.value})} placeholder="Entry Gate A..." />
                  </div>
                </>
              )}

              {modal.type === 'resetCredentials' && (
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-on-surface-variant uppercase">Email tài khoản cần reset</label>
                  <input className="w-full px-3.5 py-2 border border-outline-variant rounded text-body-sm outline-none focus:ring-1 focus:ring-primary focus:border-primary" value={modal.inputVal1} onChange={(e) => setModal({...modal, inputVal1: e.target.value})} placeholder="email@parking.com..." />
                </div>
              )}

              {modal.type === 'restrictAccess' && (
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-on-surface-variant uppercase">Email tài khoản cần khóa (Lock User)</label>
                  <input className="w-full px-3.5 py-2 border border-outline-variant rounded text-body-sm outline-none focus:ring-1 focus:ring-primary focus:border-primary" value={modal.inputVal1} onChange={(e) => setModal({...modal, inputVal1: e.target.value})} placeholder="email@parking.com..." />
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button className="px-4 py-2 border border-outline-variant text-on-surface rounded text-body-sm font-semibold hover:bg-slate-50" onClick={() => setModal({ ...modal, isOpen: false })}>
                  Hủy bỏ
                </button>
                <button className="px-4 py-2 bg-primary hover:bg-blue-700 text-white rounded text-body-sm font-bold" onClick={handleModalConfirm}>
                  Xác nhận
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Executive Toast Notification */}
      {toast.show && (
        <div className={`profile-toast-custom ${toast.type || 'success'}`}>
          <div className="profile-toast-icon">
            <span className="material-symbols-outlined text-[20px]">
              {toast.type === 'error' ? 'error' : 'check_circle'}
            </span>
          </div>
          <div className="profile-toast-body">
            <span className="profile-toast-title">
              {toast.type === 'error' ? 'Thao tác thất bại' : 'Thông báo hệ thống'}
            </span>
            <span className="profile-toast-message">{toast.message}</span>
          </div>
          <button 
            className="profile-toast-close"
            aria-label="Dismiss notification" 
            onClick={() => setToast({ show: false, message: '', type: 'success' })}
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>
      )}

    </AdminLayout>
  )
}

export default AdminDashboardPage