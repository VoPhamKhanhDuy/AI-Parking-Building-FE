import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import ManagerLayout from '../../layouts/ManagerLayout'
import { getManagerDashboard } from './managerDashboardService'
import './ManagerDashboardPage.css'

const tableHeadings = {
  zones: ['Zone', 'Vehicle Type', 'Total Slots', 'Occupied', 'Available', 'Occupancy', 'Status'],
  staff: ['Staff', 'Role', 'Area', 'Entries', 'Exits', 'Payments', 'Status'],
  activities: ['Time', 'Activity', 'Reference', 'Performed By', 'Status'],
}

function StatusBadge({ children, tone = 'normal' }) {
  return <span className={`manager-badge ${tone.toLowerCase()}`}>{children}</span>
}

function ManagerDashboardPage() {
  const location = useLocation()
  const [data, setData] = useState(null)

  useEffect(() => { getManagerDashboard().then(setData) }, [])
  useEffect(() => {
    if (data && location.hash) document.querySelector(location.hash)?.scrollIntoView({ behavior: 'smooth' })
  }, [data, location.hash])

  if (!data) return <ManagerLayout><div className="manager-loading">Loading dashboard...</div></ManagerLayout>

  return <ManagerLayout>
    <div className="manager-page">
      <header className="manager-page-heading">
        <div><p>Dashboard <span>/</span> Manager Dashboard</p><h1>Manager Dashboard</h1><h2>Monitor parking occupancy, revenue, staff activity, alerts, and facility operations.</h2></div>
        <span className="manager-live"><i/>Live operations</span>
      </header>

      <section className="manager-kpis" aria-label="Facility overview">
        {data.kpis.map((item, index) => <article key={item.label}><small>{item.label}</small><strong className={index === 2 ? 'positive' : ''}>{item.value}</strong></article>)}
      </section>

      <div className="manager-primary-grid">
        <section className="manager-card occupancy-card">
          <div className="manager-card-title"><div><h3>Parking Occupancy Overview</h3><p>Current capacity by parking zone</p></div><span>Building A</span></div>
          <div className="manager-table-wrap"><table><thead><tr>{tableHeadings.zones.map((heading)=><th key={heading}>{heading}</th>)}</tr></thead><tbody>{data.zones.map((row)=><tr key={row.zone}><td><strong>{row.zone}</strong></td><td>{row.vehicleType}</td><td>{row.total}</td><td>{row.occupied}</td><td>{row.available}</td><td><div className="occupancy-value"><span><i style={{width: row.occupancy}}/></span><b>{row.occupancy}</b></div></td><td><StatusBadge tone={row.status}>{row.status}</StatusBadge></td></tr>)}</tbody></table></div>
          <div className="facility-breakdown">{data.facilityBreakdown.map((item)=><div key={item.label}><small>{item.label}</small><strong>{item.value}</strong><span>{item.note}</span></div>)}</div>
        </section>

        <aside className="manager-side-stack">
          <section className="manager-card revenue-card"><div className="manager-card-title"><div><h3>Revenue Summary</h3><p>Today&apos;s payment breakdown</p></div></div>{data.revenue.map((item,index)=><div className={index===0?'revenue-total':'revenue-row'} key={item.label}><span>{item.label}</span><strong>{item.value}</strong></div>)}</section>
          <section className="manager-card alert-card"><div className="manager-card-title"><div><h3>Operational Alerts</h3><p>Items requiring attention</p></div><b>{data.alerts.length}</b></div><div className="alert-list">{data.alerts.map((alert)=><div key={alert.text}><p>{alert.text}</p><StatusBadge tone={alert.severity}>{alert.severity}</StatusBadge></div>)}</div></section>
        </aside>
      </div>

      <section className="manager-card staff-card" id="staff-activity">
        <div className="manager-card-title"><div><h3>Staff Activity Overview</h3><p>Current shift performance across operating areas</p></div><StatusBadge>8 Active</StatusBadge></div>
        <div className="manager-table-wrap"><table><thead><tr>{tableHeadings.staff.map((heading)=><th key={heading}>{heading}</th>)}</tr></thead><tbody>{data.staff.map((row)=><tr key={row.staff}><td><strong>{row.staff}</strong></td><td>{row.role}</td><td>{row.area}</td><td>{row.entries}</td><td>{row.exits}</td><td>{row.payments}</td><td><StatusBadge>{row.status}</StatusBadge></td></tr>)}</tbody></table></div>
      </section>

      <section className="manager-card activity-card"><div className="manager-card-title"><div><h3>Recent Manager Activity</h3><p>Latest reviews and operational updates</p></div></div><div className="manager-table-wrap"><table><thead><tr>{tableHeadings.activities.map((heading)=><th key={heading}>{heading}</th>)}</tr></thead><tbody>{data.activities.map((row)=><tr key={`${row.time}-${row.reference}`}><td>{row.time}</td><td><strong>{row.activity}</strong></td><td>{row.reference}</td><td>{row.performedBy}</td><td><StatusBadge tone={row.status}>{row.status}</StatusBadge></td></tr>)}</tbody></table></div></section>
    </div>
  </ManagerLayout>
}

export default ManagerDashboardPage
