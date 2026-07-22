import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ROUTE_PATHS } from '../../routes/routePaths'
import {
  getDriverVehicles,
  getDriverPassPackages,
  getDriverMonthlyPasses,
  registerMonthlyPass,
} from './driverService'
import DriverLayout from '../../layouts/DriverLayout'
import './DriverMonthlyPassPage.css'

function DriverMonthlyPassPage() {
  const navigate = useNavigate()
  const vehicles = getDriverVehicles()
  const packages = getDriverPassPackages()
  const [activePasses, setActivePasses] = useState(getDriverMonthlyPasses())

  const [selectedPlate, setSelectedPlate] = useState(vehicles[0].licensePlate)
  const [selectedPkg, setSelectedPkg] = useState(packages[0].id)
  const [autoRenew, setAutoRenew] = useState(true)

  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState('')

  const handleRegister = (e) => {
    e.preventDefault()
    setSubmitting(true)
    setMessage('')

    setTimeout(() => {
      const res = registerMonthlyPass({
        licensePlate: selectedPlate,
        packageId: selectedPkg,
        autoRenew,
      })

      if (res.success) {
        setActivePasses((prev) => [res.pass, ...prev])
        setMessage(res.message)
      } else {
        setMessage(res.message)
      }
      setSubmitting(false)
    }, 1000)
  }

  return (
    <DriverLayout>
      <div className="driver-monthly-pass-page">
        {/* Breadcrumb Navigation */}
        <nav className="driver-breadcrumb">
          <button onClick={() => navigate(ROUTE_PATHS.driverPortal)}>Dashboard</button>
          <span>/</span>
          <b>Monthly Pass</b>
        </nav>

        {/* Page Header */}
        <header className="driver-heading">
          <div>
            <h1>Register Monthly Pass</h1>
            <p>Subscribe to monthly parking passes with unlimited entry & exit access for registered vehicles.</p>
          </div>
          <span className="gate-pill">
            <i /> Pass Subscriptions
          </span>
        </header>

        {/* Package Tiers Grid */}
        <section className="packages-grid">
          {packages.map((pkg) => (
            <div key={pkg.id} className={`package-card ${pkg.id === selectedPkg ? 'selected' : ''}`}>
              {pkg.popular && <span className="popular-badge">Most Popular</span>}
              <div className="pkg-header">
                <h3>{pkg.name}</h3>
                <span className="pkg-price">{pkg.price.toLocaleString()}đ <small>{pkg.unit}</small></span>
              </div>
              <ul className="perks-list">
                {pkg.perks.map((perk, idx) => (
                  <li key={idx}><span className="material-symbols-outlined">check_circle</span> {perk}</li>
                ))}
              </ul>
              <button
                type="button"
                className={`btn-select-pkg ${pkg.id === selectedPkg ? 'active' : ''}`}
                onClick={() => setSelectedPkg(pkg.id)}
              >
                {pkg.id === selectedPkg ? 'Selected Plan' : 'Select Plan'}
              </button>
            </div>
          ))}
        </section>

        {/* Application Form & Active Passes Layout */}
        <div className="pass-form-grid">
          {/* Subscription Application Form */}
          <div className="card-panel">
            <h2><span className="material-symbols-outlined">badge</span> Monthly Pass Application</h2>

            <form onSubmit={handleRegister}>
              <div className="form-group">
                <label>Select Vehicle</label>
                <select value={selectedPlate} onChange={(e) => setSelectedPlate(e.target.value)} className="custom-select">
                  {vehicles.map((v) => (
                    <option key={v.licensePlate} value={v.licensePlate}>
                      {v.licensePlate} ({v.brand} {v.model} - {v.vehicleType})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Selected Package</label>
                <select value={selectedPkg} onChange={(e) => setSelectedPkg(e.target.value)} className="custom-select">
                  {packages.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.price.toLocaleString()}đ/month)
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={autoRenew}
                    onChange={(e) => setAutoRenew(e.target.checked)}
                  />
                  <span>Auto-renew monthly pass before expiration</span>
                </label>
              </div>

              <button type="submit" className="btn-submit-pass" disabled={submitting}>
                <span className="material-symbols-outlined">add_task</span>
                {submitting ? 'Submitting Application...' : 'Submit Monthly Pass Request'}
              </button>

              {message && <p className="form-msg">{message}</p>}
            </form>
          </div>

          {/* Active Subscriptions List */}
          <div className="card-panel">
            <h2><span className="material-symbols-outlined">card_membership</span> My Monthly Subscriptions</h2>

            <div className="passes-list">
              {activePasses.map((pass) => (
                <div key={pass.id} className="pass-card-item">
                  <div className="pass-top">
                    <div>
                      <strong>{pass.passCode}</strong>
                      <p>{pass.package}</p>
                    </div>
                    <span className={`pass-status ${pass.status.toLowerCase().replace(' ', '-')}`}>{pass.status}</span>
                  </div>
                  <hr />
                  <div className="pass-meta-grid">
                    <div>
                      <small>Vehicle Plate</small>
                      <strong>{pass.licensePlate}</strong>
                    </div>
                    <div>
                      <small>Assigned Zone</small>
                      <strong>{pass.assignedZone}</strong>
                    </div>
                    <div>
                      <small>Valid Period</small>
                      <strong>{pass.validFrom} → {pass.validUntil}</strong>
                    </div>
                    <div>
                      <small>Auto Renew</small>
                      <strong>{pass.autoRenew ? 'Enabled' : 'Disabled'}</strong>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DriverLayout>
  )
}

export default DriverMonthlyPassPage
