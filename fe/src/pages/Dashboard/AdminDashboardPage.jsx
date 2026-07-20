import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import ManagerLayout from '../../layouts/ManagerLayout'
import { getUsers, createUser, updateUserStatus } from '../../services/userService'
import { ROUTE_PATHS } from '../../routes/routePaths'
import '../../layouts/MainLayout.css'

function AdminDashboardPage() {
  const navigate = useNavigate()

  // State
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterQuery, setFilterQuery] = useState('')
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' })

  // Modal state
  const [modal, setModal] = useState({
    isOpen: false,
    type: '',
    inputVal1: '',
    inputVal2: '',
    inputVal3: 'Attendant',
    inputVal4: 'Entry Gate A'
  })

  // Toast helper
  const showToast = useCallback((message, type = 'success') => {
    setToast({ show: true, message, type })
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000)
  }, [])

  // Load users
  const loadUsers = useCallback(async () => {
    setLoading(true)
    try {
      const result = await getUsers()
      if (result.success) {
        setUsers(result.data)
      }
    } catch {
      showToast('Failed to load users', 'error')
    } finally {
      setLoading(false)
    }
  }, [showToast])

  // Load users on mount
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadUsers()
  }, [loadUsers])

  // Filtered users
  const filteredUsers = users.filter(u =>
    u.fullName?.toLowerCase().includes(filterQuery.toLowerCase()) ||
    u.email?.toLowerCase().includes(filterQuery.toLowerCase()) ||
    u.role?.toLowerCase().includes(filterQuery.toLowerCase())
  )

  // KPIs
  const kpis = {
    totalAccounts: users.length,
    activeUsers: users.filter(u => u.status === 'Active').length,
    suspendedAccounts: users.filter(u => u.status === 'Suspended' || u.status === 'Locked').length,
    pendingRequests: 2
  }

  // Handlers
  const handleNewUser = () => {
    setModal({
      isOpen: true,
      type: 'newUser',
      inputVal1: '',
      inputVal2: '',
      inputVal3: 'Attendant',
      inputVal4: 'Entry Gate A'
    })
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

  const handleModalConfirm = async () => {
    if (modal.type === 'newUser') {
      const name = modal.inputVal1.trim()
      const email = modal.inputVal2.trim()
      const role = modal.inputVal3.trim()

      if (!name || !email) {
        showToast('Vui lòng điền họ tên và email hợp lệ.', 'error')
        return
      }

      try {
        const result = await createUser({
          fullName: name,
          email,
          role,
          password: 'Temp@123'
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
    }

    else if (modal.type === 'resetCredentials') {
      const targetEmail = modal.inputVal1.trim()
      if (!targetEmail) {
        showToast('Vui lòng nhập địa chỉ email.', 'error')
        return
      }
      showToast(`Đã gửi yêu cầu Reset mật khẩu tới ${targetEmail}.`, 'success')
    }

    else if (modal.type === 'restrictAccess') {
      const targetEmail = modal.inputVal1.trim()
      if (!targetEmail) {
        showToast('Vui lòng nhập địa chỉ email.', 'error')
        return
      }
      const matched = users.find(u => u.email?.toLowerCase() === targetEmail.toLowerCase())
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

  return (
    <ManagerLayout>
      <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
        {/* Page Header */}
        <section>
          <h2 className="font-headline-md text-headline-md font-bold text-on-surface">Admin Dashboard</h2>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">Monitor system users, account status, security alerts, and administrative activity.</p>
        </section>

        {/* KPI Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass-card p-4 rounded-lg flex items-center justify-between">
            <div>
              <p className="text-on-surface-variant font-label-md uppercase tracking-wider text-[11px]">Total Accounts</p>
              <p className="text-2xl font-bold text-on-surface mt-1">{loading ? '...' : kpis.totalAccounts}</p>
            </div>
            <span className="material-symbols-outlined text-on-surface-variant text-[24px]">people</span>
          </div>
          <div className="glass-card p-4 rounded-lg flex items-center justify-between">
            <div>
              <p className="text-on-surface-variant font-label-md uppercase tracking-wider text-[11px]">Active Users</p>
              <p className="text-2xl font-bold text-green-600 mt-1">{loading ? '...' : kpis.activeUsers}</p>
            </div>
            <span className="material-symbols-outlined text-green-600 text-[24px]">check_circle</span>
          </div>
          <div className="glass-card p-4 rounded-lg border-l-4 border-error flex items-center justify-between">
            <div>
              <p className="text-on-surface-variant font-label-md uppercase tracking-wider text-[11px]">Suspended Accounts</p>
              <p className="text-2xl font-bold text-error mt-1">{loading ? '...' : kpis.suspendedAccounts}</p>
            </div>
            <span className="material-symbols-outlined text-error text-[24px]">block</span>
          </div>
          <div className="glass-card p-4 rounded-lg border-l-4 border-secondary flex items-center justify-between">
            <div>
              <p className="text-on-surface-variant font-label-md uppercase tracking-wider text-[11px]">Pending Requests</p>
              <p className="text-2xl font-bold text-secondary mt-1">{kpis.pendingRequests}</p>
            </div>
            <span className="material-symbols-outlined text-secondary text-[24px]">pending</span>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: User Table */}
          <div className="lg:col-span-8 space-y-4">
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
                  <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-[16px]">search</span>
                </div>
              </div>

              <div className="overflow-x-auto">
                {loading ? (
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
                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                              u.status === 'Active' ? 'bg-green-50 text-green-700' :
                              u.status === 'Suspended' ? 'bg-red-50 text-red-700' :
                              'bg-slate-100 text-slate-600'
                            }`}>
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

          {/* Right: Actions */}
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

            {/* Policy Note */}
            <div className="glass-card rounded-lg p-4 bg-slate-50 border border-dashed border-slate-300">
              <div className="flex items-start gap-3 text-slate-600">
                <span className="material-symbols-outlined text-[18px]">info</span>
                <p className="text-[10px] leading-relaxed m-0">Administrator actions are logged and subject to periodic audit review.</p>
              </div>
            </div>
          </div>
        </div>

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
                <button className="text-on-surface-variant hover:bg-slate-200 p-1.5 rounded-full" onClick={() => setModal({ ...modal, isOpen: false })}>
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
                        <option value="Operator">Operator</option>
                        <option value="Attendant">Attendant</option>
                      </select>
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
          <div className={`fixed bottom-6 right-6 flex items-center gap-3 px-5 py-3 rounded-lg shadow-lg z-50 ${
            toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
          }`}>
            <span className="material-symbols-outlined">{toast.type === 'success' ? 'check_circle' : 'error'}</span>
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
      `}</style>
    </ManagerLayout>
  )
}

export default AdminDashboardPage
