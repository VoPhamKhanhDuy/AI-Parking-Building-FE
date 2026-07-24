import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ManagerLayout from '../../layouts/ManagerLayout'
import { ROUTE_PATHS } from '../../routes/routePaths'
import { fetchCurrentManagerProfile, changeManagerPasswordApi, managerProfileData } from './managerProfileService'
import { getStoredUser } from '../../services/authService'
import '../StaffProfile/StaffProfilePage.css'

const emptyPasswordForm = { currentPassword: '', newPassword: '', confirmPassword: '' }

function getInitials(name) {
  if (!name) return 'MG'
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (!parts.length) return 'MG'
  return ((parts[0][0] || '') + (parts[parts.length - 1][0] || '')).toUpperCase()
}

function ManagerProfilePage() {
  const navigate = useNavigate()
  const storedUser = getStoredUser()
  const [profile, setProfile] = useState(managerProfileData)
  const [loading, setLoading] = useState(true)
  const [passwordModalOpen, setPasswordModalOpen] = useState(false)
  const [passwordForm, setPasswordForm] = useState(emptyPasswordForm)
  const [formError, setFormError] = useState('')
  const [passwordSubmitting, setPasswordSubmitting] = useState(false)
  const [toast, setToast] = useState('')

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
    if (passwordForm.newPassword.length < 6) {
      setFormError('New password must be at least 6 characters long.')
      return
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setFormError('New password and confirmation do not match.')
      return
    }

    setPasswordSubmitting(true)
    setFormError('')
    try {
      const res = await changeManagerPasswordApi(passwordForm.currentPassword, passwordForm.newPassword)
      if (!res.success) {
        setFormError(res.message || 'Current password is invalid.')
        return
      }
      setPasswordModalOpen(false)
      setPasswordForm(emptyPasswordForm)
      setToast(res.message || 'Manager password updated successfully!')
    } finally {
      setPasswordSubmitting(false)
    }
  }

  const logout = () => navigate(ROUTE_PATHS.login)

  const displayName = profile.name || storedUser?.fullName || storedUser?.FullName || 'Facility Manager'
  const initials = getInitials(displayName)
  const email = profile.email || storedUser?.email || 'facility.manager.a@gmail.com'

  if (loading) {
    return (
      <ManagerLayout>
        <div style={{ padding: 40, textAlign: 'center', color: '#64748b', fontWeight: 600 }}>
          Loading Manager Profile…
        </div>
      </ManagerLayout>
    )
  }

  return (
    <ManagerLayout>
      <div className="staff-profile-page">
        <header className="staff-page-heading">
          <div className="staff-breadcrumb">
            <button onClick={() => navigate(ROUTE_PATHS.managerDashboard)}>Dashboard</button>
            <span className="material-symbols-outlined">chevron_right</span>
            <strong>Manager Profile</strong>
          </div>
          <h1>Facility Manager Profile</h1>
          <p>View manager account, operational responsibility, facility permissions, and recent activity.</p>
        </header>

        <section className="profile-top-grid">
          <article className="profile-card staff-information">
            <h2>Manager Information</h2>
            <div className="staff-identity">
              <span>{initials}</span>
              <div>
                <strong>{displayName}</strong>
                <p>{profile.role || 'Facility Manager'}</p>
              </div>
            </div>
            <dl className="staff-facts">
              <dt>Manager ID</dt>
              <dd>{profile.managerId}</dd>
              <dt>Department</dt>
              <dd>{profile.department}</dd>
              <dt>Email</dt>
              <dd>{email}</dd>
              <dt>Phone</dt>
              <dd>{profile.phone || '—'}</dd>
              <dt>Status</dt>
              <dd className="active-text">{profile.status || 'Active'}</dd>
              <dt>Last Login</dt>
              <dd>{profile.lastLogin || 'Today'}</dd>
            </dl>
            <div className="staff-primary-actions">
              <button onClick={openPasswordModal}>Change Password</button>
              <button className="danger" onClick={logout}>Sign Out</button>
            </div>
          </article>

          <article className="profile-card shift-card">
            <h2>Operational Responsibility</h2>
            <div className="shift-grid">
              <div className="shift-details">
                <span>
                  <small>Facility</small>
                  <strong>{profile.facility}</strong>
                </span>
                <span>
                  <small>Coverage</small>
                  <strong>4 floors · 12 zones</strong>
                </span>
                <span>
                  <small>Facility Status</small>
                  <strong className="active-text"><i />Online · Managed</strong>
                </span>
              </div>
              <div>
                <small className="section-label">Responsibility Overview</small>
                <div className="system-checks">
                  {(profile.responsibility || []).map(([label, val]) => (
                    <span key={label}>
                      {label}: <strong>{val}</strong>
                      <i className="material-symbols-outlined">check_circle</i>
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div className="shift-message">
              <span className="material-symbols-outlined">apartment</span>
              <p>Primary Facility Managed by Account. Capacity and pricing updates require manager confirmation.</p>
            </div>
          </article>
        </section>

        <section className="profile-middle-grid">
          <article className="profile-card security-card">
            <h2>Account Security Policies</h2>
            <dl>
              {(profile.security || []).map(([label, value]) => (
                <div key={label}>
                  <dt>{label}</dt>
                  <dd className={value === 'Active' ? 'active-text' : ''}>{value}</dd>
                </div>
              ))}
            </dl>
            <div className="security-actions">
              <button onClick={openPasswordModal}>Change Password</button>
              <button onClick={logout}>Sign Out</button>
            </div>
          </article>

          <article className="profile-card permissions-card">
            <h2>Manager Clearances & Permissions</h2>
            <section>
              <h3>Full Access</h3>
              <div className="permission-tags allowed">
                {(profile.permissions?.allowed || []).map((item) => <span key={item}>{item}</span>)}
              </div>
            </section>
            <section>
              <h3>Limited Control</h3>
              <div className="limited-list">
                {(profile.permissions?.limited || []).map(([name, access]) => (
                  <span key={name}><i>{name}</i><strong>{access}</strong></span>
                ))}
              </div>
            </section>
            <section>
              <h3>No Access</h3>
              <div className="permission-tags denied">
                {(profile.permissions?.denied || []).map((item) => <span key={item}>{item}</span>)}
              </div>
            </section>
          </article>
        </section>

        <section className="profile-card activity-section">
          <header>
            <h2>Recent Manager Activities</h2>
            <button onClick={() => navigate(ROUTE_PATHS.reports)}>View Operations Reports</button>
          </header>
          <div className="profile-table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Activity</th>
                  <th>Reference</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {(profile.activities || []).map(([time, activity, reference, status]) => (
                  <tr key={`${time}-${activity}`}>
                    <td>{time}</td>
                    <td><strong>{activity}</strong></td>
                    <td className="activity-reference">{reference}</td>
                    <td>
                      <span className={`activity-status ${status.toLowerCase()}`}>{status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {passwordModalOpen && (
          <div className="password-modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && setPasswordModalOpen(false)}>
            <section className="password-modal" role="dialog" aria-modal="true" aria-labelledby="password-title">
              <header>
                <div>
                  <h2 id="password-title">Change Manager Password</h2>
                  <p>Use a strong password to maintain facility manager security.</p>
                </div>
                <button aria-label="Close" onClick={() => setPasswordModalOpen(false)}>
                  <span className="material-symbols-outlined">close</span>
                </button>
              </header>
              <form onSubmit={submitPassword}>
                <label>Current Password
                  <input autoFocus name="currentPassword" type="password" value={passwordForm.currentPassword} onChange={updatePassword} required />
                </label>
                <label>New Password
                  <input name="newPassword" type="password" value={passwordForm.newPassword} onChange={updatePassword} minLength="6" required />
                </label>
                <label>Confirm New Password
                  <input name="confirmPassword" type="password" value={passwordForm.confirmPassword} onChange={updatePassword} minLength="6" required />
                </label>
                {formError && <p className="password-error" role="alert">{formError}</p>}
                <div>
                  <button type="button" onClick={() => setPasswordModalOpen(false)}>Cancel</button>
                  <button className="save-password" type="submit" disabled={passwordSubmitting}>{passwordSubmitting ? 'Updating…' : 'Update Password'}</button>
                </div>
              </form>
            </section>
          </div>
        )}

        {toast && (
          <div className="profile-toast" role="status">
            <span className="material-symbols-outlined">check_circle</span>
            {toast}
          </div>
        )}
      </div>
    </ManagerLayout>
  )
}

export default ManagerProfilePage
