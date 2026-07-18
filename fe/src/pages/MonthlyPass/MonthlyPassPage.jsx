import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import MainLayout from '../../layouts/MainLayout'
import { ROUTE_PATHS } from '../../routes/routePaths'
import {
  createMonthlyPass,
  getMonthlyPasses,
  renewMonthlyPass,
  requestPassSuspension,
  updateMonthlyPassVehicle,
  verifyMonthlyPass
} from './monthlyPassService'
import './MonthlyPassPage.css'

// Constants
const EMPTY_FORM = { driver: '', licensePlate: '', vehicleType: 'Car' }
const STATUS_OPTIONS = ['All Statuses', 'Active', 'Expiring Soon', 'Pending Approval', 'Expired']
const VEHICLE_TYPE_OPTIONS = ['All Types', 'Car', 'Motorcycle', 'EV']
const DATE_FILTER_OPTIONS = ['This Month', 'Next 30 Days', 'Expired']

// Badge helper
const getBadgeClass = (value) => `monthly-pass-badge ${value.toLowerCase().replaceAll(' ', '-')}`

function StatusBadge({ value }) {
  return <span className={getBadgeClass(value)}>{value}</span>
}

function MonthlyPassPage() {
  const navigate = useNavigate()
  const [data, setData] = useState({ stats: {}, passes: [], activities: [] })
  const [selectedId, setSelectedId] = useState(null)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('All Statuses')
  const [vehicleType, setVehicleType] = useState('All Types')
  const [message, setMessage] = useState('')
  const [dialog, setDialog] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)

  // Fetch passes with debounce
  useEffect(() => {
    let cancelled = false
    let timeoutId

    const fetchData = async () => {
      try {
        const result = await getMonthlyPasses({ search, status, vehicleType })
        if (!cancelled) {
          setData(result)
          // Keep selected if still exists, otherwise select first
          setSelectedId((current) =>
            result.passes.some((item) => item.id === current) ? current : result.passes[0]?.id
          )
        }
      } catch {
        if (!cancelled) {
          setMessage('Unable to load monthly passes.')
        }
      }
    }

    timeoutId = setTimeout(fetchData, 160)
    return () => {
      cancelled = true
      clearTimeout(timeoutId)
    }
  }, [search, status, vehicleType])

  // Clear message after delay
  useEffect(() => {
    if (!message) return
    const timer = setTimeout(() => setMessage(''), 2800)
    return () => clearTimeout(timer)
  }, [message])

  const selected = data.passes.find((item) => item.id === selectedId) || data.passes[0]

  const replacePass = useCallback((updated) => {
    setData((current) => ({
      ...current,
      passes: current.passes.map((item) => (item.id === updated.id ? updated : item))
    }))
  }, [])

  const runAction = useCallback(async (action, successMessage) => {
    if (!selected) return
    try {
      const updated = await action(selected.id)
      if (updated.id) {
        replacePass(updated)
      }
      setMessage(successMessage)
    } catch (error) {
      setMessage(error.message)
    }
  }, [selected, replacePass])

  const openCreate = useCallback(() => {
    setForm(EMPTY_FORM)
    setDialog('create')
  }, [])

  const openUpdate = useCallback(() => {
    if (!selected) return
    setForm({
      driver: selected.driver,
      licensePlate: selected.licensePlate,
      vehicleType: selected.vehicleType
    })
    setDialog('update')
  }, [selected])

  const submitForm = useCallback(async (event) => {
    event.preventDefault()
    try {
      if (dialog === 'create') {
        const created = await createMonthlyPass(form)
        setData((current) => ({ ...current, passes: [created, ...current.passes] }))
        setSelectedId(created.id)
        setMessage(`${created.passCode} submitted for manager approval.`)
      } else {
        const updated = await updateMonthlyPassVehicle(selected.id, form)
        replacePass(updated)
        setMessage(`Vehicle information for ${updated.passCode} updated.`)
      }
      setDialog(null)
    } catch (error) {
      setMessage(error.message)
    }
  }, [dialog, form, selected, replacePass])

  const handleSuspension = useCallback(async () => {
    if (!selected) return
    try {
      const request = await requestPassSuspension(selected.id)
      setMessage(`${request.requestId} sent for manager approval.`)
    } catch (error) {
      setMessage(error.message)
    }
  }, [selected])

  const closeDialog = useCallback(() => setDialog(null), [])

  const stats = [
    ['Active Passes', data.stats.activePasses],
    ['Expiring Soon', data.stats.expiringSoon],
    ['Pending Approval', data.stats.pendingApproval],
    ['Verified Today', data.stats.verifiedToday],
    ['Expired Passes', data.stats.expiredPasses]
  ]

  return (
    <MainLayout>
      <div className="monthly-pass-page">
        <nav className="monthly-pass-breadcrumb">
          <button onClick={() => navigate(ROUTE_PATHS.dashboard)}>Dashboard</button>
          <span>/</span>
          <b>Monthly Pass</b>
        </nav>

        <header className="monthly-pass-heading">
          <div>
            <h1>Monthly Pass Processing</h1>
            <p>
              Search, verify, create, renew, and update monthly parking passes
              for customer service operations.
            </p>
          </div>
          <span><i />Staff workspace</span>
        </header>

        <section className="monthly-pass-stats">
          {stats.map(([label, value]) => (
            <article key={label}>
              <small>{label}</small>
              <strong>{value ?? '—'}</strong>
            </article>
          ))}
        </section>

        <section className="monthly-pass-filters">
          <label>
            <span className="material-symbols-outlined">search</span>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search pass code, license plate, or driver name"
            />
          </label>
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
          <select value={vehicleType} onChange={(e) => setVehicleType(e.target.value)}>
            {VEHICLE_TYPE_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
          <select defaultValue="This Month">
            {DATE_FILTER_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
          <button className="create-pass" onClick={openCreate}>
            <span className="material-symbols-outlined">add</span>
            Create New Pass
          </button>
        </section>

        {message && (
          <div className="monthly-pass-message" role="status">
            {message}
          </div>
        )}

        <div className="monthly-pass-layout">
          <PassList
            passes={data.passes}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
          <aside className="monthly-pass-side">
            <PassDetail
              selected={selected}
              onVerify={() => runAction(verifyMonthlyPass, `${selected?.passCode} verified successfully.`)}
              onRenew={() => runAction(renewMonthlyPass, `${selected?.passCode} renewed through 2026-08-31.`)}
              onUpdate={openUpdate}
              onSuspension={handleSuspension}
            />
            <ServicePanel
              selected={selected}
              onCreate={openCreate}
              onRenew={() => runAction(renewMonthlyPass, `${selected?.passCode} renewed through 2026-08-31.`)}
              onUpdate={openUpdate}
              onSuspension={handleSuspension}
            />
            <section className="staff-scope-card">
              <h2>Staff Permission Scope</h2>
              <ul>
                <li>Verify, create, renew, and update pass information.</li>
                <li>Pricing rules cannot be changed by Staff.</li>
                <li>Passes cannot be suspended directly.</li>
                <li>Special cases require manager approval.</li>
              </ul>
            </section>
          </aside>
        </div>

        <ActivitySection activities={data.activities} />

        {dialog && (
          <PassModal
            dialog={dialog}
            form={form}
            setForm={setForm}
            selected={selected}
            onSubmit={submitForm}
            onClose={closeDialog}
          />
        )}
      </div>
    </MainLayout>
  )
}

function PassList({ passes, selectedId, onSelect }) {
  return (
    <section className="monthly-pass-list">
      <header>
        <div>
          <h2>Monthly Pass List</h2>
          <p>Showing {passes.length} passes</p>
        </div>
      </header>

      <div className="monthly-pass-table-wrap">
        <table>
          <thead>
            <tr>
              <th>Pass Code</th>
              <th>License Plate</th>
              <th>Driver</th>
              <th>Vehicle Type</th>
              <th>Valid Until</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {passes.map((item) => (
              <tr
                key={item.id}
                className={item.id === selectedId ? 'selected' : ''}
                onClick={() => onSelect(item.id)}
              >
                <td><b>{item.passCode}</b></td>
                <td><strong>{item.licensePlate}</strong></td>
                <td>{item.driver}</td>
                <td>{item.vehicleType}</td>
                <td>{item.validUntil}</td>
                <td><StatusBadge value={item.status} /></td>
                <td>
                  <button onClick={(e) => { e.stopPropagation(); onSelect(item.id) }}>
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!passes.length && (
          <div className="monthly-pass-empty">
            No monthly passes match the current filters.
          </div>
        )}
      </div>
    </section>
  )
}

function PassDetail({ selected, onVerify, onRenew, onUpdate, onSuspension }) {
  if (!selected) {
    return (
      <section className="monthly-pass-detail">
        <header>
          <div>
            <small>Monthly Pass Detail</small>
            <h2>No pass selected</h2>
          </div>
        </header>
      </section>
    )
  }

  return (
    <section className="monthly-pass-detail">
      <header>
        <div>
          <small>Monthly Pass Detail</small>
          <h2>{selected.passCode}</h2>
        </div>
        <StatusBadge value={selected.status} />
      </header>

      <div className="monthly-pass-vehicle">
        <span className="material-symbols-outlined">directions_car</span>
        <div>
          <strong>{selected.licensePlate}</strong>
          <small>{selected.driver}</small>
        </div>
      </div>

      <dl>
        <div><dt>Vehicle Type</dt><dd>{selected.vehicleType}</dd></div>
        <div><dt>Pass Type</dt><dd>{selected.passType}</dd></div>
        <div><dt>Validity</dt><dd>{selected.validFrom} to {selected.validUntil}</dd></div>
        <div><dt>Status</dt><dd><span className="paid-dot" />{selected.status} / {selected.paymentStatus}</dd></div>
        <div><dt>Assigned Location</dt><dd>{selected.assignedLocation}</dd></div>
        <div><dt>Last Verified</dt><dd>{selected.lastVerified}</dd></div>
      </dl>

      <div className="monthly-pass-actions">
        <button className="primary" onClick={onVerify}>Verify Pass</button>
        <button onClick={onRenew}>Renew Pass</button>
        <button onClick={onUpdate}>Update Vehicle</button>
        <button>View Entry History</button>
        <button className="request" onClick={onSuspension}>Request Suspension</button>
        <p>Manager approval is required for suspension.</p>
      </div>
    </section>
  )
}

function ServicePanel({ selected, onCreate, onRenew, onUpdate, onSuspension }) {
  return (
    <section className="pass-service-panel">
      <header>
        <h2>Pass Service Actions</h2>
        <p>Standard customer service tasks</p>
      </header>
      <div>
        <button onClick={onCreate}>Create New Monthly Pass</button>
        <button
          onClick={() => selected && onRenew()}
          disabled={!selected}
        >
          Renew Existing Pass
        </button>
        <button onClick={onUpdate} disabled={!selected}>Update Vehicle Information</button>
        <button onClick={onSuspension} disabled={!selected}>
          Submit Manager Approval Request
        </button>
      </div>
      <p>
        Staff can process standard services. Suspension, price changes,
        and special approvals require manager review.
      </p>
    </section>
  )
}

function ActivitySection({ activities }) {
  return (
    <section className="monthly-pass-activity">
      <header>
        <div>
          <h2>Recent Monthly Pass Activity</h2>
          <p>Latest pass services handled during the current shift</p>
        </div>
      </header>
      <div className="monthly-pass-table-wrap">
        <table>
          <thead>
            <tr>
              <th>Time</th>
              <th>Pass Code</th>
              <th>License Plate</th>
              <th>Action</th>
              <th>Staff</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {activities.map((item) => (
              <tr key={item.id}>
                <td>{item.time}</td>
                <td><b>{item.passCode}</b></td>
                <td>{item.licensePlate}</td>
                <td>{item.action}</td>
                <td>{item.staff}</td>
                <td><StatusBadge value={item.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

function PassModal({ dialog, form, setForm, selected, onSubmit, onClose }) {
  const handleBackdropClick = (event) => {
    if (event.target === event.currentTarget) {
      onClose()
    }
  }

  return (
    <div
      className="monthly-pass-modal-backdrop"
      role="presentation"
      onMouseDown={handleBackdropClick}
    >
      <section className="monthly-pass-modal" role="dialog" aria-modal="true">
        <header>
          <div>
            <h2>
              {dialog === 'create' ? 'Create New Monthly Pass' : 'Update Vehicle Information'}
            </h2>
            <p>
              {dialog === 'create'
                ? 'Submit a standard monthly pass for processing.'
                : `Update the vehicle assigned to ${selected?.passCode}.`}
            </p>
          </div>
          <button onClick={onClose} aria-label="Close">
            <span className="material-symbols-outlined">close</span>
          </button>
        </header>

        <form onSubmit={onSubmit}>
          {dialog === 'create' && (
            <label>
              Driver Name
              <input
                value={form.driver}
                onChange={(e) => setForm((current) => ({ ...current, driver: e.target.value }))}
                required
              />
            </label>
          )}

          <label>
            License Plate
            <input
              value={form.licensePlate}
              onChange={(e) => setForm((current) => ({ ...current, licensePlate: e.target.value }))}
              required
            />
          </label>

          <label>
            Vehicle Type
            <select
              value={form.vehicleType}
              onChange={(e) => setForm((current) => ({ ...current, vehicleType: e.target.value }))}
            >
              <option>Car</option>
              <option>Motorcycle</option>
              <option>EV</option>
            </select>
          </label>

          <p>New passes and special changes may require manager approval.</p>

          <div>
            <button type="button" onClick={onClose}>Cancel</button>
            <button className="submit" type="submit">
              {dialog === 'create' ? 'Submit Pass' : 'Save Vehicle'}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}

export default MonthlyPassPage
