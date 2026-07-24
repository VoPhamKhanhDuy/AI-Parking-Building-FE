import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ManagerLayout from '../../layouts/ManagerLayout'
import { ROUTE_PATHS } from '../../routes/routePaths'
import { fetchCurrentManagerProfile, changeManagerPasswordApi, managerProfileData } from './managerProfileService'
import './ManagerProfilePage.css'

const emptyPasswordForm = { currentPassword: '', newPassword: '', confirmPassword: '' }

function ManagerProfilePage() {
  const navigate = useNavigate()
  const [profile, setProfile] = useState(managerProfileData)
  const [loading, setLoading] = useState(true)
  const [passwordModalOpen, setPasswordModalOpen] = useState(false)
  const [passwordForm, setPasswordForm] = useState(emptyPasswordForm)
  const [formError, setFormError] = useState('')
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' })

  useEffect(() => {
    let active = true
    fetchCurrentManagerProfile().then((res) => {
      if (!active) return
      if (res.success && res.data) {
        setProfile(res.data)
      }
      setLoading(false)
    }).catch(() => active && setLoading(false))
    return () => { active = false }
  }, [])

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type })
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' })
    }, 3200)
  }

  const openPasswordModal = () => {
    setPasswordForm(emptyPasswordForm)
    setFormError('')
    setPasswordModalOpen(true)
  }

  const updatePassword = (event) => setPasswordForm((current) => ({ ...current, [event.target.name]: event.target.value }))

  const submitPassword = async (event) => {
    event.preventDefault()
    if (passwordForm.newPassword.length < 6) {
      setFormError('New password must be at least 6 characters long.')
      return
    }
    if (passwordForm.newPassword === passwordForm.currentPassword) {
      setFormError('New password cannot be the same as the current password.')
      return
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setFormError('Password confirmation does not match.')
      return
    }

    const res = await changeManagerPasswordApi(passwordForm.currentPassword, passwordForm.newPassword)
    if (!res.success) {
      setFormError(res.message || 'Current password is invalid.')
      return
    }

    setPasswordModalOpen(false)
    showToast('Manager password updated successfully!', 'success')
  }

  const logout = () => navigate(ROUTE_PATHS.login)

  if (loading) {
    return (
      <ManagerLayout>
        <div className="p-8 text-center text-slate-500 font-semibold">
          Loading Manager Profile…
        </div>
      </ManagerLayout>
    )
  }

  return (
    <ManagerLayout>
      <div className="manager-profile-page space-y-6">
        
        {/* Dynamic styling for glass-card */}
        <style dangerouslySetInnerHTML={{__html: `
          .glass-card {
              background: white;
              border: 1px solid #e2e8f0;
              box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.08);
          }
          .manager-profile-circle {
              display: grid;
              width: 48px;
              height: 48px;
              place-items: center;
              border-radius: 50%;
              background: linear-gradient(135deg, #004ac6, #1d4ed8);
              color: white;
              font-size: 18px;
              font-weight: bold;
          }
        `}} />

        {/* Breadcrumb Heading */}
        <header className="space-y-1">
          <div className="flex items-center gap-2 text-body-sm text-slate-500">
            <button className="hover:text-primary transition-colors text-body-sm text-slate-500 font-medium" onClick={() => navigate(ROUTE_PATHS.managerDashboard)}>Manager Dashboard</button>
            <span className="material-symbols-outlined text-[16px] text-slate-400">chevron_right</span>
            <strong className="text-slate-800 font-semibold text-body-sm">Facility Manager Profile</strong>
          </div>
          <h2 className="text-[24px] leading-tight font-extrabold text-slate-900">Facility Manager Profile</h2>
          <p className="font-body-sm text-body-sm text-slate-500 mt-0.5">Manage operational responsibilities, facility clearances, account security, and activity history.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          
          {/* Left Column: Manager Info & Facility Assignment */}
          <div className="lg:col-span-8 space-y-5">
            
            {/* Identity Card */}
            <div className="glass-card rounded-xl p-6 bg-white space-y-4">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <h3 className="text-[16px] font-bold text-slate-900 m-0">Manager Information</h3>
                <span className="px-3 py-1 bg-green-50 text-green-700 text-xs font-bold rounded-full border border-green-200">
                  {profile.status || 'Active'}
                </span>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="manager-profile-circle">{profile.initials}</div>
                <div>
                  <h4 className="text-[18px] font-bold text-slate-900">{profile.name}</h4>
                  <p className="text-sm font-semibold text-primary">{profile.role}</p>
                  <span className="text-xs text-slate-500 font-medium">{profile.title || 'Facility Operations Manager'}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm pt-2">
                <div className="flex justify-between border-b border-slate-100 py-2">
                  <span className="text-slate-500 font-medium">Manager ID</span>
                  <span className="font-semibold text-slate-900 font-mono">{profile.managerId}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 py-2">
                  <span className="text-slate-500 font-medium">Department</span>
                  <span className="font-semibold text-slate-900">{profile.department}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 py-2">
                  <span className="text-slate-500 font-medium">Email Address</span>
                  <span className="font-semibold text-slate-900">{profile.email}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 py-2">
                  <span className="text-slate-500 font-medium">Phone Contact</span>
                  <span className="font-semibold text-slate-900">{profile.phone}</span>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button 
                  className="bg-slate-900 text-white px-4 py-2.5 rounded-lg text-xs font-bold hover:bg-slate-800 transition-colors active:scale-[0.98]"
                  onClick={openPasswordModal}
                >
                  Change Password
                </button>
                <button 
                  className="border border-red-200 text-red-600 hover:bg-red-50 px-4 py-2.5 rounded-lg text-xs font-bold transition-all active:scale-[0.98]"
                  onClick={logout}
                >
                  Sign Out
                </button>
              </div>
            </div>

            {/* Operational Responsibility Card */}
            <div className="glass-card rounded-xl p-6 bg-white space-y-4">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-[16px] font-bold text-slate-900 m-0">Operational Responsibility</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Primary managed facility & coverage scope</p>
                </div>
                <span className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-full border border-blue-200">
                  <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
                  Online
                </span>
              </div>

              <div className="flex items-center gap-3 p-3.5 bg-slate-50 rounded-lg border border-slate-200">
                <span className="material-symbols-outlined text-primary text-[28px]">apartment</span>
                <div>
                  <strong className="text-base text-slate-900 font-bold block">{profile.facility}</strong>
                  <small className="text-xs text-slate-500 font-medium">Primary Facility Managed by Account</small>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                {(profile.responsibility || []).map(([label, value]) => (
                  <div key={label} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <span className="text-xs text-slate-500 font-medium">{label}</span>
                    <strong className="text-xs text-slate-900 font-bold">{value}</strong>
                  </div>
                ))}
              </div>
              <p className="text-xs text-slate-500 italic bg-amber-50/60 p-3 rounded-lg border border-amber-200/60 text-amber-800">
                Capacity limits, pricing rules, and monthly pass approvals require Manager confirmation before execution.
              </p>
            </div>

          </div>

          {/* Right Column: Access Permissions & Security */}
          <div className="lg:col-span-4 space-y-5">
            
            {/* Account Security */}
            <div className="glass-card rounded-xl p-6 bg-white space-y-3">
              <h3 className="text-[16px] font-bold text-slate-900 m-0 border-b border-slate-100 pb-3">Account Security</h3>
              <div className="space-y-3 text-xs">
                {(profile.security || []).map(([label, val]) => (
                  <div key={label} className="flex justify-between items-center">
                    <span className="text-slate-500 font-medium">{label}</span>
                    <span className={`font-bold ${val === 'Active' ? 'text-green-700' : 'text-slate-900'}`}>{val}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Access Permissions */}
            <div className="glass-card rounded-xl p-6 bg-white space-y-4">
              <h3 className="text-[16px] font-bold text-slate-900 m-0 border-b border-slate-100 pb-3">Role Clearances & Permissions</h3>
              
              <div className="space-y-3">
                <div>
                  <h4 className="text-[11px] font-bold text-green-700 uppercase tracking-wider mb-2">Allowed Access</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {(profile.permissions?.allowed || []).map((allow) => (
                      <span key={allow} className="px-2.5 py-1 text-xs rounded-md bg-green-50 text-green-800 font-semibold border border-green-200">
                        {allow}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-2">Limited Access</h4>
                  <div className="space-y-1.5">
                    {(profile.permissions?.limited || []).map(([item, clearance]) => (
                      <div key={item} className="flex justify-between text-xs text-slate-600 font-medium">
                        <span>{item}</span>
                        <span className="font-bold text-slate-900">{clearance}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-[11px] font-bold text-red-600 uppercase tracking-wider mb-2">Access Denied</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {(profile.permissions?.denied || []).map((deny) => (
                      <span key={deny} className="px-2.5 py-1 text-xs rounded-md bg-red-50 text-red-800 font-semibold border border-red-200">
                        {deny}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* Activity Table Section */}
        <section className="glass-card rounded-xl overflow-hidden bg-white">
          <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
            <div>
              <h3 className="text-[16px] font-bold text-slate-900 m-0">Recent Manager Activities</h3>
              <p className="text-xs text-slate-500 mt-0.5">Audit history of management actions performed</p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3 font-bold uppercase tracking-wider text-slate-600 text-[10px]">Time</th>
                  <th className="px-5 py-3 font-bold uppercase tracking-wider text-slate-600 text-[10px]">Activity</th>
                  <th className="px-5 py-3 font-bold uppercase tracking-wider text-slate-600 text-[10px]">Reference</th>
                  <th className="px-5 py-3 font-bold uppercase tracking-wider text-slate-600 text-[10px]">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {(profile.activities || []).map(([time, act, ref, stat], i) => (
                  <tr key={i} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3 text-slate-500 font-medium">{time}</td>
                    <td className="px-5 py-3 font-bold text-slate-900">{act}</td>
                    <td className="px-5 py-3 text-slate-600 font-mono">{ref}</td>
                    <td className="px-5 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${stat === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
                        {stat}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

      </div>

      {/* Password Modal */}
      {passwordModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
          <section className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200">
            <header className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-900 text-white">
              <div>
                <h3 className="font-bold text-base">Change Manager Password</h3>
                <p className="text-xs text-slate-300">Ensure password security for management access.</p>
              </div>
              <button 
                className="text-slate-400 hover:text-white p-1 rounded transition-colors"
                onClick={() => setPasswordModalOpen(false)}
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </header>
            
            <form onSubmit={submitPassword} className="p-6 space-y-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-700 uppercase">Current Password</label>
                <input 
                  autoFocus 
                  name="currentPassword" 
                  type="password" 
                  value={passwordForm.currentPassword} 
                  onChange={updatePassword} 
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-primary focus:border-primary text-sm outline-none"
                  required 
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-700 uppercase">New Password</label>
                <input 
                  name="newPassword" 
                  type="password" 
                  value={passwordForm.newPassword} 
                  onChange={updatePassword} 
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-primary focus:border-primary text-sm outline-none"
                  minLength="6" 
                  required 
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold text-slate-700 uppercase">Confirm New Password</label>
                <input 
                  name="confirmPassword" 
                  type="password" 
                  value={passwordForm.confirmPassword} 
                  onChange={updatePassword} 
                  className="w-full px-3.5 py-2 border border-slate-300 rounded-lg focus:ring-1 focus:ring-primary focus:border-primary text-sm outline-none"
                  minLength="6" 
                  required 
                />
              </div>

              {formError && (
                <p className="text-xs font-bold text-red-600 bg-red-50 p-2.5 border border-red-200 rounded-lg">
                  {formError}
                </p>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button 
                  type="button" 
                  onClick={() => setPasswordModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2 bg-primary hover:bg-blue-700 text-white rounded-lg text-sm font-bold transition-all shadow active:scale-[0.98]"
                >
                  Update Password
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {/* Toast Notification */}
      {toast.show && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-2xl border border-slate-700 animate-slideUp">
          <span className="material-symbols-outlined text-green-400 text-[22px]">check_circle</span>
          <span className="text-xs font-bold">{toast.message}</span>
        </div>
      )}

    </ManagerLayout>
  )
}

export default ManagerProfilePage
