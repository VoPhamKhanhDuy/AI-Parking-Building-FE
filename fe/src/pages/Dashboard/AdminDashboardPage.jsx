import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import AdminLayout from '../../layouts/AdminLayout'
import { getUsers, createUser, updateUserStatus } from '../../services/userService'
import { getAdminDashboard } from './adminDashboardService'
import { ROUTE_PATHS } from '../../routes/routePaths'
import '../../layouts/MainLayout.css'

function StatusBadge({ children, tone = 'normal' }) {
  return <span className={`admin-badge ${tone.toLowerCase()}`}>{children}</span>
}

function AdminDashboardPage() {
  const navigate = useNavigate()

  // Users state
  const [users, setUsers] = useState([])
  const [usersLoading, setUsersLoading] = useState(true)
  const [filterQuery, setFilterQuery] = useState('')

  // Operational data state
  const [opsData, setOpsData] = useState(null)
  const [opsLoading, setOpsLoading] = useState(true)

  // Modal state
  const [modal, setModal] = useState({
    isOpen: false,
    type: '',
    inputVal1: '',
    inputVal2: '',
    inputVal3: 'Staff',
    inputVal4: 'Entry Gate A',
    inputVal5: '',
  })

  const [toast, setToast] = useState({ show: false, message: '', type: 'success' })

  const showToast = useCallback((message, type = 'success') => {
    setToast({ show: true, message, type })
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000)
  }, [])

  const loadUsers = useCallback(async () => {
    setUsersLoading(true)
    try {
      const result = await getUsers()
      if (result.success) {
        setUsers(result.data)
      }
    } catch {
      showToast('Failed to load users', 'error')
    } finally {
      setUsersLoading(false)
    }
  }, [showToast])

  const loadOps = useCallback(async () => {
    setOpsLoading(true)
    try {
      const result = await getAdminDashboard()
      setOpsData(result)
    } catch {
      setOpsData(null)
    } finally {
      setOpsLoading(false)
    }
  }, [])

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    loadUsers()
    loadOps()
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [loadUsers, loadOps])

  const filteredUsers = users.filter(
    (u) =>
      u.fullName?.toLowerCase().includes(filterQuery.toLowerCase()) ||
      u.email?.toLowerCase().includes(filterQuery.toLowerCase()) ||
      u.role?.toLowerCase().includes(filterQuery.toLowerCase())
  )

  const userOverview = opsData?.userOverview || {
    totalAccounts: users.length,
    activeUsers: users.filter((u) => u.status === 'Active').length,
    suspendedAccounts: users.filter((u) => u.status === 'Suspended' || u.status === 'Locked').length,
    pendingRequests: 2,
  }

  const handleNewUser = () => {
    setModal({
      isOpen: true,
      type: 'newUser',
      inputVal1: '',
      inputVal2: '',
      inputVal3: 'Staff',
      inputVal4: 'Entry Gate A',
      inputVal5: '',
    })
  }

  const handleResetCredentials = () => {
    setModal({
      isOpen: true,
      type: 'resetCredentials',
      inputVal1: '',
      inputVal2: '',
      inputVal3: '',
      inputVal4: '',
    })
  }

  const handleRestrictAccess = () => {
    setModal({
      isOpen: true,
      type: 'restrictAccess',
      inputVal1: '',
      inputVal2: '',
      inputVal3: '',
      inputVal4: '',
    })
  }

  const handleModalConfirm = async () => {
    if (modal.type === 'newUser') {
      const name = modal.inputVal1.trim()
      const email = modal.inputVal2.trim()
      const role = modal.inputVal3.trim()
      const password = modal.inputVal5

      if (!name || !email) {
        showToast('Vui lòng điền họ tên và email hợp lệ.', 'error')
        return
      }
      if (!password || password.length < 6) {
        showToast('Mật khẩu phải có ít nhất 6 ký tự.', 'error')
        return
      }

      try {
        const result = await createUser({
          fullName: name,
          email,
          role,
          password,
        })
        if (result.success) {
          showToast(`Đã tạo tài khoản cho ${name}!`, 'success')
          loadUsers()
        } else {
          showToast(result.message || 'Failed to create user', 'error')
        }
      } catch {
        showToast('Failed to create user', 'error')
      }
    } else if (modal.type === 'resetCredentials') {
      const targetEmail = modal.inputVal1.trim()
      if (!targetEmail) {
        showToast('Vui lòng nhập địa chỉ email.', 'error')
        return
      }
      showToast(`Đã gửi yêu cầu Reset mật khẩu tới ${targetEmail}.`, 'success')
    } else if (modal.type === 'restrictAccess') {
      const targetEmail = modal.inputVal1.trim()
      if (!targetEmail) {
        showToast('Vui lòng nhập địa chỉ email.', 'error')
        return
      }
      const matched = users.find((u) => u.email?.toLowerCase() === targetEmail.toLowerCase())
      if (!matched) {
        showToast('Không tìm thấy tài khoản với email đã nhập!', 'error')
        return
      }
      try {
        const result = await updateUserStatus(matched.id, 'Suspended')
        if (result.success) {
          showToast(`Đã tạm khóa tài khoản: ${matched.fullName}.`, 'success')
          loadUsers()
        }
      } catch {
        showToast('Failed to update user status', 'error')
      }
    }

    setModal({ ...modal, isOpen: false })
  }

  const adminActions = [
    { icon: 'people', label: 'Users & Roles', path: ROUTE_PATHS.users },
    { icon: 'history', label: 'Audit Logs', path: ROUTE_PATHS.auditLogs },
    { icon: 'terminal', label: 'System Logs', path: ROUTE_PATHS.systemLogs },
    { icon: 'account_balance_wallet', label: 'Pricing Rules', path: ROUTE_PATHS.pricing },
  ]

  const zones = opsData?.occupancy?.zones || []
  const facilityBreakdown = opsData?.occupancy?.facilityBreakdown || []
  const revenue = opsData?.revenue || []
  const adminActivity = opsData?.adminActivity || []
  const alerts = opsData?.alerts || []
  const kpis = opsData?.kpis || []

  return (
    <AdminLayout>
      <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
        {/* Page Header */}
        <section>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-headline-md text-headline-md font-bold text-on-surface">Admin Dashboard</h2>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                Monitor system users, operations, security alerts, and administrative activity.
              </p>
            </div>
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-50 text-green-700 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              Live operations
            </span>
          </div>
        </section>

        {/* KPI Row - Operational overview */}
        {kpis.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {kpis.map((kpi) => {
              const display = opsLoading
                ? '...'
                : (kpi.value === null || kpi.value === undefined || (typeof kpi.value === 'number' && Number.isNaN(kpi.value))
                  ? '0'
                  : String(kpi.value))
              return (
                <div key={kpi.label} className="glass-card p-4 rounded-lg">
                  <p className="text-on-surface-variant font-label-md uppercase tracking-wider text-[11px]">
                    {kpi.label}
                  </p>
                  <p className="text-xl font-bold text-on-surface mt-1">{display}</p>
                </div>
              )
            })}
          </div>
        )}

        {/* User KPIs - Admin-specific */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass-card p-4 rounded-lg flex items-center justify-between">
            <div>
              <p className="text-on-surface-variant font-label-md uppercase tracking-wider text-[11px]">Total Accounts</p>
              <p className="text-2xl font-bold text-on-surface mt-1">{usersLoading ? '...' : userOverview.totalAccounts}</p>
            </div>
            <span className="material-symbols-outlined text-on-surface-variant text-[24px]">people</span>
          </div>
          <div className="glass-card p-4 rounded-lg flex items-center justify-between">
            <div>
              <p className="text-on-surface-variant font-label-md uppercase tracking-wider text-[11px]">Active Users</p>
              <p className="text-2xl font-bold text-green-600 mt-1">{usersLoading ? '...' : userOverview.activeUsers}</p>
            </div>
            <span className="material-symbols-outlined text-green-600 text-[24px]">check_circle</span>
          </div>
          <div className="glass-card p-4 rounded-lg border-l-4 border-error flex items-center justify-between">
            <div>
              <p className="text-on-surface-variant font-label-md uppercase tracking-wider text-[11px]">Suspended Accounts</p>
              <p className="text-2xl font-bold text-error mt-1">{usersLoading ? '...' : userOverview.suspendedAccounts}</p>
            </div>
            <span className="material-symbols-outlined text-error text-[24px]">block</span>
          </div>
          <div className="glass-card p-4 rounded-lg border-l-4 border-secondary flex items-center justify-between">
            <div>
              <p className="text-on-surface-variant font-label-md uppercase tracking-wider text-[11px]">Pending Requests</p>
              <p className="text-2xl font-bold text-secondary mt-1">{userOverview.pendingRequests}</p>
            </div>
            <span className="material-symbols-outlined text-secondary text-[24px]">pending</span>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: User Table + Occupancy */}
          <div className="lg:col-span-8 space-y-6">
            {/* Occupancy overview */}
            <div className="glass-card rounded-lg overflow-hidden">
              <div className="px-5 py-3 border-b border-outline-variant flex justify-between items-center">
                <div>
                  <h3 className="font-body-lg font-bold text-on-surface">Parking Occupancy Overview</h3>
                  <p className="text-[11px] text-on-surface-variant mt-0.5">Current capacity by parking zone</p>
                </div>
                <button
                  onClick={() => navigate(ROUTE_PATHS.parkingStructure)}
                  className="text-primary font-bold text-[10px] uppercase tracking-wider hover:underline"
                >
                  Manage Structure
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-surface border-b border-outline-variant">
                    <tr>
                      <th className="px-5 py-2.5 font-label-md text-on-surface-variant uppercase text-[10px] tracking-widest font-bold">Zone</th>
                      <th className="px-5 py-2.5 font-label-md text-on-surface-variant uppercase text-[10px] tracking-widest font-bold">Type</th>
                      <th className="px-5 py-2.5 font-label-md text-on-surface-variant uppercase text-[10px] tracking-widest font-bold text-right">Total</th>
                      <th className="px-5 py-2.5 font-label-md text-on-surface-variant uppercase text-[10px] tracking-widest font-bold text-right">Occupied</th>
                      <th className="px-5 py-2.5 font-label-md text-on-surface-variant uppercase text-[10px] tracking-widest font-bold">Occupancy</th>
                      <th className="px-5 py-2.5 font-label-md text-on-surface-variant uppercase text-[10px] tracking-widest font-bold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant">
                    {zones.map((z) => (
                      <tr key={z.zone}>
                        <td className="px-5 py-2.5 font-medium text-on-surface">{z.zone}</td>
                        <td className="px-5 py-2.5 text-body-sm text-on-surface-variant">{z.vehicleType}</td>
                        <td className="px-5 py-2.5 text-body-sm text-on-surface-variant text-right">{z.total}</td>
                        <td className="px-5 py-2.5 text-body-sm text-on-surface-variant text-right">{z.occupied}</td>
                        <td className="px-5 py-2.5 text-body-sm text-on-surface-variant">{z.occupancy}</td>
                        <td className="px-5 py-2.5">
                          <StatusBadge tone={z.status}>{z.status}</StatusBadge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {facilityBreakdown.length > 0 && (
                <div className="p-4 bg-surface border-t border-outline-variant grid grid-cols-3 gap-3">
                  {facilityBreakdown.map((item) => (
                    <div key={item.label}>
                      <p className="text-[10px] uppercase tracking-wider text-on-surface-variant font-bold">{item.label}</p>
                      <p className="text-lg font-bold text-on-surface">{item.value}</p>
                      <p className="text-[10px] text-on-surface-variant">{item.note}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* User & Role Overview */}
            <div className="glass-card rounded-lg overflow-hidden">
              <div className="px-5 py-3 border-b border-outline-variant flex justify-between items-center">
                <h3 className="font-body-lg font-bold text-on-surface">User & Role Overview</h3>
                <div className="relative">
                  <input
                    className="pl-9 pr-4 py-1.5 bg-surface border border-outline-variant rounded text-body-sm focus:ring-1 focus:ring-primary outline-none"
                    placeholder="Filter users..."
                    type="text"
                    value={filterQuery}
                    onChange={(e) => setFilterQuery(e.target.value)}
                  />
                  <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-[16px]">
                    search
                  </span>
                </div>
              </div>

              <div className="overflow-x-auto">
                {usersLoading ? (
                  <div className="p-8 text-center text-on-surface-variant">Loading users...</div>
                ) : (
                  <table className="w-full text-left">
                    <thead className="bg-surface border-b border-outline-variant">
                      <tr>
                        <th className="px-6 py-3 font-label-md text-on-surface-variant uppercase text-[10px] tracking-widest font-bold">User</th>
                        <th className="px-6 py-3 font-label-md text-on-surface-variant uppercase text-[10px] tracking-widest font-bold">Role</th>
                        <th className="px-6 py-3 font-label-md text-on-surface-variant uppercase text-[10px] tracking-widest font-bold">Status</th>
                        <th className="px-6 py-3 font-label-md text-on-surface-variant uppercase text-[10px] tracking-widest font-bold">Last Login</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant">
                      {filteredUsers.map((u) => (
                        <tr key={u.id} className="hover:bg-surface-container-low/30 transition-colors">
                          <td className="px-6 py-3">
                            <div className="font-medium text-on-surface">{u.fullName || u.name || 'N/A'}</div>
                            <div className="text-[10px] text-on-surface-variant">{u.email}</div>
                          </td>
                          <td className="px-6 py-3 text-body-sm text-on-surface-variant">{u.role || 'N/A'}</td>
                          <td className="px-6 py-3">
                            <span
                              className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                                u.status === 'Active'
                                  ? 'bg-green-50 text-green-700'
                                  : u.status === 'Suspended'
                                  ? 'bg-red-50 text-red-700'
                                  : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              {u.status || 'Active'}
                            </span>
                          </td>
                          <td className="px-6 py-3 text-body-sm text-on-surface-variant">
                            {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleDateString('vi-VN') : 'Never'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              <div className="p-3 bg-surface border-t border-outline-variant flex justify-center">
                <button
                  className="text-primary font-bold text-[10px] uppercase tracking-wider hover:underline"
                  onClick={() => navigate(ROUTE_PATHS.users)}
                >
                  View Full User Directory
                </button>
              </div>
            </div>
          </div>

          {/* Right: Admin Actions + Revenue + Alerts */}
          <div className="lg:col-span-4 space-y-4">
            {/* Admin Actions */}
            <div className="glass-card rounded-lg p-5">
              <h3 className="font-body-lg font-bold text-on-surface mb-4">Admin Actions</h3>
              <div className="grid grid-cols-1 gap-2">
                <button
                  className="flex items-center justify-center gap-2 bg-primary text-white py-2.5 px-4 rounded text-sm font-bold transition-all hover:opacity-90"
                  onClick={handleNewUser}
                >
                  <span className="material-symbols-outlined text-[18px]">person_add</span>
                  New User Account
                </button>
                <button
                  className="flex items-center justify-center gap-2 border border-outline-variant text-on-surface py-2 px-4 rounded text-sm font-bold transition-all hover:bg-surface-container"
                  onClick={handleResetCredentials}
                >
                  <span className="material-symbols-outlined text-[18px]">key</span>
                  Reset Credentials
                </button>
                <button
                  className="flex items-center justify-center gap-2 border border-error/30 text-error py-2 px-4 rounded text-sm font-bold transition-all hover:bg-error/5"
                  onClick={handleRestrictAccess}
                >
                  <span className="material-symbols-outlined text-[18px]">lock</span>
                  Restrict Access
                </button>
              </div>
            </div>

            {/* Quick Admin Nav */}
            <div className="glass-card rounded-lg p-5">
              <h3 className="font-body-lg font-bold text-on-surface mb-4">Administration</h3>
              <div className="grid grid-cols-1 gap-2">
                {adminActions.map((a) => (
                  <button
                    key={a.label}
                    className="flex items-center gap-3 w-full text-left px-3 py-2 rounded border border-outline-variant hover:bg-surface-container transition-colors text-sm font-semibold text-on-surface"
                    onClick={() => navigate(a.path)}
                  >
                    <span className="material-symbols-outlined text-[18px] text-primary">{a.icon}</span>
                    {a.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Revenue Summary */}
            {revenue.length > 0 && (
              <div className="glass-card rounded-lg p-5">
                <h3 className="font-body-lg font-bold text-on-surface mb-3">Today&apos;s Revenue</h3>
                <div className="space-y-2">
                  {revenue.map((item, idx) => (
                    <div
                      key={item.label}
                      className={`flex justify-between items-center ${
                        idx === 0 ? 'pb-3 mb-1 border-b border-outline-variant' : ''
                      }`}
                    >
                      <span className={idx === 0 ? 'font-semibold text-on-surface' : 'text-body-sm text-on-surface-variant'}>
                        {item.label}
                      </span>
                      <strong className={idx === 0 ? 'text-lg text-primary' : 'text-body-sm text-on-surface'}>
                        {item.value}
                      </strong>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Operational Alerts */}
            {alerts.length > 0 && (
              <div className="glass-card rounded-lg p-5">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-body-lg font-bold text-on-surface">Operational Alerts</h3>
                  <span className="text-xs font-bold text-error">{alerts.length}</span>
                </div>
                <div className="space-y-2">
                  {alerts.map((alert) => (
                    <div key={alert.text} className="flex items-start justify-between gap-2 py-1">
                      <p className="text-body-sm text-on-surface flex-1">{alert.text}</p>
                      <StatusBadge tone={alert.severity}>{alert.severity}</StatusBadge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Policy Note */}
            <div className="glass-card rounded-lg p-4 bg-slate-50 border border-dashed border-slate-300">
              <div className="flex items-start gap-3 text-slate-600">
                <span className="material-symbols-outlined text-[18px]">info</span>
                <p className="text-[10px] leading-relaxed m-0">
                  Administrator actions are logged and subject to periodic audit review.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Admin Activity */}
        {adminActivity.length > 0 && (
          <div className="glass-card rounded-lg overflow-hidden">
            <div className="px-5 py-3 border-b border-outline-variant">
              <h3 className="font-body-lg font-bold text-on-surface">Recent Admin Activity</h3>
              <p className="text-[11px] text-on-surface-variant mt-0.5">Latest administrative actions and audit events</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-surface border-b border-outline-variant">
                  <tr>
                    <th className="px-5 py-2.5 font-label-md text-on-surface-variant uppercase text-[10px] tracking-widest font-bold">Time</th>
                    <th className="px-5 py-2.5 font-label-md text-on-surface-variant uppercase text-[10px] tracking-widest font-bold">Activity</th>
                    <th className="px-5 py-2.5 font-label-md text-on-surface-variant uppercase text-[10px] tracking-widest font-bold">Reference</th>
                    <th className="px-5 py-2.5 font-label-md text-on-surface-variant uppercase text-[10px] tracking-widest font-bold">Performed By</th>
                    <th className="px-5 py-2.5 font-label-md text-on-surface-variant uppercase text-[10px] tracking-widest font-bold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant">
                  {adminActivity.map((row) => (
                    <tr key={`${row.time}-${row.reference}`}>
                      <td className="px-5 py-2.5 text-body-sm text-on-surface-variant">{row.time}</td>
                      <td className="px-5 py-2.5 text-body-sm font-medium text-on-surface">{row.activity}</td>
                      <td className="px-5 py-2.5 text-body-sm text-on-surface-variant">{row.reference}</td>
                      <td className="px-5 py-2.5 text-body-sm text-on-surface-variant">{row.performedBy}</td>
                      <td className="px-5 py-2.5">
                        <StatusBadge tone={row.status}>{row.status}</StatusBadge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Modal */}
        {modal.isOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
              <header className="px-6 py-4 border-b border-outline-variant flex justify-between items-center bg-slate-50">
                <h3 className="font-body-lg font-bold text-on-surface">
                  {modal.type === 'newUser' && 'Tạo tài khoản quản trị mới'}
                  {modal.type === 'resetCredentials' && 'Reset mật khẩu nhân viên'}
                  {modal.type === 'restrictAccess' && 'Tạm khóa tài khoản'}
                </h3>
                <button
                  className="text-on-surface-variant hover:bg-slate-200 p-1.5 rounded-full"
                  onClick={() => setModal({ ...modal, isOpen: false })}
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </header>

              <div className="p-6 space-y-4">
                {modal.type === 'newUser' && (
                  <>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-on-surface-variant uppercase">Họ và tên</label>
                      <input
                        className="w-full px-3.5 py-2 border border-outline-variant rounded text-body-sm outline-none focus:ring-1 focus:ring-primary"
                        value={modal.inputVal1}
                        onChange={(e) => setModal({ ...modal, inputVal1: e.target.value })}
                        placeholder="Họ và tên..."
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-on-surface-variant uppercase">Email</label>
                      <input
                        className="w-full px-3.5 py-2 border border-outline-variant rounded text-body-sm outline-none focus:ring-1 focus:ring-primary"
                        value={modal.inputVal2}
                        onChange={(e) => setModal({ ...modal, inputVal2: e.target.value })}
                        placeholder="email@parking.com..."
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-on-surface-variant uppercase">Vai trò</label>
                      <select
                        className="w-full px-3.5 py-2 border border-outline-variant rounded text-body-sm outline-none focus:ring-1 focus:ring-primary"
                        value={modal.inputVal3}
                        onChange={(e) => setModal({ ...modal, inputVal3: e.target.value })}
                      >
                        <option value="Admin">Admin</option>
                        <option value="Manager">Manager</option>
                        <option value="Staff">Staff</option>
                        <option value="Driver">Driver</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs font-bold text-on-surface-variant uppercase">Mật khẩu khởi tạo</label>
                      <input
                        type="password"
                        className="w-full px-3.5 py-2 border border-outline-variant rounded text-body-sm outline-none focus:ring-1 focus:ring-primary"
                        value={modal.inputVal5}
                        onChange={(e) => setModal({ ...modal, inputVal5: e.target.value })}
                        placeholder="Ít nhất 6 ký tự..."
                        autoComplete="new-password"
                      />
                    </div>
                  </>
                )}

                {(modal.type === 'resetCredentials' || modal.type === 'restrictAccess') && (
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-on-surface-variant uppercase">
                      {modal.type === 'resetCredentials' ? 'Email tài khoản cần reset' : 'Email tài khoản cần khóa'}
                    </label>
                    <input
                      className="w-full px-3.5 py-2 border border-outline-variant rounded text-body-sm outline-none focus:ring-1 focus:ring-primary"
                      value={modal.inputVal1}
                      onChange={(e) => setModal({ ...modal, inputVal1: e.target.value })}
                      placeholder="email@parking.com..."
                    />
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    className="px-4 py-2 border border-outline-variant text-on-surface rounded text-body-sm font-semibold hover:bg-slate-50"
                    onClick={() => setModal({ ...modal, isOpen: false })}
                  >
                    Hủy bỏ
                  </button>
                  <button
                    className="px-4 py-2 bg-primary hover:bg-blue-700 text-white rounded text-body-sm font-bold"
                    onClick={handleModalConfirm}
                  >
                    Xác nhận
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Toast */}
        {toast.show && (
          <div
            className={`fixed bottom-6 right-6 flex items-center gap-3 px-5 py-3 rounded-lg shadow-lg z-50 ${
              toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
            }`}
          >
            <span className="material-symbols-outlined">
              {toast.type === 'success' ? 'check_circle' : 'error'}
            </span>
            <span>{toast.message}</span>
          </div>
        )}
      </div>

      <style>{`
        .glass-card {
          background: white;
          border: 1px solid #e2e8f0;
          box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);
        }
        .admin-badge {
          display: inline-block;
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .admin-badge.normal { background: #f1f5f9; color: #475569; }
        .admin-badge.high { background: #fee2e2; color: #b91c1c; }
        .admin-badge.medium { background: #fef3c7; color: #b45309; }
        .admin-badge.low { background: #dcfce7; color: #166534; }
        .admin-badge.success { background: #dcfce7; color: #166534; }
        .admin-badge.active { background: #dcfce7; color: #166534; }
      `}</style>
    </AdminLayout>
  )
}

export default AdminDashboardPage