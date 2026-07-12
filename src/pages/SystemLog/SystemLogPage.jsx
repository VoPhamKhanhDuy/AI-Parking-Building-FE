import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import MainLayout from '../../layouts/MainLayout'
import { ROUTE_PATHS } from '../../routes/routePaths'
import { filterSystemLogs, getLogModules, getSystemLogData } from './systemLogService'
import './SystemLogPage.css'

const defaultFilters = { search: '', module: 'All Modules', status: 'All Statuses', period: 'Current Shift' }
const PAGE_SIZE = 5

function SystemLogPage() {
  const data = getSystemLogData()
  const navigate = useNavigate()
  const [filters, setFilters] = useState(defaultFilters)
  const [selectedId, setSelectedId] = useState(data.logs[0].id)
  const [currentPage, setCurrentPage] = useState(1)
  const filteredLogs = useMemo(() => filterSystemLogs(data.logs, filters), [data.logs, filters])
  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / PAGE_SIZE))
  const paginatedLogs = filteredLogs.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)
  const selectedLog = paginatedLogs.find((log) => log.id === selectedId) || paginatedLogs[0]
  const modules = getLogModules(data.logs)

  const updateFilter = (event) => {
    setFilters((current) => ({ ...current, [event.target.name]: event.target.value }))
    setCurrentPage(1)
  }

  return (
    <MainLayout>
      <div className="system-log-page">
        <header className="log-page-heading"><div className="log-breadcrumb"><button onClick={() => navigate(ROUTE_PATHS.dashboard)}>Dashboard</button><span className="material-symbols-outlined">chevron_right</span><strong>System Logs</strong></div><h1>System Logs</h1><p>View staff actions, parking operation logs, payment events, slot updates, and system warnings during the current shift.</p></header>

        <section className="log-summary-grid">{data.summary.map((item) => <article key={item.label} className={item.warning ? 'warning-card' : ''}><div><small>{item.label}</small><strong>{item.value}</strong></div><span className="material-symbols-outlined">{item.icon}</span></article>)}</section>

        <section className="log-main-grid">
          <article className="log-list-card">
            <header><div className="log-card-title"><h2>Activity Log</h2><span>{filteredLogs.length} records · {filters.period.toLowerCase()}</span></div><div className="log-filters"><label><span className="material-symbols-outlined">search</span><input name="search" value={filters.search} onChange={updateFilter} placeholder="Search plate, ticket, receipt, or staff..." /></label><select name="module" value={filters.module} onChange={updateFilter}><option>All Modules</option>{modules.map((module) => <option key={module}>{module}</option>)}</select><select name="status" value={filters.status} onChange={updateFilter}><option>All Statuses</option><option>Completed</option><option>Warning</option></select><select name="period" value={filters.period} onChange={updateFilter}><option>Current Shift</option><option>Today</option><option>Last 7 Days</option></select></div></header>
            <div className="log-table-wrap"><table className="log-table"><thead><tr><th>Time</th><th>Module</th><th>Activity</th><th>Reference</th><th>Staff</th><th>Status</th></tr></thead><tbody>{paginatedLogs.map((log) => <tr key={log.id} className={selectedLog?.id === log.id ? 'selected' : ''} tabIndex="0" onClick={() => setSelectedId(log.id)} onKeyDown={(event) => event.key === 'Enter' && setSelectedId(log.id)}><td>{log.time}</td><td>{log.module}</td><td title={log.activity}><strong>{log.activity}</strong></td><td className="log-reference">{log.reference}</td><td>{log.staff}</td><td><span className={`log-status ${log.status.toLowerCase()}`}>{log.status}</span></td></tr>)}{!filteredLogs.length && <tr><td className="empty-logs" colSpan="6">No activity logs match the selected filters.</td></tr>}</tbody></table></div>
            {filteredLogs.length > 0 && <footer className="log-pagination"><span>Showing {(currentPage - 1) * PAGE_SIZE + 1}–{Math.min(currentPage * PAGE_SIZE, filteredLogs.length)} of {filteredLogs.length}</span><div><button aria-label="Previous page" disabled={currentPage === 1} onClick={() => setCurrentPage((page) => page - 1)}><span className="material-symbols-outlined">chevron_left</span></button><strong>{currentPage} / {totalPages}</strong><button aria-label="Next page" disabled={currentPage === totalPages} onClick={() => setCurrentPage((page) => page + 1)}><span className="material-symbols-outlined">chevron_right</span></button></div></footer>}
          </article>

          <aside className="log-detail-card"><h2>Selected Log Detail</h2>{selectedLog ? <><div className="log-detail-heading"><h3>{selectedLog.activity}</h3><p><span className="material-symbols-outlined">schedule</span>{selectedLog.time} · {selectedLog.module} Module</p></div><dl><dt>Receipt ID</dt><dd>{selectedLog.receiptId}</dd><dt>Ticket Code</dt><dd>{selectedLog.ticketCode}</dd><dt>License Plate</dt><dd>{selectedLog.licensePlate}</dd><dt>Staff</dt><dd>{selectedLog.staff}</dd><dt>Gate</dt><dd>{selectedLog.gate}</dd><dt>Status</dt><dd><span className={`log-status ${selectedLog.status.toLowerCase()}`}>{selectedLog.status}</span></dd></dl><div className="log-description"><span>Description</span><p>{selectedLog.description}</p></div><div className="log-detail-actions">{selectedLog.ticketCode !== '—' && <button className="primary" onClick={() => navigate(ROUTE_PATHS.tickets)}><span className="material-symbols-outlined">confirmation_number</span>View Related Ticket</button>}<div>{selectedLog.receiptId !== '—' && <button onClick={() => navigate('/payment')}>View Payment Detail</button>}<button onClick={() => navigate('/sessions')}>View Session</button></div></div></> : <p className="empty-detail">Select a log entry to view details.</p>}</aside>
        </section>

        <section className="log-bottom-grid">
          <article className="log-panel"><header><h2>Current Shift Summary</h2></header><div className="shift-summary">{data.shiftSummary.map(([label, value]) => <span key={label}><small>{label}</small><strong>{value}</strong></span>)}</div></article>
          <article className="log-panel warnings-panel"><header><h2>System Warnings</h2><span>3 events</span></header><div className="log-table-wrap"><table><thead><tr><th>Time</th><th>Warning</th><th>Area</th><th>Status</th></tr></thead><tbody>{data.warnings.map(([time, warning, area, status]) => <tr key={`${time}-${warning}`}><td>{time}</td><td><strong>{warning}</strong></td><td>{area}</td><td><span className={`warning-status ${status.toLowerCase()}`}>{status}</span></td></tr>)}</tbody></table></div></article>
        </section>
      </div>
    </MainLayout>
  )
}

export default SystemLogPage
