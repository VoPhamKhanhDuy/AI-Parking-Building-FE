import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ManagerLayout from '../../layouts/ManagerLayout'
import { ROUTE_PATHS } from '../../routes/routePaths'
import { exportReport, getReports } from './reportsService'
import './ReportsManagementPage.css'

function Status({ children }) {
  return <span className={`report-status ${children.toLowerCase().replaceAll(' ', '-')}`}>{children}</span>
}

const categoryReport = {
  'Daily Operations': 'RPT-2026-00012',
  'Revenue Reports': 'RPT-2026-00011',
  'Occupancy Reports': 'RPT-2026-00010',
  'Lost Ticket Reports': 'RPT-2026-00009',
  'Staff Performance': 'RPT-2026-00008',
}

const reportCategory = {
  'RPT-2026-00012': 'Daily Operations',
  'RPT-2026-00011': 'Revenue Reports',
  'RPT-2026-00010': 'Occupancy Reports',
  'RPT-2026-00009': 'Lost Ticket Reports',
  'RPT-2026-00008': 'Staff Performance',
}

function ReportsManagementPage() {
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [category, setCategory] = useState('Daily Operations')
  const [selectedId, setSelectedId] = useState('RPT-2026-00012')
  const [query, setQuery] = useState('')
  const [filters, setFilters] = useState({ date: 'Today', type: 'All Reports', facility: 'Building A', floor: 'All Floors' })
  const [notice, setNotice] = useState('')

  useEffect(() => { 
    getReports().then((result) => {
      if (result) setData(result)
    })
  }, [])
  const reports = useMemo(() => (data?.reports || []).filter((report) => {
    const matchesSearch = Object.values(report).join(' ').toLowerCase().includes(query.toLowerCase())
    const matchesDate = filters.date === 'Last 7 Days' || report.date === filters.date
    const matchesType = filters.type === 'All Reports' || report.type === filters.type
    return matchesSearch && matchesDate && matchesType
  }), [data, filters.date, filters.type, query])
  const selected = (data?.reports || []).find((report) => report.id === selectedId) || (data?.reports || [])[0]

  const notify = (message) => {
    setNotice(message)
    window.setTimeout(() => setNotice(''), 2500)
  }

  const updateFilter = (event) => {
    const { name, value } = event.target
    setFilters((current) => ({ ...current, [name]: value }))
    if (name === 'type' && value !== 'All Reports') {
      const matchingReport = (data?.reports || []).find((report) => report.type === value)
      if (matchingReport) {
        setSelectedId(matchingReport.id)
        setCategory(reportCategory[matchingReport.id])
        if (matchingReport.date !== 'Today') setFilters((current) => ({ ...current, date: 'Last 7 Days', type: value }))
      }
    }
  }

  const selectCategory = (item) => {
    const reportId = categoryReport[item]
    if (!reportId) {
      notify('No generated Ticket Report is available in the current mock data.')
      return
    }
    const report = (data?.reports || []).find((entry) => entry.id === reportId)
    setCategory(item)
    setSelectedId(reportId)
    setFilters((current) => ({ ...current, date: report.date === 'Today' ? 'Today' : 'Last 7 Days', type: report.type, floor: 'All Floors' }))
  }

  const selectReport = (report) => {
    setSelectedId(report.id)
    setCategory(reportCategory[report.id])
    setFilters((current) => ({ ...current, type: 'All Reports', floor: 'All Floors' }))
  }
  const handleExport = async (type) => {
    await exportReport(selected.id, type)
    notify(`${selected.id} exported as ${type} in mock mode.`)
  }

  if (!data) return <ManagerLayout><div className="reports-loading">Loading reports...</div></ManagerLayout>

  return <ManagerLayout>
    <div className="reports-page">
      <header className="reports-heading"><div><p>Dashboard <span>/</span> Reports</p><h1>Reports Management</h1><h2>Review daily operations, revenue, occupancy, ticket activity, and export facility reports.</h2></div><span><i />Data current</span></header>

      <section className="reports-kpis">{data.summaries.map((item) => <article key={item.label}><small>{item.label}</small><strong className={item.tone ?? ''}>{item.value}</strong><span>{item.note}</span></article>)}</section>

      <section className="report-filter-bar">
        <label><span>Date Range</span><select name="date" value={filters.date} onChange={updateFilter}><option>Today</option><option>Yesterday</option><option>Last 7 Days</option></select></label>
        <label><span>Report Type</span><select name="type" value={filters.type} onChange={updateFilter}><option>All Reports</option><option>Daily Operations</option><option>Revenue Report</option><option>Occupancy Report</option><option>Lost Ticket Report</option><option>Staff Performance</option></select></label>
        <label><span>Facility</span><select name="facility" value={filters.facility} onChange={updateFilter}><option>Building A</option></select></label>
        <label><span>Floor</span><select name="floor" value={filters.floor} onChange={updateFilter}><option>All Floors</option><option>Floor 1</option><option>Floor 2</option><option>Floor 3</option></select></label>
        <div className="filter-actions"><button onClick={() => handleExport('PDF')}>Export PDF</button><button onClick={() => handleExport('Excel')}>Export Excel</button></div>
      </section>

      <div className="reports-workspace">
        <aside className="reports-card report-categories"><header><h3>Report categories</h3></header><nav>{data.categories.map((item) => <button className={category === item ? 'active' : ''} key={item} onClick={() => selectCategory(item)}>{item}</button>)}</nav></aside>

        <div className="reports-center-column">
          <section className="reports-card generated-reports"><header><div><h3>Generated Reports</h3><p>{reports.length} reports shown</p></div><label><span className="material-symbols-outlined">search</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search reports..." /></label></header><div className="reports-table-wrap"><table><thead><tr><th>Report ID</th><th>Report Type</th><th>Date</th><th>Generated Time</th><th>Generated By</th><th>Status</th><th>Action</th></tr></thead><tbody>{reports.map((report) => <tr className={selected.id === report.id ? 'selected' : ''} key={report.id} onClick={() => selectReport(report)}><td><strong>{report.id}</strong></td><td>{report.type}</td><td>{report.date}</td><td>{report.time}</td><td>{report.generatedBy}</td><td><Status>{report.status}</Status></td><td><button onClick={(event) => { event.stopPropagation(); selectReport(report); if (report.id === 'RPT-2026-00012') navigate(ROUTE_PATHS.dailyOperationsReport); else notify(`${report.id} preview selected.`) }}>View Detail</button></td></tr>)}</tbody></table></div></section>

          <section className="reports-card export-activity"><header><div><h3>Recent Export Activity</h3><p>Latest facility report exports</p></div></header><div className="reports-table-wrap"><table><thead><tr><th>Time</th><th>Report</th><th>Export Type</th><th>User</th><th>Status</th></tr></thead><tbody>{data.exports.map((item) => <tr key={`${item.time}-${item.report}`}><td>{item.time}</td><td><strong>{item.report}</strong></td><td>{item.type}</td><td>{item.user}</td><td><Status>{item.status}</Status></td></tr>)}</tbody></table></div></section>
        </div>

        <div className="reports-right-column">
          <aside className="reports-card selected-report"><header><div><small>Selected report</small><h3>{selected.id}</h3></div><Status>{selected.status}</Status></header><dl><div><dt>Report Type</dt><dd>{selected.type}</dd></div><div><dt>Date</dt><dd>{selected.date}</dd></div><div><dt>Generated Time</dt><dd>{selected.time}</dd></div><div><dt>Facility</dt><dd>{selected.facility}</dd></div><div><dt>Generated By</dt><dd>{selected.generatedBy}</dd></div><div><dt>Status</dt><dd><Status>{selected.status}</Status></dd></div></dl><section className="report-metrics"><h4>Key metrics</h4><div>{data.metrics.map((metric) => <article key={metric.label}><small>{metric.label}</small><strong>{metric.value}</strong></article>)}</div></section><div className="report-actions"><button className="primary" onClick={() => selected.id === 'RPT-2026-00012' ? navigate(ROUTE_PATHS.dailyOperationsReport) : notify(`${selected.id} detail opened in preview mode.`)}>View Detail</button><button onClick={() => handleExport('PDF')}>Export PDF</button><button onClick={() => handleExport('Excel')}>Export Excel</button></div></aside>
          <section className="reports-card report-notes"><header><h3>Report Notes</h3></header><ul>{data.notes.map((note) => <li key={note}>{note}</li>)}</ul></section>
        </div>
      </div>

      {notice && <div className="reports-notice" role="status">{notice}</div>}
    </div>
  </ManagerLayout>
}

export default ReportsManagementPage
