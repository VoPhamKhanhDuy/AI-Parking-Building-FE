import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import MainLayout from '../../layouts/MainLayout'
import { ROUTE_PATHS } from '../../routes/routePaths'
import { calculateExitFee, checkExitPaymentStatus, getOrCreateExitPayment, fetchVehicleExitData, getPaymentSummary, lookupVehicleExitSession, processVehicleExit } from './vehicleExitService'
import { validateLicensePlate, validateTicketCode, classifyQuery } from '../../core/utils/vehicleValidation'
import './VehicleExitPage.css'

const formatMoney = (value) => new Intl.NumberFormat('vi-VN').format(value || 0) + ' VND'

function Field({ label, value, icon }) { return <label><span>{label}</span><div className="exit-field">{icon && <i className="material-symbols-outlined">{icon}</i>}<strong>{value || '—'}</strong></div></label> }

function VehicleExitPage() {
  const navigate = useNavigate()
  const [sessions, setSessions] = useState([])
  const [recentExits, setRecentExits] = useState([])
  const [selected, setSelected] = useState(null)
  const [query, setQuery] = useState('')
  const [fee, setFee] = useState(null)
  const [summary, setSummary] = useState(null)
  const [payment, setPayment] = useState(null)
  const [loading, setLoading] = useState(true)
  const [action, setAction] = useState('')
  const [message, setMessage] = useState('')
  const [validationError, setValidationError] = useState('')
  const actionInProgress = useRef(false)

  useEffect(() => {
    let active = true
    fetchVehicleExitData()
      .then((result) => {
        if (!active) return
        setSessions(result.sessions || [])
        setRecentExits(result.recentExits || [])
        if (result.sessions && result.sessions.length) setSelected(result.sessions[0])
      })
      .catch(() => active && setMessage('Unable to load active exit sessions.'))
      .finally(() => active && setLoading(false))
    return () => { active = false }
  }, [])

  useEffect(() => {
    if (!selected?.id) return undefined
    let active = true
    getPaymentSummary(selected).then((data) => active && setSummary(data)).catch(() => active && setSummary(null))
    return () => { active = false }
  }, [selected])

  const verifyTicket = async () => {
    if (actionInProgress.current) return

    const { kind, value } = classifyQuery(query)
    if (kind === 'empty') {
      setValidationError('Vui lòng nhập mã vé hoặc biển số xe')
      return
    }

    const error = kind === 'ticket' ? validateTicketCode(value) : validateLicensePlate(value)
    if (error) {
      setValidationError(error)
      return
    }

    actionInProgress.current = true
    setAction('verify'); setMessage(''); setValidationError('')
    try {
      const result = await lookupVehicleExitSession(value)
      if (result && result.id) {
        setSelected(result)
        setFee(null)
        setPayment(null)
        setSummary(null)
        setMessage(`Tìm thấy phiên đang hoạt động cho ${result.licensePlate || value}.`)
      } else {
        setMessage('Không tìm thấy phiên hoạt động nào khớp với mã vé hoặc biển số này.')
      }
    } catch {
      setMessage('Không thể xác minh mã vé. Vui lòng thử lại.')
    } finally {
      setAction('')
      setTimeout(() => { actionInProgress.current = false }, 500)
    }
  }

  const calculateFee = async () => {
    if (!selected || actionInProgress.current) return
    actionInProgress.current = true
    setAction('fee')
    try {
      const calculatedFee = await calculateExitFee(selected.id)
      setFee(calculatedFee)
      setSummary(calculatedFee)
      setMessage('Parking fee calculated. Press "Create QR payment" to generate a payment QR.')
    } catch (error) {
      setMessage(error.message)
    } finally {
      setAction('')
      setTimeout(() => { actionInProgress.current = false }, 500)
    }
  }

  const createQrPayment = async () => {
    if (!selected || actionInProgress.current) return
    actionInProgress.current = true
    setAction('payment')
    try {
      const newPayment = await getOrCreateExitPayment(selected.id)
      setPayment(newPayment)
      if (newPayment?.paymentId) {
        setMessage(newPayment.reused
          ? 'Existing pending payment found. Use "Check payment status" to refresh.'
          : 'Payment QR created.')
      } else {
        setMessage('Could not create payment.')
      }
    } catch (error) {
      setMessage(error?.message || 'Could not create payment.')
    } finally {
      setAction('')
      setTimeout(() => { actionInProgress.current = false }, 500)
    }
  }

  const checkPayment = async () => {
    if (!payment || !selected || actionInProgress.current) return
    actionInProgress.current = true
    setAction('payment')
    try {
      const result = await checkExitPaymentStatus(payment.paymentId)
      setPayment((current) => ({ ...current, ...result }))
      if (result.status === 'PAID') {
        setSelected((current) => ({ ...current, paymentStatus: 'Paid', paymentMethod: 'QR Payment' }))
        setMessage('Payment confirmed. Vehicle is ready to exit.')
      } else {
        setMessage('Payment is still pending. Check again after the transfer is completed.')
      }
    } catch (error) {
      const status = error?.response?.status
      if (status === 404) {
        setMessage('Payment record is no longer valid. Re-calculate the fee and create a new QR.')
        setPayment(null)
      } else if (status === 401) {
        setMessage('Your session has expired. Please log in again to check the payment status.')
      } else {
        setMessage(error?.message || 'Could not check payment status.')
      }
    } finally {
      setAction('')
      setTimeout(() => { actionInProgress.current = false }, 500)
    }
  }

  const completeExit = async () => {
    if (!selected || actionInProgress.current) return
    actionInProgress.current = true
    setAction('exit')
    try {
      const completed = await processVehicleExit(selected.id)
      navigate(ROUTE_PATHS.vehicleExitSuccess, { state: { session: completed, mode: 'exit' } })
    } catch (error) {
      setMessage(error?.message || 'Không thể hoàn tất xe ra. Vui lòng thử lại.')
    } finally {
      setAction('')
      setTimeout(() => { actionInProgress.current = false }, 500)
    }
  }

  const paymentPending = selected?.paymentStatus !== 'Paid' && payment?.status !== 'PAID'
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 60_000)
    return () => clearInterval(id)
  }, [])

  const parkingDuration = (() => {
    if (!selected?.entryTime) return '—'
    const start = new Date(selected.entryTime)
    const diffMs = now - start.getTime()
    if (Number.isNaN(diffMs) || diffMs < 0) return '—'
    const hours = Math.floor(diffMs / 3_600_000)
    const minutes = Math.floor((diffMs % 3_600_000) / 60_000)
    return `${hours}h ${minutes}m`
  })()

  return <MainLayout><div className="exit-page">
    <nav className="exit-breadcrumb"><button onClick={() => navigate(ROUTE_PATHS.dashboard)}>Dashboard</button><span>/</span><b>Vehicle Exit</b></nav>
    <header className="exit-heading"><h1>Vehicle Exit</h1><p>Verify the active session, calculate the parking fee and complete the exit.</p></header>
    <div className="exit-layout"><main className="exit-form-card"><div className="exit-card-title"><h2><span className="material-symbols-outlined">logout</span>Vehicle Exit Form</h2><em className={selected ? 'found' : ''}><i />{selected ? 'Active session found' : 'Awaiting verification'}</em></div>
      <div className="exit-search"><label><span className="material-symbols-outlined">search</span><input value={query} onChange={(event) => { setQuery(event.target.value); setValidationError('') }} placeholder="Ticket code or license plate"/></label><button onClick={verifyTicket} disabled={action === 'verify'}>{action === 'verify' ? 'Verifying…' : 'Verify ticket'}</button></div>{validationError && <p className="exit-message validation-error">{validationError}</p>}{message && <p className="exit-message">{message}</p>}
      {loading ? <div className="exit-loading"><i />Loading session…</div> : selected ? <><div className="exit-fields"><Field label="Plate source" value="Camera Scan (Auto)"/><Field label="Exit check status" value="Active Session Found"/><Field label="License plate" value={selected.licensePlate} icon="credit_card"/><Field label="Vehicle type" value={selected.vehicleType || '—'}/><Field label="Ticket code" value={selected.ticketCode || '—'}/><Field label="Assigned slot" value={selected.slotCode || selected.slotId}/><Field label="Entry time" value={selected.entryTime ? new Date(selected.entryTime).toLocaleString('vi-VN', { hour12: false }) : '—'}/><Field label="Exit time" value={new Date(now).toLocaleString('vi-VN', { hour12: false })}/><Field label="Parking duration" value={parkingDuration}/><Field label="Session status" value={selected.status || '—'}/></div>
      <section className="exit-steps"><h3>Exit processing steps</h3>{[['verified','Verify ticket','Check validity'],['calculate','Calculate fee','Based on duration'],['payments','Process payment','Finalize transaction'],['sensor_door','Release slot',`Mark ${selected.slotCode || selected.slotId} available`]].map(([icon,title,text], index) => <div key={title}><span className="material-symbols-outlined">{icon}</span><p><b>{title}</b><small>{text}</small></p><em>{index + 1}</em></div>)}</section>
      <section className="fee-strip"><div><small>Base fee</small><strong>{summary?.baseFee || '—'}</strong></div><div><small>Surcharge</small><strong>{summary?.surcharge || '—'}</strong></div><div><small>Discount</small><strong>{fee?.discount || '0 VND'}</strong></div><div className="total"><small>Total payable</small><strong>{summary?.formattedTotal || '—'}</strong></div><span className={paymentPending ? 'pending' : 'paid'}>{selected.paymentStatus || 'Pending'}</span></section>
      <div className="exit-actions"><button className="secondary" onClick={() => { setQuery(''); setSelected(null); setFee(null); setPayment(null); setSummary(null); setMessage(''); setValidationError('') }}>Clear form</button><button className="secondary" onClick={verifyTicket}>Verify ticket</button><button className="secondary" onClick={calculateFee} disabled={action === 'fee'}>{action === 'fee' ? 'Calculating…' : 'Calculate fee'}</button>{paymentPending ? <button className="primary" onClick={createQrPayment} disabled={action === 'payment'}>{action === 'payment' ? 'Creating…' : payment ? 'Recreate QR payment' : 'Create QR payment'}</button> : <button className="primary" disabled={action === 'exit'} onClick={completeExit}>{action === 'exit' ? 'Completing…' : 'Confirm exit'}</button>}</div></> : <div className="exit-empty">Enter a ticket code or license plate to find an active parking session.</div>}
    </main>
    <aside className="exit-side"><section><h2>Exit Session Status</h2>{selected ? <dl><div><dt>Session</dt><dd className="green">{selected.status || 'Active'}</dd></div><div><dt>Slot</dt><dd>{selected.slotCode || selected.slotId}</dd></div><div><dt>Vehicle</dt><dd>{selected.licensePlate}</dd></div><div><dt>Ticket</dt><dd>{selected.ticketCode || '—'}</dd></div><div><dt>Session ID</dt><dd style={{ fontSize: '11px' }}>{selected.id}</dd></div><div><dt>Assignment</dt><dd>Confirmed</dd></div></dl> : <p>No session selected.</p>}<small>After exit, the assigned slot will be released and marked Available.</small></section><section className="exit-payment-card"><h2>Payment Summary</h2><div className="amount"><small>Total due</small><strong>{summary?.formattedTotal || '—'}</strong></div><dl><div><dt>Method</dt><dd>{payment?.method || selected?.paymentMethod || 'EWallet'}</dd></div><div><dt>Status</dt><dd className={paymentPending ? 'pending-text' : 'green'}>{payment?.status || selected?.paymentStatus || '—'}</dd></div>{payment && payment.paymentId && <><div><dt>Payment ID</dt><dd style={{ fontSize: '11px' }}>{payment.paymentId}</dd></div><div><dt>Transaction</dt><dd style={{ fontSize: '11px' }}>{payment.transactionCode}</dd></div></>}</dl>{payment && payment.qrImageUrl && <div className="exit-payment-qr"><img src={payment.qrImageUrl} alt="Exit payment QR code"/><div><small>Scan to pay</small><b>{formatMoney(payment.amount)}</b><span>{payment.bankName}</span><code>{payment.transactionCode}</code></div></div>}<p className="waiting"><span className="material-symbols-outlined">{paymentPending ? 'pending' : 'check_circle'}</span>{paymentPending ? 'Waiting for payment' : 'Ready to exit'}</p>{payment && paymentPending && <button className="check-payment-button" disabled={action === 'payment'} onClick={checkPayment}>{action === 'payment' ? 'Checking…' : 'Check payment status'}</button>}</section><section className="pending-list"><h2>Active Sessions</h2>{sessions.map((session) => <button className={session.id === selected?.id ? 'active' : ''} key={session.id} onClick={() => { setSelected(session); setQuery(session.licensePlate || ''); setFee(null); setPayment(null); setSummary(null) }}><span><b>{session.licensePlate || '—'}</b><small>{session.slotCode || session.slotId || '—'} · {session.vehicleType || '—'}</small></span><em>{session.paymentStatus || 'Pending'}</em></button>)}</section></aside></div>
    <section className="recent-exits"><div><h2>Recent Vehicle Exits</h2><button>View full log →</button></div><table><thead><tr><th>Time</th><th>License plate</th><th>Type</th><th>Ticket</th><th>Paid amount</th><th>Exit status</th></tr></thead><tbody>{recentExits.length === 0 ? <tr><td colSpan="6"><em>No recent exits yet</em></td></tr> : recentExits.map((item) => <tr key={item.id}><td>{item.time}</td><td><b>{item.licensePlate}</b></td><td>{item.vehicleType}</td><td>{item.ticketType}</td><td>{formatMoney(item.paidAmount)}</td><td><span className={(item.status || 'completed').toLowerCase().replace(' ','-')}>{item.status}</span></td></tr>)}</tbody></table></section>
  </div></MainLayout>
}

export default VehicleExitPage
