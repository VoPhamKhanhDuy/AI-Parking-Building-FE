import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ROUTE_PATHS } from '../../routes/routePaths'
import {
  getDriverVehicles,
  getDriverParkingZones,
  simulateParkVehicle,
} from './driverService'
import DriverLayout from '../../layouts/DriverLayout'
import './ParkVehiclePage.css'

function ParkVehiclePage() {
  const navigate = useNavigate()
  const vehicles = getDriverVehicles()
  const zones = getDriverParkingZones()

  const [selectedPlate, setSelectedPlate] = useState(vehicles[0].licensePlate)
  const [gate, setGate] = useState('Entry Gate A')
  const [simulating, setSimulating] = useState(false)
  const [simResult, setSimResult] = useState(null)

  const currentVehicle = vehicles.find((v) => v.licensePlate === selectedPlate) || vehicles[0]

  const handleSimulateEntry = () => {
    setSimulating(true)
    setSimResult(null)

    setTimeout(() => {
      const res = simulateParkVehicle(currentVehicle.licensePlate, currentVehicle.vehicleType)
      setSimResult(res.session)
      setSimulating(false)
    }, 1000)
  }

  return (
    <DriverLayout>
      <div className="park-vehicle-page">
        {/* Breadcrumb Navigation */}
        <nav className="driver-breadcrumb">
          <button onClick={() => navigate(ROUTE_PATHS.driverPortal)}>Dashboard</button>
          <span>/</span>
          <b>Park Vehicle</b>
        </nav>

        {/* Page Header */}
        <header className="driver-heading">
          <div>
            <h1>Park Vehicle & AI Recommendation</h1>
            <p>Simulate vehicle arrival at Entry Gate, AI slot scoring, and parking session creation.</p>
          </div>
          <span className="gate-pill">
            <i /> Gate Online · Active
          </span>
        </header>

        {/* Workflow Diagram Card */}
        <section className="workflow-card">
          <h3>UC02 Vehicle Check-in Workflow</h3>
          <div className="workflow-steps">
            <div className="step-item active">
              <span className="step-num">1</span>
              <span>Arrive at Gate</span>
            </div>
            <span className="step-arrow">→</span>
            <div className="step-item active">
              <span className="step-num">2</span>
              <span>Staff Inputs Plate</span>
            </div>
            <span className="step-arrow">→</span>
            <div className="step-item active">
              <span className="step-num">3</span>
              <span>AI Assigns Slot</span>
            </div>
            <span className="step-arrow">→</span>
            <div className="step-item">
              <span className="step-num">4</span>
              <span>Receive Ticket</span>
            </div>
            <span className="step-arrow">→</span>
            <div className="step-item">
              <span className="step-num">5</span>
              <span>Park Vehicle</span>
            </div>
          </div>
        </section>

        <div className="park-grid">
          {/* Vehicle & Gate Simulation Panel */}
          <div className="card-panel">
            <h2><span className="material-symbols-outlined">directions_car</span> Select Vehicle & Gate</h2>

            <div className="form-group">
              <label>Select Driver Vehicle</label>
              <div className="vehicle-card-selector">
                {vehicles.map((v) => (
                  <button
                    key={v.licensePlate}
                    type="button"
                    className={`v-option ${selectedPlate === v.licensePlate ? 'selected' : ''}`}
                    onClick={() => setSelectedPlate(v.licensePlate)}
                  >
                    <span className="material-symbols-outlined">
                      {v.vehicleType === 'EV' ? 'electric_car' : v.vehicleType === 'Motorcycle' ? 'two_wheeler' : 'directions_car'}
                    </span>
                    <div>
                      <strong>{v.licensePlate}</strong>
                      <small>{v.brand} {v.model} ({v.vehicleType})</small>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>Arrival Gate</label>
              <select value={gate} onChange={(e) => setGate(e.target.value)} className="custom-select">
                <option value="Entry Gate A">Entry Gate A (Main Gate - Floor 1 & 2)</option>
                <option value="Entry Gate B">Entry Gate B (Basement & Motorcycle Lane)</option>
              </select>
            </div>

            <button
              className="btn-simulate"
              disabled={simulating}
              onClick={handleSimulateEntry}
            >
              <span className="material-symbols-outlined">smart_toy</span>
              {simulating ? 'Processing AI Slot Recommendation...' : 'Simulate Vehicle Arrival'}
            </button>
          </div>

          {/* Realtime Available Zones & AI Result Panel */}
          <div className="card-panel">
            {simResult ? (
              <div className="ai-result-box">
                <div className="result-header">
                  <span className="badge-ai"><span className="material-symbols-outlined">bolt</span> AI Match: {simResult.aiConfidence}</span>
                  <h3>AI Recommended Parking Spot</h3>
                </div>

                <div className="slot-hero">
                  <div className="slot-id-badge">{simResult.recommendedSlot}</div>
                  <div className="slot-meta">
                    <strong>{simResult.floorZone}</strong>
                    <p>Optimized for fast elevator walking distance & vehicle type ({simResult.vehicleType})</p>
                  </div>
                </div>

                <div className="session-summary-list">
                  <div className="summary-row">
                    <span>Ticket Code</span>
                    <strong>{simResult.ticketCode}</strong>
                  </div>
                  <div className="summary-row">
                    <span>License Plate</span>
                    <strong>{simResult.licensePlate}</strong>
                  </div>
                  <div className="summary-row">
                    <span>Entry Gate</span>
                    <strong>{gate}</strong>
                  </div>
                  <div className="summary-row">
                    <span>Entry Time</span>
                    <strong>{simResult.entryTime}</strong>
                  </div>
                </div>

                <div className="action-row">
                  <button
                    className="btn-primary-full"
                    onClick={() => navigate(ROUTE_PATHS.driverReceiveTicket)}
                  >
                    <span className="material-symbols-outlined">qr_code_2</span> Accept & View Digital Ticket
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <h2><span className="material-symbols-outlined">map</span> Realtime Parking Zones</h2>
                <div className="zones-list">
                  {zones.map((z) => (
                    <div key={z.id} className="zone-item">
                      <div className="zone-info">
                        <strong>{z.floor} - {z.zone}</strong>
                        <small>Rate: {z.rate} {z.evCharging && '· ⚡ EV Charger Available'}</small>
                      </div>
                      <div className="zone-availability">
                        <span className="avail-num">{z.availableSlots}</span>
                        <small>slots free</small>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DriverLayout>
  )
}

export default ParkVehiclePage
