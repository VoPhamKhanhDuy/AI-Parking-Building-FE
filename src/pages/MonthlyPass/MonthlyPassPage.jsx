import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import MainLayout from '../../layouts/MainLayout'
import { ROUTE_PATHS } from '../../routes/routePaths'
import {
  filterMonthlyPasses,
  getMonthlyPassActivity,
  getMonthlyPassDetail,
  getMonthlyPassOverview,
  getMonthlyPasses,
} from './monthlyPassService'
import './MonthlyPassPage.css'

const statusOptions = ['All Statuses', 'Active', 'Expiring Soon', 'Pending', 'Expired']
const typeOptions = ['All Types', 'Monthly Car Pass', 'Monthly Motorcycle Pass', 'Monthly EV Pass']
const paymentOptions = ['All Payments', 'Paid', 'Unpaid']

const getStatusDetail = (status) => {
  switch (status) {
    case 'Active': return 'Active / Paid'
    case 'Expiring Soon': return 'Expiring Soon / Paid'
    case 'Pending': return 'Pending / Unpaid'
    case 'Expired': return 'Expired / Expired'
    default: return status
  }
}

function MonthlyPassPage() {
  const navigate = useNavigate()
  const overview = useMemo(() => getMonthlyPassOverview(), [])
  const passes = useMemo(() => getMonthlyPasses(), [])
  const activities = useMemo(() => getMonthlyPassActivity(), [])
  const detail = useMemo(() => getMonthlyPassDetail(), [])

  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('All Statuses')
  const [type, setType] = useState('All Types')
  const [payment, setPayment] = useState('All Payments')
  const [selectedPass, setSelectedPass] = useState(passes[0]?.id)

  const filteredPasses = useMemo(
    () => filterMonthlyPasses(passes, { query, status, type, payment }),
    [passes, query, status, type, payment],
  )

  const selected = filteredPasses.find((item) => item.id === selectedPass) || filteredPasses[0] || passes[0]
  const selectedDetail = {
    ...detail,
    passCode: selected.passCode,
    plate: selected.plate,
    driver: selected.driver,
    type: selected.type,
    validity: detail.validity || `2026-07-01 to ${selected.validUntil}`,
    status: getStatusDetail(selected.status),
    location: selected.location,
  }

  return (
    <MainLayout>
      <div className="monthly-pass-page">
        <header className="monthly-pass-heading">
          <div className="breadcrumb"><button onClick={() => navigate(ROUTE_PATHS.dashboard)}>Dashboard</button><span className="material-symbols-outlined">chevron_right</span><strong>Monthly Pass</strong></div>
          <h1>Monthly Pass Management</h1>
          <p>Manage monthly parking passes, renewal status, vehicle eligibility, and pass activation.</p>
        </header>

        <section className="pass-summary-grid">
          {overview.map((item) => (
            <article key={item.label} className="summary-card">
              <small>{item.label}</small>
              <strong>{item.value}{item.unit && <em>{item.unit}</em>}</strong>
            </article>
          ))}
        </section>

        <div className="pass-layout">
          <section className="pass-list-card">
            <div className="pass-list-filter">
              <label className="search-box">
                <span className="material-symbols-outlined">search</span>
                <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search passes, plates, drivers..." />
              </label>
              <select value={status} onChange={(event) => setStatus(event.target.value)}>
                {statusOptions.map((option) => <option key={option}>{option}</option>)}
              </select>
              <select value={type} onChange={(event) => setType(event.target.value)}>
                {typeOptions.map((option) => <option key={option}>{option}</option>)}
              </select>
              <select value={payment} onChange={(event) => setPayment(event.target.value)}>
                {paymentOptions.map((option) => <option key={option}>{option}</option>)}
              </select>
            </div>

            <div className="card-title">
              <h2>Monthly Pass List</h2>
              <span>Showing {filteredPasses.length} of {passes.length} entries</span>
            </div>

            <div className="table-wrap">
              <table className="pass-table">
                <thead>
                  <tr>
                    <th>Pass Code</th>
                    <th>License Plate</th>
                    <th>Driver</th>
                    <th>Valid Until</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPasses.map((pass) => (
                    <tr key={pass.id} className={selected?.id === pass.id ? 'selected' : ''} onClick={() => setSelectedPass(pass.id)}>
                      <td>{pass.passCode}</td>
                      <td>{pass.plate}</td>
                      <td>{pass.driver}</td>
                      <td>{pass.validUntil}</td>
                      <td><span className={`status-pill ${pass.status.toLowerCase().replace(/ /g, '-')}`}>{pass.status}</span></td>
                    </tr>
                  ))}
                  {!filteredPasses.length && (
                    <tr>
                      <td colSpan="5" className="empty-state">No passes match the current filters.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="pass-pagination">
              <span>Showing 1 to {filteredPasses.length} of {passes.length} entries</span>
              <div className="pagination-actions">
                <button disabled className="pagination-button">Previous</button>
                <button className="pagination-button">Next</button>
              </div>
            </div>
          </section>

          <aside className="pass-detail-card">
            <div className="detail-card-header">
              <div>
                <span className="detail-tag">Monthly Pass Detail</span>
                <p className="detail-status">{selectedDetail.status}</p>
              </div>
              <strong>{selectedDetail.passCode}</strong>
            </div>

            <div className="detail-summary">
              <div>
                <strong>{selectedDetail.plate}</strong>
                <span>{selectedDetail.driver}</span>
              </div>
              <div>
                <small>{selectedDetail.type}</small>
                <strong>{selectedDetail.location}</strong>
              </div>
            </div>

            <dl className="detail-list">
              <div className="detail-row"><dt>Pass Code</dt><dd>{selectedDetail.passCode}</dd></div>
              <div className="detail-row"><dt>Driver</dt><dd>{selectedDetail.driver}</dd></div>
              <div className="detail-row"><dt>Type</dt><dd>{selectedDetail.type}</dd></div>
              <div className="detail-row"><dt>Validity</dt><dd>{selectedDetail.validity}</dd></div>
              <div className="detail-row"><dt>Status</dt><dd>{selectedDetail.status}</dd></div>
              <div className="detail-row"><dt>Location</dt><dd>{selectedDetail.location}</dd></div>
              <div className="detail-row"><dt>Assigned Gate</dt><dd>{selectedDetail.assignedGate}</dd></div>
              <div className="detail-row"><dt>Vehicle Model</dt><dd>{selectedDetail.vehicleModel}</dd></div>
              <div className="detail-row"><dt>Renewal Date</dt><dd>{selectedDetail.renewalDate}</dd></div>
            </dl>

            <div className="detail-actions">
              <button className="primary">Renew Pass</button>
              <button>Update Vehicle</button>
              <button className="danger">Suspend Pass</button>
              <button className="link-button">View Entry History <span className="material-symbols-outlined">arrow_forward</span></button>
            </div>
          </aside>
        </div>

        <section className="activity-card">
          <div className="activity-header">
            <h2>Recent Monthly Pass Activity</h2>
            <button className="secondary-button" onClick={() => navigate(ROUTE_PATHS.systemLogs)}>View Full Log</button>
          </div>
          <div className="table-wrap">
            <table className="activity-table">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Pass Code</th>
                  <th>License Plate</th>
                  <th>Action</th>
                  <th>Staff</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {activities.map((activity) => (
                  <tr key={`${activity.time}-${activity.passCode}`}>
                    <td className="mono">{activity.time}</td>
                    <td>{activity.passCode}</td>
                    <td className="mono">{activity.plate}</td>
                    <td>{activity.action}</td>
                    <td>{activity.staff}</td>
                    <td><span className={`activity-status ${activity.status.toLowerCase().replace(/ /g, '-')}`}>{activity.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </MainLayout>
  )
}

export default MonthlyPassPage
