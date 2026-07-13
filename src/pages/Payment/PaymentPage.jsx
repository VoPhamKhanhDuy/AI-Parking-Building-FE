import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import MainLayout from '../../layouts/MainLayout'
import { ROUTE_PATHS } from '../../routes/routePaths'
import { formatPaymentAmount, getPaymentManagement, requestPaymentRefund } from './paymentService'
import './PaymentPage.css'

const STATUS_OPTIONS = ['All Statuses', 'PAID', 'PENDING', 'FAILED', 'REFUND_PENDING']
function Status({ value }) { return <span className={`payment-badge ${value.toLowerCase()}`}>{value.replace('_', ' ')}</span> }

function PaymentPage() {
  const navigate = useNavigate()
  const [data, setData] = useState({ stats: {}, transactions: [], activities: [] })
  const [selectedId, setSelectedId] = useState(null)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('All Statuses')
  const [method, setMethod] = useState('All Methods')
  const [type, setType] = useState('All Types')
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  useEffect(() => { let active = true; const timer = setTimeout(() => getPaymentManagement({ search, status, method, type }).then((result) => { if (!active) return; setData(result); setSelectedId((current) => current || result.transactions[0]?.id || null) }).catch(() => active && setMessage('Unable to load payment transactions.')).finally(() => active && setLoading(false)), 180); return () => { active = false; clearTimeout(timer) } }, [search, status, method, type])
  const selected = data.transactions.find((item) => item.id === selectedId) || data.transactions[0]

  const refund = async () => {
    if (!selected) return
    try { const updated = await requestPaymentRefund(selected.id); setData((current) => ({ ...current, transactions: current.transactions.map((item) => item.id === updated.id ? updated : item) })); setMessage(`Refund request created for ${updated.receiptId}.`) }
    catch (error) { setMessage(error.message) }
  }

  const stats = [['Today revenue', formatPaymentAmount(data.stats.todayRevenue)], ['Paid transactions', data.stats.paidTransactions], ['Pending payments', data.stats.pendingPayments], ['Failed payments', data.stats.failedPayments], ['Refund requests', data.stats.refundRequests]]

  return <MainLayout><div className="payment-page">
    <nav className="payment-breadcrumb"><button onClick={() => navigate(ROUTE_PATHS.dashboard)}>Dashboard</button><span>/</span><b>Payment</b></nav>
    <header className="payment-heading"><div><h1>Payment Processing</h1><p>Review transactions, confirm parking payments and handle payment issues.</p></div><span><i />Staff workspace</span></header>
    <section className="payment-stats">{stats.map(([label,value]) => <div className={label.toLowerCase().replace(' ','-')} key={label}><small>{label}</small><strong>{value ?? '—'}</strong></div>)}</section>
    <section className="payment-filters"><label><span className="material-symbols-outlined">search</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search ticket, license plate or receipt ID"/></label><select value={status} onChange={(event) => setStatus(event.target.value)}>{STATUS_OPTIONS.map((item) => <option key={item}>{item}</option>)}</select><select value={method} onChange={(event) => setMethod(event.target.value)}><option>All Methods</option><option>QR Payment</option><option>Cash</option><option>Card</option><option>Monthly Pass</option></select><select value={type} onChange={(event) => setType(event.target.value)}><option>All Types</option><option>Parking Fee</option><option>Reservation</option><option>Pass Validation</option></select><select><option>Today</option><option>Last 7 days</option><option>This month</option></select></section>
    {message && <div className="payment-message">{message}</div>}
    <div className="payment-layout"><section className="transactions-card"><div className="payment-card-header"><h2>Payment Transactions</h2><span>{data.transactions.length} records</span></div>{loading ? <div className="payment-loading">Loading transactions…</div> : <div className="payment-table-wrap"><table><thead><tr><th>Receipt</th><th>Ticket / Plate</th><th>Amount</th><th>Method</th><th>Type</th><th>Status</th><th /></tr></thead><tbody>{data.transactions.map((item) => <tr className={item.id === selected?.id ? 'selected' : ''} key={item.id} onClick={() => setSelectedId(item.id)}><td><b>{item.receiptId}</b><small>{item.time}</small></td><td><b>{item.ticketCode}</b><small>{item.licensePlate}</small></td><td>{formatPaymentAmount(item.amount)}</td><td>{item.method}</td><td>{item.type}</td><td><Status value={item.status}/></td><td><button aria-label="View payment"><span className="material-symbols-outlined">chevron_right</span></button></td></tr>)}</tbody></table></div>}<div className="payment-pagination"><span>Showing 1–{data.transactions.length} of {data.transactions.length}</span><div><button disabled>Prev</button><button className="active">1</button><button>2</button><button>Next</button></div></div></section>
    <aside className="payment-detail"><div className="payment-card-header"><h2>Payment Detail</h2>{selected && <Status value={selected.status}/>}</div>{selected ? <><div className="detail-amount"><small>Total amount</small><strong>{formatPaymentAmount(selected.amount)}</strong><span>{selected.status === 'PAID' ? `Paid via ${selected.method}` : selected.method}</span></div><dl><div><dt>Receipt ID</dt><dd>{selected.receiptId}</dd></div><div><dt>Ticket code</dt><dd>{selected.ticketCode}</dd></div><div><dt>License plate</dt><dd>{selected.licensePlate}</dd></div><div><dt>Vehicle</dt><dd>{selected.vehicleType}</dd></div><div><dt>Payment type</dt><dd>{selected.type}</dd></div><div><dt>Processed at</dt><dd>{selected.paidAt || '—'}</dd></div><div><dt>Staff</dt><dd>{selected.staff}</dd></div></dl><div className="payment-detail-actions"><button className="primary" onClick={() => window.print()}><span className="material-symbols-outlined">print</span>Print receipt</button><div><button onClick={() => navigate(ROUTE_PATHS.tickets)}>View ticket</button><button onClick={() => navigate(ROUTE_PATHS.vehicleExit)}>View session</button></div><button className="refund" disabled={selected.status !== 'PAID'} onClick={refund}>Process refund</button></div></> : <div className="payment-empty">Select a transaction to view details.</div>}</aside></div>
    <section className="payment-activity"><div><h2>Recent Payment Activity</h2><button>View all activity →</button></div><table><thead><tr><th>Time</th><th>Receipt ID</th><th>License plate</th><th>Amount</th><th>Method</th><th>Status</th></tr></thead><tbody>{data.activities.map((item) => <tr key={item.id}><td>{item.time}</td><td><b>{item.receiptId}</b></td><td>{item.licensePlate}</td><td>{formatPaymentAmount(item.amount)}</td><td>{item.method}</td><td><Status value={item.status}/></td></tr>)}</tbody></table></section>
  </div></MainLayout>
}
export default PaymentPage
