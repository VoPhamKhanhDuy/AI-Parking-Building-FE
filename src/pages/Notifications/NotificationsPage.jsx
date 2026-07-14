import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import MainLayout from '../../layouts/MainLayout'
import { ROUTE_PATHS } from '../../routes/routePaths'
import {
  filterNotifications,
  getNotificationAction,
  getNotifications,
  getNotificationTypes,
  markAllNotificationsRead,
  markNotificationRead,
  saveNotifications,
} from './notificationsService'
import './NotificationsPage.css'

const defaultFilters = { search: '', type: 'All Types', status: 'All Statuses', shift: 'Current Shift' }

function NotificationsPage() {
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState(getNotifications)
  const [selectedId, setSelectedId] = useState(notifications[0]?.id)
  const [filters, setFilters] = useState(defaultFilters)
  const [toast, setToast] = useState('')
  const filteredItems = useMemo(() => filterNotifications(notifications, filters), [notifications, filters])
  const selected = filteredItems.find((item) => item.id === selectedId) || filteredItems[0]
  const types = getNotificationTypes(notifications)
  const unreadCount = notifications.filter((item) => item.status === 'Unread').length
  const primaryAction = getNotificationAction(selected)

  useEffect(() => {
    saveNotifications(notifications)
  }, [notifications])

  useEffect(() => {
    if (!toast) return undefined
    const timer = setTimeout(() => setToast(''), 2600)
    return () => clearTimeout(timer)
  }, [toast])

  const updateFilter = (event) => {
    const { name, value } = event.target
    setFilters((current) => ({ ...current, [name]: value }))
  }

  const markSelectedRead = () => {
    if (selected) {
      setNotifications((items) => markNotificationRead(items, selected.id))
      setToast(`Marked “${selected.message}” as read.`)
    }
  }

  const markAllRead = () => {
    if (!unreadCount) return
    setNotifications((items) => markAllNotificationsRead(items))
    setToast(`${unreadCount} notification${unreadCount > 1 ? 's' : ''} marked as read.`)
  }

  return (
    <MainLayout>
      <div className="notifications-page">
        <header className="notifications-heading">
          <div className="breadcrumb"><button onClick={() => navigate(ROUTE_PATHS.dashboard)}>Dashboard</button><span className="material-symbols-outlined">chevron_right</span><strong>Notifications</strong></div>
          <h1>Notifications</h1>
          <p>View important alerts and reminders during the current shift.</p>
        </header>

        <section className="notification-filters">
          <label className="notification-search"><span className="material-symbols-outlined">search</span><input name="search" value={filters.search} onChange={updateFilter} placeholder="Search plate, ticket, reservation..." /></label>
          <select aria-label="Notification type" name="type" value={filters.type} onChange={updateFilter}><option>All Types</option>{types.map((type) => <option key={type}>{type}</option>)}</select>
          <select aria-label="Notification status" name="status" value={filters.status} onChange={updateFilter}><option>All Statuses</option><option>Unread</option><option>Read</option><option>Acknowledged</option><option>Resolved</option></select>
          <select aria-label="Work shift" name="shift" value={filters.shift} onChange={updateFilter}><option>Current Shift</option><option>All Shifts</option></select>
          <button className="mark-all-button" onClick={markAllRead} disabled={!unreadCount}>Mark All Read {unreadCount > 0 && <span>{unreadCount}</span>}</button>
        </section>

        <div className="notifications-grid">
          <section className="notification-list-card">
            <h2>Notification List <span>{filteredItems.length}</span></h2>
            <div className="notification-table-wrap">
              <table className="notification-table">
                <thead><tr><th>Time</th><th>Type</th><th>Message</th><th>Reference</th><th>Priority</th><th>Status</th></tr></thead>
                <tbody>
                  {filteredItems.map((item) => (
                    <tr key={item.id} className={selected?.id === item.id ? 'selected' : ''} onClick={() => setSelectedId(item.id)} tabIndex="0" onKeyDown={(event) => event.key === 'Enter' && setSelectedId(item.id)}>
                      <td>{item.time}</td><td>{item.type}</td><td><strong>{item.message}</strong></td><td className="notification-reference">{item.reference}</td><td><span className={`priority ${item.priority.toLowerCase()}`}>{item.priority}</span></td><td><span className={`notification-status ${item.status.toLowerCase()}`}>{item.status}</span></td>
                    </tr>
                  ))}
                  {!filteredItems.length && <tr><td className="empty-notifications" colSpan="6">No notifications match your filters.</td></tr>}
                </tbody>
              </table>
            </div>
          </section>

          <aside className="notification-detail">
            <h2>Notification Detail</h2>
            {selected ? <>
              <dl>
                <dt>Type</dt><dd>{selected.type}</dd><dt>Priority</dt><dd className={`priority ${selected.priority.toLowerCase()}`}>{selected.priority}</dd><dt>Time</dt><dd>{selected.fullTime}</dd><dt>Reference</dt><dd className="notification-reference">{selected.reference}</dd><dt>Ticket Code</dt><dd className="notification-reference">{selected.ticketCode}</dd><dt>License Plate</dt><dd><strong>{selected.licensePlate}</strong></dd><dt>Status</dt><dd className={`detail-status ${selected.status.toLowerCase()}`}>{selected.status}</dd><dt>Staff</dt><dd>{selected.staff}</dd><dt>Gate</dt><dd>{selected.gate}</dd>
              </dl>
              <div className="notification-description"><h3>Description</h3><p>{selected.description}</p></div>
              <div className="notification-actions">
                {primaryAction && <button className="primary" onClick={() => navigate(primaryAction.path)}>{primaryAction.label}</button>}
                {selected.ticketCode !== '—' && <button onClick={() => navigate(ROUTE_PATHS.tickets)}>Open Ticket</button>}
                <button onClick={markSelectedRead} disabled={selected.status !== 'Unread'}>{selected.status === 'Unread' ? 'Mark as Read' : 'Already Read'}</button>
              </div>
            </> : <p className="no-selection">Select a notification to view details.</p>}
          </aside>
        </div>
        {toast && <div className="notification-toast" role="status"><span className="material-symbols-outlined">check_circle</span><span>{toast}</span><button aria-label="Dismiss notification" onClick={() => setToast('')}><span className="material-symbols-outlined">close</span></button></div>}
      </div>
    </MainLayout>
  )
}

export default NotificationsPage
