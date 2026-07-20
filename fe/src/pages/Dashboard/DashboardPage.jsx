import { useState, useEffect, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import MainLayout from '../../layouts/MainLayout'
import { ROUTE_PATHS } from '../../routes/routePaths'
import { formatCurrency, getDashboardData, shapeDashboardEntry } from './dashboardService'
import './DashboardPage.css'

function DashboardPage() {
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showAllActivities, setShowAllActivities] = useState(false)
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let cancelled = false
    getDashboardData()
      .then((result) => {
        if (cancelled) return
        setData(result)
        setError(null)
      })
      .catch((err) => {
        if (cancelled) return
        setError(err?.message || 'Failed to load dashboard data')
      })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [reloadKey])

  const handleRetry = useCallback(() => {
    setError(null)
    setReloadKey((k) => k + 1)
  }, [])

  const activities = useMemo(() => {
    if (!data?.recentEntries) return []
    return data.recentEntries.map((entry) => shapeDashboardEntry(entry)).filter(Boolean)
  }, [data])

  const displayActivities = showAllActivities ? activities : activities.slice(0, 3)

  if (loading) {
    return (
      <MainLayout>
        <div className="dashboard-page">
          <div className="loading-container">
            <div className="loading-spinner" />
            <p>Loading dashboard...</p>
          </div>
        </div>
      </MainLayout>
    )
  }

  if (error) {
    return (
      <MainLayout>
        <div className="dashboard-page">
          <div className="error-container">
            <span className="material-symbols-outlined">error</span>
            <p>{error}</p>
            <button onClick={handleRetry}>Retry</button>
          </div>
        </div>
      </MainLayout>
    )
  }

  const stats = data?.stats || {}

  return (
    <MainLayout>
      <div className="dashboard-page">
        <header className="page-heading">
          <button onClick={() => navigate(ROUTE_PATHS.dashboard)}>Dashboard</button>
          <h1>Dashboard</h1>
          <p>Live overview of parking capacity, active sessions, revenue, and system alerts.</p>
        </header>

        <section className="kpi-grid">
          <article className="kpi-card">
            <small>Active Sessions</small>
            <strong>{stats.activeSessions ?? 0}</strong>
            <p>Vehicles currently parked</p>
          </article>
          <article className="kpi-card">
            <small>Today's Entries</small>
            <strong>{stats.todayEntries ?? 0}</strong>
            <p>Total vehicle entries today</p>
          </article>
          <article className="kpi-card">
            <small>Today's Exits</small>
            <strong>{stats.todayExits ?? 0}</strong>
            <p>Total vehicle exits today</p>
          </article>
          <article className="kpi-card">
            <small>Today's Revenue</small>
            <strong className="accent">{formatCurrency(stats.todayRevenue ?? 0)}</strong>
            <p>Total collected today</p>
          </article>
        </section>

        <section className="dashboard-grid top-grid">
          <ParkingStatusCard stats={stats} />
          <OperationsStatusCard stats={stats} navigate={navigate} />
        </section>

        <section className="dashboard-grid middle-grid">
          <OperationsSummary stats={stats} />
          <QuickActions navigate={navigate} />
        </section>

        <RecentEntriesSection
          activities={displayActivities}
          showAll={showAllActivities}
          onToggle={() => setShowAllActivities((prev) => !prev)}
        />
      </div>
    </MainLayout>
  )
}

// Sub-components for better organization
function ParkingStatusCard({ stats }) {
  const occupancyRate = stats.occupancyRate ?? 0

  return (
    <article className="dashboard-card parking-status">
      <div className="card-title">
        <h2>Live Parking Status</h2>
        <span>Total Capacity: {stats.totalSlots ?? 0}</span>
      </div>
      <div className="card-body">
        <div className="utilization-label">
          <strong>Utilization Breakdown</strong>
          <span>{occupancyRate}% Occupied</span>
        </div>
        <div className="utilization-bar">
          <i className="available" style={{ width: `${100 - occupancyRate}%` }} />
          <i className="occupied" style={{ width: `${occupancyRate}%` }} />
        </div>
        <div className="legend">
          <span><i className="available" />Available ({stats.availableSlots ?? 0})</span>
          <span><i className="occupied" />Occupied ({stats.occupiedSlots ?? 0})</span>
        </div>
        <div className="slot-summary">
          <div className="slot-item">
            <span className="slot-label">Total Slots</span>
            <span className="slot-value">{stats.totalSlots ?? 0}</span>
          </div>
          <div className="slot-item">
            <span className="slot-label">Occupied</span>
            <span className="slot-value occupied">{stats.occupiedSlots ?? 0}</span>
          </div>
          <div className="slot-item">
            <span className="slot-label">Available</span>
            <span className="slot-value available">{stats.availableSlots ?? 0}</span>
          </div>
        </div>
      </div>
    </article>
  )
}

function OperationsStatusCard({ stats, navigate }) {
  return (
    <article className="dashboard-card operations-status">
      <div className="card-title">
        <h2>Operational Status</h2>
      </div>
      <div className="card-body">
        <div className="system-list">
          <div><span>Entry Gate</span><strong className="status-ok">Online</strong></div>
          <div><span>Exit Gate</span><strong className="status-ok">Online</strong></div>
          <div><span>Payment System</span><strong className="status-ok">Online</strong></div>
          <div><span>AI Recognition</span><strong className="status-ok">Active</strong></div>
          <div className="sync"><small>Slot Sync</small><span>Live</span></div>
        </div>
        <h3>Quick Stats</h3>
        <div className="alerts">
          <button className="info" onClick={() => navigate(ROUTE_PATHS.payment)}>
            <span className="material-symbols-outlined">payments</span>
            {stats.pendingPayments ?? 0} Pending Payments
          </button>
          <button className="warning" onClick={() => navigate(ROUTE_PATHS.reservation)}>
            <span className="material-symbols-outlined">event_available</span>
            {stats.pendingReservations ?? 0} Pending Reservations
          </button>
        </div>
      </div>
    </article>
  )
}

function OperationsSummary({ stats }) {
  return (
    <article className="dashboard-card">
      <div className="card-title">
        <h2>Operations Summary</h2>
      </div>
      <div className="operations-grid">
        <div><small>Active Sessions</small><strong>{stats.activeSessions ?? 0}</strong></div>
        <div><small>Monthly Passes</small><strong>{stats.monthlyPassesActive ?? 0}</strong></div>
        <div><small>Pending Payments</small><strong className="amber">{stats.pendingPayments ?? 0}</strong></div>
        <div><small>Reservations</small><strong>{stats.pendingReservations ?? 0}</strong></div>
      </div>
    </article>
  )
}

function QuickActions({ navigate }) {
  const actions = [
    { path: ROUTE_PATHS.vehicleEntry, icon: 'login', label: 'Vehicle Entry' },
    { path: ROUTE_PATHS.vehicleExit, icon: 'logout', label: 'Vehicle Exit' },
    { path: ROUTE_PATHS.parkingMap, icon: 'map', label: 'Parking Map' },
    { path: ROUTE_PATHS.aiRecommendation, icon: 'psychology', label: 'AI Recommendation' }
  ]

  return (
    <article className="dashboard-card">
      <div className="card-title">
        <h2>Quick Actions</h2>
      </div>
      <div className="quick-actions">
        <div>
          {actions.map((action) => (
            <button key={action.path} onClick={() => navigate(action.path)}>
              <span className="material-symbols-outlined">{action.icon}</span>
              {action.label}
            </button>
          ))}
        </div>
      </div>
    </article>
  )
}

function RecentEntriesSection({ activities, showAll, onToggle }) {
  return (
    <section className="dashboard-card activity-card">
      <div className="card-title">
        <h2>Recent Entries</h2>
        <button onClick={onToggle}>{showAll ? 'Show Less' : 'View All'}</button>
      </div>
      {activities.length > 0 ? (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Time</th>
                <th>Event</th>
                <th>Ticket</th>
                <th>License Plate</th>
                <th>Slot</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {activities.map((item) => (
                <tr key={item.id}>
                  <td className="mono">{item.time}</td>
                  <td><strong>{item.event}</strong></td>
                  <td className="mono">{item.vehicle}</td>
                  <td className="mono">{item.plate}</td>
                  <td>{item.slot}</td>
                  <td><span className="status completed">{item.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="empty-state">
          <span className="material-symbols-outlined">info</span>
          <p>No recent entries today</p>
        </div>
      )}
    </section>
  )
}

export default DashboardPage
