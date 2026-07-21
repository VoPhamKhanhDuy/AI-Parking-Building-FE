import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import MainLayout from '../../layouts/MainLayout'
import { ROUTE_PATHS } from '../../routes/routePaths'
import { getTickets, markTicketLost } from './ticketsService'
import './TicketsPage.css'

const STATUS_LABELS = {
  0: 'Issued',
  1: 'Active',
  2: 'PendingExit',
  3: 'PendingPayment',
  4: 'Closed',
  5: 'Cancelled',
  Issued: 'Issued',
  Active: 'Active',
  PendingExit: 'Pending Exit',
  PendingPayment: 'Pending Payment',
  Closed: 'Closed',
  Cancelled: 'Cancelled'
}

function safeString(value) {
  if (value === undefined || value === null) return ''
  return String(value)
}

function Badge({ value }) {
  const raw = safeString(value) || '—'
  const label = STATUS_LABELS[value] ?? raw
  const safe = safeString(label).toLowerCase().replaceAll(' ', '-')
  return <span className={`ticket-badge ${safe}`}>{label}</span>
}

function formatTime(value) {
  if (!value) return '—'
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: 'short'
  })
}

function formatShortTime(value) {
  if (!value) return '—'
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
}

function deriveStats(tickets = []) {
  const todayKey = new Date().toISOString().slice(0, 10)
  let active = 0
  let closedToday = 0
  let lost = 0
  let reservation = 0
  let monthly = 0
  for (const t of tickets) {
    const status = safeString(t.status)
    if (status === 'Active' || status === '1') active += 1
    if ((status === 'Closed' || status === '4') && t.exitTime && String(t.exitTime).startsWith(todayKey)) {
      closedToday += 1
    }
    if (status === 'Cancelled' || status === '5') lost += 1
    if (t.ticketType === 'Reservation') reservation += 1
    if (t.ticketType === 'Monthly') monthly += 1
  }
  return { activeTickets: active, closedToday, lostTicketCases: lost, reservationTickets: reservation, monthlyTickets: monthly }
}

function TicketsPage() {
  const navigate = useNavigate()
  const [data, setData] = useState({ stats: {}, tickets: [], activities: [] })
  const [selectedId, setSelectedId] = useState(null)
  const [search, setSearch] = useState('')
  const [type, setType] = useState('All Types')
  const [status, setStatus] = useState('All Statuses')
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  useEffect(() => {
    let active = true
    const timer = setTimeout(() => {
      getTickets({ search, type, status })
        .then((result) => {
          if (!active) return
          const tickets = Array.isArray(result?.data?.tickets) ? result.data.tickets : []
          const stats = result?.data?.stats && Object.keys(result.data.stats).length > 0
            ? result.data.stats
            : deriveStats(tickets)
          const activities = tickets.slice(0, 5).map((t) => ({
            id: t.id,
            time: t.entryTime,
            ticketCode: t.ticketCode,
            licensePlate: t.licensePlate,
            action: 'Checked in',
            staff: t.staff,
            status: t.status
          }))
          setData({ stats, tickets, activities })
          setSelectedId((current) => current && tickets.some((t) => t.id === current)
            ? current
            : (tickets[0]?.id ?? null))
          if (!result?.success) setMessage('Unable to load tickets.')
          else setMessage('')
        })
        .catch(() => active && setMessage('Unable to load tickets.'))
        .finally(() => active && setLoading(false))
    }, 180)
    return () => { active = false; clearTimeout(timer) }
  }, [search, type, status])

  const selected = useMemo(
    () => data.tickets.find((item) => item.id === selectedId) || data.tickets[0] || null,
    [data.tickets, selectedId]
  )

  const markLost = async () => {
    if (!selected) return
    try {
      // markTicketLost resolves { success, data } — it never returns the
      // ticket directly, so we must check success and read result.data.
      const result = await markTicketLost(selected.id)
      if (!result?.success) {
        setMessage('Failed to mark as lost.')
        return
      }
      const updated = result.data
      setData((current) => ({
        ...current,
        tickets: current.tickets.map((item) => item.id === updated.id ? updated : item)
      }))
      setMessage(`${updated.ticketCode || 'Ticket'} marked as lost ticket.`)
    } catch (error) {
      setMessage(error?.message || 'Failed to mark as lost.')
    }
  }

  const statCards = [
    ['Active Tickets', data.stats?.activeTickets],
    ['Closed Today', data.stats?.closedToday],
    ['Lost Ticket Cases', data.stats?.lostTicketCases],
    ['Reservation Tickets', data.stats?.reservationTickets],
    ['Monthly Tickets', data.stats?.monthlyTickets]
  ]

  const canMarkLost = selected && selected.ticketType !== 'Lost Ticket'

  return (
    <MainLayout>
      <div className="tickets-page">
        <nav className="tickets-breadcrumb">
          <button onClick={() => navigate(ROUTE_PATHS.dashboard)}>Dashboard</button>
          <span>/</span>
          <b>Tickets</b>
        </nav>

        <header className="tickets-heading">
          <h1>Tickets</h1>
          <p>Manage parking tickets, active sessions, ticket status and vehicle parking records.</p>
        </header>

        <section className="tickets-stats">
          {statCards.map(([label, value]) => (
            <div key={label}>
              <small>{label}</small>
              <strong>{value ?? '—'}</strong>
            </div>
          ))}
        </section>

        <section className="tickets-filters">
          <label>
            <span className="material-symbols-outlined">search</span>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search ticket code or license plate"
            />
          </label>
          <select value={type} onChange={(event) => setType(event.target.value)}>
            <option>All Types</option>
            <option>Normal</option>
            <option>Monthly</option>
            <option>Reservation</option>
            <option>Lost Ticket</option>
          </select>
          <select value={status} onChange={(event) => setStatus(event.target.value)}>
            <option>All Statuses</option>
            <option>Active</option>
            <option>Pending Exit</option>
            <option>Pending Payment</option>
            <option>Closed</option>
          </select>
        </section>

        {message && <div className="tickets-message">{message}</div>}

        <div className="tickets-layout">
          <section className="ticket-list-card">
            <div className="ticket-card-header">
              <h2>Ticket List</h2>
              <span>Showing {data.tickets.length} tickets</span>
            </div>
            {loading ? (
              <div className="ticket-loading">Loading tickets…</div>
            ) : data.tickets.length === 0 ? (
              <div className="ticket-empty">No tickets match the current filters.</div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Ticket</th>
                    <th>Type</th>
                    <th>Slot</th>
                    <th>Entry time</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.tickets.map((item) => (
                    <tr
                      key={item.id}
                      className={item.id === selected?.id ? 'selected' : ''}
                      onClick={() => setSelectedId(item.id)}
                    >
                      <td>
                        <b>{item.ticketCode || '—'}</b>
                        <small>{item.licensePlate || '—'}</small>
                      </td>
                      <td>{item.ticketType || '—'}</td>
                      <td><b>{item.slotId || '—'}</b></td>
                      <td>{formatTime(item.entryTime)}</td>
                      <td><Badge value={item.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>

          <aside className="ticket-detail">
            <div className="ticket-card-header">
              <h2>Ticket Detail</h2>
              {selected && <Badge value={selected.status} />}
            </div>
            {selected ? (
              <>
                <div className="ticket-identity">
                  <h3>{selected.ticketCode || '—'}</h3>
                  <strong>{selected.licensePlate || '—'}</strong>
                  <div>
                    <span><i className="material-symbols-outlined">local_parking</i>{selected.slotId || '—'}</span>
                    <b>{selected.paymentStatus || 'Pending'}</b>
                  </div>
                </div>
                <dl>
                  <div><dt>Vehicle type</dt><dd>{selected.vehicleType || '—'}</dd></div>
                  <div><dt>Ticket type</dt><dd>{selected.ticketType || '—'}</dd></div>
                  <div><dt>Floor / Zone</dt><dd>{selected.floorZone || '—'}</dd></div>
                  <div><dt>Entry gate</dt><dd>{selected.entryGate || '—'}</dd></div>
                  <div><dt>Entry time</dt><dd>{formatTime(selected.entryTime)}</dd></div>
                  <div><dt>Method</dt><dd>{selected.method || '—'}</dd></div>
                  <div><dt>Staff</dt><dd>{selected.staff || '—'}</dd></div>
                </dl>
                <div className="ticket-actions">
                  <button onClick={() => navigate(ROUTE_PATHS.vehicleExit)}>Process vehicle exit</button>
                  <button className="danger" disabled={!canMarkLost} onClick={markLost}>Mark as lost ticket</button>
                  <button onClick={() => window.print()}>Print ticket</button>
                </div>
              </>
            ) : (
              <div className="ticket-empty">Select a ticket to view details.</div>
            )}
          </aside>
        </div>

        <section className="ticket-activity">
          <div>
            <h2>Recent Ticket Activity</h2>
          </div>
          {data.activities.length === 0 ? (
            <div className="ticket-empty">No recent activity.</div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Ticket code</th>
                  <th>License plate</th>
                  <th>Action</th>
                  <th>Staff</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {data.activities.map((item) => (
                  <tr key={item.id}>
                    <td>{formatShortTime(item.time)}</td>
                    <td><b>{item.ticketCode || '—'}</b></td>
                    <td>{item.licensePlate || '—'}</td>
                    <td>{item.action || '—'}</td>
                    <td>{item.staff || '—'}</td>
                    <td><Badge value={item.status} /></td>
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

export default TicketsPage