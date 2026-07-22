import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ROUTE_PATHS } from '../../routes/routePaths'
import { getDemoUsers, login } from './loginService'
import './LoginPage.css'

const heroImage = 'https://lh3.googleusercontent.com/aida-public/AB6AXuCSu_O056QPcT0x16SaD2U72Je0TfVIxUky6-rWI0evNjs4LNdJEkV-W37Xm7mL7Rt_5peGA6QfBjSqarTx4DtKiWFUSs4_9dQYnuYBDYxTdb615LJbZTKzJ40jUSCduLitb72YtjUcO7sWj1tpCk0rFuaOEOwBEL2B6T5o3lrlcKYN7CEbn6aoA5YOrWsE7YcHzdq6ZOx571-sAumP4aoc5fHMTyWcSRisj2hLWeFAucUfV6yE1W9aHZ9U7Jfj87zqfPAiAGDunUM'
const logoImage = 'https://lh3.googleusercontent.com/aida-public/AB6AXuD7DLgS8D3XCMEEBNEj68W89edaHjYcJRhf9R6Yw9KHuW7kTcZPcGu0XtB_TRCjlIdtQ7IZlvVzL0a4NS7gyTvXKz8GZu6RNFDcRGHeO96x9M7RJFrPirMh05g1O-xRyG5iKcmiEMjf6eWYYWMYgaGmfa93h8NheXABAQOt-qqGuNo0vIV9rLVIIKjkP4ytl4o3MdT2C0IhHGDyLA_5IOjdfaXQ1sFEIPL7dsbUu5NZWUor_HWtuBICnsT-Sp-txH1hc8zvYnEYpUA'

function Icon({ children, filled = false }) {
  return <span className={`material-symbols-outlined${filled ? ' icon-filled' : ''}`}>{children}</span>
}

function LoginPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '', remember: false })
  const [showPassword, setShowPassword] = useState(false)
  const [message, setMessage] = useState('')
  const demoUsers = getDemoUsers()

  const updateField = (event) => {
    const { name, value, checked, type } = event.target
    setForm((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    const result = login(form)
    setMessage(result.success ? 'Login successful.' : result.message)
    if (result.success) {
      if (result.user?.role === 'Admin') {
        navigate(ROUTE_PATHS.adminDashboard)
      } else if (result.user?.role === 'Manager') {
        navigate(ROUTE_PATHS.managerDashboard)
      } else if (result.user?.role === 'Driver') {
        navigate(ROUTE_PATHS.driverPortal)
      } else {
        navigate(ROUTE_PATHS.dashboard)
      }
    }
  }

  return (
    <main className="login-page">
      <section className="login-visual" style={{ '--hero-image': `url(${heroImage})` }}>
        <div className="visual-content">
          <div className="visual-icon"><Icon filled>precision_manufacturing</Icon></div>
          <h2>AI Parking Operation Command Center</h2>
          <p>Manage vehicle entry, AI slot recommendation, real-time parking status, tickets, payments, and operation reports in one intelligent system.</p>
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
            <img src={logoImage} alt="AI Parking Command Logo" />
            <h1>AI Parking Command</h1>
            <p>Smart parking building operation with AI slot recommendation.</p>
          </header>

          <form onSubmit={handleSubmit} className="login-form">
            <label className="input-wrap">
              <Icon>mail</Icon>
              <input name="email" type="email" placeholder="Email Address" value={form.email} onChange={updateField} required />
            </label>
            <label className="input-wrap">
              <Icon>lock</Icon>
              <input name="password" type={showPassword ? 'text' : 'password'} placeholder="Password" value={form.password} onChange={updateField} required />
              <button className="password-toggle" type="button" aria-label={showPassword ? 'Hide password' : 'Show password'} onClick={() => setShowPassword((current) => !current)}>
                <Icon>{showPassword ? 'visibility' : 'visibility_off'}</Icon>
              </button>
            </label>

            <div className="form-options">
              <label className="remember-option">
                <input name="remember" type="checkbox" checked={form.remember} onChange={updateField} />
                <span>Remember me</span>
              </label>
              <a href="#forgot-password">Forgot password?</a>
            </div>

            <button className="login-button" type="submit">Login <Icon>arrow_forward</Icon></button>
            {message && <p className="form-message" role="status">{message}</p>}
          </form>

          <section className="quick-access">
            <p className="quick-title">Quick Access Demo</p>
            <div className="demo-list">
              {demoUsers.map((user) => (
                <button
                  type="button"
                  key={user.role}
                  title={`${user.email} / ${user.password}`}
                  className={`demo-user${user.featured ? ' featured' : ''}`}
                  onClick={() => {
                    setForm({ email: user.email, password: user.password, remember: false })
                    setMessage(`${user.role} demo account selected.`)
                  }}
                >
                  <span className="demo-info"><span className="demo-icon"><Icon>{user.icon}</Icon></span><strong>{user.role}</strong>{user.featured && <small>Main Demo</small>}</span>
                  <Icon>chevron_right</Icon>
                </button>
              ))}
            </div>
          </section>
        </div>

        <a className="driver-link" href="/driver"><Icon>directions_car</Icon>Driver Portal / Monthly Pass / Reservation</a>
      </section>
    </main>
  )
}

export default LoginPage
