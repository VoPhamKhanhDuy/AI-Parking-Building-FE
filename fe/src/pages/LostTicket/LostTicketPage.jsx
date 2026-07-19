import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import MainLayout from '../../layouts/MainLayout'
import { ROUTE_PATHS } from '../../routes/routePaths'
import {
  createLostTicketCase,
  findLostTicketSession,
  formatLostTicketMoney,
  getLostTicketPageData
} from './lostTicketService'
import './LostTicketPage.css'

const METHODS = [
  { value: 'License Plate', label: 'License Plate' },
  { value: 'Ticket Code', label: 'Ticket Code' }
]

function formatTime(value) {
  if (!value) return '—'
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleString('en-GB', { hour12: false })
}

function calculateDuration(start, end = Date.now()) {
  if (!start) return '—'
  const startDate = new Date(start)
  if (Number.isNaN(startDate.getTime())) return '—'
  const diff = end - startDate.getTime()
  if (diff < 0) return '—'
  const hours = Math.floor(diff / 3_600_000)
  const minutes = Math.floor((diff % 3_600_000) / 60_000)
  return `${hours}h ${minutes}m`
}

const DEFAULT_PAGE = { policy: { carPenalty: 0, motorcyclePenalty: 0 }, recentCases: [] }

function LostTicketPage() {
  const navigate = useNavigate()
  const [method, setMethod] = useState('License Plate')
  const [query, setQuery] = useState('')
  const [ownerName, setOwnerName] = useState('')
  const [phone, setPhone] = useState('')
  const [vehicleType, setVehicleType] = useState('Car')
  const [session, setSession] = useState(null)
  const [fee, setFee] = useState(null)
  const [pageData, setPageData] = useState(DEFAULT_PAGE)
  const [action, setAction] = useState('')
  const [message, setMessage] = useState('')
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    let active = true
    const id = setInterval(() => setNow(Date.now()), 60_000)
    getLostTicketPageData()
      .then((result) => {
        if (!active) return
        setPageData({
          policy: result?.data?.policy || DEFAULT_PAGE.policy,
          recentCases: Array.isArray(result?.data?.recentCases) ? result.data.recentCases : []
        })
      })
      .catch(() => active && setPageData(DEFAULT_PAGE))
    return () => { active = false; clearInterval(id) }
  }, [])

  const verify = async () => {
    if (!query.trim()) {
      setMessage('Please enter a ticket code or license plate to verify.')
      return
    }
    setAction('verify')
    setMessage('')
    try {
      const result = await findLostTicketSession({ method, query: query.trim() })
      if (result?.success && result.data) {
        setSession(result.data)
        if (result.data.vehicleType && result.data.vehicleType !== '—') {
          setVehicleType(result.data.vehicleType)
        }
        setFee(null)
        setMessage('Active parking session recovered.')
      } else {
        setSession(null)
        setFee(null)
        setMessage(result?.message || 'No active session matches the supplied information.')
      }
    } catch (error) {
      setMessage(error?.message || 'Verification failed.')
    } finally {
      setAction('')
    }
  }

  const calculate = async () => {
    if (!session) return
    setAction('fee')
    setFee(null)
    try {
      const parkingFee = 50000
      const policy = pageData.policy || DEFAULT_PAGE.policy
      const isMotor = /motor/i.test(String(session.vehicleType || vehicleType || ''))
      const penalty = isMotor ? (policy.motorcyclePenalty || 200000) : (policy.carPenalty || 500000)
      const discount = 0
      const total = parkingFee + penalty - discount
      setFee({
        parkingFee,
        penalty,
        discount,
        total,
        formattedTotal: formatLostTicketMoney(total),
        paymentStatus: 'Unpaid'
      })
      setMessage('Lost ticket fee calculated.')
    } catch (error) {
      setMessage(error?.message || 'Failed to calculate fee.')
    } finally {
      setAction('')
    }
  }

  const processCase = async () => {
    if (!session || !fee) return
    setAction('case')
    setMessage('')
    try {
      const result = await createLostTicketCase(session, { ownerName, phone })
      if (!result?.success) {
        setMessage(result?.message || 'Could not create lost ticket case.')
        return
      }
      setMessage(`Case ${result.caseId || result.data?.id || '—'} created. Continue to payment before vehicle exit.`)
      navigate(ROUTE_PATHS.payment)
    } catch (error) {
      setMessage(error?.message || 'Could not create lost ticket case.')
    } finally {
      setAction('')
    }
  }

  const parkingDuration = useMemo(
    () => calculateDuration(session?.entryTime, now),
    [session?.entryTime, now]
  )

  return (
    <MainLayout>
      <div className="lost-page">
        <nav className="lost-breadcrumb">
          <button onClick={() => navigate(ROUTE_PATHS.dashboard)}>Dashboard</button>
          <span>/</span>
          <b>Lost Ticket</b>
        </nav>

        <header className="lost-heading">
          <h1>Lost Ticket</h1>
          <p>Verify vehicle information, recover active parking sessions and process lost ticket exit requests.</p>
        </header>

        <div className="lost-layout">
          <main className="lost-form-card">
            <div className="lost-card-title">
              <h2><span className="material-symbols-outlined">find_replace</span>Lost Ticket Verification Form</h2>
              <em className={session ? 'found' : ''}><i />{session ? 'Active session found' : 'Verification required'}</em>
            </div>

            <div className="lost-fields">
              <label>
                <span>Search method</span>
                <select value={method} onChange={(event) => setMethod(event.target.value)}>
                  {METHODS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
                </select>
              </label>
              <label>
                <span>{method}</span>
                <div>
                  <i className="material-symbols-outlined">credit_card</i>
                  <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={method === 'Ticket Code' ? 'TKT-20260711-AB12CD' : '51A-12345'} />
                </div>
              </label>
              <label>
                <span>Vehicle type</span>
                <select value={vehicleType} onChange={(event) => setVehicleType(event.target.value)}>
                  <option>Car</option>
                  <option>Motorcycle</option>
                  <option>Electric Vehicle</option>
                </select>
              </label>
              <label>
                <span>Owner / Driver name</span>
                <input value={ownerName} onChange={(event) => setOwnerName(event.target.value)} />
              </label>
              <label>
                <span>Phone number</span>
                <input value={phone} onChange={(event) => setPhone(event.target.value)} />
              </label>
              <label>
                <span>Verification status</span>
                <div className={`verification ${session ? 'verified' : ''}`}>
                  <i />{session ? 'Active Session Found' : 'Not Verified'}
                </div>
              </label>
            </div>

            {session && (
              <div className="recovered-fields">
                <label><span>Entry time</span><strong>{formatTime(session.entryTime)}</strong></label>
                <label><span>Assigned slot</span><strong>{session.slotId || '—'}</strong></label>
                <label><span>Parking duration</span><strong>{parkingDuration}</strong></label>
              </div>
            )}

            <section className="evidence-card">
              <h3>Verification evidence</h3>
              {(session?.verification || ['Plate match pending', 'Vehicle type check pending', 'Active session lookup pending'])
                .map((item) => (
                  <p className={session ? 'ok' : ''} key={item}>
                    <span className="material-symbols-outlined">{session ? 'check_circle' : 'radio_button_unchecked'}</span>
                    {item}
                  </p>
                ))}
            </section>

            <section className="lost-fee">
              <h3>Fee summary</h3>
              <dl>
                <div><dt>Parking fee</dt><dd>{fee ? formatLostTicketMoney(fee.parkingFee) : '—'}</dd></div>
                <div><dt>Lost ticket penalty</dt><dd>{fee ? formatLostTicketMoney(fee.penalty) : '—'}</dd></div>
                <div><dt>Discount</dt><dd>{fee ? formatLostTicketMoney(fee.discount) : '—'}</dd></div>
                <div className="total"><dt>Total payable</dt><dd>{fee ? fee.formattedTotal : '—'}</dd></div>
                <div className="payment"><dt>Payment status</dt><dd>{fee?.paymentStatus || 'Not calculated'}</dd></div>
              </dl>
              <p>After completion, the assigned slot will be released and marked Available.</p>
            </section>

            {message && <div className="lost-message">{message}</div>}

            <div className="lost-actions">
              <button onClick={() => {
                setSession(null); setFee(null); setQuery(''); setOwnerName(''); setPhone(''); setMessage('')
              }}>Clear form</button>
              <button onClick={verify} disabled={action === 'verify'}>{action === 'verify' ? 'Verifying…' : 'Verify vehicle'}</button>
              <button onClick={calculate} disabled={!session || action === 'fee'}>{action === 'fee' ? 'Calculating…' : 'Calculate fee'}</button>
              <button className="primary" disabled={!fee || action === 'case'} onClick={processCase}>Process payment & exit</button>
            </div>
          </main>

          <aside className="lost-side">
            <section>
              <h2><span className="material-symbols-outlined">history</span>Recovered Session</h2>
              {session ? (
                <dl>
                  <div><dt>Session status</dt><dd className="active">Active</dd></div>
                  <div><dt>Ticket code</dt><dd>{session.ticketCode || '—'}</dd></div>
                  <div><dt>License plate</dt><dd>{session.licensePlate || '—'}</dd></div>
                  <div><dt>Slot</dt><dd className="blue">{session.slotId || '—'}</dd></div>
                  <div><dt>Floor / Zone</dt><dd>{session.floorZone || '—'}</dd></div>
                  <div><dt>Entry gate</dt><dd>{session.entryGate || '—'}</dd></div>
                  <div><dt>Entry time</dt><dd>{formatTime(session.entryTime)}</dd></div>
                  <div><dt>Assignment</dt><dd>{session.assignmentMethod || 'Manual'}</dd></div>
                </dl>
              ) : <p>No recovered session yet.</p>}
            </section>

            <section>
              <h2><span className="material-symbols-outlined">policy</span>Lost Ticket Policy</h2>
              <ul>
                <li>Car/EV penalty: {formatLostTicketMoney(pageData.policy?.carPenalty)}</li>
                <li>Motorcycle penalty: {formatLostTicketMoney(pageData.policy?.motorcyclePenalty)}</li>
                <li>Staff verification required</li>
                <li>Payment required before exit</li>
                <li>Slot released after completion</li>
              </ul>
            </section>
          </aside>
        </div>

        <section className="lost-cases">
          <div>
            <h2>Recent Lost Ticket Cases</h2>
            <button>View full log →</button>
          </div>
          {(!Array.isArray(pageData.recentCases) || pageData.recentCases.length === 0) ? (
            <div className="lost-empty">No recent cases.</div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Time</th>
                  <th>License plate</th>
                  <th>Vehicle type</th>
                  <th>Recovered slot</th>
                  <th>Total paid</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {pageData.recentCases.map((item) => (
                  <tr key={item.id}>
                    <td>{formatTime(item.time)}</td>
                    <td><b>{item.licensePlate || '—'}</b></td>
                    <td>{item.vehicleType || '—'}</td>
                    <td>{item.slotId || '—'}</td>
                    <td><b>{formatLostTicketMoney(item.totalPaid)}</b></td>
                    <td>
                      <span className={(item.status || 'completed').toLowerCase().replace(' ', '-')}>
                        {item.status || 'Completed'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </div>
    </MainLayout>
  )
}

export default LostTicketPage
