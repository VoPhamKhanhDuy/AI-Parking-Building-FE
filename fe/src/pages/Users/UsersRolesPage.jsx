import { useState, useEffect } from 'react'
import AdminLayout from '../../layouts/AdminLayout'
import {
  initialUserKPIs,
  initialUsersList,
  rolePermissionMap as initialRolePermissions,
  initialUserChanges,
  fetchUsersList,
  createUserApi,
  updateUserApi,
  setUserStatusApi,
  fetchRolesList,
  updateRolePermissionsApi,
} from './usersRolesService'
import { downloadCSV } from '../../utils/exportUtils'

function UsersRolesPage() {
  // Real-time states
  const [kpis, setKpis] = useState(initialUserKPIs)
  const [users, setUsers] = useState(() => {
    const saved = localStorage.getItem('ai_parking_users_list')
    if (saved) {
      try { return JSON.parse(saved) } catch (e) { console.error(e) }
    }
    return initialUsersList
  })

  useEffect(() => {
    let active = true
    fetchUsersList().then((res) => {
      if (!active) return
      if (res.success && Array.isArray(res.data) && res.data.length > 0) {
        setUsers(res.data)
      }
    })
    return () => { active = false }
  }, [])

  const [rolePermissions, setRolePermissions] = useState(() => {
    const saved = localStorage.getItem('ai_parking_role_permissions')
    if (saved) {
      try { return JSON.parse(saved) } catch (e) { console.error(e) }
    }
    return initialRolePermissions
  })

  useEffect(() => {
    let active = true
    fetchRolesList().then((res) => {
      if (!active) return
      if (res.success && res.data) {
        setRolePermissions((prev) => ({ ...prev, ...res.data }))
      }
    })
    return () => { active = false }
  }, [])

  useEffect(() => {
    localStorage.setItem('ai_parking_users_list', JSON.stringify(users))
  }, [users])

  useEffect(() => {
    localStorage.setItem('ai_parking_role_permissions', JSON.stringify(rolePermissions))
  }, [rolePermissions])

  const [userChanges, setUserChanges] = useState(initialUserChanges)
  const [selectedUserEmail, setSelectedUserEmail] = useState('an.nguyen@parking.vn')

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState('All Roles')
  const [statusFilter, setStatusFilter] = useState('All Status')

  // Selected User Detail
  const selectedUser = users.find((u) => u.email === selectedUserEmail) || users[0] || {
    name: 'N/A',
    email: '',
    role: 'Parking Staff',
    area: 'N/A',
    status: 'Active',
    lastLogin: 'N/A',
    createdDate: 'N/A'
  }

  // Modal State
  const [modal, setModal] = useState({
    isOpen: false,
    type: '', // 'addUser' | 'editUser' | 'editRole' | 'resetPassword' | 'lockUser' | 'unlockUser' | 'managePermissions'
    inputVal1: '',
    inputVal2: '',
    inputVal3: '',
    inputVal4: ''
  })

  // Role permissions editing state
  const [selectedEditRole, setSelectedEditRole] = useState('Parking Staff')
  const [editPerms, setEditPerms] = useState({ allowed: '', limited: '', denied: '' })

  // Executive Toast State
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' })

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type })
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' })
    }, 3500)
  }

  // Get permissions for active role
  const permissions = rolePermissions[selectedUser.role] || {
    allowed: 'Entry/Exit Logs, Basic Reports',
    limited: 'User Directory (View Only)',
    denied: 'System Settings, Audit Logs'
  }

  // Helper: Append change log entry
  const addChangeLog = (action, targetName) => {
    const timeStr = new Date().toTimeString().split(' ')[0]
    const newLog = {
      time: timeStr,
      action,
      target: targetName,
      changedBy: 'System Admin',
      result: 'Success'
    }
    setUserChanges([newLog, ...userChanges])
  }

  // Actions
  const handleAddUser = () => {
    setModal({
      isOpen: true,
      type: 'addUser',
      inputVal1: '',
      inputVal2: '',
      inputVal3: 'Parking Staff',
      inputVal4: 'Entry Gate A'
    })
  }

  const handleEditUser = () => {
    if (!selectedUser) return
    setModal({
      isOpen: true,
      type: 'editUser',
      inputVal1: selectedUser.name,
      inputVal2: selectedUser.email,
      inputVal3: selectedUser.role,
      inputVal4: selectedUser.area
    })
  }

  const handleEditRole = () => {
    if (!selectedUser) return
    setModal({
      isOpen: true,
      type: 'editRole',
      inputVal1: selectedUser.role,
      inputVal2: '',
      inputVal3: '',
      inputVal4: ''
    })
  }

  const handleResetPassword = () => {
    if (!selectedUser) return
    setModal({
      isOpen: true,
      type: 'resetPassword',
      inputVal1: '',
      inputVal2: '',
      inputVal3: '',
      inputVal4: ''
    })
  }

  const handleLockUser = () => {
    if (!selectedUser) return
    setModal({
      isOpen: true,
      type: 'lockUser',
      inputVal1: '',
      inputVal2: '',
      inputVal3: '',
      inputVal4: ''
    })
  }

  const handleUnlockUser = () => {
    if (!selectedUser) return
    setModal({
      isOpen: true,
      type: 'unlockUser',
      inputVal1: '',
      inputVal2: '',
      inputVal3: '',
      inputVal4: ''
    })
  }

  const handleManagePermissions = () => {
    const roleKey = selectedUser.role || 'Parking Staff'
    setSelectedEditRole(roleKey)
    setEditPerms(rolePermissions[roleKey] || { allowed: '', limited: '', denied: '' })
    setModal({
      isOpen: true,
      type: 'managePermissions',
      inputVal1: '',
      inputVal2: '',
      inputVal3: '',
      inputVal4: ''
    })
  }

  // Modal Confirm Action handler
  const handleModalConfirm = async () => {
    if (modal.type === 'addUser') {
      const name = modal.inputVal1.trim()
      const email = modal.inputVal2.trim()
      const role = modal.inputVal3.trim()
      const area = modal.inputVal4.trim()

      if (!name || !email) {
        showToast('Vui lòng điền đầy đủ họ tên và email.', 'error')
        return
      }

      if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
        showToast('Email này đã tồn tại trong danh sách!', 'error')
        return
      }

      const newUser = {
        name,
        email,
        role,
        area,
        status: 'Active',
        lastLogin: 'Not logged in',
        createdDate: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
      }

      // Try Backend API call first
      await createUserApi(newUser)

      setUsers([...users, newUser])
      setSelectedUserEmail(email)
      setKpis((prev) => ({
        ...prev,
        totalAccounts: prev.totalAccounts + 1,
        activeAccounts: prev.activeAccounts + 1
      }))

      addChangeLog('Create User', name)
      setModal({ ...modal, isOpen: false })
      showToast(`Đã tạo thành công tài khoản thành viên ${name}!`, 'success')
    }

    else if (modal.type === 'editUser') {
      const name = modal.inputVal1.trim()
      const role = modal.inputVal3.trim()
      const area = modal.inputVal4.trim()

      if (!name) {
        showToast('Vui lòng nhập họ tên người dùng.', 'error')
        return
      }

      // Try Backend API call first
      if (selectedUser.id) {
        await updateUserApi(selectedUser.id, { name, email: selectedUser.email, role, area })
      }

      setUsers((prev) => 
        prev.map((u) => 
          u.email === selectedUser.email ? { ...u, name, role, area } : u
        )
      )

      addChangeLog('Update User', name)
      setModal({ ...modal, isOpen: false })
      showToast(`Cập nhật thông tin tài khoản ${name} thành công!`, 'success')
    }

    else if (modal.type === 'editRole') {
      const newRole = modal.inputVal1.trim()
      if (!newRole) {
        showToast('Vui lòng điền vai trò hợp lệ.', 'error')
        return
      }

      if (selectedUser.id) {
        await updateUserApi(selectedUser.id, { name: selectedUser.name, email: selectedUser.email, role: newRole, area: selectedUser.area })
      }

      setUsers((prev) => 
        prev.map((u) => 
          u.email === selectedUser.email ? { ...u, role: newRole } : u
        )
      )

      addChangeLog('Role Assignment Updated', selectedUser.name)
      setModal({ ...modal, isOpen: false })
      showToast(`Cập nhật vai trò của ${selectedUser.name} thành ${newRole} thành công!`, 'success')
    }

    else if (modal.type === 'resetPassword') {
      addChangeLog('Reset Credentials', selectedUser.name)
      setModal({ ...modal, isOpen: false })
      showToast(`Đã gửi lệnh Reset mật khẩu cho tài khoản ${selectedUser.name}.`, 'success')
    }

    else if (modal.type === 'lockUser') {
      const prevStatus = selectedUser.status

      if (selectedUser.id) {
        await setUserStatusApi(selectedUser.id, 'Suspended')
      }

      setUsers((prev) => 
        prev.map((u) => 
          u.email === selectedUser.email ? { ...u, status: 'Suspended' } : u
        )
      )

      setKpis((prev) => {
        const activeDec = prevStatus === 'Active' ? 1 : 0
        const pendingDec = prevStatus === 'Pending' ? 1 : 0
        return {
          ...prev,
          activeAccounts: Math.max(0, prev.activeAccounts - activeDec),
          pendingInvitations: Math.max(0, prev.pendingInvitations - pendingDec),
          suspendedAccounts: prev.suspendedAccounts + 1
        }
      })

      addChangeLog('Lock User', selectedUser.name)
      setModal({ ...modal, isOpen: false })
      showToast(`Đã khóa tài khoản của ${selectedUser.name} thành công.`, 'success')
    }

    else if (modal.type === 'unlockUser') {
      if (selectedUser.id) {
        await setUserStatusApi(selectedUser.id, 'Active')
      }

      setUsers((prev) => 
        prev.map((u) => 
          u.email === selectedUser.email ? { ...u, status: 'Active' } : u
        )
      )

      setKpis((prev) => ({
        ...prev,
        activeAccounts: prev.activeAccounts + 1,
        suspendedAccounts: Math.max(0, prev.suspendedAccounts - 1)
      }))

      addChangeLog('Unlock User', selectedUser.name)
      setModal({ ...modal, isOpen: false })
      showToast(`Đã mở khóa và kích hoạt lại tài khoản ${selectedUser.name}.`, 'success')
    }

    else if (modal.type === 'managePermissions') {
      await updateRolePermissionsApi(selectedEditRole, editPerms)
      setRolePermissions((prev) => ({
        ...prev,
        [selectedEditRole]: { ...editPerms }
      }))
      addChangeLog('Role Permissions Configured', selectedEditRole)
      setModal({ ...modal, isOpen: false })
      showToast(`Cấu hình quyền truy cập cho vai trò ${selectedEditRole} đã được lưu.`, 'success')
    }
  }

  // Filter user list
  const filteredUsers = users.filter((u) => {
    const matchesSearch = u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          u.area.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesRole = roleFilter === 'All Roles' || u.role === roleFilter
    const matchesStatus = statusFilter === 'All Status' || u.status === statusFilter

    return matchesSearch && matchesRole && matchesStatus
  })

  // List of unique roles & statuses for filter dropdowns
  const uniqueRoles = ['All Roles', 'Parking Staff', 'Facility Manager', 'System Admin', 'Field Support', 'Manager']
  const uniqueStatuses = ['All Status', 'Active', 'Suspended', 'Pending']

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
            <h2 className="font-headline-md text-headline-md text-on-surface">Users &amp; Roles Management</h2>
            <p className="font-body-md text-body-md text-on-surface-variant mt-0.5">Admin Control: Manage user accounts, role authorizations, status lock/unlock, and system access levels.</p>
          </div>
          <button
            className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-body-sm font-bold shadow transition-all active:scale-[0.98]"
            onClick={handleManagePermissions}
          >
            <span className="material-symbols-outlined text-[18px]">manage_accounts</span>
            Manage Role Permissions
          </button>
        </section>

        {/* KPI Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="glass-card p-4 rounded-lg bg-white">
            <div className="flex items-center justify-between mb-1">
              <p className="text-on-surface-variant font-label-md uppercase tracking-wider text-[11px]">Total Accounts</p>
              <span className="material-symbols-outlined text-on-surface-variant text-[18px]">people</span>
            </div>
            <p className="text-2xl font-bold text-on-surface">{kpis.totalAccounts}</p>
          </div>
          <div className="glass-card p-4 rounded-lg bg-white">
            <div className="flex items-center justify-between mb-1">
              <p className="text-on-surface-variant font-label-md uppercase tracking-wider text-[11px]">Active Accounts</p>
              <span className="material-symbols-outlined text-green-600 text-[18px]">check_circle</span>
            </div>
            <p className="text-2xl font-bold text-on-surface">{kpis.activeAccounts}</p>
          </div>
          <div className="glass-card p-4 rounded-lg border-l-4 border-error bg-white">
            <div className="flex items-center justify-between mb-1">
              <p className="text-on-surface-variant font-label-md uppercase tracking-wider text-[11px]">Suspended Accounts</p>
              <span className="material-symbols-outlined text-error text-[18px]">block</span>
            </div>
            <p className="text-2xl font-bold text-on-surface">{kpis.suspendedAccounts}</p>
          </div>
          <div className="glass-card p-4 rounded-lg border-l-4 border-secondary bg-white">
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
            <div className="glass-card rounded-lg overflow-hidden flex flex-col bg-white">
              
              {/* Header Filter Panel */}
              <div className="px-5 py-3 border-b border-outline-variant flex flex-wrap gap-3 justify-between items-center bg-white">
                <h3 className="font-body-lg font-bold text-on-surface">User Directory</h3>
                <div className="flex gap-2 flex-1 min-w-[300px] justify-end">
                  <div className="relative flex-1 max-w-[180px]">
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
                  <button 
                    className="bg-surface-container-high text-on-surface border border-outline-variant px-3 py-1 rounded text-body-sm font-semibold active:scale-[0.98] transition-all hover:bg-surface-container flex items-center gap-1"
                    onClick={() => {
                      downloadCSV('users_directory.csv', filteredUsers, [
                        { key: 'name', label: 'Name' },
                        { key: 'email', label: 'Email' },
                        { key: 'role', label: 'Role' },
                        { key: 'area', label: 'Area' },
                        { key: 'status', label: 'Status' },
                        { key: 'lastLogin', label: 'Last Login' },
                        { key: 'createdDate', label: 'Created Date' }
                      ])
                      showToast('Đã xuất file CSV danh sách người dùng thành công!', 'success')
                    }}
                  >
                    <span className="material-symbols-outlined text-[16px]">download</span>
                    Export
                  </button>
                </div>
              </div>

              {/* Table Data */}
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-surface-container-lowest border-b border-outline-variant">
                    <tr>
                      <th className="px-4 py-2.5 font-label-md text-on-surface-variant uppercase text-[10px] tracking-widest font-bold">User</th>
                      <th className="px-4 py-2.5 font-label-md text-on-surface-variant uppercase text-[10px] tracking-widest font-bold">Role</th>
                      <th className="px-4 py-2.5 font-label-md text-on-surface-variant uppercase text-[10px] tracking-widest font-bold">Area</th>
                      <th className="px-4 py-2.5 font-label-md text-on-surface-variant uppercase text-[10px] tracking-widest font-bold">Status</th>
                      <th className="px-4 py-2.5 font-label-md text-on-surface-variant uppercase text-[10px] tracking-widest font-bold">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant bg-white">
                    {filteredUsers.map((user) => {
                      const isSelected = selectedUser.email === user.email
                      return (
                        <tr 
                          key={user.email} 
                          className={`cursor-pointer transition-colors ${isSelected ? 'bg-primary/5' : 'hover:bg-surface-container-low/30'}`}
                          onClick={() => setSelectedUserEmail(user.email)}
                        >
                          <td className="px-4 py-3">
                            <div className="font-body-sm text-on-surface font-medium">{user.name}</div>
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
                              title="Edit user details"
                              onClick={(e) => {
                                e.stopPropagation()
                                setSelectedUserEmail(user.email)
                                handleEditUser()
                              }}
                            >
                              edit
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right Column: Selected User Detail & Permissions */}
          <div className="lg:col-span-4 space-y-4">
            
            {/* Selected User Detail Card */}
            <div className="glass-card rounded-lg p-5 bg-white">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-body-lg font-bold text-on-surface">Selected User Detail</h3>
                <button 
                  className="text-xs text-primary font-bold hover:underline"
                  onClick={handleEditUser}
                >
                  Edit Profile
                </button>
              </div>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-body-sm text-on-surface-variant">Name</span>
                  <span className="text-body-sm font-medium">{selectedUser.name}</span>
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
                  <span className="text-body-sm">{selectedUser.lastLogin}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-body-sm text-on-surface-variant">Created Date</span>
                  <span className="text-body-sm">{selectedUser.createdDate || 'Oct 12, 2023'}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-2">
                <button 
                  className="w-full py-2 bg-[#1e293b] text-white rounded text-sm font-bold hover:bg-slate-800 active:scale-[0.98] transition-all"
                  onClick={handleEditRole}
                >
                  Change Role Assignment
                </button>
                <button 
                  className="w-full py-2 border border-outline-variant rounded text-sm font-bold hover:bg-slate-50 active:scale-[0.98] transition-all"
                  onClick={handleResetPassword}
                >
                  Reset Credentials
                </button>

                {/* Explicit Lock User / Unlock User Action */}
                {selectedUser.status === 'Suspended' ? (
                  <button 
                    className="w-full py-2 border border-green-300 text-green-700 hover:bg-green-50 rounded text-sm font-bold active:scale-[0.98] transition-all flex items-center justify-center gap-1"
                    onClick={handleUnlockUser}
                  >
                    <span className="material-symbols-outlined text-[18px]">lock_open</span>
                    Unlock User Account
                  </button>
                ) : (
                  <button 
                    className="w-full py-2 border border-error/30 text-error hover:bg-error/5 rounded text-sm font-bold active:scale-[0.98] transition-all flex items-center justify-center gap-1"
                    onClick={handleLockUser}
                  >
                    <span className="material-symbols-outlined text-[18px]">lock</span>
                    Lock User Account
                  </button>
                )}
              </div>
            </div>

            {/* Role Permission Summary */}
            <div className="glass-card rounded-lg p-5 bg-white">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-body-lg font-bold text-on-surface">Role Permission Summary</h3>
                <button 
                  className="text-xs text-primary font-bold hover:underline"
                  onClick={handleManagePermissions}
                >
                  Configure
                </button>
              </div>
              <div className="space-y-2">
                <div className="flex items-start gap-2 text-green-700">
                  <span className="material-symbols-outlined text-[18px] mt-0.5">check_circle</span>
                  <span className="text-body-sm"><strong>Allowed:</strong> {permissions.allowed}</span>
                </div>
                <div className="flex items-start gap-2 text-on-surface-variant">
                  <span className="material-symbols-outlined text-[18px] mt-0.5">info</span>
                  <span className="text-body-sm"><strong>Limited:</strong> {permissions.limited}</span>
                </div>
                <div className="flex items-start gap-2 text-error">
                  <span className="material-symbols-outlined text-[18px] mt-0.5">cancel</span>
                  <span className="text-body-sm"><strong>No Access:</strong> {permissions.denied}</span>
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* Bottom Section: Recent User Changes */}
        <section className="glass-card rounded-lg overflow-hidden bg-white">
          <div className="px-5 py-3 border-b border-outline-variant flex justify-between items-center bg-white">
            <h3 className="font-body-lg font-bold text-on-surface">Recent System Audit Log History</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-surface-container-lowest border-b border-outline-variant">
                <tr>
                  <th className="px-6 py-2.5 font-label-md text-on-surface-variant uppercase text-[10px] tracking-widest font-bold">Time</th>
                  <th className="px-6 py-2.5 font-label-md text-on-surface-variant uppercase text-[10px] tracking-widest font-bold">Action</th>
                  <th className="px-6 py-2.5 font-label-md text-on-surface-variant uppercase text-[10px] tracking-widest font-bold">Target</th>
                  <th className="px-6 py-2.5 font-label-md text-on-surface-variant uppercase text-[10px] tracking-widest font-bold">Changed By</th>
                  <th className="px-6 py-2.5 font-label-md text-on-surface-variant uppercase text-[10px] tracking-widest font-bold">Result</th>
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

      {/* Dynamic Modals */}
      {modal.isOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden border border-outline-variant">
            <header className="px-6 py-4 border-b border-outline-variant flex justify-between items-center bg-slate-50">
              <h3 className="font-body-lg font-bold text-on-surface">
                {modal.type === 'addUser' && 'Tạo tài khoản người dùng mới (Create User)'}
                {modal.type === 'editUser' && 'Cập nhật thông tin người dùng (Update User)'}
                {modal.type === 'editRole' && 'Cập nhật vai trò người dùng (Assign Role)'}
                {modal.type === 'resetPassword' && 'Reset mật khẩu người dùng'}
                {modal.type === 'lockUser' && 'Khóa tài khoản người dùng (Lock User)'}
                {modal.type === 'unlockUser' && 'Mở khóa tài khoản người dùng (Unlock User)'}
                {modal.type === 'managePermissions' && 'Cấu hình quyền theo Role (Manage Roles)'}
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
                    <input className="w-full px-3.5 py-2 border border-outline-variant rounded text-body-sm outline-none focus:ring-1 focus:ring-primary" value={modal.inputVal1} onChange={(e) => setModal({...modal, inputVal1: e.target.value})} placeholder="Họ và tên..." />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-on-surface-variant uppercase">Email</label>
                    <input className="w-full px-3.5 py-2 border border-outline-variant rounded text-body-sm outline-none focus:ring-1 focus:ring-primary" value={modal.inputVal2} onChange={(e) => setModal({...modal, inputVal2: e.target.value})} placeholder="email@parking.vn..." />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-on-surface-variant uppercase">Vai trò</label>
                    <input className="w-full px-3.5 py-2 border border-outline-variant rounded text-body-sm outline-none focus:ring-1 focus:ring-primary" value={modal.inputVal3} onChange={(e) => setModal({...modal, inputVal3: e.target.value})} placeholder="Parking Staff..." />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-on-surface-variant uppercase">Khu vực làm việc</label>
                    <input className="w-full px-3.5 py-2 border border-outline-variant rounded text-body-sm outline-none focus:ring-1 focus:ring-primary" value={modal.inputVal4} onChange={(e) => setModal({...modal, inputVal4: e.target.value})} placeholder="Entry Gate A..." />
                  </div>
                </>
              )}

              {modal.type === 'editUser' && (
                <>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-on-surface-variant uppercase">Họ và tên</label>
                    <input className="w-full px-3.5 py-2 border border-outline-variant rounded text-body-sm outline-none focus:ring-1 focus:ring-primary" value={modal.inputVal1} onChange={(e) => setModal({...modal, inputVal1: e.target.value})} />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-on-surface-variant uppercase">Email (Read-only)</label>
                    <input className="w-full px-3.5 py-2 border border-outline-variant bg-slate-100 rounded text-body-sm outline-none cursor-not-allowed" value={modal.inputVal2} disabled />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-on-surface-variant uppercase">Vai trò</label>
                    <input className="w-full px-3.5 py-2 border border-outline-variant rounded text-body-sm outline-none focus:ring-1 focus:ring-primary" value={modal.inputVal3} onChange={(e) => setModal({...modal, inputVal3: e.target.value})} />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-on-surface-variant uppercase">Khu vực làm việc</label>
                    <input className="w-full px-3.5 py-2 border border-outline-variant rounded text-body-sm outline-none focus:ring-1 focus:ring-primary" value={modal.inputVal4} onChange={(e) => setModal({...modal, inputVal4: e.target.value})} />
                  </div>
                </>
              )}

              {modal.type === 'editRole' && (
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-on-surface-variant uppercase">Chọn vai trò mới cho {selectedUser.name}</label>
                  <select 
                    className="w-full px-3.5 py-2 border border-outline-variant rounded text-body-sm outline-none focus:ring-1 focus:ring-primary"
                    value={modal.inputVal1} 
                    onChange={(e) => setModal({...modal, inputVal1: e.target.value})}
                  >
                    <option value="Parking Staff">Parking Staff</option>
                    <option value="Facility Manager">Facility Manager</option>
                    <option value="System Admin">System Admin</option>
                    <option value="Field Support">Field Support</option>
                    <option value="Operator">Operator</option>
                  </select>
                </div>
              )}

              {modal.type === 'lockUser' && (
                <p className="text-body-sm text-on-surface-variant font-medium">
                  Bạn có chắc chắn muốn **Khóa (Lock User)** tài khoản **{selectedUser.name}**? Người dùng sẽ không thể truy cập hệ thống và trạng thái sẽ chuyển thành `Suspended`. Thao tác sẽ được ghi System Log.
                </p>
              )}

              {modal.type === 'unlockUser' && (
                <p className="text-body-sm text-on-surface-variant font-medium">
                  Xác nhận **Mở khóa (Unlock User)** và khôi phục quyền truy cập cho **{selectedUser.name}**? Trạng thái sẽ trở về `Active`. Thao tác sẽ được ghi System Log.
                </p>
              )}

              {modal.type === 'managePermissions' && (
                <div className="space-y-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-on-surface-variant uppercase">Chọn Role để cấu hình</label>
                    <select
                      className="w-full px-3 py-1.5 border border-outline-variant rounded text-body-sm font-semibold"
                      value={selectedEditRole}
                      onChange={(e) => {
                        const rKey = e.target.value
                        setSelectedEditRole(rKey)
                        setEditPerms(rolePermissions[rKey] || { allowed: '', limited: '', denied: '' })
                      }}
                    >
                      {Object.keys(rolePermissions).map((roleName) => (
                        <option key={roleName} value={roleName}>{roleName}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-green-700 uppercase">Quyền cho phép (Allowed Permissions)</label>
                    <textarea 
                      className="w-full px-3 py-2 border border-outline-variant rounded text-body-sm outline-none" 
                      rows="2"
                      value={editPerms.allowed}
                      onChange={(e) => setEditPerms({ ...editPerms, allowed: e.target.value })}
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-slate-700 uppercase">Quyền giới hạn (Limited Permissions)</label>
                    <textarea 
                      className="w-full px-3 py-2 border border-outline-variant rounded text-body-sm outline-none" 
                      rows="2"
                      value={editPerms.limited}
                      onChange={(e) => setEditPerms({ ...editPerms, limited: e.target.value })}
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-bold text-red-600 uppercase">Quyền bị cấm (Denied Access)</label>
                    <textarea 
                      className="w-full px-3 py-2 border border-outline-variant rounded text-body-sm outline-none" 
                      rows="2"
                      value={editPerms.denied}
                      onChange={(e) => setEditPerms({ ...editPerms, denied: e.target.value })}
                    />
                  </div>
                </div>
              )}

              {modal.type === 'resetPassword' && (
                <p className="text-body-sm text-on-surface-variant font-medium">
                  Xác nhận **Reset Mật khẩu** tài khoản **{selectedUser.name}**? Mật khẩu tạm thời mới sẽ được tạo tự động.
                </p>
              )}

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
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

export default UsersRolesPage
