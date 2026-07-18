import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import MainLayout from '../../layouts/MainLayout'
import { ROUTE_PATHS } from '../../routes/routePaths'
import { getParkingMap, updateParkingSlot } from './parkingMapService'
import './ParkingMapPage.css'

const STATUS_ICON = { Occupied: 'directions_car', Reserved: 'lock', Maintenance: 'build' }

function ParkingSlot({ slot, selected, onClick }) {
  const typeIcon = slot.type === 'Motorcycle' ? 'two_wheeler' : slot.type === 'Electric Vehicle' ? 'ev_station' : null
  return <button className={`map-slot ${slot.status.toLowerCase()}${selected ? ' selected' : ''}`} onClick={() => onClick(slot.id)} aria-pressed={selected}><strong>{slot.id}</strong>{(STATUS_ICON[slot.status] || typeIcon) && <span className="material-symbols-outlined">{STATUS_ICON[slot.status] || typeIcon}</span>}{selected && slot.vehicle && <em><small>Current session</small>{slot.vehicle}</em>}</button>
}

function ParkingMapPage() {
  const navigate = useNavigate()
  const [data, setData] = useState({ summary: {}, slots: [], updates: [] })
  const [selectedId, setSelectedId] = useState('B2-18')
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('All Statuses')
  const [building, setBuilding] = useState('All Buildings')
  const [floor, setFloor] = useState('All Floors')
  const [zone, setZone] = useState('All Zones')
  const [vehicleType, setVehicleType] = useState('All Vehicles')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    const timer = setTimeout(() => getParkingMap({ search, status, building, floor, zone, vehicleType }).then((result) => active && setData(result)).catch(() => active && setError('Unable to load parking map.')).finally(() => active && setLoading(false)), 180)
    return () => { active = false; clearTimeout(timer) }
  }, [search, status, building, floor, zone, vehicleType])

  const selected = data.slots.find((slot) => slot.id === selectedId) || data.slots[0]
  const zoneGroups = useMemo(() => [
    { key: 'motorcycle', label: 'Zone A', name: 'Motorcycle', slots: data.slots.filter((slot) => slot.type === 'Motorcycle') },
    { key: 'car', label: 'Zone B', name: 'Car', slots: data.slots.filter((slot) => slot.type === 'Car') },
    { key: 'ev', label: 'Zone C', name: 'EV charging', slots: data.slots.filter((slot) => slot.type === 'Electric Vehicle') },
  ].filter((group) => group.slots.length), [data.slots])

  const changeStatus = async (nextStatus) => {
    if (!selected) return
    setSaving(true); setError('')
    try { const result = await updateParkingSlot(selected.id, nextStatus); setData((current) => ({ ...current, summary: result.summary, slots: current.slots.map((slot) => slot.id === selected.id ? result.slot : slot), updates: [result.update, ...current.updates] })) }
    catch (requestError) { setError(requestError.message || 'Could not update slot.') }
    finally { setSaving(false) }
  }

  const summaryItems = [['Total slots', data.summary.totalSlots], ['Available', data.summary.available], ['Occupied', data.summary.occupied], ['Reserved', data.summary.reserved], ['Maintenance', data.summary.maintenance], ['Occupancy', `${data.summary.occupancyRate || 0}%`]]

  return <MainLayout><div className="parking-page">
    <nav className="parking-breadcrumb"><button onClick={() => navigate(ROUTE_PATHS.dashboard)}>Dashboard</button><span>/</span><b>Parking Map</b></nav>
    <header className="parking-heading"><div><h1>Parking Map</h1><p>Real-time parking slot status by floor, zone and vehicle type.</p></div><span><i />Live data</span></header>
    <section className="parking-summary">{summaryItems.map(([label, value]) => <div className={label.toLowerCase().replace(' ', '-')} key={label}><small>{label}</small><strong>{value ?? '—'}</strong></div>)}</section>
    <section className="parking-filters"><select aria-label="Building" value={building} onChange={(event) => setBuilding(event.target.value)}><option>All Buildings</option><option>Building A</option><option>Building B</option></select><select aria-label="Floor" value={floor} onChange={(event) => setFloor(event.target.value)}><option>All Floors</option><option>Basement</option><option>Floor 1</option><option>Floor 2</option><option>Floor 3</option><option>Floor 4</option></select><select aria-label="Zone" value={zone} onChange={(event) => setZone(event.target.value)}><option>All Zones</option><option>Car</option><option>Motorcycle</option><option>EV Charging</option></select><select aria-label="Vehicle" value={vehicleType} onChange={(event) => setVehicleType(event.target.value)}><option>All Vehicles</option><option>Car</option><option>Motorcycle</option><option>Electric Vehicle</option></select><select aria-label="Status" value={status} onChange={(event) => setStatus(event.target.value)}><option>All Statuses</option><option>Available</option><option>Occupied</option><option>Reserved</option><option>Maintenance</option></select><label><span className="material-symbols-outlined">search</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search slot or license plate"/></label></section>
    {error && <div className="parking-error">{error}</div>}
    <div className="parking-layout"><section className="parking-map-card"><div className="parking-card-heading"><div><h2>Parking Slot Map</h2><p>{floor} · {zone} · {vehicleType}</p></div><div className="parking-legend">{['Available','Occupied','Reserved','Maintenance'].map((item) => <span key={item}><i className={item.toLowerCase()} />{item}</span>)}</div></div>
      <div className="parking-canvas">{loading ? <div className="parking-loading"><i />Loading availability…</div> : data.slots.length === 0 ? <div className="parking-loading">No slots match the selected filters.</div> : <><div className="map-marker entry"><span className="material-symbols-outlined">login</span>Entry</div><div className="map-marker lift"><span className="material-symbols-outlined">elevator</span>Lift</div><div className="parking-zones">{zoneGroups.map((group) => <section className={`parking-zone-map ${group.key}`} key={group.key}><h3><b>{group.label}</b><span>{group.name}</span><em>{group.slots.length} slots</em></h3><div className="zone-slot-grid">{group.slots.map((slot) => <ParkingSlot key={slot.id} slot={slot} selected={slot.id === selected?.id} onClick={setSelectedId}/>)}</div><div className="zone-flow"><b>ENTRY FLOW</b><span>→</span><span>→</span><span>→</span></div></section>)}</div></>}</div>
    </section>
    <aside className="slot-inspector"><div className="inspector-header"><div><small>Selected slot</small><h2>{selected?.id || '—'}</h2></div><span className={`slot-status ${selected?.status?.toLowerCase()}`}>{selected?.status || 'Unknown'}</span></div>{selected && <div className="inspector-body"><div className="vehicle-panel"><span className="material-symbols-outlined">{selected.type === 'Motorcycle' ? 'two_wheeler' : selected.type === 'Electric Vehicle' ? 'electric_car' : 'directions_car'}</span><div><small>{selected.type}</small><strong>{selected.vehicle || 'No active vehicle'}</strong></div></div><dl><div><dt>Building</dt><dd>{selected.building}</dd></div><div><dt>Floor</dt><dd>{selected.floor}</dd></div><div><dt>Zone</dt><dd>{selected.zone}</dd></div><div><dt>Ticket ID</dt><dd>{selected.ticketId || '—'}</dd></div><div><dt>Session status</dt><dd>{selected.vehicle ? 'Active' : 'Inactive'}</dd></div><div><dt>Entry time</dt><dd>{selected.entryTime || '—'}</dd></div><div><dt>Assignment</dt><dd>{selected.method || 'Manual / Idle'}</dd></div><div><dt>Processed by</dt><dd>{selected.processedBy || '—'}</dd></div></dl></div>}<div className="inspector-actions"><button className="primary">View session detail</button><button>Update actual parking slot</button><div><button disabled={saving || !['Occupied','Reserved'].includes(selected?.status)} onClick={() => changeStatus('Available')}>Release slot</button><button disabled={saving || selected?.status === 'Maintenance'} onClick={() => changeStatus('Maintenance')}>{saving ? 'Updating…' : 'Maintenance'}</button></div></div></aside></div>
    <section className="updates-card"><div><h2>Recent Slot Updates</h2><button>View full history →</button></div><table><thead><tr><th>Time</th><th>Slot</th><th>Vehicle</th><th>Action</th><th>Staff</th><th>Status</th></tr></thead><tbody>{data.updates.map((item) => <tr key={item.id}><td>{item.time}</td><td><b>{item.slot}</b></td><td>{item.vehicle}</td><td>{item.action}</td><td>{item.staff}</td><td><span className={`update-status ${item.status.toLowerCase().replace(' ', '-')}`}>{item.status}</span></td></tr>)}</tbody></table></section>
  </div></MainLayout>
}

export default ParkingMapPage
