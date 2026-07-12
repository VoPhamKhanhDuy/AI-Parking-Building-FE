import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import MainLayout from '../../layouts/MainLayout'
import { ROUTE_PATHS } from '../../routes/routePaths'
import {
  changeReservationSlot,
  filterReservations,
  getReservationActivities,
  getReservationData,
  getUpcomingArrivals,
  saveReservationData,
  updateReservationStatus,
} from './reservationService'
import './ReservationPage.css'

const timeOptions = ['Today']
const floorOptions = ['All Floors', 'Floor 1', 'Floor 2', 'Floor 3']
const zoneOptions = ['All Zones', 'Zone A', 'Zone B', 'Zone C']
const typeOptions = ['All Types', 'Car', 'Motorcycle', 'EV']
const statusOptions = ['All Statuses', 'Pending', 'Checked In', 'Cancelled']

const getStatusMetadata = (status) => {
  switch (status) {
    case 'Pending': return { label: 'Pending Check-in', variant: 'pending' }
    case 'Checked In': return { label: 'Checked In', variant: 'checked-in' }
    case 'Cancelled': return { label: 'Cancelled', variant: 'cancelled' }
    default: return { label: status, variant: 'neutral' }
  }
}

const getRowActionLabel = (reservation) => {
  if (reservation.status === 'Pending') return 'Check In'
  if (reservation.status === 'Checked In') return 'View'
  if (reservation.status === 'Cancelled') return 'Review'
  return 'View'
}

function ReservationPage() {
  const navigate = useNavigate()
  const [reservations, setReservations] = useState(getReservationData)
  const [search, setSearch] = useState('')
  const [timeRange, setTimeRange] = useState(timeOptions[0])
  const [floor, setFloor] = useState('All Floors')
  const [zone, setZone] = useState('All Zones')
  const [type, setType] = useState('All Types')
  const [status, setStatus] = useState('All Statuses')
  const [selectedId, setSelectedId] = useState(reservations[0]?.id)
  const [toast, setToast] = useState('')
  const activities = useMemo(() => getReservationActivities(), [])
  const upcomingArrivals = useMemo(() => getUpcomingArrivals(), [])

  const filteredReservations = useMemo(
    () => filterReservations(reservations, { query: search, floor, zone, type, status }),
    [reservations, search, floor, zone, type, status],
  )

  const selected = filteredReservations.find((item) => item.id === selectedId) || filteredReservations[0] || reservations[0]

  const statistics = useMemo(() => {
    const total = reservations.length
    const pending = reservations.filter((item) => item.status === 'Pending').length
    const checkedIn = reservations.filter((item) => item.status === 'Checked In').length
    const cancelled = reservations.filter((item) => item.status === 'Cancelled').length
    const today = total - cancelled

    return [
      { label: 'Total', value: total },
      { label: 'Today', value: today },
      { label: 'Pending', value: pending },
      { label: 'Checked In', value: checkedIn },
      { label: 'Cancelled', value: cancelled },
    ]
  }, [reservations])

  useEffect(() => {
    saveReservationData(reservations)
  }, [reservations])

  const updateSelection = (id) => setSelectedId(id)

  const handleCheckIn = (reservation = selected) => {
    if (!reservation) return
    setReservations((items) => updateReservationStatus(items, reservation.id, { status: 'Checked In' }))
    setToast(`Reservation ${reservation.code} checked in.`)
    setSelectedId(reservation.id)
  }

  const handleRowAction = (reservation, event) => {
    event.stopPropagation()
    setSelectedId(reservation.id)
    if (reservation.status === 'Pending') {
      handleCheckIn(reservation)
    }
  }

  const handleSendReminder = () => {
    if (!selected) return
    setToast(`Reminder sent for ${selected.code}.`)
  }

  const handleChangeSlot = () => {
    if (!selected) return
    const nextSlot = selected.slot === 'B2-18' ? 'B2-19' : 'B2-18'
    setReservations((items) => changeReservationSlot(items, selected.id, nextSlot))
    setToast(`Slot updated to ${nextSlot} for ${selected.code}.`)
  }

  const handleCancel = () => {
    if (!selected) return
    setReservations((items) => updateReservationStatus(items, selected.id, { status: 'Cancelled' }))
    setToast(`Reservation ${selected.code} cancelled.`)
  }

  useEffect(() => {
    if (!toast) return undefined
    const timer = setTimeout(() => setToast(''), 2600)
    return () => clearTimeout(timer)
  }, [toast])

  return (
    <MainLayout>
      <div className="reservation-page">
        <header className="reservation-heading">
          <div className="breadcrumb"><button onClick={() => navigate(ROUTE_PATHS.dashboard)}>Dashboard</button><span className="material-symbols-outlined">chevron_right</span><strong>Reservation</strong></div>
          <h1>Reservation Management</h1>
          <p>Manage reservation arrivals, check-in status, slot assignments, and operational activity from a central dashboard.</p>
        </header>

        <section className="reservation-stats">
          {statistics.map((item) => (
            <article key={item.label} className="stat-card">
              <small>{item.label}</small>
              <strong>{item.value}</strong>
            </article>
          ))}
        </section>

        <section className="reservation-filters">
          <label className="search-box">
            <span className="material-symbols-outlined">search</span>
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search code or plate..." />
          </label>
          <select value={timeRange} onChange={(event) => setTimeRange(event.target.value)}>
            {timeOptions.map((option) => <option key={option}>{option}</option>)}
          </select>
          <select value={floor} onChange={(event) => setFloor(event.target.value)}>
            {floorOptions.map((option) => <option key={option}>{option}</option>)}
          </select>
          <select value={zone} onChange={(event) => setZone(event.target.value)}>
            {zoneOptions.map((option) => <option key={option}>{option}</option>)}
          </select>
          <select value={type} onChange={(event) => setType(event.target.value)}>
            {typeOptions.map((option) => <option key={option}>{option}</option>)}
          </select>
          <select value={status} onChange={(event) => setStatus(event.target.value)}>
            {statusOptions.map((option) => <option key={option}>{option}</option>)}
          </select>
        </section>

        <div className="reservation-grid">
          <section className="queue-card">
            <div className="card-header">
              <div>
                <h2>Today's Arrival Queue</h2>
              </div>
              <button className="export-button"><span className="material-symbols-outlined">download</span> Export</button>
            </div>

            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>Driver</th>
                    <th>Plate</th>
                    <th>Type</th>
                    <th>Slot</th>
                    <th>Window</th>
                    <th>Status</th>
                    <th className="text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReservations.map((reservation) => {
                    const statusMeta = getStatusMetadata(reservation.status)
                    return (
                      <tr
                        key={reservation.id}
                        className={reservation.id === selected?.id ? 'selected' : ''}
                        onClick={() => updateSelection(reservation.id)}
                      >
                        <td className="font-mono">{reservation.code}</td>
                        <td>{reservation.driver}</td>
                        <td className="font-mono">{reservation.plate}</td>
                        <td>{reservation.type}</td>
                        <td className="font-mono">{reservation.slot}</td>
                        <td>{reservation.arrivalWindow}</td>
                        <td><span className={`status-pill ${statusMeta.variant}`}>{statusMeta.label}</span></td>
                        <td className="text-right">
                          <button className={`row-action ${reservation.status === 'Pending' ? 'primary' : 'secondary'}`} onClick={(event) => handleRowAction(reservation, event)}>{getRowActionLabel(reservation)}</button>
                        </td>
                      </tr>
                    )
                  })}
                  {!filteredReservations.length && (
                    <tr>
                      <td colSpan="8" className="empty-state">No reservations match the current filters.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="upcoming-strip">
              <span className="upcoming-label">Upcoming Arrivals:</span>
              <div className="arrival-list">
                {upcomingArrivals.map((item) => (
                  <span key={`${item.time}-${item.slot}`} className="arrival-pill"><strong>{item.time}</strong> {item.slot}</span>
                ))}
              </div>
            </div>
          </section>

          <aside className="action-panel">
            <div className="action-card">
              <div className="panel-heading">
                <div>
                  <p className="panel-title">Action Panel: Check-In</p>
                </div>
              </div>
              {selected ? (
                <div className="panel-content">
                  <div className="active-reservation-card">
                    <div>
                      <p className="panel-label">Active Reservation</p>
                      <h3>{selected.code}</h3>
                    </div>
                    <span className={`status-pill ${getStatusMetadata(selected.status).variant}`}>{getStatusMetadata(selected.status).label}</span>
                  </div>

                  <div className="detail-grid">
                    <div>
                      <p className="detail-label">License Plate</p>
                      <p className="detail-value font-mono">{selected.plate}</p>
                    </div>
                    <div>
                      <p className="detail-label">Vehicle Type</p>
                      <p className="detail-value">{selected.type}</p>
                    </div>
                    <div>
                      <p className="detail-label">Driver</p>
                      <p className="detail-value">{selected.driver}</p>
                    </div>
                    <div>
                      <p className="detail-label">Payment</p>
                      <p className="detail-value badge paid">{selected.payment}</p>
                    </div>
                  </div>

                  <div className="slot-status-card">
                    <div className="slot-row">
                      <div>
                        <p className="detail-label">Reserved Slot Status</p>
                        <p className="detail-value">{selected.slot}</p>
                      </div>
                      <span className="detail-slot-type">{selected.floor}, {selected.zone} - Standard {selected.type}</span>
                    </div>
                    <div className="slot-note">{selected.reservedSlotStatus}</div>
                  </div>

                  <div className="detail-grid two-column">
                    <div>
                      <p className="detail-label">Arrival Window</p>
                      <p className="detail-value">{selected.arrivalWindow}</p>
                    </div>
                    <div>
                      <p className="detail-label">Check-in Deadline</p>
                      <p className="detail-value important">{selected.checkInDeadline}</p>
                    </div>
                    <div>
                      <p className="detail-label">No-show Risk</p>
                      <p className="detail-value success">{selected.noShowRisk}</p>
                    </div>
                  </div>

                  <div className="panel-actions">
                    <button className="primary" onClick={handleCheckIn} disabled={selected.status === 'Checked In'}>Check In Reservation</button>
                    <button onClick={handleSendReminder}>Send Reminder</button>
                    <button onClick={handleChangeSlot}>Change Slot</button>
                  </div>
                  <button className="cancel-button" onClick={handleCancel}>Cancel Reservation</button>
                </div>
              ) : (
                <p className="no-selection">Select a reservation from the queue to view details.</p>
              )}
            </div>
          </aside>
        </div>

        <section className="activity-card">
          <div className="activity-header">
            <h2>Recent Activity</h2>
            <button className="secondary-button" onClick={() => navigate(ROUTE_PATHS.systemLogs)}>View Full Log</button>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Reservation Code</th>
                  <th>License Plate</th>
                  <th>Action</th>
                  <th>Staff</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {activities.map((activity) => (
                  <tr key={`${activity.time}-${activity.code}`}>
                    <td className="font-mono">{activity.time}</td>
                    <td>{activity.code}</td>
                    <td className="font-mono">{activity.plate}</td>
                    <td>{activity.action}</td>
                    <td>{activity.staff}</td>
                    <td><span className={`status-pill ${activity.status.toLowerCase().replace(/ /g, '-')}`}>{activity.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {toast && <div className="reservation-toast" role="status"><span className="material-symbols-outlined">check_circle</span><span>{toast}</span></div>}
      </div>
    </MainLayout>
  )
}

export default ReservationPage
