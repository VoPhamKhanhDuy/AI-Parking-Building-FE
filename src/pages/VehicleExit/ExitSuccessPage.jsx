import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import MainLayout from '../../layouts/MainLayout'
import { ROUTE_PATHS } from '../../routes/routePaths'
import { formatPaidAmount, getExitCompletion } from './exitSuccessService'
import './ExitSuccessPage.css'

const DEFAULT_SESSION = { id: 125, licensePlate: '30A-99887', ticketCode: 'TCK-2026-000125', slotId: 'EV04', entryTime: '2026-07-13 14:25:33', exitTime: '2026-07-13 16:55:30', baseFee: 20000, surcharge: 0, paymentMethod: 'QR Payment' }
function Pair({ label, value, accent }) { return <div><dt>{label}</dt><dd className={accent || ''}>{value}</dd></div> }

function ExitSuccessPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const sourceSession = { ...DEFAULT_SESSION, ...(location.state?.session || {}) }
  const [data, setData] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => { let active = true; getExitCompletion(sourceSession).then((result) => active && setData(result)).catch(() => active && setError('Unable to load the exit receipt.')).finally(() => {}); return () => { active = false } }, [sourceSession.id]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!data) return <MainLayout><div className="exit-success-page"><div className="exit-success-loading">{error || 'Preparing exit receipt…'}</div></div></MainLayout>
  const { session, receipt, slotRelease } = data

  return <MainLayout><div className="exit-success-page">
    <nav className="exit-success-breadcrumb"><button onClick={() => navigate(ROUTE_PATHS.dashboard)}>Dashboard</button><span>/</span><button onClick={() => navigate(ROUTE_PATHS.vehicleExit)}>Vehicle Exit</button><span>/</span><b>Exit Success</b></nav>
    <header className="exit-success-heading"><h1>Exit completed</h1><p>Payment is complete, the vehicle exit is confirmed and the parking slot has been released.</p></header>
    <div className="exit-success-layout"><main className="exit-success-main"><section className="completion-card"><div className="completion-title"><span className="material-symbols-outlined">check_circle</span><div><h2>Vehicle exit completed</h2><p>Transaction finalized successfully</p></div></div><dl className="completion-grid"><Pair label="License plate" value={session.licensePlate}/><Pair label="Ticket code" value={session.ticketCode}/><Pair label="Assigned slot" value={session.slotId}/><Pair label="Parking duration" value="3h 16m"/><Pair label="Payment amount" value={receipt.totalPaid} accent="blue"/><Pair label="Payment method" value={receipt.method}/><Pair label="Payment status" value="Paid" accent="paid"/><Pair label="Exit time" value={session.exitTime}/></dl><p className="release-notice"><span className="material-symbols-outlined">info</span>Slot {session.slotId} has been released and marked Available.</p></section>
      <div className="result-grid"><section className="result-card"><h2><span className="material-symbols-outlined">receipt_long</span>Payment receipt</h2><dl><Pair label="Receipt ID" value={receipt.id}/><Pair label="Base fee" value={receipt.baseFee}/><Pair label="Surcharge" value={receipt.surcharge}/><Pair label="Discount" value={receipt.discount}/><Pair label="Total paid" value={receipt.totalPaid} accent="blue"/><Pair label="Staff" value={receipt.staff}/></dl></section><section className="result-card"><h2><span className="material-symbols-outlined">sensor_door</span>Slot release result</h2><dl><Pair label="Previous status" value={slotRelease.previousStatus} accent="red"/><Pair label="New status" value={slotRelease.newStatus} accent="green"/><Pair label="Released slot" value={slotRelease.slotId}/><Pair label="Session status" value={slotRelease.sessionStatus}/><Pair label="System log" value={slotRelease.logStatus} accent="green"/></dl></section></div>
    </main><aside className="exit-success-side"><section className="checks-card"><h2>Exit completion status</h2>{data.checks.map((item) => <p key={item}><span className="material-symbols-outlined">check_circle</span>{item}</p>)}</section><section className="receipt-preview"><h2>Parking receipt</h2><small>ID: {receipt.id}</small><dl><Pair label="Plate" value={session.licensePlate}/><Pair label="Slot" value={session.slotId}/><Pair label="Method" value={receipt.method}/><Pair label="Time" value={session.exitTime}/><Pair label="Total paid" value={receipt.totalPaid}/></dl><div className="receipt-qr"><span className="material-symbols-outlined">qr_code_2</span><small>Scan to verify receipt</small></div></section><div className="exit-success-actions"><button className="primary" onClick={() => window.print()}><span className="material-symbols-outlined">print</span>Print receipt</button><button onClick={() => navigate(ROUTE_PATHS.parkingMap)}><span className="material-symbols-outlined">map</span>View slot map</button><button onClick={() => navigate(ROUTE_PATHS.vehicleExit)}>New vehicle exit</button><button className="text" onClick={() => navigate(ROUTE_PATHS.dashboard)}>Back to dashboard</button></div></aside></div>
    <section className="completed-exits"><div><h2>Recent completed exits</h2><button>View full log →</button></div><table><thead><tr><th>Time</th><th>License plate</th><th>Ticket</th><th>Paid amount</th><th>Vehicle type</th><th>Status</th></tr></thead><tbody>{data.recentExits.map((item) => <tr key={item.id}><td>{item.time}</td><td><b>{item.licensePlate}</b></td><td>{item.ticketType}</td><td>{formatPaidAmount(item.paidAmount)}</td><td>{item.vehicleType}</td><td><span>Exited</span></td></tr>)}</tbody></table></section>
  </div></MainLayout>
}
export default ExitSuccessPage
