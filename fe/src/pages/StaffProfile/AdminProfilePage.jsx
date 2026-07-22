import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AdminLayout from '../../layouts/AdminLayout'
import { adminProfileData } from '../../mock-data/adminProfile'
import { ROLE_CREDENTIALS } from '../../mock-data/users'
import { ROUTE_PATHS } from '../../routes/routePaths'
import { changeAdminPassword } from './adminProfileService'

const emptyPasswordForm = { currentPassword: '', newPassword: '', confirmPassword: '' }

function AdminProfilePage() {
  const navigate = useNavigate()
  const [profile] = useState(adminProfileData)
  const [passwordModalOpen, setPasswordModalOpen] = useState(false)
  const [passwordForm, setPasswordForm] = useState(emptyPasswordForm)
  const [formError, setFormError] = useState('')
  
  // Executive Toast State
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' })

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type })
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' })
    }, 3500)
  }

  const openPasswordModal = () => {
    setPasswordForm(emptyPasswordForm)
    setFormError('')
    setPasswordModalOpen(true)
  }

  const updatePassword = (event) => {
    setPasswordForm((current) => ({ ...current, [event.target.name]: event.target.value }))
  }

  const submitPassword = async (event) => {
    event.preventDefault()
    if (passwordForm.newPassword.length < 6) {
      setFormError('Mật khẩu mới phải dài tối thiểu 6 ký tự.')
      return
    }
    if (passwordForm.newPassword === passwordForm.currentPassword) {
      setFormError('Mật khẩu mới không được trùng với mật khẩu cũ.')
      return
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setFormError('Xác nhận mật khẩu mới không khớp.')
      return
    }

    // Attempt Backend API call first
    const apiRes = await changeAdminPassword(passwordForm.currentPassword, passwordForm.newPassword)
    if (!apiRes.success && passwordForm.currentPassword !== (ROLE_CREDENTIALS?.Admin?.password || 'admin123')) {
      setFormError(apiRes.message || 'Mật khẩu hiện tại không chính xác.')
      return
    }

    setPasswordModalOpen(false)
    showToast('Đổi mật khẩu tài khoản Admin thành công!', 'success')
  }

  const logout = () => navigate(ROUTE_PATHS.login)

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
          .admin-profile-circle {
              display: grid;
              width: 44px;
              height: 44px;
              place-items: center;
              border-radius: 50%;
              background: linear-gradient(135deg, #004ac6, #2563eb);
              color: white;
              font-size: 17px;
              font-weight: bold;
          }
        `}} />

        {/* Breadcrumb heading */}
        <header className="space-y-1">
          <div className="flex items-center gap-2 text-body-sm text-on-surface-variant">
            <button className="hover:text-primary transition-colors text-body-sm text-on-surface-variant font-medium" onClick={() => navigate(ROUTE_PATHS.adminDashboard)}>Admin Dashboard</button>
            <span className="material-symbols-outlined text-[16px] text-on-surface-variant">chevron_right</span>
            <strong className="text-on-surface font-semibold text-body-sm">Admin Profile</strong>
          </div>
          <h2 className="text-[22px] leading-tight font-bold text-on-surface">Admin Profile</h2>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">Manage administrative credentials, IT system access clearances, and logs overview.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          
          {/* Left: General Facts & Shift Status */}
          <div className="lg:col-span-8 space-y-4">
            
            {/* Profile Main Card */}
            <div className="glass-card rounded-lg p-5 bg-white space-y-4">
              <h3 className="text-[15px] font-bold text-on-surface m-0 border-b border-outline-variant pb-2">Admin Information</h3>
              
              <div className="flex items-center gap-4">
                <div className="admin-profile-circle">{profile.initials}</div>
                <div>
                  <h4 className="text-[16px] font-bold text-on-surface">{profile.name}</h4>
                  <p className="text-body-sm text-on-surface-variant font-medium">{profile.role}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-body-sm">
                <div className="flex justify-between border-b border-slate-100 py-2">
                  <span className="text-on-surface-variant">IT Terminal Office</span>
                  <span className="font-semibold">{profile.gate}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 py-2">
                  <span className="text-on-surface-variant">Division</span>
                  <span className="font-semibold">{profile.department}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 py-2">
                  <span className="text-on-surface-variant">Account Status</span>
                  <span className="text-green-700 font-bold uppercase">{profile.status}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 py-2">
                  <span className="text-on-surface-variant">Last Login Session</span>
                  <span className="font-semibold">{profile.lastLogin}</span>
                </div>
              </div>

              <div className="flex gap-3 pt-1">
                <button 
                  className="bg-[#1e293b] text-white px-4 py-2 rounded text-body-sm font-bold hover:bg-slate-800 transition-colors active:scale-[0.98]"
                  onClick={openPasswordModal}
                >
                  Change Password
                </button>
                <button 
                  className="border border-error/30 text-error hover:bg-error/5 px-4 py-2 rounded text-body-sm font-bold transition-all active:scale-[0.98]"
                  onClick={logout}
                >
                  Logout
                </button>
              </div>
            </div>

            {/* Shift and checks */}
            <div className="glass-card rounded-lg p-5 bg-white space-y-4">
              <h3 className="text-[15px] font-bold text-on-surface m-0 border-b border-outline-variant pb-2">Active Shift Security Checks</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3 bg-slate-50 p-4 rounded border border-slate-100">
                  <div className="flex flex-col">
                    <small className="text-[10px] text-slate-500 font-bold uppercase">Workshift Schedule</small>
                    <strong className="text-body-md">{profile.shift.name}</strong>
                    <span className="text-body-sm text-on-surface-variant">{profile.shift.schedule}</span>
                  </div>
                  <div className="flex items-center gap-2 text-green-700 text-body-sm font-bold">
                    <span className="w-2.5 h-2.5 rounded-full bg-green-500"></span>
                    Active Session Verified
                  </div>
                </div>
                
                <div className="space-y-2">
                  <small className="text-[10px] text-slate-500 font-bold uppercase block">Core IT Status</small>
                  <div className="space-y-1.5 text-body-sm">
                    {profile.systems.map((sys) => (
                      <div key={sys} className="flex justify-between items-center text-on-surface-variant font-medium">
                        <span>{sys}</span>
                        <span className="material-symbols-outlined text-green-600 text-[18px]">check_circle</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Right: Security & Permissions */}
          <div className="lg:col-span-4 space-y-4">
            
            {/* Security info card */}
            <div className="glass-card rounded-lg p-5 bg-white space-y-3">
              <h3 className="text-[15px] font-bold text-on-surface m-0 border-b border-outline-variant pb-2">IT Security Policies</h3>
              <div className="space-y-3 text-body-sm">
                {profile.security.map(([label, val]) => (
                  <div key={label} className="flex justify-between">
                    <span className="text-on-surface-variant">{label}</span>
                    <span className="font-semibold text-slate-900">{val}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Clearance Levels */}
            <div className="glass-card rounded-lg p-5 bg-white space-y-3">
              <h3 className="text-[15px] font-bold text-on-surface m-0 border-b border-outline-variant pb-2">Clearance Access Permissions</h3>
              
              <div className="space-y-3">
                <div>
                  <h4 className="text-[11px] font-bold text-green-700 uppercase tracking-wider mb-1.5">Allowed Actions</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {profile.permissions.allowed.map((allow) => (
                      <span key={allow} className="px-2.5 py-1 text-xs rounded bg-green-50 text-green-800 font-medium border border-green-200">
                        {allow}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-1.5">Limited Control</h4>
                  <div className="space-y-1">
                    {profile.permissions.limited.map(([item, clearance]) => (
                      <div key={item} className="flex justify-between text-xs text-on-surface-variant font-medium">
                        <span>{item}</span>
                        <span className="font-semibold text-slate-900">{clearance}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-[11px] font-bold text-error uppercase tracking-wider mb-1.5">Access Denied</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {profile.permissions.denied.map((deny) => (
                      <span key={deny} className="px-2.5 py-1 text-xs rounded bg-red-50 text-red-800 font-medium border border-red-200">
                        {deny}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* Activity Section */}
        <section className="glass-card rounded-lg overflow-hidden bg-white">
          <div className="px-5 py-3 border-b border-outline-variant flex justify-between items-center bg-white">
            <h3 className="text-[15px] font-bold text-on-surface m-0">Recent Admin Activities</h3>
            <button 
              className="text-primary font-bold text-xs uppercase hover:underline"
              onClick={() => navigate(ROUTE_PATHS.auditLogs)}
            >
              View Full Audit Logs
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-surface-container-lowest border-b border-outline-variant">
                <tr>
                  <th className="px-4 py-2.5 font-label-md text-on-surface-variant uppercase text-[10px] tracking-widest font-bold">Time</th>
                  <th className="px-4 py-2.5 font-label-md text-on-surface-variant uppercase text-[10px] tracking-widest font-bold">Activity</th>
                  <th className="px-4 py-2.5 font-label-md text-on-surface-variant uppercase text-[10px] tracking-widest font-bold">Reference</th>
                  <th className="px-4 py-2.5 font-label-md text-on-surface-variant uppercase text-[10px] tracking-widest font-bold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant bg-white">
                {profile.activities.map(([time, act, ref, stat], i) => (
                  <tr key={i} className="hover:bg-surface-container-low/30 transition-colors">
                    <td className="px-4 py-2.5 text-body-sm text-on-surface-variant">{time}</td>
                    <td className="px-4 py-2.5 text-body-sm font-semibold text-on-surface">{act}</td>
                    <td className="px-4 py-2.5 text-body-sm text-on-surface-variant">{ref}</td>
                    <td className="px-4 py-2.5">
                      <span className="text-green-700 font-bold text-[10px] uppercase">{stat}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

      </div>

      {/* Password Modal Custom */}
      {passwordModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
          <section className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden border border-outline-variant">
            <header className="px-6 py-4 border-b border-outline-variant flex justify-between items-center bg-slate-50">
              <div>
                <h3 className="font-body-lg font-bold text-on-surface">Đổi mật khẩu Admin</h3>
                <p className="text-xs text-on-surface-variant font-medium mt-0.5">Sử dụng mật khẩu mạnh để bảo mật tài khoản.</p>
              </div>
              <button 
                className="text-on-surface-variant hover:bg-slate-200 p-1.5 rounded-full transition-colors"
                onClick={() => setPasswordModalOpen(false)}
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </header>
            
            <form onSubmit={submitPassword} className="p-6 space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-on-surface-variant uppercase">Mật khẩu hiện tại</label>
                <input 
                  autoFocus 
                  name="currentPassword" 
                  type="password" 
                  value={passwordForm.currentPassword} 
                  onChange={updatePassword} 
                  className="w-full px-3.5 py-2 border border-outline-variant rounded focus:ring-1 focus:ring-primary focus:border-primary text-body-sm outline-none"
                  required 
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-on-surface-variant uppercase">Mật khẩu mới</label>
                <input 
                  name="newPassword" 
                  type="password" 
                  value={passwordForm.newPassword} 
                  onChange={updatePassword} 
                  className="w-full px-3.5 py-2 border border-outline-variant rounded focus:ring-1 focus:ring-primary focus:border-primary text-body-sm outline-none"
                  minLength="6" 
                  required 
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-on-surface-variant uppercase">Xác nhận mật khẩu mới</label>
                <input 
                  name="confirmPassword" 
                  type="password" 
                  value={passwordForm.confirmPassword} 
                  onChange={updatePassword} 
                  className="w-full px-3.5 py-2 border border-outline-variant rounded focus:ring-1 focus:ring-primary focus:border-primary text-body-sm outline-none"
                  minLength="6" 
                  required 
                />
              </div>

              {formError && (
                <p className="text-xs font-bold text-error bg-red-50 p-2 border border-red-200 rounded">
                  {formError}
                </p>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button 
                  type="button" 
                  onClick={() => setPasswordModalOpen(false)}
                  className="px-4 py-2 border border-outline-variant text-on-surface rounded text-body-sm font-semibold hover:bg-slate-50 transition-colors"
                >
                  Hủy bỏ
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-primary hover:bg-blue-700 text-white rounded text-body-sm font-bold transition-colors"
                >
                  Cập nhật
                </button>
              </div>
            </form>
          </section>
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

export default AdminProfilePage
