import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import MainLayout from '../../layouts/MainLayout'
import { ROUTE_PATHS } from '../../routes/routePaths'
import {
  filterReports,
  getDailyOperationsDetail,
  getReportCategories,
  getReportList,
  getReportsOverview,
} from './reportsService'
import './ReportsPage.css'

const dateOptions = ['Today', 'Yesterday', 'Last 7 Days']
const buildingOptions = ['Building A', 'Building B']
const floorOptions = ['All Floors', 'Floor 1', 'Floor 2', 'Floor 3']
const typeOptions = ['All Types', 'Daily Operations', 'Revenue Report', 'Occupancy Report', 'Ticket Activity', 'Payment Report', 'Lost Ticket Report', 'Reservation Report', 'Monthly Pass Report']

function ReportsPage() {
  const navigate = useNavigate()
  const overview = useMemo(() => getReportsOverview(), [])
  const categories = useMemo(() => getReportCategories(), [])
  const reports = useMemo(() => getReportList(), [])
  const detail = useMemo(() => getDailyOperationsDetail(), [])

  const [dateRange, setDateRange] = useState(dateOptions[0])
  const [reportType, setReportType] = useState(typeOptions[0])
  const [building, setBuilding] = useState(buildingOptions[0])
  const [floor, setFloor] = useState(floorOptions[0])
  const [query, setQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState(categories[0])
  const [selectedReportId, setSelectedReportId] = useState(reports[0]?.id)

  const filteredReports = useMemo(
    () => filterReports(reports, { query, type: reportType === 'All Types' ? selectedCategory : reportType }),
    [reports, query, reportType, selectedCategory],
  )

  const selectedReport = filteredReports.find((item) => item.id === selectedReportId) || filteredReports[0] || reports[0]

  const reportMetadata = {
    reportName: selectedReport?.name || detail.metadata.reportName,
    dateRange: selectedReport?.range || detail.metadata.dateRange,
    building,
    generatedBy: selectedReport?.generatedBy || detail.metadata.generatedBy,
    generatedAt: selectedReport?.updatedAt || detail.metadata.generatedAt,
    status: selectedReport?.status
      ? `${selectedReport.status[0].toUpperCase()}${selectedReport.status.slice(1).toLowerCase()}`
      : detail.metadata.status,
  }

  return (
    <MainLayout>
      <div className="reports-page">
        <div className="reports-header">
          <div className="reports-heading">
            <div className="reports-label">Reports</div>
            <h1>Reports Management</h1>
            <p>Generate operational reports, revenue summaries, ticket activity reports, and system performance logs.</p>
          </div>
        </div>

        <section className="reports-filter-card">
          <div className="filter-grid">
            <div className="filter-item">
              <label>Date Range</label>
              <select value={dateRange} onChange={(event) => setDateRange(event.target.value)}>
                {dateOptions.map((option) => <option key={option}>{option}</option>)}
              </select>
            </div>
            <div className="filter-item">
              <label>Report Type</label>
              <select value={reportType} onChange={(event) => setReportType(event.target.value)}>
                {typeOptions.map((option) => <option key={option}>{option}</option>)}
              </select>
            </div>
            <div className="filter-item">
              <label>Building</label>
              <select value={building} onChange={(event) => setBuilding(event.target.value)}>
                {buildingOptions.map((option) => <option key={option}>{option}</option>)}
              </select>
            </div>
            <div className="filter-item">
              <label>Floor</label>
              <select value={floor} onChange={(event) => setFloor(event.target.value)}>
                {floorOptions.map((option) => <option key={option}>{option}</option>)}
              </select>
            </div>
            <div className="filter-actions">
              <button type="button" className="button-secondary">Export PDF</button>
              <button type="button" className="button-secondary">Export Excel</button>
            </div>
          </div>
        </section>

        <section className="reports-summary-grid">
          {overview.map((item) => (
            <article key={item.label} className="summary-card">
              <div>
                <small>{item.label}</small>
                <strong>{item.value}</strong>
              </div>
              <div className="summary-bar" />
            </article>
          ))}
        </section>

        <section className="reports-top-card">
          <div className="reports-top-grid">
            <aside className="reports-sidebar-card">
              <div className="sidebar-title">Report Categories</div>
              <div className="category-list">
                {categories.map((item) => (
                  <button
                    key={item}
                    type="button"
                    className={`category-item ${item === selectedCategory ? 'active' : ''}`}
                    onClick={() => {
                      setSelectedCategory(item)
                      setReportType('All Types')
                    }}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </aside>

            <div className="reports-table-card">
              <div className="table-card-header">
                <div>
                  <h2>Generated Reports Overview</h2>
                  <p>Showing {Math.min(filteredReports.length, 5)} recent reports</p>
                </div>
                <div className="table-search">
                  <span className="material-symbols-outlined">search</span>
                  <input
                    type="text"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search reports..."
                  />
                </div>
              </div>

              <div className="table-wrap">
                <table className="reports-table">
                  <thead>
                    <tr>
                      <th>Report Name</th>
                      <th>Date Range</th>
                      <th>Generated By</th>
                      <th>Last Updated</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredReports.map((report) => (
                      <tr
                        key={report.id}
                        className={selectedReport?.id === report.id ? 'selected-row' : ''}
                        onClick={() => setSelectedReportId(report.id)}
                      >
                        <td>{report.name}</td>
                        <td>{report.range}</td>
                        <td>{report.generatedBy}</td>
                        <td>{report.updatedAt}</td>
                        <td><span className={`status-pill ${report.status.toLowerCase()}`}>{report.status}</span></td>
                        <td>
                          <button
                            type="button"
                            className="text-action"
                            onClick={(event) => {
                              event.stopPropagation()
                              if (report.type === 'Daily Operations') {
                                navigate(ROUTE_PATHS.dailyOperationsReport)
                              }
                            }}
                          >
                            {report.type === 'Revenue Report' ? 'Export' : 'View'}
                          </button>
                        </td>
                      </tr>
                    ))}
                    {!filteredReports.length && (
                      <tr>
                        <td colSpan="6" className="empty-state">No reports match the current filters.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        <section className="reports-bottom-card">
          <div className="reports-bottom-grid">
            <div className="reports-metadata-card">
              <div className="metadata-top">
                <div>
                  <p className="meta-label">Selected Report Metadata</p>
                  <h2>{reportMetadata.reportName}</h2>
                </div>
                <div className="meta-status">{reportMetadata.status}</div>
              </div>

              <div className="metadata-grid">
                <div><span>Selected Report</span><strong>{reportMetadata.reportName}</strong></div>
                <div><span>Date Range</span><strong>{reportMetadata.dateRange}</strong></div>
                <div><span>Building</span><strong>{reportMetadata.building}</strong></div>
                <div><span>Generated By</span><strong>{reportMetadata.generatedBy}</strong></div>
                <div><span>Generated At</span><strong>{reportMetadata.generatedAt}</strong></div>
                <div><span>Status</span><strong>{reportMetadata.status}</strong></div>
              </div>
            </div>

            <div className="reports-keynotes-card">
              <div className="key-notes">
                <div className="key-notes-title">Key Notes</div>
                <ul>
                  {detail.keyFindings.map((note) => (
                    <li key={note}>{note}</li>
                  ))}
                </ul>
              </div>

              <div className="metadata-actions">
                <button type="button" className="button-primary">View Report Detail</button>
                <button type="button" className="button-secondary">Download PDF</button>
                <button type="button" className="button-secondary">Export Excel</button>
              </div>
            </div>
          </div>
        </section>

        <section className="reports-activity-card">
          <div className="activity-header">
            <h2>Recent Export Activity</h2>
            <button type="button" className="activity-link">View All History</button>
          </div>
          <div className="table-wrap">
            <table className="reports-table">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Report</th>
                  <th>Action</th>
                  <th>Staff</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {detail.exportHistory.map((entry) => (
                  <tr key={entry.time}>
                    <td>{entry.time}</td>
                    <td>{entry.report}</td>
                    <td>{entry.action}</td>
                    <td>{entry.staff}</td>
                    <td><span className={`status-text ${entry.status.toLowerCase()}`}>{entry.status}</span></td>
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

export default ReportsPage
