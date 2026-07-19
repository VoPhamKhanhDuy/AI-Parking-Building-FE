import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import MainLayout from '../../layouts/MainLayout'
import { ROUTE_PATHS } from '../../routes/routePaths'
import { getReservations, updateReservation } from './reservationService'
import './ReservationPage.css'

const STATUS_OPTIONS = [
  'All Statuses',
  'Pending Check-in',
  'Checked In',
  'Waiting',
  'Late Arrival',
  'Paid'
]
const VEHICLE_OPTIONS = ['All Vehicles', 'Car', 'Motorcycle', 'Electric Vehicle']
const DATE_OPTIONS = ['Today', 'Tomorrow']

const STATUS_ALIASES = {
  pendingcheckin: 'Pending Check-in',
  pending: 'Pending Check-in',
  checkedin: 'Checked In',
  waiting: 'Waiting',
  late: 'Late Arrival',
  paid: 'Paid',
  confirmed: 'Confirmed',
  completed: 'Completed',
  cancelled: 'Cancelled',
  expired: 'Expired'
}

function safeString(value) {
  if (value === undefined || value === null) return ''
  return String(value)
}

function Badge({ value }) {
  const raw = safeString(value) || '—'
  const lower = raw.toLowerCase()
  const friendly = STATUS_ALIASES[lower.replace(/[\s_-]+/g, '')] || raw
  const safe = friendly.toLowerCase().replaceAll(' ', '-')
  return <span className={`rsv-badge ${safe}`}>{friendly}</span>
}

function ReservationPage() {
  const navigate = useNavigate()
  const [reservations, setReservations] = useState([])
  const [activities, setActivities] = useState([])
  const [selectedId, setSelectedId] = useState(null)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('All Statuses')
  const [vehicle, setVehicle] = useState('All Vehicles')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [actionBusy, setActionBusy] = useState(false)

  useEffect(() => {
    let active = true
    const timer = setTimeout(() => {
      getReservations({ search, status, vehicle })
        .then((result) => {
          if (!active) return
          const list = Array.isArray(result?.data?.reservations) ? result.data.reservations : []
          const acts = Array.isArray(result?.data?.activities) ? result.data.activities : []
          setReservations(list)
          setActivities(acts)
          setSelectedId((current) => current && list.some((r) => r.id === current)
            ? current
            : (list[0]?.id ?? null))
          if (!result?.success) setMessage('Unable to load reservations.')
          else setMessage('')
        })
        .catch(() => active && setMessage('Unable to load reservations.'))
        .finally(() => active && setLoading(false))
    }, 180)
    return () => { active = false; clearTimeout(timer) }
  }, [search, status, vehicle])

  const selected = useMemo(
    () => reservations.find((r) => r.id === selectedId) || reservations[0] || null,
    [reservations, selectedId]
  )

  const handleAction = useCallback(async (action) => {
    if (!selected) return
    setActionBusy(true)
    try {
      const result = await updateReservation(selected.id, action)
      if (result?.success && result.data) {
        setReservations((prev) => prev.map((r) => (r.id === selected.id ? result.data : r)))
        setMessage(`${result.data.code || 'Reservation'} ${action} completed.`)
      } else {
        setMessage(result?.message || 'Action failed.')
      }
    } catch (e) {
      setMessage(e?.message || 'An error occurred.')
    } finally {
      setActionBusy(false)
    }
  }, [selected])

  const stats = useMemo(() => {
    const waiting = reservations.filter((r) => safeString(r.status).toLowerCase() === 'waiting').length
    const late = reservations.filter((r) => safeString(r.status).toLowerCase() === 'late').length
    const nextWindow = reservations[1]?.window || reservations[0]?.window || '—'
    return { waiting, late, nextWindow }
  }, [reservations])

  return (
    <MainLayout>
      <div className="rsv-page">
        <nav className="rsv-breadcrumb">
          <button onClick={() => navigate(ROUTE_PATHS.dashboard)}>Dashboard</button>
          <span>/</span>
          <b>Reservation</b>
        </nav>

        <header className="rsv-heading">
          <h1>Reservation</h1>
          <p>Manage arrival windows, assigned slots and reservation check-ins.</p>
        </header>

        <section className="rsv-toolbar">
          <label>
            <span className="material-symbols-outlined">search</span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search reservation, plate or driver"
            />
          </label>
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            {STATUS_OPTIONS.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
          </select>
          <select value={vehicle} onChange={(e) => setVehicle(e.target.value)}>
            {VEHICLE_OPTIONS.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
          </select>
          <select>
            {DATE_OPTIONS.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
          </select>
          <button>
            <span className="material-symbols-outlined">download</span>
            Export
          </button>
        </section>

        {message && <div className="rsv-message">{message}</div>}

        <div className="rsv-layout">
          <section className="rsv-queue">
            <div className="rsv-card-head">
              <h2>Today's Arrival Queue</h2>
              <span>{reservations.length} reservations</span>
            </div>
            {loading ? (
              <div className="rsv-loading">Loading reservations…</div>
            ) : reservations.length === 0 ? (
              <div className="rsv-empty">No reservations match the current filters.</div>
            ) : (
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
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {reservations.map((r) => (
                    <tr
                      key={r.id}
                      className={r.id === selectedId ? 'selected' : ''}
                      onClick={() => setSelectedId(r.id)}
                    >
                      <td><b>{r.code || '—'}</b></td>
                      <td>{r.driver || '—'}</td>
                      <td><b>{r.plate || '—'}</b></td>
                      <td>{r.vehicleType || '—'}</td>
                      <td><b>{r.slot || '—'}</b></td>
                      <td>{r.window || '—'}</td>
                      <td><Badge value={r.status} /></td>
                      <td>
                        <button disabled={actionBusy}>
                          {safeString(r.status).toLowerCase() === 'pendingcheckin' ? 'Check In' : 'View'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            <section className="upcoming-strip">
              <div>
                <small>Next arrival</small>
                <strong>{stats.nextWindow}</strong>
              </div>
              <div>
                <small>Waiting</small>
                <strong>{stats.waiting}</strong>
              </div>
              <div>
                <small>Late arrivals</small>
                <strong>{stats.late}</strong>
              </div>
            </section>
          </section>

          <aside className="rsv-panel">
            <div className="rsv-card-head">
              <h2>Action Panel: Check-In</h2>
              {selected && <Badge value={selected.status} />}
            </div>
            {selected ? (
              <>
                <div className="rsv-active">
                  <small>Active reservation</small>
                  <h3>{selected.code || '—'}</h3>
                  <strong>{selected.plate || '—'}</strong>
                  <span>{selected.driver || '—'}</span>
                </div>
                <dl>
                  <div><dt>Vehicle</dt><dd>{selected.vehicleType || '—'}</dd></div>
                  <div><dt>Assigned slot</dt><dd>{selected.slot || '—'}</dd></div>
                  <div><dt>Floor / Zone</dt><dd>{selected.floorZone || '—'}</dd></div>
                  <div><dt>Arrival window</dt><dd>{selected.window || '—'}</dd></div>
                  <div><dt>Payment</dt><dd>{selected.payment || '—'}</dd></div>
                  <div><dt>Phone</dt><dd>{selected.phone || '—'}</dd></div>
                </dl>
                <div className="rsv-actions">
                  <button
                    className="primary"
                    disabled={safeString(selected.status).toLowerCase() === 'checkedin' || actionBusy}
                    onClick={() => handleAction('check-in')}
                  >
                    Check In Reservation
                  </button>
                  <button disabled={actionBusy}>Send Reminder</button>
                  <button onClick={() => navigate(ROUTE_PATHS.parkingMap)}>Change Slot</button>
                  <button className="danger" disabled={actionBusy} onClick={() => handleAction('cancel')}>
                    Cancel Reservation
                  </button>
                </div>
              </>
            ) : <p>No reservation selected.</p>}
          </aside>
        </div>

        <section className="rsv-activity">
          <div>
            <h2>Recent Activity</h2>
            <button>View full log →</button>
          </div>
          {activities.length === 0 ? (
            <div className="rsv-empty">No recent activity.</div>
          ) : (
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
                {activities.map((a) => (
                  <tr key={a.id}>
                    <td>{a.time || '—'}</td>
                    <td><b>{a.code || '—'}</b></td>
                    <td>{a.plate || '—'}</td>
                    <td>{a.action || '—'}</td>
                    <td>{a.staff || '—'}</td>
                    <td><Badge value={a.status} /></td>
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