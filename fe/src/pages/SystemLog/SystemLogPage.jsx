import { useEffect, useMemo, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import MainLayout from '../../layouts/MainLayout'
import { ROUTE_PATHS } from '../../routes/routePaths'
import { getSystemLogs } from './systemLogService'
import './SystemLogPage.css'

const DEFAULT_FILTERS = { search: '', module: 'All Modules', status: 'All Statuses', period: 'Current Shift' }
const MODULE_OPTIONS = ['All Modules', 'Auth', 'Parking', 'Payment', 'Ticket', 'System', 'Vehicle', 'Reservation']
const STATUS_OPTIONS = ['All Statuses', 'Info', 'Completed', 'Warning', 'Error']
const PERIOD_OPTIONS = ['Current Shift', 'Today', 'Last 7 Days']
const PAGE_SIZE = 10

function SystemLogPage() {
  const navigate = useNavigate()
  const [logs, setLogs] = useState([])
  const [filters, setFilters] = useState(DEFAULT_FILTERS)
  const [selectedId, setSelectedId] = useState(null)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [modules, setModules] = useState(MODULE_OPTIONS)

  useEffect(() => {
    let active = true
    getSystemLogs().then((result) => {
      if (!active) return
      const list = Array.isArray(result?.data) ? result.data : []
      setLogs(list)
      const derived = Array.from(new Set(list.map((l) => l.module).filter(Boolean)))
      setModules([...MODULE_OPTIONS, ...derived.filter((m) => !MODULE_OPTIONS.includes(m))])
      setSelectedId((current) => current || list[0]?.id || null)
      setLoading(false)
    }).catch(() => active && setLoading(false))
    return () => { active = false }
  }, [])

  const filteredLogs = useMemo(() => {
    const search = filters.search.trim().toLowerCase()
    const status = filters.status === 'All Statuses' ? null : filters.status.toLowerCase()
    return logs.filter((log) => {
      if (filters.module !== 'All Modules' && log.module !== filters.module) return false
      if (status && String(log.status).toLowerCase() !== status) return false
      if (search) {
        const blob = `${log.activity} ${log.reference} ${log.ticketCode} ${log.licensePlate} ${log.staff}`.toLowerCase()
        if (!blob.includes(search)) return false
      }
      return true
    })
  }, [logs, filters])

  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / PAGE_SIZE))
  const paginated = filteredLogs.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const selectedLog = useMemo(
    () => paginated.find((log) => log.id === selectedId) || filteredLogs.find((log) => log.id === selectedId) || paginated[0] || null,
    [paginated, filteredLogs, selectedId]
  )

  const updateFilter = useCallback((event) => {
    setFilters((current) => ({ ...current, [event.target.name]: event.target.value }))
    setPage(1)
  }, [])

  const summary = useMemo(() => {
    const completed = logs.filter((l) => /complete|success|paid/i.test(String(l.status))).length
    const warnings = logs.filter((l) => /warning|error/i.test(String(l.status))).length
    return [
      { label: 'Total events', value: logs.length, icon: 'list_alt' },
      { label: 'Completed', value: completed, icon: 'check_circle' },
      { label: 'Warnings', value: warnings, icon: 'warning', warning: warnings > 0 }
    ]
  }, [logs])

  const safeShiftSummary = useMemo(() => [
    ['Total events', logs.length],
    ['Completed', logs.filter((l) => /complete|success|paid/i.test(String(l.status))).length],
    ['Warnings', logs.filter((l) => /warning|error/i.test(String(l.status))).length]
  ], [logs])

  const warnings = useMemo(
    () => logs.filter((l) => /warning|error/i.test(String(l.status))).slice(0, 8),
    [logs]
  )

  return (
    <MainLayout>
      <div className="system-log-page">
        <header className="log-page-heading">
          <div className="log-breadcrumb">
            <button onClick={() => navigate(ROUTE_PATHS.dashboard)}>Dashboard</button>
            <span className="material-symbols-outlined">chevron_right</span>
            <strong>System Logs</strong>
          </div>
          <h1>System Logs</h1>
          <p>View staff actions, parking operation logs, payment events, slot updates, and system warnings during the current shift.</p>
        </header>

        <section className="log-summary-grid">
          {summary.map((item) => (
            <article key={item.label} className={item.warning ? 'warning-card' : ''}>
              <div><small>{item.label}</small><strong>{item.value ?? 0}</strong></div>
              <span className="material-symbols-outlined">{item.icon}</span>
            </article>
          ))}
        </section>

        <section className="log-main-grid">
          <article className="log-list-card">
            <header>
              <div className="log-card-title"><h2>Activity Log</h2><span>{filteredLogs.length} records · {filters.period.toLowerCase()}</span></div>
              <div className="log-filters">
                <label><span className="material-symbols-outlined">search</span><input name="search" value={filters.search} onChange={updateFilter} placeholder="Search plate, ticket, receipt, or staff..." /></label>
                <select name="module" value={filters.module} onChange={updateFilter}>
                  {modules.map((module) => <option key={module} value={module}>{module}</option>)}
                </select>
                <select name="status" value={filters.status} onChange={updateFilter}>
                  {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
                <select name="period" value={filters.period} onChange={updateFilter}>
                  {PERIOD_OPTIONS.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
            </header>
            <div className="log-table-wrap">
              {loading ? (
                <div className="log-loading">Loading logs…</div>
              ) : (
                <table className="log-table">
                  <thead>
                    <tr><th>Time</th><th>Module</th><th>Activity</th><th>Reference</th><th>Staff</th><th>Status</th></tr>
                  </thead>
                  <tbody>
                    {paginated.map((log) => (
                      <tr key={log.id} className={selectedLog?.id === log.id ? 'selected' : ''} tabIndex="0" onClick={() => setSelectedId(log.id)} onKeyDown={(event) => event.key === 'Enter' && setSelectedId(log.id)}>
                        <td>{log.time}</td>
                        <td>{log.module}</td>
                        <td title={log.activity}><strong>{log.activity}</strong></td>
                        <td className="log-reference">{log.reference}</td>
                        <td>{log.staff}</td>
                        <td><span className={`log-status ${String(log.status).toLowerCase()}`}>{log.status}</span></td>
                      </tr>
                    ))}
                    {!filteredLogs.length && <tr><td className="empty-logs" colSpan="6">No activity logs match the selected filters.</td></tr>}
                  </tbody>
                </table>
              )}
            </div>
            {filteredLogs.length > 0 && (
              <footer className="log-pagination">
                <span>Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filteredLogs.length)} of {filteredLogs.length}</span>
                <div>
                  <button aria-label="Previous page" disabled={page === 1} onClick={() => setPage((p) => p - 1)}><span className="material-symbols-outlined">chevron_left</span></button>
                  <strong>{page} / {totalPages}</strong>
                  <button aria-label="Next page" disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}><span className="material-symbols-outlined">chevron_right</span></button>
                </div>
              </footer>
            )}
          </article>

          <aside className="log-detail-card">
            <h2>Selected Log Detail</h2>
            {selectedLog ? (
              <>
                <div className="log-detail-heading">
                  <h3>{selectedLog.activity}</h3>
                  <p><span className="material-symbols-outlined">schedule</span>{selectedLog.time} · {selectedLog.module} Module</p>
                </div>
                <dl>
                  <dt>Receipt ID</dt><dd>{selectedLog.receiptId}</dd>
                  <dt>Ticket Code</dt><dd>{selectedLog.ticketCode}</dd>
                  <dt>License Plate</dt><dd>{selectedLog.licensePlate}</dd>
                  <dt>Staff</dt><dd>{selectedLog.staff}</dd>
                  <dt>Gate</dt><dd>{selectedLog.gate}</dd>
                  <dt>Status</dt><dd><span className={`log-status ${String(selectedLog.status).toLowerCase()}`}>{selectedLog.status}</span></dd>
                </dl>
                <div className="log-description"><span>Description</span><p>{selectedLog.description}</p></div>
                <div className="log-detail-actions">
                  {selectedLog.ticketCode !== '—' && <button className="primary" onClick={() => navigate(ROUTE_PATHS.tickets)}><span className="material-symbols-outlined">confirmation_number</span>View Related Ticket</button>}
                  <div>
                    {selectedLog.receiptId !== '—' && <button onClick={() => navigate(ROUTE_PATHS.payment)}>View Payment Detail</button>}
                    <button onClick={() => navigate(ROUTE_PATHS.vehicleExit)}>View Session</button>
                  </div>
                </div>
              </>
            ) : (
              <p className="empty-detail">Select a log entry to view details.</p>
            )}
          </aside>
        </section>

        <section className="log-bottom-grid">
          <article className="log-panel">
            <header><h2>Current Shift Summary</h2></header>
            <div className="shift-summary">
              {safeShiftSummary.map(([label, value]) => <span key={label}><small>{label}</small><strong>{value ?? '—'}</strong></span>)}
            </div>
          </article>
          <article className="log-panel warnings-panel">
            <header><h2>System Warnings</h2><span>{warnings.length} events</span></header>
            <div className="log-table-wrap">
              <table>
                <thead><tr><th>Time</th><th>Warning</th><th>Area</th><th>Status</th></tr></thead>
                <tbody>
                  {warnings.map((log) => (
                    <tr key={log.id}>
                      <td>{log.time}</td>
                      <td><strong>{log.activity}</strong></td>
                      <td>{log.module}</td>
                      <td><span className={`warning-status ${String(log.status).toLowerCase()}`}>{log.status}</span></td>
                    </tr>
                  ))}
                  {!warnings.length && <tr><td colSpan="4"><em>No warnings.</em></td></tr>}
                </tbody>
              </table>
            </div>
          </article>
        </section>
      </div>
    </MainLayout>
  )
}

export default SystemLogPage