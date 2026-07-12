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

const defaultSummaryFill = [70, 85, 75, 73]

function getSummaryFill(value, index) {
  const match = typeof value === 'string' ? value.match(/(\d+(?:\.\d+)?)\s*%/) : null
  if (match) return Number(match[1])
  return defaultSummaryFill[index % defaultSummaryFill.length]
}

function getReportAction(report) {
  if (report.type === 'Daily Operations') return 'View Detail'
  if (report.type === 'Revenue Report') return 'Export'
  return 'View'
}

const dateOptions = ['Today', 'Yesterday', 'Last 7 Days']
const buildingOptions = ['Building A', 'Building B']
const floorOptions = ['All Floors', 'Floor 1', 'Floor 2', 'Floor 3']
const typeOptions = ['Daily Operations', 'Revenue Report']

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
  const [selectedCategory, setSelectedCategory] = useState(categories[0])
  const [selectedReportId, setSelectedReportId] = useState(reports[0]?.id)

  const filteredReports = useMemo(
    () => filterReports(reports, { query: '', type: selectedCategory }),
    [reports, selectedCategory],
  )

  const displayedReports = filteredReports.slice(0, 5)
  const selectedReport = displayedReports.find((item) => item.id === selectedReportId) || displayedReports[0] || reports[0]

  const reportMetadata = {
    reportName: selectedReport?.type || selectedCategory,
    dateRange: selectedReport?.range || detail.metadata.dateRange,
    building,
    generatedBy: selectedReport?.generatedBy || detail.metadata.generatedBy,
    generatedAt: selectedReport?.updatedAt || detail.metadata.generatedAt,
    status: selectedReport?.status
      ? `${selectedReport.status[0].toUpperCase()}${selectedReport.status.slice(1).toLowerCase()}`
      : detail.metadata.status,
  }

  const [exportHistory, setExportHistory] = useState(detail.exportHistory || [])

  const addExportEntry = (reportName, action, staff = 'Parking Staff', status = 'Success') => {
    const now = new Date()
    const time = now.toLocaleTimeString('en-GB')
    setExportHistory((prev) => [{ time, report: reportName, action, staff, status }, ...prev])
  }

  const handleDownloadPdf = () => {
    addExportEntry(reportMetadata.reportName, 'Exported PDF')
  }

  const handleExportExcel = () => {
    addExportEntry(reportMetadata.reportName, 'Exported Excel')
  }

  const handleViewDetail = () => {
    if (selectedReport?.type === 'Daily Operations') {
      navigate(ROUTE_PATHS.dailyOperationsReport)
    }
  }

  const handleReportAction = (report) => {
    if (report.type === 'Daily Operations') {
      navigate(ROUTE_PATHS.dailyOperationsReport)
      return
    }
    if (report.type === 'Revenue Report') {
      addExportEntry(report.name, 'Exported PDF', report.generatedBy)
    }
  }

  const keyNotes = [
    'Revenue increased compared to yesterday',
    'Lost ticket cases require review',
    'Manual overrides should be monitored',
  ]

  return (
    <MainLayout>
      <div className="reports-page">
        <div className="reports-page-header">
          <nav className="reports-breadcrumb" aria-label="Breadcrumb">
            <button type="button" onClick={() => navigate(ROUTE_PATHS.dashboard)}>Dashboard</button>
            <span className="material-symbols-outlined">chevron_right</span>
            <strong>Reports</strong>
          </nav>
          <h1>Reports Management</h1>
          <p>Generate operational reports, revenue summaries, ticket activity reports, and system performance logs.</p>
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
              <select
                value={reportType}
                onChange={(event) => {
                  setReportType(event.target.value)
                  setSelectedCategory(event.target.value)
                }}
              >
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
          </div>
          <div className="filter-actions">
            <button type="button" className="button-secondary" onClick={handleDownloadPdf}>
              <span className="material-symbols-outlined">picture_as_pdf</span>
              Export PDF
            </button>
            <button type="button" className="button-secondary" onClick={handleExportExcel}>
              <span className="material-symbols-outlined">description</span>
              Export Excel
            </button>
          </div>
        </section>

        <section className="reports-summary-grid">
          {overview.map((item, index) => (
            <article key={item.label} className="summary-card">
              <small>{item.label}</small>
              <strong>{item.value}</strong>
              <div className="summary-bar">
                <span className="summary-bar-fill" style={{ width: `${getSummaryFill(item.value, index)}%` }} />
              </div>
            </article>
          ))}
        </section>

        <section className="reports-main-layout">
          <aside className="reports-categories-card">
            <div className="categories-title">Report Categories</div>
            <div className="category-list">
              {categories.map((item) => (
                <button
                  key={item}
                  type="button"
                  className={`category-item ${item === selectedCategory ? 'active' : ''}`}
                  onClick={() => {
                    setSelectedCategory(item)
                    if (typeOptions.includes(item)) setReportType(item)
                  }}
                >
                  {item}
                </button>
              ))}
            </div>
          </aside>

          <div className="reports-main-content">
            <div className="reports-table-card">
              <div className="table-card-header">
                <h2>Generated Reports Overview</h2>
                <span className="table-card-subtitle">Showing {displayedReports.length} recent reports</span>
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
                    {displayedReports.map((report) => (
                      <tr
                        key={report.id}
                        className={selectedReport?.id === report.id ? 'selected-row' : ''}
                        onClick={() => setSelectedReportId(report.id)}
                      >
                        <td className="report-name-cell">{report.name}</td>
                        <td>{report.range}</td>
                        <td>{report.generatedBy}</td>
                        <td>{report.updatedAt}</td>
                        <td>
                          <span className={`status-pill ${report.status.toLowerCase()}`}>{report.status}</span>
                        </td>
                        <td>
                          <button
                            type="button"
                            className="text-action"
                            onClick={(event) => {
                              event.stopPropagation()
                              handleReportAction(report)
                            }}
                          >
                            {getReportAction(report)}
                          </button>
                        </td>
                      </tr>
                    ))}
                    {!displayedReports.length && (
                      <tr>
                        <td colSpan="6" className="empty-state">No reports match the current filters.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="reports-metadata-panel">
              <div className="metadata-column">
                <h3>Selected Report Metadata</h3>
                <div className="metadata-rows">
                  <div className="metadata-row">
                    <span>Selected Report</span>
                    <strong>{reportMetadata.reportName}</strong>
                  </div>
                  <div className="metadata-row">
                    <span>Date Range</span>
                    <strong>{reportMetadata.dateRange}</strong>
                  </div>
                  <div className="metadata-row">
                    <span>Building</span>
                    <strong>{reportMetadata.building}</strong>
                  </div>
                  <div className="metadata-row">
                    <span>Generated By</span>
                    <strong>{reportMetadata.generatedBy}</strong>
                  </div>
                  <div className="metadata-row">
                    <span>Generated At</span>
                    <strong>{reportMetadata.generatedAt}</strong>
                  </div>
                  <div className="metadata-row">
                    <span>Status</span>
                    <strong className="metadata-status-value">{reportMetadata.status}</strong>
                  </div>
                </div>
              </div>

              <div className="metadata-column">
                <h3>Key Notes</h3>
                <ul className="key-notes-list">
                  {keyNotes.map((note) => <li key={note}>{note}</li>)}
                </ul>
              </div>

              <div className="metadata-actions">
                <button type="button" className="button-primary" onClick={handleViewDetail}>View Report Detail</button>
                <button type="button" className="button-secondary" onClick={handleDownloadPdf}>Download PDF</button>
                <button type="button" className="button-secondary" onClick={handleExportExcel}>Export Excel</button>
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
                {exportHistory.map((entry) => (
                  <tr key={`${entry.time}-${entry.report}-${entry.action}`}>
                    <td>{entry.time}</td>
                    <td className="report-name-cell">{entry.report}</td>
                    <td>{entry.action}</td>
                    <td>{entry.staff}</td>
                    <td>
                      <span className={`status-text ${entry.status.toLowerCase()}`}>{entry.status}</span>
                    </td>
                  </tr>
                ))}
                {!exportHistory.length && (
                  <tr>
                    <td colSpan="5" className="empty-state">No export activity yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </MainLayout>
  )
}

export default ReportsPage
