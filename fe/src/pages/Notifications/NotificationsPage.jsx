import { useEffect, useMemo, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import MainLayout from '../../layouts/MainLayout'
import { ROUTE_PATHS } from '../../routes/routePaths'
import {
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead
} from './notificationsService'
import './NotificationsPage.css'

const DEFAULT_FILTERS = { search: '', type: 'All Types', status: 'All Statuses', shift: 'Current Shift' }
const TYPE_OPTIONS = ['All Types', 'Info', 'Warning', 'Alert', 'Reservation', 'Payment', 'Ticket']
const STATUS_OPTIONS = ['All Statuses', 'Unread', 'Read', 'Acknowledged', 'Resolved']

function NotificationsPage() {
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState([])
  const [selectedId, setSelectedId] = useState(null)
  const [filters, setFilters] = useState(DEFAULT_FILTERS)
  const [toast, setToast] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    const timer = setTimeout(() => {
      getNotifications(filters)
        .then((result) => {
          if (!active) return
          const list = Array.isArray(result?.data) ? result.data : []
          setNotifications(list)
          setSelectedId((current) => current && list.some((n) => n.id === current)
            ? current
            : (list[0]?.id ?? null))
          setLoading(false)
        })
        .catch(() => active && setLoading(false))
    }, 180)
    return () => { active = false; clearTimeout(timer) }
  }, [filters])

  useEffect(() => {
    if (!toast) return undefined
    const timer = setTimeout(() => setToast(''), 2600)
    return () => clearTimeout(timer)
  }, [toast])

  const filteredItems = useMemo(() => {
    const search = filters.search.trim().toLowerCase()
    const statusLower = filters.status === 'All Statuses' ? null : filters.status.toLowerCase()
    return notifications.filter((item) => {
      if (filters.type !== 'All Types' && item.type !== filters.type) return false
      if (statusLower && item.status.toLowerCase() !== statusLower) return false
      if (search) {
        const blob = `${item.message} ${item.licensePlate} ${item.ticketCode} ${item.reference}`.toLowerCase()
        if (!blob.includes(search)) return false
      }
      return true
    })
  }, [notifications, filters])

  const selected = useMemo(
    () => filteredItems.find((item) => item.id === selectedId) || filteredItems[0] || null,
    [filteredItems, selectedId]
  )

  const unreadCount = useMemo(
    () => notifications.filter((item) => item.status === 'Unread').length,
    [notifications]
  )

  const primaryAction = useMemo(() => {
    if (!selected) return null
    if (selected.ticketCode && selected.ticketCode !== '—') {
      return { label: 'Open Ticket', path: ROUTE_PATHS.tickets }
    }
    if (selected.licensePlate && selected.licensePlate !== '—') {
      return { label: 'Verify Vehicle', path: ROUTE_PATHS.vehicleEntry }
    }
    return null
  }, [selected])

  const updateFilter = useCallback((event) => {
    const { name, value } = event.target
    setFilters((current) => ({ ...current, [name]: value }))
  }, [])

  const markSelectedRead = useCallback(async () => {
    if (!selected || selected.status !== 'Unread') return
    const previous = notifications
    setNotifications((items) => items.map((item) => item.id === selected.id
      ? { ...item, status: 'Read', readAt: new Date().toISOString() }
      : item))
    setToast(`Marked "${selected.message}" as read.`)
    const result = await markNotificationRead(selected.id)
    if (!result?.success) {
      setNotifications(previous)
      setToast(result?.message || 'Failed to mark as read.')
    }
  }, [selected, notifications])

  const markAllRead = useCallback(async () => {
    if (!unreadCount) return
    const previous = notifications
    setNotifications((items) => items.map((item) => item.status === 'Unread'
      ? { ...item, status: 'Read', readAt: new Date().toISOString() }
      : item))
    setToast(`${unreadCount} notification${unreadCount > 1 ? 's' : ''} marked as read.`)
    const result = await markAllNotificationsRead()
    if (!result?.success) {
      setNotifications(previous)
      setToast('Failed to mark all as read.')
    }
  }, [notifications, unreadCount])

  return (
    <MainLayout>
      <div className="notifications-page">
        <header className="notifications-heading">
          <div className="breadcrumb">
            <button onClick={() => navigate(ROUTE_PATHS.dashboard)}>Dashboard</button>
            <span className="material-symbols-outlined">chevron_right</span>
            <strong>Notifications</strong>
          </div>
          <h1>Notifications</h1>
          <p>View important alerts and reminders during the current shift.</p>
        </header>

        <section className="notification-filters">
          <label className="notification-search">
            <span className="material-symbols-outlined">search</span>
            <input name="search" value={filters.search} onChange={updateFilter} placeholder="Search plate, ticket, reservation..." />
          </label>
          <select aria-label="Notification type" name="type" value={filters.type} onChange={updateFilter}>
            {TYPE_OPTIONS.map((type) => <option key={type} value={type}>{type}</option>)}
          </select>
          <select aria-label="Notification status" name="status" value={filters.status} onChange={updateFilter}>
            {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <select aria-label="Work shift" name="shift" value={filters.shift} onChange={updateFilter}>
            <option>Current Shift</option>
            <option>All Shifts</option>
          </select>
          <button className="mark-all-button" onClick={markAllRead} disabled={!unreadCount}>
            Mark All Read {unreadCount > 0 && <span>{unreadCount}</span>}
          </button>
        </section>

        <div className="notifications-grid">
          <section className="notification-list-card">
            <h2>Notification List <span>{filteredItems.length}</span></h2>
            <div className="notification-table-wrap">
              {loading ? (
                <div className="notification-loading">Loading notifications…</div>
              ) : (
                <table className="notification-table">
                  <thead>
                    <tr>
                      <th>Time</th>
                      <th>Type</th>
                      <th>Message</th>
                      <th>Reference</th>
                      <th>Priority</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredItems.map((item) => (
                      <tr key={item.id} className={selected?.id === item.id ? 'selected' : ''} onClick={() => setSelectedId(item.id)} tabIndex="0" onKeyDown={(event) => event.key === 'Enter' && setSelectedId(item.id)}>
                        <td>{item.time}</td>
                        <td>{item.type}</td>
                        <td><strong>{item.message}</strong></td>
                        <td className="notification-reference">{item.reference}</td>
                        <td><span className={`priority ${String(item.priority).toLowerCase()}`}>{item.priority}</span></td>
                        <td><span className={`notification-status ${String(item.status).toLowerCase()}`}>{item.status}</span></td>
                      </tr>
                    ))}
                    {!filteredItems.length && (
                      <tr><td className="empty-notifications" colSpan="6">No notifications match your filters.</td></tr>
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </section>

          <aside className="notification-detail">
            <h2>Notification Detail</h2>
            {selected ? (
              <>
                <dl>
                  <dt>Type</dt><dd>{selected.type}</dd>
                  <dt>Priority</dt><dd className={`priority ${String(selected.priority).toLowerCase()}`}>{selected.priority}</dd>
                  <dt>Time</dt><dd>{selected.fullTime}</dd>
                  <dt>Reference</dt><dd className="notification-reference">{selected.reference}</dd>
                  <dt>Ticket Code</dt><dd className="notification-reference">{selected.ticketCode}</dd>
                  <dt>License Plate</dt><dd><strong>{selected.licensePlate}</strong></dd>
                  <dt>Status</dt><dd className={`detail-status ${String(selected.status).toLowerCase()}`}>{selected.status}</dd>
                  <dt>Staff</dt><dd>{selected.staff}</dd>
                  <dt>Gate</dt><dd>{selected.gate}</dd>
                </dl>
                <div className="notification-description">
                  <h3>Description</h3>
                  <p>{selected.description}</p>
                </div>
                <div className="notification-actions">
                  {primaryAction && <button className="primary" onClick={() => navigate(primaryAction.path)}>{primaryAction.label}</button>}
                  {selected.ticketCode !== '—' && <button onClick={() => navigate(ROUTE_PATHS.tickets)}>Open Ticket</button>}
                  <button onClick={markSelectedRead} disabled={selected.status !== 'Unread'}>
                    {selected.status === 'Unread' ? 'Mark as Read' : 'Already Read'}
                  </button>
                </div>
              </>
            ) : (
              <p className="no-selection">Select a notification to view details.</p>
            )}
          </aside>
        </div>

        {toast && (
          <div className="notification-toast" role="status">
            <span className="material-symbols-outlined">check_circle</span>
            <span>{toast}</span>
            <button aria-label="Dismiss notification" onClick={() => setToast('')}>
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
        )}
      </div>
    </MainLayout>
  )
}

export default NotificationsPage