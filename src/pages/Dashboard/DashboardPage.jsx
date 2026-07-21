import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import MainLayout from '../../layouts/MainLayout'
import { ROUTE_PATHS } from '../../routes/routePaths'
import { getDashboardData } from './dashboardService'
import './DashboardPage.css'

function DashboardPage() {
  const data = getDashboardData()
  const navigate = useNavigate()
  const [showAllActivities, setShowAllActivities] = useState(false)
  const activities = showAllActivities ? data.activities : data.activities.slice(0, 3)

  return (
    <MainLayout>
      <div className="dashboard-page">
        <header className="page-heading"><button onClick={() => navigate(ROUTE_PATHS.dashboard)}>Dashboard</button><h1>Dashboard</h1><p>Live overview of parking capacity, active sessions, revenue, and system alerts.</p></header>

        <section className="kpi-grid">
          {data.kpis.map((kpi) => <article className="kpi-card" key={kpi.label}><small>{kpi.label}</small><strong className={kpi.accent ? 'accent' : ''}>{kpi.value} {kpi.unit && <em>{kpi.unit}</em>}</strong><p>{kpi.detail}</p></article>)}
        </section>

        <section className="dashboard-grid top-grid">
          <article className="dashboard-card parking-status">
            <div className="card-title"><h2>Live Parking Status</h2><span>Total Capacity: 524</span></div>
            <div className="card-body">
              <div className="utilization-label"><strong>Utilization Breakdown</strong><span>73% Occupied</span></div>
              <div className="utilization-bar"><i className="available" /><i className="occupied" /><i className="reserved" /><i className="maintenance" /></div>
              <div className="legend"><span><i className="available" />Available (123)</span><span><i className="occupied" />Occupied (343)</span><span><i className="reserved" />Reserved (45)</span><span><i className="maintenance" />Maintenance (13)</span></div>
              <div className="table-wrap"><table><thead><tr><th>Area</th><th>Capacity</th><th>Occupied</th><th>Available</th><th>Reserved</th><th>Status</th></tr></thead><tbody>{data.floors.map((floor) => <tr key={floor.area}><td><strong>{floor.area}</strong></td><td>{floor.capacity}</td><td>{floor.occupied}</td><td>{floor.available}</td><td>{floor.reserved}</td><td><span className={floor.status === 'Normal' ? 'status normal' : 'status warning'}>{floor.status}</span></td></tr>)}</tbody></table></div>
            </div>
          </article>

          <article className="dashboard-card operations-status">
            <div className="card-title"><h2>Operational Status</h2></div>
            <div className="card-body">
              <div className="system-list">{data.systemStatuses.map(([name, status]) => <div key={name}><span>{name}</span><strong>{status}</strong></div>)}<div className="sync"><small>Slot Sync</small><span>5 seconds ago</span></div></div>
              <h3>Active Alerts</h3>
              <div className="alerts">{data.alerts.map((alert) => <button key={alert.text} className={alert.type} onClick={() => alert.type === 'info' ? navigate('/payment') : navigate(ROUTE_PATHS.parkingStructure)}><span className="material-symbols-outlined">{alert.type}</span>{alert.text}</button>)}</div>
            </div>
          </article>
        </section>

        <section className="dashboard-grid middle-grid">
          <article className="dashboard-card"><div className="card-title"><h2>Operations Summary</h2></div><div className="operations-grid">{data.operations.map(([label, value]) => <div key={label}><small>{label}</small><strong className={label === 'Pending Payments' ? 'amber' : ''}>{value}</strong></div>)}</div></article>
          <article className="dashboard-card"><div className="card-title"><h2>AI Recommendation Performance</h2></div><div className="ai-content"><div className="score-ring"><svg viewBox="0 0 36 36"><circle cx="18" cy="18" r="16" /><circle className="progress" cx="18" cy="18" r="16" /></svg><strong>91%</strong></div><div><small>Average Match Score</small><p>High accuracy maintained across automated slot assignments and plate recognition during current shift.</p></div></div><div className="ai-stats"><span><strong>186</strong><small>Total AI Recs</small></span><span className="confirmed"><strong>172</strong><small>Staff Confirmed</small></span><span><strong>14</strong><small>Manual Override</small></span></div></article>
        </section>

        <section className="dashboard-card activity-card">
          <div className="card-title"><h2>Recent System Activity</h2><button onClick={() => setShowAllActivities((current) => !current)}>{showAllActivities ? 'Show Less' : 'View All Logs'}</button></div>
          <div className="table-wrap"><table><thead><tr><th>Time</th><th>Event</th><th>Vehicle / Ticket</th><th>Staff</th><th>Status</th></tr></thead><tbody>{activities.map(([time, event, vehicle, staff, status]) => <tr key={`${time}-${event}`}><td className="mono">{time}</td><td><strong>{event}</strong></td><td className="mono">{vehicle}</td><td>{staff}</td><td><span className="status completed">{status}</span></td></tr>)}</tbody></table></div>
        </section>
      </div>
    </MainLayout>
  )
}

export default DashboardPage
