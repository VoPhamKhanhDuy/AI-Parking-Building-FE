import { useEffect, useMemo, useState, useCallback } from 'react'
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

const EMPTY_FORM = { driver: '', licensePlate: '', vehicleType: 'Car' }
const STATUS_OPTIONS = ['All Statuses', 'Active', 'Expiring Soon', 'Pending Approval', 'Expired']
const VEHICLE_TYPE_OPTIONS = ['All Types', 'Car', 'Motorcycle', 'EV']
const DATE_FILTER_OPTIONS = ['This Month', 'Next 30 Days', 'Expired']

function StatusBadge({ value }) {
  const raw = String(value ?? '—')
  const safe = raw.toLowerCase().replaceAll(' ', '-')
  return <span className={`monthly-pass-badge ${safe}`}>{raw}</span>
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
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    const timer = setTimeout(() => {
      getMonthlyPasses({ search, status, vehicleType })
        .then((result) => {
          if (!active) return
          const passes = Array.isArray(result?.data?.passes) ? result.data.passes : []
          const stats = result?.data?.stats && Object.keys(result.data.stats).length > 0
            ? result.data.stats
            : deriveStats(passes)
          setData({ stats, passes, activities: result?.data?.activities || [] })
          setSelectedId((current) => current && passes.some((p) => p.id === current)
            ? current
            : (passes[0]?.id ?? null))
          setLoading(false)
          if (!result?.success) setMessage('Unable to load monthly passes.')
          else setMessage('')
        })
        .catch(() => {
          if (active) {
            setMessage('Unable to load monthly passes.')
            setLoading(false)
          }
        })
    }, 180)
    return () => { active = false; clearTimeout(timer) }
  }, [search, status, vehicleType])

  useEffect(() => {
    if (!message) return undefined
    const timer = setTimeout(() => setMessage(''), 2800)
    return () => clearTimeout(timer)
  }, [message])

  const selected = useMemo(
    () => data.passes.find((item) => item.id === selectedId) || data.passes[0] || null,
    [data.passes, selectedId]
  )

  const replacePass = useCallback((updated) => {
    setData((current) => ({
      ...current,
      passes: current.passes.map((item) => (item.id === updated.id ? updated : item))
    }))
  }, [])

  const runAction = useCallback(async (action, successMessage) => {
    if (!selected) return
    try {
      const result = await action(selected.id)
      const updated = result?.data
      if (updated?.id) replacePass(updated)
      setMessage(updated?.id ? successMessage : (result?.message || 'Action failed.'))
    } catch (error) {
      setMessage(error?.message || 'Action failed.')
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
        const result = await createMonthlyPass(form)
        if (result?.success && result.data) {
          setData((current) => ({ ...current, passes: [result.data, ...current.passes] }))
          setSelectedId(result.data.id)
          setMessage(`${result.data.passCode} submitted for manager approval.`)
        } else {
          setMessage(result?.message || 'Failed to create pass.')
          return
        }
      } else {
        const result = await updateMonthlyPassVehicle(selected.id, form)
        if (result?.success && result.data) {
          replacePass(result.data)
          setMessage(`Vehicle information for ${result.data.passCode} updated.`)
        } else {
          setMessage(result?.message || 'Failed to update pass.')
          return
        }
      }
      setDialog(null)
    } catch (error) {
      setMessage(error?.message || 'Save failed.')
    }
  }, [dialog, form, selected, replacePass])

  const handleSuspension = useCallback(async () => {
    if (!selected) return
    try {
      const result = await requestPassSuspension(selected.id, 'Staff request')
      setMessage(result?.data?.requestId
        ? `${result.data.requestId} sent for manager approval.`
        : result?.message || 'Suspension request failed.')
    } catch (error) {
      setMessage(error?.message || 'Suspension request failed.')
    }
  }, [selected])

  const closeDialog = useCallback(() => setDialog(null), [])

  const stats = useMemo(() => {
    const base = data.stats || {}
    const fallback = deriveStats(data.passes)
    return [
      ['Active Passes', base.activePasses ?? fallback.active],
      ['Expiring Soon', base.expiringSoon ?? fallback.expiring],
      ['Pending Approval', base.pendingApproval ?? fallback.pending],
      ['Verified Today', base.verifiedToday ?? fallback.verified],
      ['Expired Passes', base.expiredPasses ?? fallback.expired]
    ]
  }, [data])

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
            <p>Search, verify, create, renew, and update monthly parking passes for customer service operations.</p>
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
            {STATUS_OPTIONS.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
          </select>
          <select value={vehicleType} onChange={(e) => setVehicleType(e.target.value)}>
            {VEHICLE_TYPE_OPTIONS.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
          </select>
          <select defaultValue="This Month">
            {DATE_FILTER_OPTIONS.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
          </select>
          <button className="create-pass" onClick={openCreate}>
            <span className="material-symbols-outlined">add</span>
            Create New Pass
          </button>
        </section>

        {message && <div className="monthly-pass-message" role="status">{message}</div>}

        <div className="monthly-pass-layout">
          <PassList passes={data.passes} selectedId={selectedId} onSelect={setSelectedId} loading={loading} />
          <aside className="monthly-pass-side">
            <PassDetail
              selected={selected}
              onVerify={() => runAction(verifyMonthlyPass, `${selected?.passCode} verified successfully.`)}
              onRenew={() => runAction(renewMonthlyPass, `${selected?.passCode} renewed successfully.`)}
              onUpdate={openUpdate}
              onSuspension={handleSuspension}
            />
            <ServicePanel
              selected={selected}
              onCreate={openCreate}
              onRenew={() => runAction(renewMonthlyPass, `${selected?.passCode} renewed successfully.`)}
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

function deriveStats(passes) {
  let active = 0
  let expiring = 0
  let pending = 0
  let verified = 0
  let expired = 0
  const todayKey = new Date().toISOString().slice(0, 10)
  for (const pass of passes) {
    const status = String(pass.status || '').toLowerCase()
    if (status === 'active') active += 1
    else if (status === 'expiringsoon') expiring += 1
    else if (status === 'pendingapproval') pending += 1
    else if (status === 'expired') expired += 1
    if (pass.lastVerified && String(pass.lastVerified).startsWith(todayKey)) verified += 1
  }
  return { active, expiring, pending, verified, expired }
}

function PassList({ passes, selectedId, onSelect, loading }) {
  return (
    <section className="monthly-pass-list">
      <header>
        <div>
          <h2>Monthly Pass List</h2>
          <p>Showing {passes.length} passes</p>
        </div>
      </header>
      <div className="monthly-pass-table-wrap">
        {loading ? (
          <div className="monthly-pass-empty">Loading passes…</div>
        ) : passes.length === 0 ? (
          <div className="monthly-pass-empty">No monthly passes match the current filters.</div>
        ) : (
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
                    <button onClick={(e) => { e.stopPropagation(); onSelect(item.id) }}>View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  )
}

function PassDetail({ selected, onVerify, onRenew, onUpdate, onSuspension }) {
  if (!selected) {
    return (
      <section className="monthly-pass-detail">
        <header><div><small>Monthly Pass Detail</small><h2>No pass selected</h2></div></header>
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
        <div><dt>Vehicle Type</dt><dd>{selected.vehicleType || '—'}</dd></div>
        <div><dt>Pass Type</dt><dd>{selected.passType || '—'}</dd></div>
        <div><dt>Validity</dt><dd>{selected.validFrom} to {selected.validUntil}</dd></div>
        <div><dt>Status</dt><dd><span className="paid-dot" />{selected.status || '—'} / {selected.paymentStatus || '—'}</dd></div>
        <div><dt>Assigned Location</dt><dd>{selected.assignedLocation || '—'}</dd></div>
        <div><dt>Last Verified</dt><dd>{selected.lastVerified || '—'}</dd></div>
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
        <button onClick={() => selected && onRenew()} disabled={!selected}>Renew Existing Pass</button>
        <button onClick={onUpdate} disabled={!selected}>Update Vehicle Information</button>
        <button onClick={onSuspension} disabled={!selected}>Submit Manager Approval Request</button>
      </div>
      <p>Staff can process standard services. Suspension, price changes, and special approvals require manager review.</p>
    </section>
  )
}

function ActivitySection({ activities }) {
  if (!activities?.length) return null
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
                <td>{item.time || '—'}</td>
                <td><b>{item.passCode || '—'}</b></td>
                <td>{item.licensePlate || '—'}</td>
                <td>{item.action || '—'}</td>
                <td>{item.staff || '—'}</td>
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
    if (event.target === event.currentTarget) onClose()
  }

  return (
    <div className="monthly-pass-modal-backdrop" role="presentation" onMouseDown={handleBackdropClick}>
      <section className="monthly-pass-modal" role="dialog" aria-modal="true">
        <header>
          <div>
            <h2>{dialog === 'create' ? 'Create New Monthly Pass' : 'Update Vehicle Information'}</h2>
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
