import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ROUTE_PATHS } from '../../routes/routePaths'
import {
  getDriverVehicles,
  getDriverReservations,
  makeReservation,
} from './driverService'
import DriverLayout from '../../layouts/DriverLayout'
import './DriverReservationPage.css'

function DriverReservationPage() {
  const navigate = useNavigate()
  const vehicles = getDriverVehicles()
  const [reservations, setReservations] = useState(getDriverReservations())

  const [selectedPlate, setSelectedPlate] = useState(vehicles[0].licensePlate)
  const [date, setDate] = useState('2026-07-23')
  const [timeWindow, setTimeWindow] = useState('09:00 - 18:00')
  const [slot, setSlot] = useState('EV-04')
  const [floorZone, setFloorZone] = useState('Floor 1 · Zone C (EV Fast Charge)')
  const [notes, setNotes] = useState('')

  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState('')

  const handleBooking = (e) => {
    e.preventDefault()
    setSubmitting(true)
    setMessage('')

    setTimeout(() => {
      const selectedVehicle = vehicles.find((v) => v.licensePlate === selectedPlate)
      const res = makeReservation({
        licensePlate: selectedPlate,
        vehicleType: selectedVehicle?.vehicleType || 'Car',
        date,
        timeWindow,
        slot,
        floorZone,
        notes,
      })

      if (res.success) {
        setReservations((prev) => [res.reservation, ...prev])
        setMessage(res.message)
      } else {
        setMessage(res.message)
      }
      setSubmitting(false)
    }, 1000)
  }

  return (
    <DriverLayout>
      <div className="driver-reservation-page">
        {/* Breadcrumb Navigation */}
        <nav className="driver-breadcrumb">
          <button onClick={() => navigate(ROUTE_PATHS.driverPortal)}>Dashboard</button>
          <span>/</span>
          <b>Reservation</b>
        </nav>

        {/* Page Header */}
        <header className="driver-heading">
          <div>
            <h1>Make Spot Reservation</h1>
            <p>Book your preferred parking space in advance. Slot status will be updated to Reserved instantly.</p>
          </div>
          <span className="gate-pill">
            <i /> Advance Booking
          </span>
        </header>

        <div className="res-grid">
          {/* Reservation Booking Form */}
          <div className="card-panel">
            <h2><span className="material-symbols-outlined">event_available</span> Reserve Parking Spot</h2>

            <form onSubmit={handleBooking}>
              <div className="form-group">
                <label>Select Vehicle</label>
                <select value={selectedPlate} onChange={(e) => setSelectedPlate(e.target.value)} className="custom-select">
                  {vehicles.map((v) => (
                    <option key={v.licensePlate} value={v.licensePlate}>
                      {v.licensePlate} ({v.brand} {v.model})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Arrival Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="custom-input"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Time Window</label>
                  <select value={timeWindow} onChange={(e) => setTimeWindow(e.target.value)} className="custom-select">
                    <option value="08:00 - 12:00">08:00 - 12:00 (Morning)</option>
                    <option value="09:00 - 18:00">09:00 - 18:00 (Full Work Day)</option>
                    <option value="14:00 - 18:00">14:00 - 18:00 (Afternoon)</option>
                    <option value="18:00 - 23:00">18:00 - 23:00 (Evening)</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Preferred Slot & Zone</label>
                <select
                  value={slot}
                  onChange={(e) => {
                    setSlot(e.target.value)
                    if (e.target.value.startsWith('EV')) {
                      setFloorZone('Floor 1 · Zone C (EV Fast Charge)')
                    } else {
                      setFloorZone('Floor 2 · Zone B')
                    }
                  }}
                  className="custom-select"
                >
                  <option value="EV-04">Slot EV-04 (Floor 1 · Zone C Fast Charge)</option>
                  <option value="EV-05">Slot EV-05 (Floor 1 · Zone C Fast Charge)</option>
                  <option value="B2-18">Slot B2-18 (Floor 2 · Zone B Standard Car)</option>
                  <option value="B3-22">Slot B3-22 (Floor 3 · Zone B Standard Car)</option>
                </select>
              </div>

              <div className="form-group">
                <label>Special Notes (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. EV Charger requested, wide parking spot needed"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="custom-input"
                />
              </div>

              <div className="deposit-info-box">
                <div>
                  <small>Reservation Deposit</small>
                  <strong>20,000đ (Deducted from final parking fee)</strong>
                </div>
              </div>

              <button type="submit" className="btn-book-spot" disabled={submitting}>
                <span className="material-symbols-outlined">calendar_add_on</span>
                {submitting ? 'Creating Reservation...' : 'Confirm & Reserve Spot Now'}
              </button>

              {message && <p className="form-msg">{message}</p>}
            </form>
          </div>

          {/* Active & Historical Reservations */}
          <div className="card-panel">
            <h2><span className="material-symbols-outlined">format_list_bulleted</span> Active Reservations</h2>

            <div className="reservations-list">
              {reservations.map((r) => (
                <div key={r.id} className="res-card-item">
                  <div className="res-card-top">
                    <div>
                      <strong>{r.code}</strong>
                      <span className="res-slot-pill">Slot {r.slot}</span>
                    </div>
                    <span className={`res-status ${r.status.toLowerCase().replace(' ', '-')}`}>{r.status}</span>
                  </div>
                  <p className="res-location">{r.floorZone}</p>
                  <hr />
                  <div className="res-meta-row">
                    <span>📅 Date: {r.date}</span>
                    <span>⏰ Window: {r.timeWindow}</span>
                    <span>🚗 Plate: {r.licensePlate}</span>
                  </div>
                  {r.qrCodeUrl && (
                    <div className="res-qr-preview">
                      <img src={r.qrCodeUrl} alt="Reservation Check-in QR" />
                      <small>Present QR at entry barrier upon arrival</small>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DriverLayout>
  )
}

export default DriverReservationPage
