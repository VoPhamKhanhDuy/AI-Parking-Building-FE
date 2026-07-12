import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { initialUserKPIs, initialUsersList, rolePermissionMap, initialUserChanges } from './usersRolesService'
import { ROUTE_PATHS } from '../../routes/routePaths'

function UsersRolesPage() {
  const navigate = useNavigate()

  // Real-time states
  const [kpis, setKpis] = useState(initialUserKPIs)
  const [users, setUsers] = useState(initialUsersList)
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

  // Get permissions for active role
  const permissions = rolePermissionMap[selectedUser.role] || {
    allowed: 'Entry/Exit Logs, Basic Reports',
    limited: 'User Directory (View Only)',
    denied: 'System Settings, Audit Logs'
  }

  // Action: Add change log entry
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

  // Action: Add User
  const handleAddUser = () => {
    const name = window.prompt('Nhập họ tên người dùng mới:')
    if (!name) return
    const email = window.prompt('Nhập địa chỉ email:')
    if (!email) return
    if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
      window.alert('Email này đã tồn tại trong danh sách!')
      return
    }
    const role = window.prompt('Nhập vai trò (vd: Parking Staff, Facility Manager, Field Support, Manager):', 'Parking Staff')
    if (!role) return
    const area = window.prompt('Nhập khu vực làm việc (vd: Entry Gate A, Building B):', 'Entry Gate A')
    if (!area) return

    const newUser = {
      name,
      email,
      role,
      area,
      status: 'Active',
      lastLogin: 'Not logged in',
      createdDate: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
    }

    setUsers([...users, newUser])
    setSelectedUserEmail(email)
    setKpis((prev) => ({
      ...prev,
      totalAccounts: prev.totalAccounts + 1,
      activeAccounts: prev.activeAccounts + 1
    }))

    addChangeLog('Account Created', name)
    window.alert(`Đã thêm thành công người dùng ${name}!`)
  }

  // Action: Edit Role
  const handleEditRole = () => {
    if (!selectedUser) return
    const newRole = window.prompt(`Cập nhật vai trò mới cho ${selectedUser.name} (Vai trò hiện tại: ${selectedUser.role}):`, selectedUser.role)
    if (!newRole || newRole === selectedUser.role) return

    setUsers((prev) => 
      prev.map((u) => 
        u.email === selectedUser.email ? { ...u, role: newRole } : u
      )
    )

    addChangeLog('Role Updated', selectedUser.name)
    window.alert(`Đã cập nhật vai trò của ${selectedUser.name} thành: ${newRole}.`)
  }

  // Action: Reset Password
  const handleResetPassword = () => {
    if (!selectedUser) return
    const confirm = window.confirm(`Bạn có chắc chắn muốn reset mật khẩu tài khoản ${selectedUser.name}?`)
    if (!confirm) return

    addChangeLog('Password Reset', selectedUser.name)
    window.alert(`Đã reset mật khẩu của tài khoản ${selectedUser.name} về mặc định. Mật khẩu tạm thời đã được gửi tới email ${selectedUser.email}.`)
  }

  // Action: Suspend Account
  const handleSuspendAccount = () => {
    if (!selectedUser) return
    if (selectedUser.status === 'Suspended') {
      // Unsuspended
      setUsers((prev) => 
        prev.map((u) => 
          u.email === selectedUser.email ? { ...u, status: 'Active' } : u
        )
      )
      setKpis((prev) => ({
        ...prev,
        activeAccounts: prev.activeAccounts + 1,
        suspendedAccounts: prev.suspendedAccounts - 1
      }))
      addChangeLog('Status Changed', selectedUser.name)
      window.alert(`Đã kích hoạt lại tài khoản ${selectedUser.name}.`)
      return
    }

    const confirm = window.confirm(`Bạn có chắc chắn muốn tạm khóa tài khoản ${selectedUser.name}?`)
    if (!confirm) return

    const prevStatus = selectedUser.status

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
        activeAccounts: prev.activeAccounts - activeDec,
        pendingInvitations: prev.pendingInvitations - pendingDec,
        suspendedAccounts: prev.suspendedAccounts + 1
      }
    })

    addChangeLog('Status Changed', selectedUser.name)
    window.alert(`Đã khóa tạm thời tài khoản ${selectedUser.name}.`)
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
              <a className="flex items-center gap-3 px-4 py-2 text-white bg-primary rounded-lg mx-2 transition-all duration-200" href="#">
                <span className="material-symbols-outlined text-[20px]">group</span>
                <span className="font-body-md text-body-md font-medium">Users &amp; Roles</span>
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
      <main className="flex-1 ml-[280px] flex flex-col min-w-0">
        
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
            <h2 className="font-headline-lg text-headline-lg text-on-surface">Users &amp; Roles Management</h2>
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
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setSelectedUserEmail(user.email)
                                  handleEditRole()
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

    </div>
  )
}

export default UsersRolesPage
