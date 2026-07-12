import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import MainLayout from '../../layouts/MainLayout'
import { ROUTE_PATHS } from '../../routes/routePaths'
import { changeStaffPassword, getStaffProfile } from './staffProfileService'
import './StaffProfilePage.css'

const emptyPasswordForm = { currentPassword: '', newPassword: '', confirmPassword: '' }

function StaffProfilePage() {
  const profile = getStaffProfile()
  const navigate = useNavigate()
  const [passwordModalOpen, setPasswordModalOpen] = useState(false)
  const [passwordForm, setPasswordForm] = useState(emptyPasswordForm)
  const [formError, setFormError] = useState('')
  const [toast, setToast] = useState('')

  useEffect(() => {
    if (!toast) return undefined
    const timer = setTimeout(() => setToast(''), 2600)
    return () => clearTimeout(timer)
  }, [toast])

  const openPasswordModal = () => {
    setPasswordForm(emptyPasswordForm)
    setFormError('')
    setPasswordModalOpen(true)
  }

  const updatePassword = (event) => setPasswordForm((current) => ({ ...current, [event.target.name]: event.target.value }))

  const submitPassword = (event) => {
    event.preventDefault()
    const result = changeStaffPassword(passwordForm)
    if (!result.success) {
      setFormError(result.message)
      return
    }
    setPasswordModalOpen(false)
    setToast(result.message)
  }

  const logout = () => navigate(ROUTE_PATHS.login)

  return (
    <MainLayout>
      <div className="staff-profile-page">
        <header className="staff-page-heading">
          <div className="staff-breadcrumb"><button onClick={() => navigate(ROUTE_PATHS.dashboard)}>Dashboard</button><span className="material-symbols-outlined">chevron_right</span><strong>Staff Profile</strong></div>
          <h1>Staff Profile</h1><p>View staff account information, current shift status, permissions, and recent activity.</p>
        </header>

        <section className="profile-top-grid">
          <article className="profile-card staff-information">
            <h2>Staff Information</h2>
            <div className="staff-identity"><span>{profile.initials}</span><div><strong>{profile.name}</strong><p>{profile.role}</p></div></div>
            <dl className="staff-facts"><dt>Gate</dt><dd>{profile.gate}</dd><dt>Department</dt><dd>{profile.department}</dd><dt>Status</dt><dd className="active-text">{profile.status}</dd><dt>Last Login</dt><dd>{profile.lastLogin}</dd></dl>
            <div className="staff-primary-actions"><button onClick={openPasswordModal}>Change Password</button><button className="danger" onClick={logout}>Logout</button></div>
          </article>

          <article className="profile-card shift-card">
            <h2>Current Shift Status</h2>
            <div className="shift-grid"><div className="shift-details"><span><small>Shift Name</small><strong>{profile.shift.name}</strong></span><span><small>Schedule</small><strong>{profile.shift.schedule}</strong></span><span><small>Status</small><strong className="active-text"><i />{profile.shift.status}</strong></span></div><div><small className="section-label">System Status</small><div className="system-checks">{profile.systems.map((system) => <span key={system}>{system}<i className="material-symbols-outlined">check_circle</i></span>)}</div></div></div>
            <div className="shift-message"><span className="material-symbols-outlined">info</span><p>Current shift is active and all assigned systems are operational.</p></div>
          </article>
        </section>

        <section className="profile-middle-grid">
          <article className="profile-card security-card"><h2>Account Security</h2><dl>{profile.security.map(([label, value]) => <div key={label}><dt>{label}</dt><dd className={label === 'Current Session' ? 'active-text' : ''}>{value}</dd></div>)}</dl><div className="security-actions"><button onClick={openPasswordModal}>Change Password</button><button onClick={logout}>Sign Out</button></div></article>
          <article className="profile-card permissions-card"><h2>My Permissions</h2><section><h3>Allowed</h3><div className="permission-tags allowed">{profile.permissions.allowed.map((item) => <span key={item}>{item}</span>)}</div></section><section><h3>Limited Access</h3><div className="limited-list">{profile.permissions.limited.map(([name, access]) => <span key={name}><i>{name}</i><strong>{access}</strong></span>)}</div></section><section><h3>No Access</h3><div className="permission-tags denied">{profile.permissions.denied.map((item) => <span key={item}>{item}</span>)}</div></section></article>
        </section>

        <section className="profile-card activity-section"><header><h2>Recent Staff Activity</h2><button onClick={() => navigate(ROUTE_PATHS.systemLogs)}>View Full Logs</button></header><div className="profile-table-wrap"><table><thead><tr><th>Time</th><th>Activity</th><th>Reference</th><th>Status</th></tr></thead><tbody>{profile.activities.map(([time, activity, reference, status]) => <tr key={`${time}-${activity}`}><td>{time}</td><td>{activity}</td><td className="activity-reference">{reference}</td><td><span className={`activity-status ${status.toLowerCase()}`}>{status}</span></td></tr>)}</tbody></table></div></section>

        {passwordModalOpen && <div className="password-modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && setPasswordModalOpen(false)}><section className="password-modal" role="dialog" aria-modal="true" aria-labelledby="password-title"><header><div><h2 id="password-title">Change Password</h2><p>Use a strong password you do not use elsewhere.</p></div><button aria-label="Close" onClick={() => setPasswordModalOpen(false)}><span className="material-symbols-outlined">close</span></button></header><form onSubmit={submitPassword}><label>Current Password<input autoFocus name="currentPassword" type="password" value={passwordForm.currentPassword} onChange={updatePassword} required /></label><label>New Password<input name="newPassword" type="password" value={passwordForm.newPassword} onChange={updatePassword} minLength="6" required /></label><label>Confirm New Password<input name="confirmPassword" type="password" value={passwordForm.confirmPassword} onChange={updatePassword} minLength="6" required /></label>{formError && <p className="password-error" role="alert">{formError}</p>}<div><button type="button" onClick={() => setPasswordModalOpen(false)}>Cancel</button><button className="save-password" type="submit">Update Password</button></div></form></section></div>}
        {toast && <div className="profile-toast" role="status"><span className="material-symbols-outlined">check_circle</span>{toast}</div>}
      </div>
    </MainLayout>
  )
}

export default StaffProfilePage
