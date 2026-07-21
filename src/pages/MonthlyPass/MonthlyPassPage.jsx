import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import MainLayout from '../../layouts/MainLayout'
import { ROUTE_PATHS } from '../../routes/routePaths'
import { createMonthlyPass, getMonthlyPasses, renewMonthlyPass, requestPassSuspension, updateMonthlyPassVehicle, verifyMonthlyPass } from './monthlyPassService'
import './MonthlyPassPage.css'

const emptyForm = { driver: '', licensePlate: '', vehicleType: 'Car' }
const badgeClass = (value) => value.toLowerCase().replaceAll(' ', '-')

function StatusBadge({ value }) { return <span className={`monthly-pass-badge ${badgeClass(value)}`}>{value}</span> }

function MonthlyPassPage() {
  const navigate = useNavigate()
  const [data, setData] = useState({ stats: {}, passes: [], activities: [] })
  const [selectedId, setSelectedId] = useState(null)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('All Statuses')
  const [vehicleType, setVehicleType] = useState('All Types')
  const [message, setMessage] = useState('')
  const [dialog, setDialog] = useState(null)
  const [form, setForm] = useState(emptyForm)

  useEffect(() => {
    let active = true
    const timer = setTimeout(() => getMonthlyPasses({ search, status, vehicleType }).then((result) => {
      if (!active) return
      setData(result)
      setSelectedId((current) => result.passes.some((item) => item.id === current) ? current : result.passes[0]?.id)
    }).catch(() => active && setMessage('Unable to load monthly passes.')), 160)
    return () => { active = false; clearTimeout(timer) }
  }, [search, status, vehicleType])

  useEffect(() => {
    if (!message) return undefined
    const timer = setTimeout(() => setMessage(''), 2800)
    return () => clearTimeout(timer)
  }, [message])

  const selected = data.passes.find((item) => item.id === selectedId) || data.passes[0]
  const replacePass = (updated) => setData((current) => ({ ...current, passes: current.passes.map((item) => item.id === updated.id ? updated : item) }))
  const runAction = async (action, successMessage) => {
    if (!selected) return
    try { const updated = await action(selected.id); if (updated.id) replacePass(updated); setMessage(successMessage) } catch (error) { setMessage(error.message) }
  }
  const openCreate = () => { setForm(emptyForm); setDialog('create') }
  const openUpdate = () => { if (!selected) return; setForm({ driver: selected.driver, licensePlate: selected.licensePlate, vehicleType: selected.vehicleType }); setDialog('update') }
  const submitForm = async (event) => {
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
    } catch (error) { setMessage(error.message) }
  }
  const requestSuspension = async () => {
    if (!selected) return
    try { const request = await requestPassSuspension(selected.id); setMessage(`${request.requestId} sent for manager approval.`) } catch (error) { setMessage(error.message) }
  }

  const stats = [['Active Passes', data.stats.activePasses], ['Expiring Soon', data.stats.expiringSoon], ['Pending Approval', data.stats.pendingApproval], ['Verified Today', data.stats.verifiedToday], ['Expired Passes', data.stats.expiredPasses]]
  return <MainLayout><div className="monthly-pass-page">
    <nav className="monthly-pass-breadcrumb"><button onClick={() => navigate(ROUTE_PATHS.dashboard)}>Dashboard</button><span>/</span><b>Monthly Pass</b></nav>
    <header className="monthly-pass-heading"><div><h1>Monthly Pass Processing</h1><p>Search, verify, create, renew, and update monthly parking passes for customer service operations.</p></div><span><i/>Staff workspace</span></header>
    <section className="monthly-pass-stats">{stats.map(([label, value]) => <article key={label}><small>{label}</small><strong>{value ?? '—'}</strong></article>)}</section>
    <section className="monthly-pass-filters"><label><span className="material-symbols-outlined">search</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search pass code, license plate, or driver name" /></label><select value={status} onChange={(event) => setStatus(event.target.value)}><option>All Statuses</option><option>Active</option><option>Expiring Soon</option><option>Pending Approval</option><option>Expired</option></select><select value={vehicleType} onChange={(event) => setVehicleType(event.target.value)}><option>All Types</option><option>Car</option><option>Motorcycle</option><option>EV</option></select><select defaultValue="This Month"><option>This Month</option><option>Next 30 Days</option><option>Expired</option></select><button className="create-pass" onClick={openCreate}><span className="material-symbols-outlined">add</span>Create New Pass</button></section>
    {message && <div className="monthly-pass-message" role="status">{message}</div>}

    <div className="monthly-pass-layout"><section className="monthly-pass-list"><header><div><h2>Monthly Pass List</h2><p>Showing {data.passes.length} passes</p></div></header><div className="monthly-pass-table-wrap"><table><thead><tr><th>Pass Code</th><th>License Plate</th><th>Driver</th><th>Vehicle Type</th><th>Valid Until</th><th>Status</th><th>Action</th></tr></thead><tbody>{data.passes.map((item) => <tr key={item.id} className={item.id === selected?.id ? 'selected' : ''} onClick={() => setSelectedId(item.id)}><td><b>{item.passCode}</b></td><td><strong>{item.licensePlate}</strong></td><td>{item.driver}</td><td>{item.vehicleType}</td><td>{item.validUntil}</td><td><StatusBadge value={item.status}/></td><td><button onClick={(event) => { event.stopPropagation(); setSelectedId(item.id) }}>View</button></td></tr>)}</tbody></table>{!data.passes.length && <div className="monthly-pass-empty">No monthly passes match the current filters.</div>}</div></section>
      <aside className="monthly-pass-side"><section className="monthly-pass-detail"><header><div><small>Monthly Pass Detail</small><h2>{selected?.passCode || 'No pass selected'}</h2></div>{selected && <StatusBadge value={selected.status}/>}</header>{selected && <><div className="monthly-pass-vehicle"><span className="material-symbols-outlined">directions_car</span><div><strong>{selected.licensePlate}</strong><small>{selected.driver}</small></div></div><dl><div><dt>Vehicle Type</dt><dd>{selected.vehicleType}</dd></div><div><dt>Pass Type</dt><dd>{selected.passType}</dd></div><div><dt>Validity</dt><dd>{selected.validFrom} to {selected.validUntil}</dd></div><div><dt>Status</dt><dd><span className="paid-dot"/>{selected.status} / {selected.paymentStatus}</dd></div><div><dt>Assigned Location</dt><dd>{selected.assignedLocation}</dd></div><div><dt>Last Verified</dt><dd>{selected.lastVerified}</dd></div></dl><div className="monthly-pass-actions"><button className="primary" onClick={() => runAction(verifyMonthlyPass, `${selected.passCode} verified successfully.`)}>Verify Pass</button><button onClick={() => runAction(renewMonthlyPass, `${selected.passCode} renewed through 2026-08-31.`)}>Renew Pass</button><button onClick={openUpdate}>Update Vehicle</button><button>View Entry History</button><button className="request" onClick={requestSuspension}>Request Suspension</button><p>Manager approval is required for suspension.</p></div></>}</section>
        <section className="pass-service-panel"><header><h2>Pass Service Actions</h2><p>Standard customer service tasks</p></header><div><button onClick={openCreate}>Create New Monthly Pass</button><button onClick={() => selected && runAction(renewMonthlyPass, `${selected.passCode} renewed through 2026-08-31.`)}>Renew Existing Pass</button><button onClick={openUpdate}>Update Vehicle Information</button><button onClick={requestSuspension}>Submit Manager Approval Request</button></div><p>Staff can process standard services. Suspension, price changes, and special approvals require manager review.</p></section>
        <section className="staff-scope-card"><h2>Staff Permission Scope</h2><ul><li>Verify, create, renew, and update pass information.</li><li>Pricing rules cannot be changed by Staff.</li><li>Passes cannot be suspended directly.</li><li>Special cases require manager approval.</li></ul></section>
      </aside></div>

    <section className="monthly-pass-activity"><header><div><h2>Recent Monthly Pass Activity</h2><p>Latest pass services handled during the current shift</p></div></header><div className="monthly-pass-table-wrap"><table><thead><tr><th>Time</th><th>Pass Code</th><th>License Plate</th><th>Action</th><th>Staff</th><th>Status</th></tr></thead><tbody>{data.activities.map((item) => <tr key={item.id}><td>{item.time}</td><td><b>{item.passCode}</b></td><td>{item.licensePlate}</td><td>{item.action}</td><td>{item.staff}</td><td><StatusBadge value={item.status}/></td></tr>)}</tbody></table></div></section>

    {dialog && <div className="monthly-pass-modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && setDialog(null)}><section className="monthly-pass-modal" role="dialog" aria-modal="true"><header><div><h2>{dialog === 'create' ? 'Create New Monthly Pass' : 'Update Vehicle Information'}</h2><p>{dialog === 'create' ? 'Submit a standard monthly pass for processing.' : `Update the vehicle assigned to ${selected?.passCode}.`}</p></div><button onClick={() => setDialog(null)} aria-label="Close"><span className="material-symbols-outlined">close</span></button></header><form onSubmit={submitForm}>{dialog === 'create' && <label>Driver Name<input value={form.driver} onChange={(event) => setForm((current) => ({ ...current, driver: event.target.value }))} required /></label>}<label>License Plate<input value={form.licensePlate} onChange={(event) => setForm((current) => ({ ...current, licensePlate: event.target.value }))} required /></label><label>Vehicle Type<select value={form.vehicleType} onChange={(event) => setForm((current) => ({ ...current, vehicleType: event.target.value }))}><option>Car</option><option>Motorcycle</option><option>EV</option></select></label><p>New passes and special changes may require manager approval.</p><div><button type="button" onClick={() => setDialog(null)}>Cancel</button><button className="submit" type="submit">{dialog === 'create' ? 'Submit Pass' : 'Save Vehicle'}</button></div></form></section></div>}
  </div></MainLayout>
}

export default MonthlyPassPage
