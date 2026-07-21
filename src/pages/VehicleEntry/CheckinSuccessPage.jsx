import { useLocation, useNavigate } from 'react-router-dom'
import MainLayout from '../../layouts/MainLayout'
import { ROUTE_PATHS } from '../../routes/routePaths'
import { formatSessionTime, getCheckinNextSteps } from './checkinSuccessService'
import './CheckinSuccessPage.css'

const DEFAULT_SESSION = { licensePlate: '51A-12345', vehicleType: 'Car', ticketType: 'Normal', checkStatus: 'Existing Vehicle', plateSource: 'Camera Scan', selectedSlotId: 'B2-18', ticketCode: 'TCK-2026-000128', entryTime: new Date().toISOString(), method: 'AI Recommended', matchScore: '92%' }

function InfoRow({ label, value, accent }) { return <div><dt>{label}</dt><dd className={accent || ''}>{value}</dd></div> }

function CheckinSuccessPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const session = { ...DEFAULT_SESSION, ...(location.state || {}) }
  const slotId = session.selectedSlotId || 'B2-18'
  const floor = session.selectedFloor || (slotId.includes('2') || slotId.startsWith('C') ? 'Floor 2' : 'Floor 1')
  const zone = slotId.startsWith('M') ? 'A · Motorcycle' : slotId.startsWith('EV') ? 'C · EV charging' : 'B · Car'
  const entryTime = formatSessionTime(session.entryTime)
  const nextSteps = getCheckinNextSteps({ slotId, floor, zone })

  return <MainLayout><div className="checkin-page">
    <nav className="checkin-breadcrumb"><button onClick={() => navigate(ROUTE_PATHS.dashboard)}>Dashboard</button><span>/</span><button onClick={() => navigate(ROUTE_PATHS.vehicleEntry)}>Vehicle Entry</button><span>/</span><b>Check-in Success</b></nav>
    <header className="checkin-heading"><h1>Check-in successful</h1><p>Ticket, parking session, and slot assignment have been created.</p></header>

    <section className="checkin-summary"><div className="summary-icon material-symbols-outlined">directions_car</div><div><small>License plate</small><strong>{session.licensePlate}</strong></div><i /><div><small>Vehicle type</small><span>{session.vehicleType}</span></div><i /><div><small>Ticket type</small><span>{session.ticketType}</span></div><i /><div><small>Source</small><span>{session.plateSource}</span></div><i /><div><small>Status</small><em>{session.checkStatus}</em></div></section>

    <div className="checkin-layout"><main className="checkin-main">
      <section className="success-card"><div className="success-card-title"><span><b className="material-symbols-outlined">check_circle</b>Check-in completed</span><em><i />Active session</em></div><div className="success-content"><div className="assigned-slot"><small>Assigned slot</small><strong>{slotId}</strong></div><div><small>Ticket code</small><strong>{session.ticketCode}</strong><small>Method</small><span>{session.method}</span></div><div><small>Entry time</small><strong>{entryTime}</strong><small>Match score</small><span>{session.matchScore}</span></div></div></section>
      <section className="info-card"><h2><span className="material-symbols-outlined">confirmation_number</span>Ticket information</h2><dl><InfoRow label="Ticket code" value={session.ticketCode}/><InfoRow label="License plate" value={session.licensePlate}/><InfoRow label="Vehicle type" value={session.vehicleType}/><InfoRow label="Ticket type" value={session.ticketType}/><InfoRow label="Entry gate" value="Gate A"/><InfoRow label="Entry time" value={entryTime}/></dl><p>Processed by: <b>Staff Operator (ID: 001)</b></p></section>
      <section className="info-card"><h2><span className="material-symbols-outlined">location_on</span>Slot assignment detail</h2><dl><InfoRow label="Assigned slot" value={slotId} accent="blue"/><InfoRow label="Floor" value={floor}/><InfoRow label="Zone" value={zone}/><InfoRow label="Slot status" value="Occupied" accent="green"/><InfoRow label="Assignment method" value={session.method}/><InfoRow label="AI match score" value={session.matchScore} accent="green"/></dl><p>AI log status: <b className="green">Saved</b></p></section>
    </main>

    <aside className="checkin-side"><div className="checkin-actions"><button className="primary" onClick={() => window.print()}><span className="material-symbols-outlined">print</span>Print ticket</button><button onClick={() => navigate(ROUTE_PATHS.manualSlot, { state: session })}><span className="material-symbols-outlined">map</span>View slot map</button><button onClick={() => navigate(ROUTE_PATHS.vehicleEntry)}><span className="material-symbols-outlined">add_circle</span>New vehicle entry</button><button className="text" onClick={() => navigate(ROUTE_PATHS.dashboard)}>Back to dashboard</button></div>
      <section className="operation-card"><h2>Session checks</h2>{['Vehicle verified','Slot assignment confirmed','Ticket created','Session initiated'].map((item) => <p key={item}><span className="material-symbols-outlined">check_circle</span>{item}</p>)}</section>
      <section className="next-step-card">
        <div className="next-step-heading"><div className="next-step-title"><span className="material-symbols-outlined">route</span><div><small>Entry handoff</small><h2>Next Step</h2></div></div><span className="next-step-status"><i />Entry authorized</span></div>
        <div className="next-step-list">{nextSteps.map((item) => <p key={item}><span className="material-symbols-outlined">check_circle</span>{item}</p>)}</div>
        <div className="next-step-note"><span className="material-symbols-outlined">info</span><div><strong>Fee handling</strong><small>No payment is required at entry. Parking fees are calculated and processed during vehicle exit.</small></div></div>
      </section>
    </aside></div>
  </div></MainLayout>
}

export default CheckinSuccessPage
