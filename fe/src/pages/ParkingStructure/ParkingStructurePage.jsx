import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ManagerLayout from '../../layouts/ManagerLayout'
import { ROUTE_PATHS } from '../../routes/routePaths'
import { getParkingStructure, updateZone } from './parkingStructureService'
import './ParkingStructurePage.css'

function Badge({ children }) {
  const text = String(children ?? '—')
  const safe = text.toLowerCase().replaceAll(' ', '-')
  return <span className={`structure-badge ${safe}`}>{text}</span>
}

function ParkingStructurePage() {
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [floor, setFloor] = useState('Floor 2')
  const [selectedZone, setSelectedZone] = useState('Zone B')
  const [query, setQuery] = useState('')
  const [notice, setNotice] = useState('')

  useEffect(() => { getParkingStructure().then(setData) }, [])

  const filteredZones = useMemo(() => (data?.zones || []).filter((item) => (
    `${item.location || ''} ${item.zone || ''} ${item.type || ''}`.toLowerCase().includes(query.toLowerCase())
  )), [data, query])

  const building = data?.buildings?.[0]
  const detail = (data?.zones || []).find((item) => item.location === floor && item.zone === selectedZone)
    ?? (data?.zones || []).find((item) => item.location === floor)
    ?? (data?.zones || [])[0]
    ?? { zone: 'N/A', location: 'N/A', type: 'Standard', status: 'Available', capacity: 0, occupied: 0, available: 0, reserved: 0, maintenance: 0 }

  const selectFloor = (nextFloor) => {
    setFloor(nextFloor)
    const firstZone = (data?.zones || []).find((item) => item.location === nextFloor)
    if (firstZone) setSelectedZone(firstZone.zone)
  }

  const selectZone = (item) => {
    setFloor(item.location)
    setSelectedZone(item.zone)
  }

  const showNotice = (message) => {
    setNotice(message)
    window.setTimeout(() => setNotice(''), 2500)
  }

  const markMaintenance = async () => {
    if (!detail.id) {
      showNotice(`${detail.zone} maintenance request has been recorded (offline).`)
      return
    }
    await updateZone(detail.id, { status: 'Maintenance' })
    showNotice(`${detail.zone} maintenance request has been recorded.`)
  }

  if (!data) return <ManagerLayout><div className="structure-loading">Loading parking structure...</div></ManagerLayout>

  const utilizationPct = detail.capacity ? Math.round((detail.occupied / detail.capacity) * 100) : 0

  return <ManagerLayout>
    <div className="structure-page">
      <header className="structure-heading">
        <div>
          <p>Dashboard <span>/</span> Parking Structure</p>
          <h1>Parking Structure</h1>
          <h2>Building capacity, zone allocation, and maintenance status.</h2>
        </div>
        <span><i />Data current</span>
      </header>

      <section className="structure-kpis" aria-label="Structure summary">
        {(data.kpis || []).map((item, index) => <article key={item.id ?? `${item.label ?? 'kpi'}-${index}`}>
          <small>{item.label}</small>
          <strong className={item.tone ?? ''}>{item.value}</strong>
          <span>{item.note}</span>
        </article>)}
      </section>

      <div className="structure-workspace">
        <div className="structure-column structure-left-column">
          <aside className="structure-card structure-navigator">
            <header><h3>Building &amp; floor</h3></header>
            <div className="building-row"><span className="material-symbols-outlined">apartment</span><strong>{building?.name || 'Building'}</strong></div>
            <nav>{(building?.floors || []).map((item) => {
              const zoneCount = data.zones.filter((zone) => zone.location === item).length
              return <button className={floor === item ? 'active' : ''} key={item} onClick={() => selectFloor(item)}>
                <span>{item}</span><small>{zoneCount} {zoneCount === 1 ? 'zone' : 'zones'}</small>
              </button>
            })}</nav>
          </aside>

          <section className="structure-card slot-summary">
            <header><h3>Slot type summary</h3></header>
            <div className="compact-summary">
              {(data.slotTypes || []).map((item, index) => <div key={item.id ?? `${item.type ?? 'type'}-${index}`}>
                <span><strong>{item.type}</strong><small>{item.total} total</small></span>
                <span><b>{item.available}</b><small>available</small></span>
              </div>)}
            </div>
            <footer><span>Total capacity</span><strong>{detail.capacity || 0} slots</strong></footer>
          </section>
        </div>

        <div className="structure-column structure-center-column">
          <section className="structure-card zone-capacity">
            <header>
              <div><h3>Zone capacity</h3><p>{filteredZones.length} zones shown</p></div>
              <label><span className="material-symbols-outlined">search</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search zone" /></label>
            </header>
            <div className="structure-table-wrap">
              <table>
                <thead><tr><th>Location</th><th>Zone</th><th>Type</th><th>Capacity</th><th>Occupied</th><th>Available</th><th>Status</th></tr></thead>
                <tbody>{filteredZones.map((item, index) => <tr className={detail === item ? 'selected' : ''} key={item.id ?? `${item.location ?? 'loc'}-${item.zone ?? 'zone'}-${item.type ?? 'type'}-${index}`} onClick={() => selectZone(item)}>
                  <td>{item.location}</td><td><strong>{item.zone}</strong></td><td>{item.type}</td><td>{item.capacity}</td><td>{item.occupied}</td><td>{item.available}</td><td><Badge>{item.status}</Badge></td>
                </tr>)}</tbody>
              </table>
            </div>
          </section>

          <section className="structure-card updates">
            <header><div><h3>Recent updates</h3><p>Structure and maintenance activity</p></div><button>View all</button></header>
            <div className="updates-list">{(data.recentUpdates || []).map((item, index) => <article key={item.id ?? `${item.time ?? 't'}-${item.area ?? 'a'}-${index}`}>
              <time>{item.time || '—'}</time>
              <div><strong>{item.update || '—'}</strong><span>{item.area || '—'} · {item.staff || '—'}</span></div>
              <Badge>{item.status || 'Updated'}</Badge>
            </article>)}</div>
          </section>
        </div>

        <aside className="structure-card zone-detail">
          <header><div><h3>{detail.zone} · {detail.location}</h3><p>{building?.name || 'Building'} · {detail.type}</p></div><Badge>{detail.status}</Badge></header>
          <div className="utilization"><span>Utilization <b>{utilizationPct}%</b></span><div><i style={{ width: `${utilizationPct}%` }} /></div></div>
          <dl>
            <div><dt>Total slots</dt><dd>{detail.capacity}</dd></div>
            <div><dt>Type</dt><dd>{detail.type}</dd></div>
            <div><dt>Occupied</dt><dd>{detail.occupied}</dd></div>
            <div><dt>Available</dt><dd className="zone-available-value">{detail.available}</dd></div>
            <div><dt>Reserved</dt><dd>{detail.reserved}</dd></div>
            <div><dt>Maintenance</dt><dd className={detail.maintenance > 0 ? 'zone-maintenance-value' : ''}>{detail.maintenance}</dd></div>
          </dl>
          <div className="zone-meta"><span>Last Updated: <strong>Today 10:43</strong></span><span>Managed By: <strong>Facility Manager</strong></span></div>
          <div className="zone-actions">
            <button className="primary" onClick={() => navigate(ROUTE_PATHS.parkingMap)}><span className="material-symbols-outlined">map</span>View Zone Map</button>
            <button onClick={() => showNotice('Zone editor opened in mock mode.')}><span className="material-symbols-outlined">edit</span>Edit Zone</button>
            <button onClick={() => showNotice('Add slots request started.')}><span className="material-symbols-outlined">add_circle</span>Add Slots</button>
            <button className="warning" onClick={markMaintenance}><span className="material-symbols-outlined">build</span>Mark Maintenance</button>
          </div>
        </aside>
      </div>

      {notice && <div className="structure-notice" role="status">{notice}</div>}
    </div>
  </ManagerLayout>
}

export default ParkingStructurePage
