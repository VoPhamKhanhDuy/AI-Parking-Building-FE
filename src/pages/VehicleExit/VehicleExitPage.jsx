import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import MainLayout from '../../layouts/MainLayout'
import { ROUTE_PATHS } from '../../routes/routePaths'
import { calculateExitFee, checkExitPaymentStatus, createExitPayment, fetchVehicleExitData, getPaymentSummary, lookupVehicleExitSession, processVehicleExit } from './vehicleExitService'
import './VehicleExitPage.css'

const formatMoney = (value) => new Intl.NumberFormat('vi-VN').format(value || 0) + ' VND'

function Field({ label, value, icon }) { return <label><span>{label}</span><div className="exit-field">{icon && <i className="material-symbols-outlined">{icon}</i>}<strong>{value || '—'}</strong></div></label> }

function VehicleExitPage() {
  const navigate = useNavigate()
  const [sessions, setSessions] = useState([])
  const [recentExits, setRecentExits] = useState([])
  const [selected, setSelected] = useState(null)
  const [query, setQuery] = useState('51A-12345')
  const [fee, setFee] = useState(null)
  const [payment, setPayment] = useState(null)
  const [loading, setLoading] = useState(true)
  const [action, setAction] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    let active = true
    fetchVehicleExitData().then((result) => { if (!active) return; setSessions(result.sessions); setRecentExits(result.recentExits); setSelected(result.sessions[0] || null) }).catch(() => active && setMessage('Unable to load active exit sessions.')).finally(() => active && setLoading(false))
    return () => { active = false }
  }, [])

  const verifyTicket = async () => {
    setAction('verify'); setMessage('')
    try { const result = await lookupVehicleExitSession(query); setSelected(result); setFee(null); setMessage(result ? `Active session found for ${result.licensePlate}.` : 'No active session matches this ticket or plate.') }
    catch { setMessage('Could not verify this ticket.') }
    finally { setAction('') }
  }

  const calculateFee = async () => {
    if (!selected) return
    setAction('fee')
    try { const calculatedFee = await calculateExitFee(selected.id); setFee(calculatedFee); setPayment(await createExitPayment(selected.id)); setMessage('Parking fee calculated and payment QR created.') }
    catch (error) { setMessage(error.message) }
    finally { setAction('') }
  }

  const checkPayment = async () => {
    if (!payment || !selected) return
    setAction('payment')
    try {
      const result = await checkExitPaymentStatus(payment.paymentId, selected.id)
      setPayment((current) => ({ ...current, ...result }))
      if (result.status === 'PAID') { setSelected((current) => ({ ...current, paymentStatus: 'Paid', paymentMethod: 'QR Payment' })); setMessage('Payment confirmed. Vehicle is ready to exit.') }
      else setMessage('Payment is still pending. Check again after the transfer is completed.')
    } catch { setMessage('Could not check payment status.') }
    finally { setAction('') }
  }

  const completeExit = async () => {
    if (!selected) return
    setAction('exit')
    try { const completed = await processVehicleExit(selected.id); navigate(ROUTE_PATHS.vehicleExitSuccess, { state: { session: completed, mode: 'exit' } }) }
    catch { setMessage('Could not complete the vehicle exit.') }
    finally { setAction('') }
  }

  const summary = fee || getPaymentSummary(selected)
  const paymentPending = selected?.paymentStatus === 'Pending' && payment?.status !== 'PAID'

  return <MainLayout><div className="exit-page">
    <nav className="exit-breadcrumb"><button onClick={() => navigate(ROUTE_PATHS.dashboard)}>Dashboard</button><span>/</span><b>Vehicle Exit</b></nav>
    <header className="exit-heading"><h1>Vehicle Exit</h1><p>Verify the active session, calculate the parking fee and complete the exit.</p></header>
    <div className="exit-layout"><main className="exit-form-card"><div className="exit-card-title"><h2><span className="material-symbols-outlined">logout</span>Vehicle Exit Form</h2><em className={selected ? 'found' : ''}><i />{selected ? 'Active session found' : 'Awaiting verification'}</em></div>
      <div className="exit-search"><label><span className="material-symbols-outlined">search</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Ticket code or license plate"/></label><button onClick={verifyTicket} disabled={action === 'verify'}>{action === 'verify' ? 'Verifying…' : 'Verify ticket'}</button></div>{message && <p className="exit-message">{message}</p>}
      {loading ? <div className="exit-loading"><i />Loading session…</div> : selected ? <><div className="exit-fields"><Field label="Plate source" value="Camera Scan (Auto)"/><Field label="Exit check status" value="Active Session Found"/><Field label="License plate" value={selected.licensePlate} icon="credit_card"/><Field label="Vehicle type" value={selected.vehicleType}/><Field label="Ticket code" value={selected.ticketCode}/><Field label="Assigned slot" value={selected.slotId}/><Field label="Entry time" value={selected.entryTime}/><Field label="Exit time" value={new Date().toLocaleString('vi-VN', { hour12: false })}/><Field label="Parking duration" value="3h 16m"/><Field label="Ticket type" value={selected.ticketType}/></div>
      <section className="exit-steps"><h3>Exit processing steps</h3>{[['verified','Verify ticket','Check validity'],['calculate','Calculate fee','Based on duration'],['payments','Process payment','Finalize transaction'],['sensor_door','Release slot',`Mark ${selected.slotId} available`]].map(([icon,title,text], index) => <div key={title}><span className="material-symbols-outlined">{icon}</span><p><b>{title}</b><small>{text}</small></p><em>{index + 1}</em></div>)}</section>
      <section className="fee-strip"><div><small>Base fee</small><strong>{summary?.baseFee || '—'}</strong></div><div><small>Surcharge</small><strong>{summary?.surcharge || '—'}</strong></div><div><small>Discount</small><strong>{fee?.discount || '0 VND'}</strong></div><div className="total"><small>Total payable</small><strong>{summary?.formattedTotal || '—'}</strong></div><span className={paymentPending ? 'pending' : 'paid'}>{selected.paymentStatus}</span></section>
      <div className="exit-actions"><button className="secondary" onClick={() => { setQuery(''); setSelected(null); setFee(null); setPayment(null); setMessage('') }}>Clear form</button><button className="secondary" onClick={verifyTicket}>Verify ticket</button><button className="secondary" onClick={calculateFee} disabled={action === 'fee'}>{action === 'fee' ? 'Calculating…' : 'Calculate fee'}</button>{paymentPending ? <button className="primary" onClick={calculateFee}>{payment ? 'Refresh QR payment' : 'Create QR payment'}</button> : <button className="primary" disabled={action === 'exit'} onClick={completeExit}>{action === 'exit' ? 'Completing…' : 'Confirm exit'}</button>}</div></> : <div className="exit-empty">Enter a ticket code or license plate to find an active parking session.</div>}
    </main>
    <aside className="exit-side"><section><h2>Exit Session Status</h2>{selected ? <dl><div><dt>Session</dt><dd className="green">Active</dd></div><div><dt>Slot</dt><dd>{selected.slotId}</dd></div><div><dt>Vehicle</dt><dd>{selected.licensePlate}</dd></div><div><dt>Entry gate</dt><dd>{selected.entryGate}</dd></div><div><dt>Zone</dt><dd>{selected.zone}</dd></div><div><dt>Assignment</dt><dd>Confirmed</dd></div></dl> : <p>No session selected.</p>}<small>After exit, the assigned slot will be released and marked Available.</small></section><section className="exit-payment-card"><h2>Payment Summary</h2><div className="amount"><small>Total due</small><strong>{summary?.formattedTotal || '—'}</strong></div><dl><div><dt>Method</dt><dd>{payment?.method || selected?.paymentMethod || 'QR Payment'}</dd></div><div><dt>Status</dt><dd className={paymentPending ? 'pending-text' : 'green'}>{payment?.status || selected?.paymentStatus || '—'}</dd></div>{payment && <><div><dt>Payment ID</dt><dd>{payment.paymentId}</dd></div><div><dt>Transaction</dt><dd>{payment.transactionCode}</dd></div></>}</dl>{payment && <div className="exit-payment-qr"><img src={payment.qrImageUrl} alt="Exit payment QR code"/><div><small>Scan to pay</small><b>{formatMoney(payment.amount)}</b><span>{payment.bankName}</span><code>{payment.transactionCode}</code></div></div>}<p className="waiting"><span className="material-symbols-outlined">{paymentPending ? 'pending' : 'check_circle'}</span>{paymentPending ? 'Waiting for payment' : 'Ready to exit'}</p>{payment && paymentPending && <button className="check-payment-button" disabled={action === 'payment'} onClick={checkPayment}>{action === 'payment' ? 'Checking…' : 'Check payment status'}</button>}</section><section className="pending-list"><h2>Active Sessions</h2>{sessions.map((session) => <button className={session.id === selected?.id ? 'active' : ''} key={session.id} onClick={() => { setSelected(session); setQuery(session.licensePlate); setFee(null); setPayment(null) }}><span><b>{session.licensePlate}</b><small>{session.slotId} · {session.vehicleType}</small></span><em>{session.paymentStatus}</em></button>)}</section></aside></div>
    <section className="recent-exits"><div><h2>Recent Vehicle Exits</h2><button>View full log →</button></div><table><thead><tr><th>Time</th><th>License plate</th><th>Type</th><th>Ticket</th><th>Paid amount</th><th>Exit status</th></tr></thead><tbody>{recentExits.map((item) => <tr key={item.id}><td>{item.time}</td><td><b>{item.licensePlate}</b></td><td>{item.vehicleType}</td><td>{item.ticketType}</td><td>{formatMoney(item.paidAmount)}</td><td><span className={item.status.toLowerCase().replace(' ','-')}>{item.status}</span></td></tr>)}</tbody></table></section>
  </div></MainLayout>
}

export default VehicleExitPage
