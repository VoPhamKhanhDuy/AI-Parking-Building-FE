import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import MainLayout from '../../layouts/MainLayout'
import { ROUTE_PATHS } from '../../routes/routePaths'
import { getReservations, updateReservation } from './reservationService'
import './ReservationPage.css'

// Badge component for status display
function Badge({ value }) {
  const className = `rsv-badge ${value.toLowerCase().replaceAll(' ', '-')}`
  return <span className={className}>{value}</span>
}

// Status options
const STATUS_OPTIONS = [
  'All Statuses',
  'Pending Check-in',
  'Checked In',
  'Waiting',
  'Late Arrival',
  'Paid'
]

// Vehicle type options
const VEHICLE_OPTIONS = ['All Vehicles', 'Car', 'Motorcycle', 'Electric Vehicle']

// Date options
const DATE_OPTIONS = ['Today', 'Tomorrow']

function ReservationPage() {
  const navigate = useNavigate()
  const [reservations, setReservations] = useState([])
  const [activities, setActivities] = useState([])
  const [selectedId, setSelectedId] = useState(null)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('All Statuses')
  const [vehicle, setVehicle] = useState('All Vehicles')
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // Fetch reservations with debounce
  useEffect(() => {
    let cancelled = false
    let timeoutId

    const fetchData = async () => {
      try {
        const result = await getReservations({ search, status, vehicle })
        if (!cancelled) {
          if (result.success) {
            setReservations(result.data.reservations || [])
            setActivities(result.data.activities || [])
            // Select first reservation if none selected
            setSelectedId((prev) => prev || result.data.reservations?.[0]?.id)
          } else {
            setMessage('Unable to load reservations.')
          }
        }
      } catch {
        if (!cancelled) {
          setMessage('Unable to load reservations.')
        }
      }
    }

    timeoutId = setTimeout(fetchData, 180)
    return () => {
      cancelled = true
      clearTimeout(timeoutId)
    }
  }, [search, status, vehicle])

  const selected = reservations.find((r) => r.id === selectedId) || reservations[0]

  const handleAction = useCallback(async (action) => {
    if (!selected) return

    setIsLoading(true)
    try {
      const result = await updateReservation(selected.id, action)
      if (result.success) {
        setReservations((prev) =>
          prev.map((r) => (r.id === selected.id ? result.data : r))
        )
        setMessage(`${result.data.code} updated successfully.`)
      } else {
        setMessage(result.message || 'Action failed.')
      }
    } catch (e) {
      setMessage(e.message || 'An error occurred.')
    } finally {
      setIsLoading(false)
    }
  }, [selected])

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
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
          <select value={vehicle} onChange={(e) => setVehicle(e.target.value)}>
            {VEHICLE_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
          <select>
            {DATE_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
          <button>
            <span className="material-symbols-outlined">download</span>
            Export
          </button>
        </section>

        {message && <div className="rsv-message">{message}</div>}

        <div className="rsv-layout">
          <ReservationQueue
            reservations={reservations}
            selectedId={selectedId}
            onSelect={setSelectedId}
            onAction={handleAction}
            isLoading={isLoading}
          />
          <ActionPanel
            selected={selected}
            onAction={handleAction}
            onNavigate={navigate}
            isLoading={isLoading}
          />
        </div>

        <ActivitySection activities={activities} />
      </div>
    </MainLayout>
  )
}

function ReservationQueue({ reservations, selectedId, onSelect, isLoading }) {
  const waitingCount = reservations.filter((r) => r.status === 'Waiting').length
  const lateCount = reservations.filter((r) => r.status === 'Late Arrival').length

  return (
    <main className="rsv-queue">
      <div className="rsv-card-head">
        <h2>Today's Arrival Queue</h2>
        <span>{reservations.length} reservations</span>
      </div>

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
              onClick={() => onSelect(r.id)}
            >
              <td><b>{r.code}</b></td>
              <td>{r.driver}</td>
              <td><b>{r.plate}</b></td>
              <td>{r.vehicleType}</td>
              <td><b>{r.slot}</b></td>
              <td>{r.window}</td>
              <td><Badge value={r.status} /></td>
              <td>
                <button disabled={isLoading}>
                  {r.status === 'Pending Check-in' ? 'Check In' : 'View'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <section className="upcoming-strip">
        <div>
          <small>Next arrival</small>
          <strong>{reservations[1]?.window || '—'}</strong>
        </div>
        <div>
          <small>Waiting</small>
          <strong>{waitingCount}</strong>
        </div>
        <div>
          <small>Late arrivals</small>
          <strong>{lateCount}</strong>
        </div>
      </section>
    </main>
  )
}

function ActionPanel({ selected, onAction, onNavigate, isLoading }) {
  return (
    <aside className="rsv-panel">
      <div className="rsv-card-head">
        <h2>Action Panel: Check-In</h2>
        {selected && <Badge value={selected.status} />}
      </div>

      {selected ? (
        <>
          <div className="rsv-active">
            <small>Active reservation</small>
            <h3>{selected.code}</h3>
            <strong>{selected.plate}</strong>
            <span>{selected.driver}</span>
          </div>

          <dl>
            <div>
              <dt>Vehicle</dt>
              <dd>{selected.vehicleType}</dd>
            </div>
            <div>
              <dt>Assigned slot</dt>
              <dd>{selected.slot}</dd>
            </div>
            <div>
              <dt>Floor / Zone</dt>
              <dd>{selected.floorZone}</dd>
            </div>
            <div>
              <dt>Arrival window</dt>
              <dd>{selected.window}</dd>
            </div>
            <div>
              <dt>Payment</dt>
              <dd>{selected.payment}</dd>
            </div>
            <div>
              <dt>Phone</dt>
              <dd>{selected.phone}</dd>
            </div>
          </dl>

          <div className="rsv-actions">
            <button
              className="primary"
              disabled={selected.status === 'Checked In' || isLoading}
              onClick={() => onAction('check-in')}
            >
              Check In Reservation
            </button>
            <button disabled={isLoading}>Send Reminder</button>
            <button onClick={() => onNavigate(ROUTE_PATHS.parkingMap)}>
              Change Slot
            </button>
            <button className="danger" onClick={() => onAction('cancel')}>
              Cancel Reservation
            </button>
          </div>
        </>
      ) : (
        <p>No reservation selected.</p>
      )}
    </aside>
  )
}

function ActivitySection({ activities }) {
  return (
    <section className="rsv-activity">
      <div>
        <h2>Recent Activity</h2>
        <button>View full log →</button>
      </div>
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
              <td>{a.time}</td>
              <td><b>{a.code}</b></td>
              <td>{a.plate}</td>
              <td>{a.action}</td>
              <td>{a.staff}</td>
              <td><Badge value={a.status} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  )
}

export default ReservationPage
