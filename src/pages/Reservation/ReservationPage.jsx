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

const floorOptions = ['All Floors', 'Floor 1', 'Floor 2', 'Floor 3']
const zoneOptions = ['All Zones', 'Zone A', 'Zone B', 'Zone C']
const typeOptions = ['All Types', 'Car', 'Motorcycle', 'EV']
const statusOptions = ['All Statuses', 'Pending', 'Checked In', 'Cancelled']

function ReservationPage() {
  const navigate = useNavigate()
  const [reservations, setReservations] = useState(getReservationData)
  const [search, setSearch] = useState('')
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

  useEffect(() => {
    saveReservationData(reservations)
  }, [reservations])

  useEffect(() => {
    if (!filteredReservations.some((item) => item.id === selectedId)) {
      setSelectedId(filteredReservations[0]?.id)
    }
  }, [filteredReservations, selectedId])

  useEffect(() => {
    if (!selectedId && filteredReservations[0]) {
      setSelectedId(filteredReservations[0].id)
    }
  }, [filteredReservations, selectedId])

  const updateSelection = (id) => setSelectedId(id)

  const handleCheckIn = () => {
    if (!selected) return
    setReservations((items) => updateReservationStatus(items, selected.id, { status: 'Checked In' }))
    setToast(`Reservation ${selected.code} checked in.`)
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
          <p>Monitor arrival queue, reservation status, slot assignments, and recent activity in real time.</p>
        </header>

        <section className="reservation-filters">
          <label className="search-box">
            <span className="material-symbols-outlined">search</span>
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search code or plate..." />
          </label>
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
            <div className="card-title">
              <h2>Today's Arrival Queue</h2>
              <span>{filteredReservations.length} reservations</span>
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
                  </tr>
                </thead>
                <tbody>
                  {filteredReservations.map((reservation) => (
                    <tr
                      key={reservation.id}
                      className={reservation.id === selected?.id ? 'selected' : ''}
                      onClick={() => updateSelection(reservation.id)}
                    >
                      <td>{reservation.code}</td>
                      <td>{reservation.driver}</td>
                      <td>{reservation.plate}</td>
                      <td>{reservation.type}</td>
                      <td>{reservation.slot}</td>
                    </tr>
                  ))}
                  {!filteredReservations.length && (
                    <tr>
                      <td colSpan="5" className="empty-state">No reservations match the current filters.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="upcoming-arrivals">
              <div className="upcoming-title">Upcoming Arrivals</div>
              <div className="arrival-list">
                {upcomingArrivals.map((item) => (
                  <span key={`${item.time}-${item.slot}`}>{item.time} {item.slot}</span>
                ))}
              </div>
            </div>
          </section>

          <aside className="action-panel">
            <div className="action-card">
              <div className="panel-label">Active Reservation</div>
              {selected ? (
                <>
                  <div className="reservation-status-row">
                    <strong>{selected.code}</strong>
                    <span className={`status-badge ${selected.status.toLowerCase().replace(/ /g, '-')}`}>{selected.status}</span>
                  </div>
                  <dl className="reservation-detail-list">
                    <dt>License Plate</dt><dd>{selected.plate}</dd>
                    <dt>Vehicle Type</dt><dd>{selected.type}</dd>
                    <dt>Driver</dt><dd>{selected.driver}</dd>
                    <dt>Payment</dt><dd>{selected.payment}</dd>
                    <dt>Reserved Slot Status</dt><dd>{selected.reservedSlotStatus}</dd>
                    <dt>Arrival Window</dt><dd>{selected.arrivalWindow}</dd>
                    <dt>Check-in Deadline</dt><dd>{selected.checkInDeadline}</dd>
                    <dt>No-show Risk</dt><dd>{selected.noShowRisk}</dd>
                  </dl>
                  <div className="panel-actions">
                    <button className="primary" onClick={handleCheckIn} disabled={selected.status === 'Checked In'}>Check In Reservation</button>
                    <button onClick={handleSendReminder}>Send Reminder</button>
                    <button onClick={handleChangeSlot}>Change Slot</button>
                  </div>
                  <button className="cancel-button" onClick={handleCancel}>Cancel Reservation</button>
                </>
              ) : (
                <p className="no-selection">Select a reservation from the queue to view details.</p>
              )}
            </div>
          </aside>
        </div>

        <section className="activity-card">
          <div className="activity-title">
            <h2>Recent Activity</h2>
            <button onClick={() => navigate(ROUTE_PATHS.systemLogs)}>View Full Log</button>
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
                    <td className="mono">{activity.time}</td>
                    <td>{activity.code}</td>
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

        {toast && <div className="reservation-toast" role="status"><span className="material-symbols-outlined">check_circle</span><span>{toast}</span></div>}
      </div>
    </MainLayout>
  )
}

export default ReservationPage
