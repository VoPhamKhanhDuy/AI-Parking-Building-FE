import { useEffect, useMemo, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  createUser,
  deleteUser,
  getUsers,
  initialUserKPIs,
  initialUsersList,
  initialUserChanges,
  rolePermissionMap,
  updateUser,
  updateUserStatus
} from './usersRolesService'
import { ROUTE_PATHS } from '../../routes/routePaths'
import '../../layouts/MainLayout.css'

function UsersRolesPage() {
  const navigate = useNavigate()

  const [users, setUsers] = useState(initialUsersList)
  const [kpis, setKpis] = useState(initialUserKPIs)
  const [userChanges, setUserChanges] = useState(initialUserChanges)
  const [selectedUserId, setSelectedUserId] = useState(null)
  const [openMenu, setOpenMenu] = useState(null)

  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState('All Roles')
  const [statusFilter, setStatusFilter] = useState('All Status')

  const [modal, setModal] = useState({
    isOpen: false,
    type: '',
    inputVal1: '',
    inputVal2: '',
    inputVal3: 'Parking Staff',
    inputVal4: 'Entry Gate A'
  })

  const [toast, setToast] = useState({ show: false, message: '', type: 'success' })

  useEffect(() => {
    let active = true
    getUsers()
      .then((result) => {
        if (!active) return
        const list = Array.isArray(result?.data) ? result.data : []
        setUsers(list)
        const activeCount = list.filter((u) => u.status === 'Active').length
        const adminCount = list.filter((u) => String(u.role).toLowerCase() === 'admin').length
        setKpis([
          { label: 'Total Accounts', value: list.length },
          { label: 'Active Today', value: activeCount },
          { label: 'Admins', value: adminCount }
        ])
        setSelectedUserId((current) => current || list[0]?.id || null)
      })
      .catch(() => active && false)
    return () => { active = false }
  }, [])

  const selectedUser = useMemo(
    () => users.find((u) => u.id === selectedUserId) || users[0] || null,
    [users, selectedUserId]
  )

  const permissions = useMemo(() => {
    if (!selectedUser) return { allowed: '—', limited: '—', denied: '—' }
    return rolePermissionMap[selectedUser.role] || {
      allowed: 'Entry/Exit Logs, Basic Reports',
      limited: 'User Directory (View Only)',
      denied: 'System Settings, Audit Logs'
    }
  }, [selectedUser])

  const showToast = useCallback((message, type = 'success') => {
    setToast({ show: true, message, type })
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000)
  }, [])

  const addChangeLog = useCallback((action, targetName) => {
    const timeStr = new Date().toTimeString().split(' ')[0]
    setUserChanges((current) => [
      { time: timeStr, action, target: targetName, changedBy: 'System Admin', result: 'Success' },
      ...current
    ])
  }, [])

  const handleAddUser = useCallback(() => {
    setModal({ isOpen: true, type: 'addUser', inputVal1: '', inputVal2: '', inputVal3: 'Parking Staff', inputVal4: 'Entry Gate A' })
  }, [])

  const handleEditRole = useCallback(() => {
    if (!selectedUser) return
    setModal({ isOpen: true, type: 'editRole', inputVal1: selectedUser.role, inputVal2: '', inputVal3: '', inputVal4: '' })
  }, [selectedUser])

  const handleResetPassword = useCallback(() => {
    if (!selectedUser) return
    setModal({ isOpen: true, type: 'resetPassword', inputVal1: '', inputVal2: '', inputVal3: '', inputVal4: '' })
  }, [selectedUser])

  const handleSuspendAccount = useCallback(() => {
    if (!selectedUser) return
    if (selectedUser.status === 'Suspended') {
      updateUserStatus(selectedUser.id, 'Active')
        .then((result) => {
          if (result?.success) {
            setUsers((prev) => prev.map((u) => u.id === selectedUser.id ? { ...u, ...result.data } : u))
            addChangeLog('Status Changed', selectedUser.fullName)
            showToast(`Đã kích hoạt lại tài khoản ${selectedUser.fullName}.`, 'success')
          } else {
            showToast(result?.message || 'Failed to reactivate.', 'error')
          }
        })
      return
    }
    setModal({ isOpen: true, type: 'suspendAccount', inputVal1: '', inputVal2: '', inputVal3: '', inputVal4: '' })
  }, [selectedUser, addChangeLog, showToast])

  const handleModalConfirm = useCallback(async () => {
    if (!modal.isOpen) return
    if (modal.type === 'addUser') {
      const name = modal.inputVal1.trim()
      const email = modal.inputVal2.trim()
      const role = modal.inputVal3.trim()
      const area = modal.inputVal4.trim()
      if (!name || !email) {
        showToast('Vui lòng điền đầy đủ họ tên và email.', 'error')
        return
      }
      const result = await createUser({ fullName: name, email, role, area, password: 'Temp@123' })
      if (result?.success) {
        setUsers((prev) => [...prev, result.data])
        setKpis((prev) => prev.map((k) => k.label === 'Total Accounts' ? { ...k, value: k.value + 1 } : k))
        setSelectedUserId(result.data.id)
        addChangeLog('Account Created', name)
        setModal((m) => ({ ...m, isOpen: false }))
        showToast(`Đã thêm người dùng ${name}.`, 'success')
      } else {
        showToast(result?.message || 'Failed to create user', 'error')
      }
      return
    }
    if (modal.type === 'editRole') {
      const newRole = modal.inputVal1.trim()
      if (!newRole || !selectedUser) return
      const result = await updateUser(selectedUser.id, { role: newRole })
      if (result?.success) {
        setUsers((prev) => prev.map((u) => u.id === selectedUser.id ? { ...u, ...result.data } : u))
        addChangeLog('Role Updated', selectedUser.fullName)
        setModal((m) => ({ ...m, isOpen: false }))
        showToast(`Đã cập nhật vai trò của ${selectedUser.fullName}.`, 'success')
      } else {
        showToast(result?.message || 'Failed to update role.', 'error')
      }
      return
    }
    if (modal.type === 'resetPassword') {
      if (!selectedUser) return
      // Backend doesn't expose a reset endpoint yet — surface the intent as a stub.
      addChangeLog('Password Reset', selectedUser.fullName)
      setModal((m) => ({ ...m, isOpen: false }))
      showToast(`Yêu cầu reset mật khẩu của ${selectedUser.fullName} đã ghi nhận.`, 'success')
      return
    }
    if (modal.type === 'suspendAccount') {
      if (!selectedUser) return
      const result = await updateUserStatus(selectedUser.id, 'Suspended')
      if (result?.success) {
        setUsers((prev) => prev.map((u) => u.id === selectedUser.id ? { ...u, ...result.data } : u))
        addChangeLog('Status Changed', selectedUser.fullName)
        setModal((m) => ({ ...m, isOpen: false }))
        showToast(`Đã khóa tài khoản ${selectedUser.fullName}.`, 'success')
      } else {
        showToast(result?.message || 'Failed to suspend.', 'error')
      }
    }
  }, [modal, selectedUser, addChangeLog, showToast])

  const handleDelete = useCallback(async (user) => {
    if (!user) return
    if (!window.confirm(`Xóa tài khoản ${user.fullName}?`)) return
    const result = await deleteUser(user.id)
    if (result?.success) {
      setUsers((prev) => prev.filter((u) => u.id !== user.id))
      setKpis((prev) => prev.map((k) => k.label === 'Total Accounts' ? { ...k, value: Math.max(0, k.value - 1) } : k))
      showToast(`Đã xóa ${user.fullName}.`, 'success')
    } else {
      showToast(result?.message || 'Failed to delete.', 'error')
    }
  }, [showToast])

  const filteredUsers = useMemo(() => users.filter((u) => {
    const blob = `${u.fullName || ''} ${u.email || ''} ${u.role || ''} ${u.area || ''}`.toLowerCase()
    if (searchQuery && !blob.includes(searchQuery.toLowerCase())) return false
    if (roleFilter !== 'All Roles' && u.role !== roleFilter) return false
    if (statusFilter !== 'All Status' && u.status !== statusFilter) return false
    return true
  }), [users, searchQuery, roleFilter, statusFilter])

  const uniqueRoles = useMemo(() => ['All Roles', ...Array.from(new Set(users.map((u) => u.role).filter(Boolean)))], [users])
  const uniqueStatuses = ['All Status', 'Active', 'Suspended', 'Pending', 'Inactive']

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
              <a className="flex items-center gap-3 px-4 py-2 text-white bg-primary rounded-lg mx-2 transition-all duration-200" href="#">
                <span className="material-symbols-outlined text-[20px]">group</span>
                <span className="font-body-md text-body-md font-medium">Users &amp; Roles</span>
              </a>
              <a className="flex items-center gap-3 px-4 py-2 text-slate-300 hover:text-white transition-colors duration-200 hover:bg-white/5 rounded-lg mx-2 cursor-pointer" onClick={() => navigate(ROUTE_PATHS.auditLogs)}>
                <span className="material-symbols-outlined text-[20px]">list_alt</span>
                <span className="font-body-md text-body-md">Audit Logs</span>
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
            <h2 className="font-headline-md text-headline-md text-on-surface">Users &amp; Roles Management</h2>
            <p className="font-body-md text-body-md text-on-surface-variant mt-0.5">Manage staff accounts, role assignments, account status, and permission levels.</p>
          </section>

          {/* KPI Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="glass-card p-4 rounded-lg">
              <div className="flex items-center justify-between mb-1">
                <p className="text-on-surface-variant font-label-md uppercase tracking-wider text-[11px]">Total Accounts</p>
                <span className="material-symbols-outlined text-on-surface-variant text-[18px]">people</span>
              </div>
              <p className="text-2xl font-bold text-on-surface">{kpis.totalAccounts}</p>
            </div>
            <div className="glass-card p-4 rounded-lg">
              <div className="flex items-center justify-between mb-1">
                <p className="text-on-surface-variant font-label-md uppercase tracking-wider text-[11px]">Active Accounts</p>
                <span className="material-symbols-outlined text-green-600 text-[18px]">check_circle</span>
              </div>
              <p className="text-2xl font-bold text-on-surface">{kpis.activeAccounts}</p>
            </div>
            <div className="glass-card p-4 rounded-lg border-l-4 border-error">
              <div className="flex items-center justify-between mb-1">
                <p className="text-on-surface-variant font-label-md uppercase tracking-wider text-[11px]">Suspended Accounts</p>
                <span className="material-symbols-outlined text-error text-[18px]">block</span>
              </div>
              <p className="text-2xl font-bold text-on-surface">{kpis.suspendedAccounts}</p>
            </div>
            <div className="glass-card p-4 rounded-lg border-l-4 border-secondary">
              <div className="flex items-center justify-between mb-1">
                <p className="text-on-surface-variant font-label-md uppercase tracking-wider text-[11px]">Pending Invitations</p>
                <span className="material-symbols-outlined text-secondary text-[18px]">mail</span>
              </div>
              <p className="text-2xl font-bold text-on-surface">{kpis.pendingInvitations}</p>
            </div>
          </div>

          {/* Main Section */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            
            {/* Left: User Directory list */}
            <div className="lg:col-span-8 space-y-4">
              <div className="glass-card rounded-lg overflow-hidden flex flex-col">
                
                {/* Header Filter Panel */}
                <div className="px-5 py-3 border-b border-outline-variant flex flex-wrap gap-3 justify-between items-center">
                  <h3 className="font-body-lg font-bold text-on-surface">User Directory</h3>
                  <div className="flex gap-2 flex-1 min-w-[300px] justify-end">
                    <div className="relative flex-1 max-w-[200px]">
                      <input 
                        className="w-full pl-9 pr-4 py-1 bg-surface-container-low border border-outline-variant rounded text-body-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none" 
                        placeholder="Search..." 
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                      <span className="material-symbols-outlined absolute left-2.5 top-1.5 text-on-surface-variant text-[16px]">search</span>
                    </div>
                    <select 
                      className="bg-surface-container-low border border-outline-variant rounded text-body-sm px-2 py-1 outline-none"
                      value={roleFilter}
                      onChange={(e) => setRoleFilter(e.target.value)}
                    >
                      {uniqueRoles.map((r) => <option key={r}>{r}</option>)}
                    </select>
                    <select 
                      className="bg-surface-container-low border border-outline-variant rounded text-body-sm px-2 py-1 outline-none"
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                    >
                      {uniqueStatuses.map((s) => <option key={s}>{s}</option>)}
                    </select>
                    <button 
                      className="bg-primary text-white px-3 py-1 rounded text-body-sm font-bold active:scale-[0.98] transition-all"
                      onClick={handleAddUser}
                    >
                      + Add User
                    </button>
                  </div>
                </div>

                {/* Table Data */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead className="bg-surface-container-lowest border-b border-outline-variant">
                      <tr>
                        <th className="px-4 py-2.5 font-label-md text-on-surface-variant uppercase text-[10px] tracking-widest">User</th>
                        <th className="px-4 py-2.5 font-label-md text-on-surface-variant uppercase text-[10px] tracking-widest">Role</th>
                        <th className="px-4 py-2.5 font-label-md text-on-surface-variant uppercase text-[10px] tracking-widest">Area</th>
                        <th className="px-4 py-2.5 font-label-md text-on-surface-variant uppercase text-[10px] tracking-widest">Status</th>
                        <th className="px-4 py-2.5 font-label-md text-on-surface-variant uppercase text-[10px] tracking-widest">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant">
                      {filteredUsers.map((user) => {
                        const isSelected = selectedUser?.id === user.id
                        return (
                          <tr 
                            key={user.id}
                            className={`cursor-pointer transition-colors ${isSelected ? 'bg-primary/5' : 'hover:bg-surface-container-low/30'}`}
                            onClick={() => setSelectedUserId(user.id)}
                          >
                            <td className="px-4 py-3">
                              <div className="font-body-sm text-on-surface font-medium">{user.fullName}</div>
                              <div className="text-[10px] text-on-surface-variant">{user.email}</div>
                            </td>
                            <td className="px-4 py-3 text-body-sm text-on-surface-variant">{user.role}</td>
                            <td className="px-4 py-3 text-body-sm text-on-surface-variant">{user.area}</td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                                user.status === 'Active' ? 'bg-green-50 text-green-700' :
                                user.status === 'Suspended' ? 'bg-red-50 text-red-700' :
                                'bg-slate-100 text-slate-600'
                              }`}>
                                {user.status}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <button
                                className="text-primary material-symbols-outlined"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setSelectedUserId(user.id)
                                  handleEditRole()
                                }}
                              >
                                edit
                              </button>
                              <button
                                className="text-error material-symbols-outlined ml-2"
                                title="Delete"
                                onClick={(e) => { e.stopPropagation(); handleDelete(user) }}
                              >
                                delete
                              </button>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="p-2.5 bg-surface-container-lowest border-t border-outline-variant flex justify-center">
                  <button className="text-primary font-bold text-[10px] uppercase tracking-wider hover:underline" onClick={() => window.alert('Đang tải danh sách người dùng...')}>
                    View Full User Directory
                  </button>
                </div>

              </div>
            </div>

            {/* Right Column: Selected User Detail & Permissions */}
            <div className="lg:col-span-4 space-y-4">
              
              {/* Selected User Detail Card */}
              <div className="glass-card rounded-lg p-5">
                <h3 className="font-body-lg font-bold text-on-surface mb-4">Selected User Detail</h3>
                
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span className="text-body-sm text-on-surface-variant">Name</span>
                    <span className="text-body-sm font-medium">{selectedUser.fullName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-body-sm text-on-surface-variant">Email</span>
                    <span className="text-body-sm">{selectedUser.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-body-sm text-on-surface-variant">Role</span>
                    <span className="text-body-sm">{selectedUser.role}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-body-sm text-on-surface-variant">Area</span>
                    <span className="text-body-sm">{selectedUser.area}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-body-sm text-on-surface-variant">Status</span>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                      selectedUser.status === 'Active' ? 'bg-green-50 text-green-700' :
                      selectedUser.status === 'Suspended' ? 'bg-red-50 text-red-700' :
                      'bg-slate-100 text-slate-600'
                    }`}>
                      {selectedUser.status}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-body-sm text-on-surface-variant">Last Login</span>
                    <span className="text-body-sm">{selectedUser.lastLoginAt ? new Date(selectedUser.lastLoginAt).toLocaleString('vi-VN') : '—'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-body-sm text-on-surface-variant">Created Date</span>
                    <span className="text-body-sm">{selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString('en-GB') : '—'}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-2">
                  <button 
                    className="w-full py-2 bg-[#1e293b] text-white rounded text-sm font-bold hover:bg-slate-800 active:scale-[0.98] transition-all"
                    onClick={handleEditRole}
                  >
                    Edit Role
                  </button>
                  <button 
                    className="w-full py-2 border border-outline-variant rounded text-sm font-bold hover:bg-slate-50 active:scale-[0.98] transition-all"
                    onClick={handleResetPassword}
                  >
                    Reset Password
                  </button>
                  <button 
                    className={`w-full py-2 border rounded text-sm font-bold active:scale-[0.98] transition-all ${
                      selectedUser.status === 'Suspended' 
                        ? 'border-green-200 text-green-700 hover:bg-green-50' 
                        : 'border-error/30 text-error hover:bg-error/5'
                    }`}
                    onClick={handleSuspendAccount}
                  >
                    {selectedUser.status === 'Suspended' ? 'Reactivate Account' : 'Suspend Account'}
                  </button>
                </div>
              </div>

              {/* Role Permission Summary */}
              <div className="glass-card rounded-lg p-5">
                <h3 className="font-body-lg font-bold text-on-surface mb-3">Role Permission Summary</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-green-700">
                    <span className="material-symbols-outlined text-[18px]">check_circle</span>
                    <span className="text-body-sm">Allowed: {permissions.allowed}</span>
                  </div>
                  <div className="flex items-center gap-2 text-on-surface-variant">
                    <span className="material-symbols-outlined text-[18px]">info</span>
                    <span className="text-body-sm">Limited: {permissions.limited}</span>
                  </div>
                  <div className="flex items-center gap-2 text-error">
                    <span className="material-symbols-outlined text-[18px]">cancel</span>
                    <span className="text-body-sm">No Access: {permissions.denied}</span>
                  </div>
                </div>
              </div>

            </div>

          </div>

          {/* Bottom Section: Recent User Changes */}
          <section className="glass-card rounded-lg overflow-hidden bg-white">
            <div className="px-5 py-3 border-b border-outline-variant flex justify-between items-center">
              <h3 className="font-body-lg font-bold text-on-surface">Recent User Changes</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-surface-container-lowest border-b border-outline-variant">
                  <tr>
                    <th className="px-6 py-2.5 font-label-md text-on-surface-variant uppercase text-[10px] tracking-widest">Time</th>
                    <th className="px-6 py-2.5 font-label-md text-on-surface-variant uppercase text-[10px] tracking-widest">Action</th>
                    <th className="px-6 py-2.5 font-label-md text-on-surface-variant uppercase text-[10px] tracking-widest">Target User</th>
                    <th className="px-6 py-2.5 font-label-md text-on-surface-variant uppercase text-[10px] tracking-widest">Changed By</th>
                    <th className="px-6 py-2.5 font-label-md text-on-surface-variant uppercase text-[10px] tracking-widest">Result</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant bg-white">
                  {userChanges.map((log, index) => (
                    <tr key={index} className="hover:bg-surface-container-low/30 transition-colors">
                      <td className="px-6 py-2.5 text-body-sm text-on-surface-variant">{log.time}</td>
                      <td className="px-6 py-2.5 text-body-sm font-medium text-on-surface">{log.action}</td>
                      <td className="px-6 py-2.5 text-body-sm text-on-surface-variant">{log.target}</td>
                      <td className="px-6 py-2.5 text-body-sm text-on-surface-variant">{log.changedBy}</td>
                      <td className="px-6 py-2.5">
                        <span className="text-green-700 font-bold text-[9px] uppercase">
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

      {modal.isOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden border border-outline-variant">
            <header className="px-6 py-4 border-b border-outline-variant flex justify-between items-center bg-slate-50">
              <h3 className="font-body-lg font-bold text-on-surface">
                {modal.type === 'addUser' && 'Thêm thành viên hệ thống mới'}
                {modal.type === 'editRole' && 'Cập nhật vai trò thành viên'}
                {modal.type === 'resetPassword' && 'Reset mật khẩu thành viên'}
                {modal.type === 'suspendAccount' && 'Tạm khóa tài khoản'}
              </h3>
              <button className="text-on-surface-variant hover:bg-slate-200 p-1.5 rounded-full" onClick={() => setModal({ ...modal, isOpen: false })}>
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </header>
            
            <div className="p-6 space-y-4">
              {modal.type === 'addUser' && (
                <>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-on-surface-variant uppercase">Họ và tên</label>
                    <input className="w-full px-3.5 py-2 border border-outline-variant rounded text-body-sm outline-none focus:ring-1 focus:ring-primary focus:border-primary" value={modal.inputVal1} onChange={(e) => setModal({...modal, inputVal1: e.target.value})} placeholder="Họ và tên..." />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-on-surface-variant uppercase">Email</label>
                    <input className="w-full px-3.5 py-2 border border-outline-variant rounded text-body-sm outline-none focus:ring-1 focus:ring-primary focus:border-primary" value={modal.inputVal2} onChange={(e) => setModal({...modal, inputVal2: e.target.value})} placeholder="email@parking.vn..." />
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

              {modal.type === 'editRole' && (
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-on-surface-variant uppercase">Nhập vai trò mới cho {selectedUser.fullName}</label>
                  <input className="w-full px-3.5 py-2 border border-outline-variant rounded text-body-sm outline-none focus:ring-1 focus:ring-primary focus:border-primary" value={modal.inputVal1} onChange={(e) => setModal({...modal, inputVal1: e.target.value})} placeholder="Parking Staff..." />
                </div>
              )}

              {modal.type === 'resetPassword' && (
                <p className="text-body-sm text-on-surface-variant font-medium">
                  Bạn có chắc chắn muốn reset mật khẩu của tài khoản **{selectedUser.fullName}** về mặc định? Mật khẩu tạm thời sẽ được gửi tới email của họ.
                </p>
              )}

              {modal.type === 'suspendAccount' && (
                <p className="text-body-sm text-on-surface-variant font-medium">
                  Bạn có chắc chắn muốn tạm khóa tài khoản của thành viên **{selectedUser.fullName}**? Họ sẽ không thể đăng nhập cho tới khi được kích hoạt lại.
                </p>
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

      {toast.show && (
        <div className="profile-toast-custom animate-fadeIn">
          <span className="material-symbols-outlined text-green-500">check_circle</span>
          <span>{toast.message}</span>
        </div>
      )}

    </div>
  )
}

export default UsersRolesPage
