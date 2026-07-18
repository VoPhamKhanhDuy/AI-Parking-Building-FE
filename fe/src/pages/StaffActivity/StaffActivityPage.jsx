import { useEffect, useMemo, useState } from 'react'
import ManagerLayout from '../../layouts/ManagerLayout'
import { getStaffActivity, submitStaffActivityAction } from './staffActivityService'
import './StaffActivityPage.css'

function Status({ children }) {
  return <span className={`staff-status ${children.toLowerCase().replaceAll(' ', '-')}`}>{children}</span>
}

const defaultFilters = { query: '', role: 'All Roles', area: 'All Areas', status: 'All Statuses', date: 'Today' }

function matchesFilters(item, filters) {
  const matchesQuery = `${item.name} ${item.id} ${item.role} ${item.area}`.toLowerCase().includes(filters.query.toLowerCase())
  const matchesRole = filters.role === 'All Roles' || item.role === filters.role
  const matchesArea = filters.area === 'All Areas' || item.area === filters.area
  const matchesStatus = filters.status === 'All Statuses' || item.status === filters.status
  return matchesQuery && matchesRole && matchesArea && matchesStatus
}

function StaffActivityPage() {
  const [data, setData] = useState(null)
  const [selectedId, setSelectedId] = useState('STF-2026-001')
  const [filters, setFilters] = useState(defaultFilters)
  const [notice, setNotice] = useState('')

  useEffect(() => { 
    getStaffActivity().then((result) => {
      if (result) setData(result)
    })
  }, [])
  const staff = useMemo(() => (data?.staff || []).filter((item) => matchesFilters(item, filters)), [data, filters])
  const selected = (data?.staff || []).find((item) => item.id === selectedId) || (data?.staff || [])[0]

  const updateFilter = (event) => {
    const nextFilters = { ...filters, [event.target.name]: event.target.value }
    setFilters(nextFilters)
    const visibleStaff = (data?.staff || []).filter((item) => matchesFilters(item, nextFilters))
    if (!visibleStaff.some((item) => item.id === selectedId) && visibleStaff.length) setSelectedId(visibleStaff[0].id)
  }
  const runAction = async (action, message) => {
    await submitStaffActivityAction(action, { staffId: selected.id })
    setNotice(message)
    window.setTimeout(() => setNotice(''), 2500)
  }

  if (!data) return <ManagerLayout><div className="staff-loading">Loading staff activity...</div></ManagerLayout>

  return <ManagerLayout>
    <div className="staff-activity-page">
      <header className="staff-heading"><div><p>Dashboard <span>/</span> Staff Activity</p><h1>Staff Activity Monitoring</h1><h2>Monitor staff on duty, gate activity, handled sessions, payment workload, and operational issues.</h2></div><span><i />Current shift</span></header>

      <section className="staff-kpis">{data.summaries.map((item) => <article key={item.label}><small>{item.label}</small><strong className={item.tone ?? ''}>{item.value}</strong><span>{item.note}</span></article>)}</section>

      <section className="shift-overview staff-card"><header><div><h3>Current Shift Overview</h3><p>Live staffing coverage for Building A</p></div><Status>{data.shift.status}</Status></header><div className="shift-fields"><div><small>Shift</small><strong>{data.shift.name}</strong></div><div><small>Facility</small><strong>{data.shift.facility}</strong></div><div><small>Shift Time</small><strong>{data.shift.time}</strong></div><div><small>Supervisor</small><strong>{data.shift.supervisor}</strong></div><div><small>Staff Coverage</small><strong>{data.shift.coverage}</strong></div></div><p>{data.shift.note}</p></section>

      <div className="staff-workspace">
        <div className="staff-main-column">
          <section className="staff-card staff-overview"><header><div><h3>Staff Activity Overview</h3><p>{staff.length} staff records shown</p></div></header><div className="staff-filters"><label className="staff-search"><span className="material-symbols-outlined">search</span><input name="query" value={filters.query} onChange={updateFilter} placeholder="Search staff..." /></label><select name="role" value={filters.role} onChange={updateFilter}><option>All Roles</option><option>Entry Gate Operator</option><option>Exit Gate Operator</option><option>Parking Support</option><option>Supervisor</option><option>Entry Support</option><option>Facility Support</option></select><select name="area" value={filters.area} onChange={updateFilter}><option>All Areas</option><option>Entry Gate A</option><option>Entry Gate B</option><option>Exit Gate A</option><option>Exit Gate B</option><option>Zone B</option><option>Zone C</option><option>Zone D</option><option>Building A</option></select><select name="status" value={filters.status} onChange={updateFilter}><option>All Statuses</option><option>Active</option><option>On Break</option><option>Offline</option></select><select name="date" value={filters.date} onChange={updateFilter}><option>Today</option></select></div><div className="staff-table-wrap"><table><thead><tr><th>Staff</th><th>Role</th><th>Assigned Area</th><th>Entries</th><th>Exits</th><th>Payments</th><th>Pending Cases</th><th>Status</th><th>Action</th></tr></thead><tbody>{staff.map((item) => <tr className={selected.id === item.id ? 'selected' : ''} key={item.id} onClick={() => setSelectedId(item.id)}><td><strong>{item.name}</strong><small>{item.id}</small></td><td>{item.role}</td><td>{item.area}</td><td>{item.entries}</td><td>{item.exits}</td><td>{item.payments}</td><td className={item.pending ? 'pending-count' : ''}>{item.pending}</td><td><Status>{item.status}</Status></td><td><button onClick={(event) => { event.stopPropagation(); setSelectedId(item.id) }}>View Detail</button></td></tr>)}</tbody></table></div></section>

          <section className="staff-card workload"><header><div><h3>Workload Distribution</h3><p>Completed parking sessions during the current shift</p></div></header><div className="workload-bars">{data.workload.map((item) => <article key={item.area}><span>{item.area}</span><div><i style={{ width: `${item.value / 42 * 100}%` }} /></div><strong>{item.label}</strong></article>)}</div><footer>Workload is calculated from completed parking sessions during the current shift.</footer></section>
        </div>

        <aside className="staff-side-column">
          <section className="staff-card selected-staff"><header><div><small>Selected staff</small><h3>{selected.name}</h3></div><Status>{selected.status}</Status></header><dl><div><dt>Staff ID</dt><dd>{selected.id}</dd></div><div><dt>Role</dt><dd>{selected.role}</dd></div><div><dt>Assigned Area</dt><dd>{selected.area}</dd></div><div><dt>Current Status</dt><dd><Status>{selected.status}</Status></dd></div><div><dt>Shift Time</dt><dd>{selected.shiftTime}</dd></div><div><dt>Last Activity</dt><dd>{selected.lastActivity}</dd></div><div><dt>Handled Exits</dt><dd>{selected.exits}</dd></div><div><dt>Payments Processed</dt><dd>{selected.payments}</dd></div><div><dt>Pending Cases</dt><dd className={selected.pending ? 'pending-value' : ''}>{selected.pending}</dd></div></dl><div className="staff-detail-actions"><button className="primary" onClick={() => runAction('view-log', `${selected.name} activity log opened in mock mode.`)}>View Activity Log</button><button onClick={() => runAction('review-cases', `${selected.pending} pending cases selected for review.`)}>Review Pending Cases</button><button onClick={() => runAction('send-message', `Message composer opened for ${selected.name}.`)}>Send Message</button></div></section>

          <section className="staff-card pending-reviews"><header><div><h3>Pending Staff Reviews</h3><p>Manager attention required</p></div></header><div>{data.pendingReviews.map((item) => <article key={item.reference}><div><strong>{item.reference}</strong><p>{item.text}</p></div><Status>{item.priority}</Status></article>)}</div></section>
        </aside>
      </div>

      <section className="staff-card recent-staff-activity"><header><div><h3>Recent Staff Activities</h3><p>Latest actions during the current shift</p></div></header><div className="staff-table-wrap"><table><thead><tr><th>Time</th><th>Staff</th><th>Activity</th><th>Reference</th><th>Area</th><th>Status</th></tr></thead><tbody>{data.activities.map((item) => <tr key={`${item.time}-${item.reference}`}><td>{item.time}</td><td><strong>{item.staff}</strong></td><td>{item.activity}</td><td>{item.reference}</td><td>{item.area}</td><td><Status>{item.status}</Status></td></tr>)}</tbody></table></div></section>

      <section className="manager-staff-footer"><div><h3>Manager Notes</h3><p>{data.managerNote}</p></div><div><button onClick={() => runAction('export', 'Staff activity exported in mock mode.')}>Export Staff Activity</button><button onClick={() => runAction('review-pending', 'Pending staff cases opened for review.')}>Review Pending Cases</button><button className="primary" onClick={() => runAction('send-summary', 'Shift summary sent to Operations Team.')}>Send Shift Summary</button></div></section>

      {notice && <div className="staff-notice" role="status">{notice}</div>}
    </div>
  </ManagerLayout>
}

export default StaffActivityPage
