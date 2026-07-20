import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ManagerLayout from '../../layouts/ManagerLayout'
import { ROUTE_PATHS } from '../../routes/routePaths'
import { changeManagerPassword, getManagerProfile } from './managerProfileService'
import './ManagerProfilePage.css'

const emptyPasswordForm = { currentPassword: '', newPassword: '', confirmPassword: '' }

function ManagerProfilePage() {
  const profile = getManagerProfile()
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
    const result = changeManagerPassword(passwordForm)
    if (!result.success) {
      setFormError(result.message)
      return
    }
    setPasswordModalOpen(false)
    setToast(result.message)
  }

  return (
    <ManagerLayout>
      <div className="manager-profile-page">
        <header className="manager-profile-heading">
          <p><button onClick={() => navigate(ROUTE_PATHS.managerDashboard)}>Dashboard</button><span>/</span>Facility Manager Profile</p>
          <h1>Facility Manager Profile</h1>
          <h2>View your manager account, operational responsibility, access scope, and recent activity.</h2>
        </header>

        <section className="manager-profile-grid manager-profile-overview">
          <article className="manager-profile-card identity-card">
            <header><h3>Manager Information</h3><span className="manager-profile-status">Active</span></header>
            <div className="manager-identity"><b>{profile.initials}</b><div><strong>{profile.name}</strong><span>{profile.role}</span><small>{profile.title}</small></div></div>
            <dl className="manager-profile-facts">
              <div><dt>Manager ID</dt><dd>{profile.managerId}</dd></div>
              <div><dt>Department</dt><dd>{profile.department}</dd></div>
              <div><dt>Email</dt><dd>{profile.email}</dd></div>
              <div><dt>Phone</dt><dd>{profile.phone}</dd></div>
            </dl>
            <div className="manager-profile-actions"><button onClick={openPasswordModal}>Change Password</button><button className="sign-out" onClick={() => navigate(ROUTE_PATHS.login)}>Sign Out</button></div>
          </article>

          <article className="manager-profile-card responsibility-card">
            <header><div><h3>Operational Responsibility</h3><p>Current facility assignment</p></div><span className="manager-profile-status">Online</span></header>
            <div className="facility-assignment"><span className="material-symbols-outlined">apartment</span><div><strong>{profile.facility}</strong><small>Primary managed facility</small></div></div>
            <dl>{profile.responsibility.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
            <p className="responsibility-note">Capacity and pricing changes require manager confirmation before they are applied.</p>
          </article>
        </section>

        <section className="manager-profile-grid manager-profile-access">
          <article className="manager-profile-card permissions-card">
            <header><div><h3>Access Permissions</h3><p>Access assigned to the Facility Manager role</p></div></header>
            <div className="permission-section"><h4>Full access</h4><div className="permission-tags allowed">{profile.permissions.allowed.map((item) => <span key={item}>{item}</span>)}</div></div>
            <div className="permission-section"><h4>Limited access</h4><div className="manager-limited-list">{profile.permissions.limited.map(([name, access]) => <div key={name}><span>{name}</span><strong>{access}</strong></div>)}</div></div>
            <div className="permission-section"><h4>No access</h4><div className="permission-tags denied">{profile.permissions.denied.map((item) => <span key={item}>{item}</span>)}</div></div>
          </article>

          <article className="manager-profile-card security-card">
            <header><div><h3>Account Security</h3><p>Personal account and session status</p></div></header>
            <dl>{profile.security.map(([label, value]) => <div key={label}><dt>{label}</dt><dd className={value === 'Active' ? 'active-value' : ''}>{value}</dd></div>)}</dl>
            <button className="security-password" onClick={openPasswordModal}>Change Password</button>
          </article>
        </section>

        <section className="manager-profile-card manager-profile-activity">
          <header><div><h3>Recent Manager Activity</h3><p>Latest actions performed with this account</p></div></header>
          <div className="manager-profile-table-wrap"><table><thead><tr><th>Time</th><th>Activity</th><th>Reference</th><th>Status</th></tr></thead><tbody>{profile.activities.map(([time, activity, reference, status]) => <tr key={`${time}-${activity}`}><td>{time}</td><td><strong>{activity}</strong></td><td>{reference}</td><td><span className={`manager-activity-status ${status.toLowerCase()}`}>{status}</span></td></tr>)}</tbody></table></div>
        </section>

        {passwordModalOpen && <div className="manager-password-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && setPasswordModalOpen(false)}><section className="manager-password-modal" role="dialog" aria-modal="true" aria-labelledby="manager-password-title"><header><div><h3 id="manager-password-title">Change Password</h3><p>Update the password for your manager account.</p></div><button aria-label="Close" onClick={() => setPasswordModalOpen(false)}><span className="material-symbols-outlined">close</span></button></header><form onSubmit={submitPassword}><label>Current Password<input autoFocus name="currentPassword" type="password" value={passwordForm.currentPassword} onChange={updatePassword} required /></label><label>New Password<input name="newPassword" type="password" value={passwordForm.newPassword} onChange={updatePassword} minLength="6" required /></label><label>Confirm New Password<input name="confirmPassword" type="password" value={passwordForm.confirmPassword} onChange={updatePassword} minLength="6" required /></label>{formError && <p className="manager-password-error" role="alert">{formError}</p>}<div className="manager-password-actions"><button type="button" onClick={() => setPasswordModalOpen(false)}>Cancel</button><button className="save" type="submit">Update Password</button></div></form></section></div>}
        {toast && <div className="manager-profile-toast" role="status"><span className="material-symbols-outlined">check_circle</span>{toast}</div>}
      </div>
    </ManagerLayout>
  )
}

export default ManagerProfilePage
