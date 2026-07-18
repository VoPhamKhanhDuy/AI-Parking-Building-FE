import { useState, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { ROUTE_PATHS } from '../../routes/routePaths'
import { useAuth } from '../../contexts/useAuth'
import './LoginPage.css'

// Demo users for quick access
const DEMO_USERS = [
  { role: 'Admin', email: 'admin@parking.local', password: 'Admin@123', icon: 'admin_panel_settings', featured: true },
  { role: 'Manager', email: 'manager@parking.local', password: 'Manager@123', icon: 'manage_accounts', featured: false },
  { role: 'Staff', email: 'staff@parking.local', password: 'Staff@123', icon: 'support_agent', featured: false },
]

// Role to dashboard mapping
const ROLE_DASHBOARD_MAP = {
  Admin: ROUTE_PATHS.adminDashboard,
  SystemAdmin: ROUTE_PATHS.adminDashboard,
  Manager: ROUTE_PATHS.managerDashboard,
  FacilityManager: ROUTE_PATHS.managerDashboard,
}

const getDashboardByRole = (role) => ROLE_DASHBOARD_MAP[role] || ROUTE_PATHS.dashboard

function Icon({ children, filled = false }) {
  return (
    <span className={`material-symbols-outlined${filled ? ' icon-filled' : ''}`}>
      {children}
    </span>
  )
}

function LoginPage() {
  console.log('LoginPage rendering')
  const navigate = useNavigate()
  const location = useLocation()
  const { login, loading: authLoading } = useAuth()

  const [form, setForm] = useState({ email: '', password: '', remember: false })
  const [showPassword, setShowPassword] = useState(false)
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  // Get redirect URL from navigation state
  const from = location.state?.from?.pathname || null

  const updateField = useCallback((event) => {
    const { name, value, checked, type } = event.target
    setForm((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }))
    setError('')
  }, [])

  const handleSubmit = useCallback(async (event) => {
    event.preventDefault()
    setIsSubmitting(true)
    setError('')
    setMessage('')

    try {
      const result = await login(form.email, form.password)

      if (result.success) {
        setMessage('Login successful. Redirecting...')
        const redirectTo = from || getDashboardByRole(result.user?.role || result.user?.Role)
        setTimeout(() => navigate(redirectTo, { replace: true }), 300)
      } else {
        setError(result.message || 'Login failed. Please check your credentials.')
      }
    } catch {
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }, [form.email, form.password, login, navigate, from])

  const handleDemoLogin = useCallback((demoUser) => {
    setForm({ email: demoUser.email, password: demoUser.password, remember: false })
    setError('')
    setMessage(`${demoUser.role} demo account selected. Click Login to continue.`)
  }, [])

  const togglePassword = useCallback(() => {
    setShowPassword((prev) => !prev)
  }, [])

  const isLoading = isSubmitting || authLoading

  return (
    <main className="login-page">
      <section className="login-visual">
        <div className="visual-content">
          <div className="visual-icon">
            <Icon filled>precision_manufacturing</Icon>
          </div>
          <h2>AI Parking Operation Command Center</h2>
          <p>
            Manage vehicle entry, AI slot recommendation, real-time parking status,
            tickets, payments, and operation reports in one intelligent system.
          </p>
          <div className="feature-chips">
            <span>AI Slot Recommendation</span>
            <span>Real-time Slot Status</span>
            <span>Secure Role-Based Access</span>
          </div>
        </div>
      </section>

      <section className="login-panel">
        <div className="login-card">
          <header className="login-header">
            <div className="login-logo" aria-label="AI Parking Command Logo" />
            <h1>AI Parking Command</h1>
            <p>Smart parking building operation with AI slot recommendation.</p>
          </header>

          <form onSubmit={handleSubmit} className="login-form">
            <label className="input-wrap">
              <Icon>mail</Icon>
              <input
                name="email"
                type="email"
                placeholder="Email Address"
                value={form.email}
                onChange={updateField}
                required
                disabled={isLoading}
                autoComplete="email"
              />
            </label>

            <label className="input-wrap">
              <Icon>lock</Icon>
              <input
                name="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={form.password}
                onChange={updateField}
                required
                disabled={isLoading}
                autoComplete="current-password"
              />
              <button
                className="password-toggle"
                type="button"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                onClick={togglePassword}
              >
                <Icon>{showPassword ? 'visibility' : 'visibility_off'}</Icon>
              </button>
            </label>

            <div className="form-options">
              <label className="remember-option">
                <input
                  name="remember"
                  type="checkbox"
                  checked={form.remember}
                  onChange={updateField}
                  disabled={isLoading}
                />
                <span>Remember me</span>
              </label>
              <a href="#forgot-password">Forgot password?</a>
            </div>

            {error && (
              <p className="form-message error" role="alert">
                {error}
              </p>
            )}
            {message && !error && (
              <p className="form-message" role="status">
                {message}
              </p>
            )}

            <button
              className="login-button"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? (
                <>Loading...</>
              ) : (
                <>
                  Login <Icon>arrow_forward</Icon>
                </>
              )}
            </button>
          </form>

          <section className="quick-access">
            <p className="quick-title">Quick Access Demo</p>
            <div className="demo-list">
              {DEMO_USERS.map((user) => (
                <button
                  type="button"
                  key={user.role}
                  title={`${user.email} / ${user.password}`}
                  className={`demo-user${user.featured ? ' featured' : ''}`}
                  onClick={() => handleDemoLogin(user)}
                >
                  <span className="demo-info">
                    <span className="demo-icon">
                      <Icon>{user.icon}</Icon>
                    </span>
                    <strong>{user.role}</strong>
                    {user.featured && <small>Main Demo</small>}
                  </span>
                  <Icon>chevron_right</Icon>
                </button>
              ))}
            </div>
          </section>
        </div>

        <a className="driver-link" href="/driver">
          <Icon>directions_car</Icon>
          Driver Portal / Monthly Pass / Reservation
        </a>
      </section>
    </main>
  )
}

export default LoginPage
