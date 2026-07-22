import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import MainLayout from '../../layouts/MainLayout'
import { ROUTE_PATHS } from '../../routes/routePaths'
import { getStoredUser } from '../../services/authService'
import { changeStaffPassword, getCurrentStaffProfile } from './staffProfileService'
import './StaffProfilePage.css'

const emptyPasswordForm = { currentPassword: '', newPassword: '', confirmPassword: '' }

const SHIFT = {
  name: 'Morning Shift',
  schedule: '07:00 – 15:00',
  status: 'On duty',
}

const SYSTEMS = ['Gate Controller', 'Slot Manager', 'Payment Terminal']
const PERMISSIONS_ALLOWED = ['View parking map', 'Assign manual slot', 'Print ticket']
const PERMISSIONS_LIMITED = [
  ['Pricing rules', 'View only'],
  ['Refund requests', 'Submit only'],
]
const PERMISSIONS_DENIED = ['Delete staff accounts', 'System configuration', 'Database access']
const SECURITY = [
  ['Two-Factor Auth', 'Enabled'],
  ['Last Password Change', '12 days ago'],
  ['Active Devices', '1 desktop, 1 mobile'],
  ['Current Session', 'Active now · This browser'],
]
const ACTIVITIES = [
  ['08:12', 'Issued ticket T-1042', 'Vehicle 51A-123.45', 'Success'],
  ['08:34', 'Assigned manual slot B-12', 'Vehicle 59C-778.21', 'Success'],
  ['09:01', 'Processed exit payment', 'Ticket T-1037', 'Success'],
  ['09:25', 'Flagged maintenance for slot A-04', 'Slot A-04', 'Warning'],
]

function getInitials(name) {
  if (!name) return 'ST'
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (!parts.length) return 'ST'
  return ((parts[0][0] || '') + (parts[parts.length - 1][0] || '')).toUpperCase()
}

function formatDateTime(value) {
  if (!value) return '—'
  try {
    return new Date(value).toLocaleString()
  } catch {
    return value
  }
}

function StaffProfilePage() {
  const navigate = useNavigate()
  const storedUser = getStoredUser()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [passwordModalOpen, setPasswordModalOpen] = useState(false)
  const [passwordForm, setPasswordForm] = useState(emptyPasswordForm)
  const [formError, setFormError] = useState('')
  const [passwordSubmitting, setPasswordSubmitting] = useState(false)
  const [toast, setToast] = useState('')

  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    if (!storedUser) {
      setLoading(false)
      setError('You are not signed in.')
      return
    }
    let active = true
    setLoading(true)
    getCurrentStaffProfile()
      .then((result) => {
        if (!active) return
        if (result.success) {
          setProfile(result.data)
          setError('')
        } else {
          setProfile(storedUser)
          setError(result.message || 'Could not refresh profile.')
        }
      })
      .finally(() => active && setLoading(false))
    return () => { active = false }
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [storedUser])

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

  const submitPassword = async (event) => {
    event.preventDefault()
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      setFormError('Please fill in all password fields.')
      return
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setFormError('New password and confirmation do not match.')
      return
    }
    setPasswordSubmitting(true)
    setFormError('')
    try {
      const result = await changeStaffPassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      })
      if (!result.success) {
        setFormError(result.message || 'Could not change password.')
        return
      }
      setPasswordModalOpen(false)
      setPasswordForm(emptyPasswordForm)
      setToast(result.message || 'Password updated.')
    } finally {
      setPasswordSubmitting(false)
    }
  }

  const logout = () => navigate(ROUTE_PATHS.login)

  const display = profile || storedUser || {}
  const initials = getInitials(display.fullName || display.FullName || display.name)
  const fullName = display.fullName || display.FullName || display.name || 'Staff Member'
  const role = display.role || display.Role || 'Staff'
  const email = display.email || display.Email || '—'
  const phone = display.phoneNumber || display.PhoneNumber || '—'
  const status = display.status || display.Status || 'Active'
  const lastLogin = formatDateTime(display.lastLoginAt || display.LastLoginAt)

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
            <div className="staff-identity"><span>{initials}</span><div><strong>{fullName}</strong><p>{role}</p></div></div>
            <dl className="staff-facts"><dt>Email</dt><dd>{email}</dd><dt>Phone</dt><dd>{phone}</dd><dt>Status</dt><dd className="active-text">{status}</dd><dt>Last Login</dt><dd>{lastLogin}</dd></dl>
            <div className="staff-primary-actions"><button onClick={openPasswordModal}>Change Password</button><button className="danger" onClick={logout}>Logout</button></div>
          </article>

          <article className="profile-card shift-card">
            <h2>Current Shift Status</h2>
            <div className="shift-grid"><div className="shift-details"><span><small>Shift Name</small><strong>{SHIFT.name}</strong></span><span><small>Schedule</small><strong>{SHIFT.schedule}</strong></span><span><small>Status</small><strong className="active-text"><i />{SHIFT.status}</strong></span></div><div><small className="section-label">System Status</small><div className="system-checks">{SYSTEMS.map((system) => <span key={system}>{system}<i className="material-symbols-outlined">check_circle</i></span>)}</div></div></div>
            <div className="shift-message"><span className="material-symbols-outlined">info</span><p>Current shift is active and all assigned systems are operational.</p></div>
          </article>
        </section>

        <section className="profile-middle-grid">
          <article id="account-security" className="profile-card security-card"><h2>Account Security</h2><dl>{SECURITY.map(([label, value]) => <div key={label}><dt>{label}</dt><dd className={label === 'Current Session' ? 'active-text' : ''}>{value}</dd></div>)}</dl><div className="security-actions"><button onClick={openPasswordModal}>Change Password</button><button onClick={logout}>Sign Out</button></div></article>
          <article className="profile-card permissions-card"><h2>My Permissions</h2><section><h3>Allowed</h3><div className="permission-tags allowed">{PERMISSIONS_ALLOWED.map((item) => <span key={item}>{item}</span>)}</div></section><section><h3>Limited Access</h3><div className="limited-list">{PERMISSIONS_LIMITED.map(([name, access]) => <span key={name}><i>{name}</i><strong>{access}</strong></span>)}</div></section><section><h3>No Access</h3><div className="permission-tags denied">{PERMISSIONS_DENIED.map((item) => <span key={item}>{item}</span>)}</div></section></article>
        </section>

        <section className="profile-card activity-section"><header><h2>Recent Staff Activity</h2><button onClick={() => navigate(ROUTE_PATHS.systemLogs)}>View Full Logs</button></header><div className="profile-table-wrap"><table><thead><tr><th>Time</th><th>Activity</th><th>Reference</th><th>Status</th></tr></thead><tbody>{ACTIVITIES.map(([time, activity, reference, status]) => <tr key={`${time}-${activity}`}><td>{time}</td><td>{activity}</td><td className="activity-reference">{reference}</td><td><span className={`activity-status ${status.toLowerCase()}`}>{status}</span></td></tr>)}</tbody></table></div></section>

        {error && !loading && <div className="profile-error" role="alert"><span className="material-symbols-outlined">error</span>{error}</div>}

        {passwordModalOpen && <div className="password-modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && setPasswordModalOpen(false)}><section className="password-modal" role="dialog" aria-modal="true" aria-labelledby="password-title"><header><div><h2 id="password-title">Change Password</h2><p>Use a strong password you do not use elsewhere.</p></div><button aria-label="Close" onClick={() => setPasswordModalOpen(false)}><span className="material-symbols-outlined">close</span></button></header><form onSubmit={submitPassword}><label>Current Password<input autoFocus name="currentPassword" type="password" value={passwordForm.currentPassword} onChange={updatePassword} required /></label><label>New Password<input name="newPassword" type="password" value={passwordForm.newPassword} onChange={updatePassword} minLength="6" required /></label><label>Confirm New Password<input name="confirmPassword" type="password" value={passwordForm.confirmPassword} onChange={updatePassword} minLength="6" required /></label>{formError && <p className="password-error" role="alert">{formError}</p>}<div><button type="button" onClick={() => setPasswordModalOpen(false)}>Cancel</button><button className="save-password" type="submit" disabled={passwordSubmitting}>{passwordSubmitting ? 'Updating…' : 'Update Password'}</button></div></form></section></div>}
        {toast && <div className="profile-toast" role="status"><span className="material-symbols-outlined">check_circle</span>{toast}</div>}
      </div>
    </MainLayout>
  )
}

export default StaffProfilePage