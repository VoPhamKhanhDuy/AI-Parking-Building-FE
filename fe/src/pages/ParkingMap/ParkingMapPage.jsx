import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import MainLayout from '../../layouts/MainLayout'
import { ROUTE_PATHS } from '../../routes/routePaths'
import {
  calculateLostTicketFee,
  createLostTicketCase,
  findLostTicketSession,
  formatLostTicketMoney,
  getLostTicketPageData
} from "../LostTicket/lostTicketService"
import "../LostTicket/LostTicketPage.css";

// NOTE: lostTicketService.js has no payment-processing export yet.
// Kept local here (same axios/mock pattern as the rest of the service)
// so only this page needed changing. Ideally this belongs in
// lostTicketService.js alongside the other calls — move it there when
// that file gets its own pass.
const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api', timeout: 8000 })
const useMockData = import.meta.env.VITE_USE_MOCK_DATA !== 'false'
const wait = (value, delay = 400) => new Promise((resolve) => setTimeout(() => resolve(value), delay))

async function processLostTicketPayment(caseId, payload) {
  if (!useMockData) {
    const { data } = await api.post(`/lost-tickets/${caseId}/process-payment`, payload)
    return data
  }
  return wait({ id: caseId, caseCode: `LT-${String(caseId).slice(-6)}`, paymentStatus: 'Paid', ...payload })
}

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

const DEFAULT_PAGE = { policy: { carPenalty: 0, motorcyclePenalty: 0, baseParkingFee: 50000 }, recentCases: [] }

function LostTicketPage() {
  const navigate = useNavigate()
  const [method, setMethod] = useState('License Plate')
  const [query, setQuery] = useState('')
  const [ownerName, setOwnerName] = useState('')
  const [phone, setPhone] = useState('')
  const [vehicleType, setVehicleType] = useState('Car')
  const [session, setSession] = useState(null)
  const [caseData, setCaseData] = useState(null)
  const [fee, setFee] = useState(null)
  const [pageData, setPageData] = useState(DEFAULT_PAGE)
  const [action, setAction] = useState('')
  const [message, setMessage] = useState('')
  const [now, setNow] = useState(() => Date.now())

  const loadPageData = () => getLostTicketPageData()
    .then((result) => ({
      policy: result?.policy || DEFAULT_PAGE.policy,
      recentCases: Array.isArray(result?.recentCases) ? result.recentCases : []
    }))
    .catch(() => DEFAULT_PAGE)

  useEffect(() => {
    let active = true
    const id = setInterval(() => setNow(Date.now()), 60_000)
    loadPageData().then((data) => active && setPageData(data))
    return () => { active = false; clearInterval(id) }
  }, [])

  const verify = async () => {
    if (!query.trim()) {
      setMessage('Please enter a ticket code or license plate to verify.')
      return
    }
    setAction('verify')
    setMessage('')
    setCaseData(null)
    setFee(null)
    try {
      // findLostTicketSession resolves the session object directly, or null — no {success,data} wrapper.
      const result = await findLostTicketSession({ method, query: query.trim() })
      if (result) {
        setSession(result)
        if (result.vehicleType && result.vehicleType !== '—') {
          setVehicleType(result.vehicleType)
        }
        setMessage('Active parking session recovered.')
      } else {
        setSession(null)
        setMessage('No active session matches the supplied information.')
      }
    } catch (error) {
      setSession(null)
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
      // Delegate to the service (hits the real fee endpoint when mock is off)
      // instead of guessing the policy math on the client.
      const result = await calculateLostTicketFee(session.id)
      setFee({
        ...result,
        formattedTotal: result.formattedTotal || formatLostTicketMoney(result.total),
        paymentStatus: result.paymentStatus || 'Pending'
      })
      setMessage('Fee calculated. Ready to process payment.')
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
      // createLostTicketCase expects a session id, and returns the case
      // object directly — no {success,data} wrapper.
      const createdCase = await createLostTicketCase(session.id, { ownerName, phone })
      const caseId = createdCase?.id || createdCase?.caseId
      if (!caseId) {
        setMessage('Could not create lost ticket case.')
        return
      }
      setCaseData(createdCase)

      const paymentResult = await processLostTicketPayment(caseId, {
        ownerName,
        phone,
        paymentMethod: 'Cash'
      })

      setMessage(`Case ${createdCase.caseCode || caseId} created and payment processed successfully. Vehicle can now exit.`)
      setFee((prev) => ({ ...prev, paymentStatus: paymentResult?.paymentStatus || 'Paid' }))

      const refreshed = await loadPageData()
      setPageData(refreshed)
    } catch (error) {
      setMessage(error?.message || 'Could not process lost ticket case.')
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
                <label><span>Assigned slot</span><strong>{session.slotCode || session.slotId || '—'}</strong></label>
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
                setSession(null); setFee(null); setCaseData(null); setQuery(''); setOwnerName(''); setPhone(''); setMessage('')
              }}>Clear form</button>
              <button onClick={verify} disabled={action === 'verify'}>{action === 'verify' ? 'Verifying…' : 'Verify vehicle'}</button>
              <button onClick={calculate} disabled={!session || action === 'fee'}>{action === 'fee' ? 'Calculating…' : 'Calculate fee'}</button>
              <button className="primary" disabled={!fee || action === 'case'} onClick={processCase}>
                {action === 'case' ? 'Processing…' : 'Process payment & exit'}
              </button>
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
                  <div><dt>Slot</dt><dd className="blue">{session.slotCode || session.slotId || '—'}</dd></div>
                  <div><dt>Floor / Zone</dt><dd>{session.floorZone || '—'}</dd></div>
                  <div><dt>Entry gate</dt><dd>{session.entryGate || '—'}</dd></div>
                  <div><dt>Entry time</dt><dd>{formatTime(session.entryTime)}</dd></div>
                  <div><dt>Assignment</dt><dd>{session.assignmentMethod || 'Manual'}</dd></div>
                  {caseData && (
                    <>
                      <div><dt>Case code</dt><dd>{caseData.caseCode || caseData.id || caseData.caseId || '—'}</dd></div>
                      <div><dt>Payment</dt><dd className={fee?.paymentStatus === 'Paid' ? 'active' : ''}>{fee?.paymentStatus || 'Pending'}</dd></div>
                    </>
                  )}
                </dl>
              ) : <p>No recovered session yet.</p>}
            </section>

            <section>
              <h2><span className="material-symbols-outlined">policy</span>Lost Ticket Policy</h2>
              <ul>
                <li>Car/EV penalty: {formatLostTicketMoney(pageData.policy?.carPenalty || 500000)}</li>
                <li>Motorcycle penalty: {formatLostTicketMoney(pageData.policy?.motorcyclePenalty || 200000)}</li>
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
          </div>
          {(!Array.isArray(pageData.recentCases) || pageData.recentCases.length === 0) ? (
            <div className="lost-empty">No recent cases.</div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Case code</th>
                  <th>License plate</th>
                  <th>Vehicle type</th>
                  <th>Total paid</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {pageData.recentCases.map((item) => (
                  <tr key={item.id}>
                    <td>{formatTime(item.time)}</td>
                    <td><b>{item.caseCode || '—'}</b></td>
                    <td><b>{item.licensePlate || '—'}</b></td>
                    <td>{item.vehicleType || '—'}</td>
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