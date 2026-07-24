import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import MainLayout from '../../layouts/MainLayout'
import { ROUTE_PATHS } from '../../routes/routePaths'
import {
  getReservations,
  updateReservation,
  confirmReservation,
  cancelReservation,
  shapeReservation,
} from './reservationService'
import './ReservationPage.css'

const STATUS_OPTIONS = [
  'All Statuses',
  'Pending',
  'Confirmed',
  'CheckedIn',
  'Completed',
  'Cancelled',
]

const VEHICLE_OPTIONS = ['All Vehicles', 'Car', 'EV', 'Motorcycle']

const STATUS_CONFIG = {
  pending: { label: 'Pending Approval', class: 'rsv-status-pending', icon: 'hourglass_top' },
  confirmed: { label: 'Confirmed (Reserved)', class: 'rsv-status-confirmed', icon: 'event_available' },
  checkedin: { label: 'Checked In', class: 'rsv-status-checkedin', icon: 'sensor_door' },
  completed: { label: 'Completed', class: 'rsv-status-completed', icon: 'check_circle' },
  cancelled: { label: 'Cancelled', class: 'rsv-status-cancelled', icon: 'cancel' },
  late: { label: 'Late Arrival', class: 'rsv-status-late', icon: 'schedule' },
}

function StatusBadge({ status }) {
  const safe = (status || 'Pending').toString().toLowerCase().replace(/[\s_-]+/g, '')
  const config = STATUS_CONFIG[safe] || { label: status || 'Pending', class: 'rsv-status-pending', icon: 'info' }
  return (
    <span className={`rsv-badge ${config.class}`}>
      <span className="material-symbols-outlined badge-icon">{config.icon}</span>
      {config.label}
    </span>
  )
}

function ReservationPage() {
  const navigate = useNavigate()
  const [reservations, setReservations] = useState([])
  const [activities, setActivities] = useState([])
  const [selectedId, setSelectedId] = useState(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All Statuses')
  const [vehicleFilter, setVehicleFilter] = useState('All Vehicles')
  const [cancelReason, setCancelReason] = useState('')
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [actionBusy, setActionBusy] = useState(false)

  const loadData = useCallback(() => {
    setLoading(true)
    getReservations({ search, status: statusFilter, vehicle: vehicleFilter })
      .then((res) => {
        if (res.success && res.data) {
          const list = (res.data.reservations || []).map(shapeReservation)
          const acts = res.data.activities || []
          setReservations(list)
          setActivities(acts)
          setSelectedId((current) => (current && list.some((r) => r.id === current) ? current : list[0]?.id || null))
          setMessage('')
        } else {
          setMessage('Unable to load reservations from server.')
        }
      })
      .catch(() => setMessage('Error connecting to reservation service.'))
      .finally(() => setLoading(false))
  }, [search, statusFilter, vehicleFilter])

  useEffect(() => {
    const timer = setTimeout(() => loadData(), 200)
    return () => clearTimeout(timer)
  }, [loadData])

  const selected = useMemo(
    () => reservations.find((r) => String(r.id) === String(selectedId)) || reservations[0] || null,
    [reservations, selectedId]
  )

  // System Stats calculation
  const stats = useMemo(() => {
    const total = reservations.length
    const pending = reservations.filter((r) => (r.status || '').toLowerCase() === 'pending').length
    const confirmed = reservations.filter((r) => (r.status || '').toLowerCase() === 'confirmed').length
    const checkedIn = reservations.filter((r) => (r.status || '').toLowerCase() === 'checkedin').length
    const completed = reservations.filter((r) => (r.status || '').toLowerCase() === 'completed').length
    const cancelled = reservations.filter((r) => (r.status || '').toLowerCase() === 'cancelled').length
    return { total, pending, confirmed, checkedIn, completed, cancelled }
  }, [reservations])

  const handleStatusChange = async (actionType) => {
    if (!selected) return
    setActionBusy(true)
    setMessage('')
    try {
      let res
      if (actionType === 'check-in') {
        res = await updateReservation(selected.id, 'check-in')
      } else if (actionType === 'confirm') {
        res = await confirmReservation(selected.id)
      } else if (actionType === 'complete') {
        res = await updateReservation(selected.id, 'complete')
      } else if (actionType === 'cancel') {
        res = await cancelReservation(selected.id)
        setShowCancelModal(false)
      }

      if (res?.success) {
        setMessage(`Reservation ${selected.code || ''} ${actionType} successful!`)
        loadData()
      } else {
        setMessage(res?.message || `Failed to ${actionType} reservation.`)
      }
    } catch (err) {
      setMessage(err.message || 'Operation failed.')
    } finally {
      setActionBusy(false)
    }
  }

  return (
    <MainLayout>
      <div className="rsv-page">
        {/* Breadcrumb Navigation */}
        <nav className="rsv-breadcrumb">
          <button onClick={() => navigate(ROUTE_PATHS.dashboard)}>Dashboard</button>
          <span>/</span>
          <b>Reservation Management</b>
        </nav>

        {/* Page Title & Context */}
        <header className="rsv-heading">
          <div>
            <h1>Reservation Command & Check-In</h1>
            <p>Real-time booking validation, slot locks & arrival check-in system.</p>
          </div>
          <button className="btn-refresh" onClick={loadData} disabled={loading}>
            <span className="material-symbols-outlined">refresh</span>
            Refresh List
          </button>
        </header>

        {/* KPI Stats Summary Cards */}
        <section className="rsv-stats-grid">
          <div className="stat-card">
            <div className="stat-icon-wrap total">
              <span className="material-symbols-outlined">event_seat</span>
            </div>
            <div className="stat-info">
              <small>Total Bookings</small>
              <strong>{stats.total}</strong>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon-wrap pending">
              <span className="material-symbols-outlined">hourglass_top</span>
            </div>
            <div className="stat-info">
              <small>Pending Approval</small>
              <strong>{stats.pending}</strong>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon-wrap confirmed">
              <span className="material-symbols-outlined">event_available</span>
            </div>
            <div className="stat-info">
              <small>Confirmed Slots</small>
              <strong>{stats.confirmed}</strong>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon-wrap checkedin">
              <span className="material-symbols-outlined">sensor_door</span>
            </div>
            <div className="stat-info">
              <small>Checked In Now</small>
              <strong>{stats.checkedIn}</strong>
            </div>
          </div>
        </section>

        {/* Search & Filter Toolbar */}
        <section className="rsv-toolbar">
          <div className="search-wrap">
            <span className="material-symbols-outlined search-icon">search</span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by Code, License Plate, or Driver Name..."
            />
          </div>

          <div className="filter-group">
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>

            <select value={vehicleFilter} onChange={(e) => setVehicleFilter(e.target.value)}>
              {VEHICLE_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
        </section>

        {message && (
          <div className={`rsv-alert ${message.includes('success') ? 'success' : 'info'}`}>
            <span className="material-symbols-outlined">info</span>
            <span>{message}</span>
          </div>
        )}

        {/* Main 2-Column Workspace */}
        <div className="rsv-layout-grid">
          {/* Left Column: Arrival Queue & Table */}
          <section className="rsv-table-card">
            <div className="table-card-header">
              <h2>
                <span className="material-symbols-outlined header-icon">format_list_bulleted</span>
                Arrival Queue & Bookings
              </h2>
              <span className="badge-count">{reservations.length} items</span>
            </div>

            {loading ? (
              <div className="rsv-loading">
                <span className="material-symbols-outlined spinner-icon">sync</span>
                Loading reservation queue...
              </div>
            ) : reservations.length === 0 ? (
              <div className="rsv-empty">
                <span className="material-symbols-outlined empty-icon">event_busy</span>
                <p>No reservations found matching the current search filters.</p>
              </div>
            ) : (
              <div className="table-scroll-wrap">
                <table className="rsv-table">
                  <thead>
                    <tr>
                      <th>Code</th>
                      <th>License Plate</th>
                      <th>Driver Name</th>
                      <th>Reserved Slot</th>
                      <th>Arrival Window</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reservations.map((r) => {
                      const isSelected = selected && String(r.id) === String(selected.id)
                      return (
                        <tr
                          key={r.id}
                          className={isSelected ? 'selected-row' : ''}
                          onClick={() => setSelectedId(r.id)}
                        >
                          <td>
                            <strong className="rsv-code-text">{r.code}</strong>
                          </td>
                          <td>
                            <span className="plate-badge">{r.plate}</span>
                          </td>
                          <td>{r.driver}</td>
                          <td>
                            <span className="slot-badge">{r.slot}</span>
                          </td>
                          <td>{r.window}</td>
                          <td>
                            <StatusBadge status={r.status} />
                          </td>
                          <td>
                            <button
                              className="btn-table-action"
                              onClick={(e) => {
                                e.stopPropagation()
                                setSelectedId(r.id)
                              }}
                            >
                              View
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* Right Column: Action & Details Inspector Panel */}
          <aside className="rsv-inspector-card">
            <div className="inspector-header">
              <h2>
                <span className="material-symbols-outlined header-icon">fact_check</span>
                Booking Inspector
              </h2>
              {selected && <StatusBadge status={selected.status} />}
            </div>

            {selected ? (
              <div className="inspector-body">
                {/* Hero Summary */}
                <div className="inspector-hero">
                  <small>Reservation Code</small>
                  <h3>{selected.code}</h3>
                  <div className="hero-plate-row">
                    <span className="plate-badge-hero">{selected.plate}</span>
                    <span className="v-type-chip">{selected.vehicleType}</span>
                  </div>
                </div>

                {/* Details Definition List */}
                <div className="details-list">
                  <div className="d-item">
                    <span>Driver Name:</span>
                    <strong>{selected.driver}</strong>
                  </div>
                  <div className="d-item">
                    <span>Contact Phone:</span>
                    <strong>{selected.phone}</strong>
                  </div>
                  <div className="d-item">
                    <span>Assigned Slot:</span>
                    <strong className="slot-highlight">{selected.slot}</strong>
                  </div>
                  <div className="d-item">
                    <span>Floor / Zone:</span>
                    <strong>{selected.floorZone}</strong>
                  </div>
                  <div className="d-item">
                    <span>Arrival Window:</span>
                    <strong>{selected.window}</strong>
                  </div>
                  <div className="d-item">
                    <span>Deposit / Fee:</span>
                    <strong className="fee-text">{selected.amount ? `${selected.amount.toLocaleString('vi-VN')} đ` : 'Paid'}</strong>
                  </div>
                </div>

                {/* Workflow Actions */}
                <div className="inspector-actions">
                  {(selected.status || '').toLowerCase() === 'pending' && (
                    <button
                      className="btn-action confirm"
                      disabled={actionBusy}
                      onClick={() => handleStatusChange('confirm')}
                    >
                      <span className="material-symbols-outlined">event_available</span>
                      Confirm Booking
                    </button>
                  )}

                  {((selected.status || '').toLowerCase() === 'pending' || (selected.status || '').toLowerCase() === 'confirmed') && (
                    <button
                      className="btn-action checkin"
                      disabled={actionBusy}
                      onClick={() => handleStatusChange('check-in')}
                    >
                      <span className="material-symbols-outlined">sensor_door</span>
                      Check In Vehicle
                    </button>
                  )}

                  {(selected.status || '').toLowerCase() === 'checkedin' && (
                    <button
                      className="btn-action complete"
                      disabled={actionBusy}
                      onClick={() => handleStatusChange('complete')}
                    >
                      <span className="material-symbols-outlined">check_circle</span>
                      Mark Completed & Exit
                    </button>
                  )}

                  <button
                    className="btn-action map"
                    onClick={() => navigate(ROUTE_PATHS.parkingMap)}
                  >
                    <span className="material-symbols-outlined">map</span>
                    View Live Slot Map
                  </button>

                  {(selected.status || '').toLowerCase() !== 'completed' && (selected.status || '').toLowerCase() !== 'cancelled' && (
                    <button
                      className="btn-action cancel"
                      disabled={actionBusy}
                      onClick={() => setShowCancelModal(true)}
                    >
                      <span className="material-symbols-outlined">cancel</span>
                      Cancel Booking
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="rsv-empty-inspector">
                <span className="material-symbols-outlined">touch_app</span>
                <p>Select a reservation from the list to view details & trigger check-in.</p>
              </div>
            )}
          </aside>
        </div>

        {/* Cancellation Reason Modal */}
        {showCancelModal && selected && (
          <div className="modal-overlay">
            <div className="modal-card">
              <h3>Cancel Reservation {selected.code}</h3>
              <p>Are you sure you want to cancel this booking? This slot will be unlocked for public parking.</p>
              <textarea
                placeholder="Reason for cancellation (optional)..."
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
              />
              <div className="modal-actions">
                <button className="btn-modal-cancel" onClick={() => setShowCancelModal(false)}>
                  Go Back
                </button>
                <button
                  className="btn-modal-confirm"
                  disabled={actionBusy}
                  onClick={() => handleStatusChange('cancel')}
                >
                  Confirm Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Activity Log Audit Trail */}
        <section className="rsv-activity-card">
          <div className="table-card-header">
            <h2>
              <span className="material-symbols-outlined header-icon">history</span>
              Recent Reservation Activity Audit
            </h2>
          </div>
          {activities.length === 0 ? (
            <div className="rsv-empty-sm">No recent activity recorded.</div>
          ) : (
            <table className="rsv-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Reservation Code</th>
                  <th>License Plate</th>
                  <th>Action Triggered</th>
                  <th>Operator Staff</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {activities.map((act) => (
                  <tr key={act.id}>
                    <td>{act.time}</td>
                    <td><strong>{act.code}</strong></td>
                    <td><span className="plate-badge">{act.plate}</span></td>
                    <td>{act.action}</td>
                    <td>{act.staff}</td>
                    <td><StatusBadge status={act.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </div>
    </MainLayout>
  )
}

export default ReservationPage
