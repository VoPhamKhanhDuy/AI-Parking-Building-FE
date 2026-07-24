import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/useAuth'
import MainLayout from '../../layouts/MainLayout'
import ManagerLayout from '../../layouts/ManagerLayout'
import AdminLayout from '../../layouts/AdminLayout'
import { ROUTE_PATHS } from '../../routes/routePaths'
import { getBuildings, getFloors, getParkingMap, updateParkingSlot, getZones } from './parkingMapService'
import './ParkingMapPage.css'

const STATUS_ICON = { Occupied: 'directions_car', Reserved: 'lock', Maintenance: 'build' }

function ParkingSlot({ slot, selected, onClick }) {
  const typeIcon = slot.type === 'Motorcycle' ? 'two_wheeler' : slot.type === 'Electric Vehicle' ? 'ev_station' : null
  const label = slot.slotCode || slot.id
  return (
    <button className={`map-slot ${(slot.status || '').toLowerCase()}${selected ? ' selected' : ''}`} onClick={() => onClick(slot.id)} aria-pressed={selected}>
      <strong>{label}</strong>
      {(STATUS_ICON[slot.status] || typeIcon) && <span className="material-symbols-outlined">{STATUS_ICON[slot.status] || typeIcon}</span>}
      {selected && slot.vehicle && <em><small>Current session</small>{slot.vehicle}</em>}
    </button>
  )
}

function ParkingMapPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const role = user?.role || user?.Role || 'Staff'
  const Layout = (role === 'Manager' || role === 'Facility Manager') ? ManagerLayout : (role === 'Admin' || role === 'Administrator') ? AdminLayout : MainLayout

  const dashboardPath = (role === 'Manager' || role === 'Facility Manager')
    ? ROUTE_PATHS.managerDashboard
    : (role === 'Admin' || role === 'Administrator')
      ? ROUTE_PATHS.adminDashboard
      : ROUTE_PATHS.dashboard

  const [data, setData] = useState({ summary: {}, slots: [], updates: [] })
  const [selectedId, setSelectedId] = useState(null)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('All Statuses')
  const [building, setBuilding] = useState('All Buildings')
  const [floor, setFloor] = useState('All Floors')
  const [zone, setZone] = useState('All Zones')
  const [vehicleType, setVehicleType] = useState('All Vehicles')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [buildings, setBuildings] = useState([])
  const [floors, setFloors] = useState([])
  const [zones, setZones] = useState([])

  useEffect(() => {
    getBuildings().then((list) => setBuildings(list.length ? list : [{ id: null, name: 'Main Parking Building' }]))
  }, [])

  useEffect(() => {
    const b = buildings.find((x) => x.name === building) || buildings[0]
    if (!b?.id) return undefined
    let active = true
    getFloors(b.id).then((list) => {
      if (!active) return
      setFloors(list.map((f) => ({ ...f, label: f.name || `Floor ${f.floorNumber}` })))
    })
    return () => { active = false }
  }, [building, buildings])

  useEffect(() => {
    const f = floors.find((x) => (x.name || `Floor ${x.floorNumber}`) === floor) || floors[0]
    if (!f?.id) return undefined
    let active = true
    getZones(f.id).then((list) => { if (active) setZones(list) })
    return () => { active = false }
  }, [floor, floors])

  useEffect(() => {
    let active = true
    const timer = setTimeout(() => {
      setError('')
      getParkingMap({ search, status, building, floor, zone, vehicleType })
        .then((result) => {
          if (!active) return
          setData(result)
          if (!selectedId && result.slots.length) setSelectedId(result.slots[0].id)
        })
        .catch(() => active && setError('Unable to load parking map.'))
        .finally(() => active && setLoading(false))
    }, 180)
    return () => { active = false; clearTimeout(timer) }
  }, [search, status, building, floor, zone, vehicleType, selectedId])

  const selected = useMemo(() => data.slots.find((slot) => slot.id === selectedId) || data.slots[0] || null, [data.slots, selectedId])
  const zoneGroups = useMemo(() => {
    const grouped = data.slots.reduce((acc, slot) => {
      const key = slot.type || 'Other'
      if (!acc[key]) acc[key] = []
      acc[key].push(slot)
      return acc
    }, {})
    return Object.entries(grouped).map(([type, slots]) => ({
      key: type.toLowerCase().replace(/\s+/g, '-'),
      label: type,
      name: slots[0]?.zone || type,
      slots
    }))
  }, [data.slots])

  const changeStatus = async (nextStatus) => {
    if (!selected) return
    setSaving(true); setError('')
    try {
      const result = await updateParkingSlot(selected.id, nextStatus)
      setData((current) => ({
        ...current,
        slots: current.slots.map((slot) => slot.id === selected.id ? { ...slot, ...result.slot, status: result.slot.status || nextStatus } : slot),
        updates: [result.update, ...current.updates]
      }))
      if (result.summary) {
        setData((current) => ({ ...current, summary: result.summary }))
      }
    } catch (requestError) {
      setError(requestError.message || 'Could not update slot.')
    } finally {
      setSaving(false)
    }
  }

  const summaryItems = [
    ['Total slots', data?.summary?.totalSlots],
    ['Available', data?.summary?.available],
    ['Occupied', data?.summary?.occupied],
    ['Reserved', data?.summary?.reserved],
    ['Maintenance', data?.summary?.maintenance],
    ['Occupancy', `${data?.summary?.occupancyRate ?? 0}%`]
  ]

  return (
    <Layout>
      <div className="parking-page">
        <nav className="parking-breadcrumb">
          <button onClick={() => navigate(dashboardPath)}>Dashboard</button>
          <span>/</span>
          <b>Parking Map</b>
        </nav>

        <header className="parking-heading">
          <div>
            <h1>Parking Map</h1>
            <p>Real-time parking slot status by floor, zone and vehicle type.</p>
          </div>
          <span><i />Live data</span>
        </header>

        <section className="parking-summary">
          {summaryItems.map(([label, value]) => (
            <div className={label.toLowerCase().replace(' ', '-')} key={label}>
              <small>{label}</small>
              <strong>{value ?? '—'}</strong>
            </div>
          ))}
        </section>

        <section className="parking-filters">
          <select aria-label="Building" value={building} onChange={(event) => { setBuilding(event.target.value); setFloor('All Floors'); setZone('All Zones') }}>
            <option>All Buildings</option>
            {buildings.map((b) => <option key={b.id} value={b.name}>{b.name}</option>)}
          </select>

          <select aria-label="Floor" value={floor} onChange={(event) => { setFloor(event.target.value); setZone('All Zones') }}>
            <option>All Floors</option>
            {floors.map((f) => <option key={f.id} value={f.name || `Floor ${f.floorNumber}`}>{f.name || `Floor ${f.floorNumber}`}</option>)}
          </select>

          <select aria-label="Zone" value={zone} onChange={(event) => setZone(event.target.value)}>
            <option>All Zones</option>
            {zones.map((z) => <option key={z.id} value={z.name}>{z.name}</option>)}
          </select>

          <select aria-label="Vehicle" value={vehicleType} onChange={(event) => setVehicleType(event.target.value)}>
            <option>All Vehicles</option>
            <option>Car</option>
            <option>Motorcycle</option>
            <option>Electric Vehicle</option>
          </select>

          <select aria-label="Status" value={status} onChange={(event) => setStatus(event.target.value)}>
            <option>All Statuses</option>
            <option>Available</option>
            <option>Occupied</option>
            <option>Reserved</option>
            <option>Maintenance</option>
          </select>

          <label>
            <span className="material-symbols-outlined">search</span>
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search slot or license plate" />
          </label>
        </section>

        {error && <div className="parking-error">{error}</div>}

        <div className="parking-layout">
          <section className="parking-map-card">
            <div className="parking-card-heading">
              <div>
                <h2>Parking Slot Map</h2>
                <p>{floor !== 'All Floors' ? floor : 'All floors'} · {zone !== 'All Zones' ? zone : 'All zones'} · {vehicleType !== 'All Vehicles' ? vehicleType : 'All vehicles'}</p>
              </div>
              <div className="parking-legend">
                {['Available', 'Occupied', 'Reserved', 'Maintenance'].map((item) => (
                  <span key={item}><i className={item.toLowerCase()} />{item}</span>
                ))}
              </div>
            </div>

            <div className="parking-canvas">
              {loading ? (
                <div className="parking-loading"><i />Loading availability…</div>
              ) : data.slots.length === 0 ? (
                <div className="parking-loading">No slots match the selected filters.</div>
              ) : (
                <>
                  <div className="map-marker entry"><span className="material-symbols-outlined">login</span>Entry</div>
                  <div className="map-marker lift"><span className="material-symbols-outlined">elevator</span>Lift</div>
                  <div className="parking-zones">
                    {zoneGroups.map((group) => (
                      <section className={`parking-zone-map ${group.key}`} key={group.key}>
                        <h3><b>{group.label}</b><span>{group.name}</span><em>{group.slots.length} slots</em></h3>
                        <div className="zone-slot-grid">
                          {group.slots.map((slot) => (
                            <ParkingSlot key={slot.id} slot={slot} selected={slot.id === selected?.id} onClick={setSelectedId} />
                          ))}
                        </div>
                        <div className="zone-flow"><b>ENTRY FLOW</b><span>→</span><span>→</span><span>→</span></div>
                      </section>
                    ))}
                  </div>
                </>
              )}
            </div>
          </section>

          <aside className="slot-inspector">
            <div className="inspector-header">
              <div><small>Selected slot</small><h2>{selected?.slotCode || selected?.id || '—'}</h2></div>
              <span className={`slot-status ${(selected?.status || 'unknown').toLowerCase()}`}>{selected?.status || 'Unknown'}</span>
            </div>
            {selected && (
              <div className="inspector-body">
                <div className="vehicle-panel">
                  <span className="material-symbols-outlined">{selected.type === 'Motorcycle' ? 'two_wheeler' : selected.type === 'Electric Vehicle' ? 'electric_car' : 'directions_car'}</span>
                  <div><small>{selected.type || '—'}</small><strong>{selected.vehicle || 'No active vehicle'}</strong></div>
                </div>
                <dl>
                  <div><dt>Building</dt><dd>{selected.building || '—'}</dd></div>
                  <div><dt>Floor</dt><dd>{selected.floor || '—'}</dd></div>
                  <div><dt>Zone</dt><dd>{selected.zone || '—'}</dd></div>
                  <div><dt>Distance</dt><dd>{selected.distance ? `${selected.distance}m` : '—'}</dd></div>
                </dl>
              </div>
            )}
            <div className="inspector-actions">
              <button className="primary" disabled={!selected}>View session detail</button>
              <button disabled={!selected}>Update actual parking slot</button>
              <div>
                <button disabled={saving || !selected || !['Occupied', 'Reserved'].includes(selected.status)} onClick={() => changeStatus('Available')}>Release slot</button>
                <button disabled={saving || !selected || selected.status === 'Maintenance'} onClick={() => changeStatus('Maintenance')}>{saving ? 'Updating…' : 'Maintenance'}</button>
              </div>
            </div>
          </aside>
        </div>

        <section className="updates-card">
          <div><h2>Recent Slot Updates</h2><button>View full history →</button></div>
          <table>
            <thead>
              <tr><th>Time</th><th>Slot</th><th>Vehicle</th><th>Action</th><th>Staff</th><th>Status</th></tr>
            </thead>
            <tbody>
              {data.updates.map((item) => (
                <tr key={item.id}>
                  <td>{item.time}</td>
                  <td><b>{item.slot}</b></td>
                  <td>{item.vehicle || '—'}</td>
                  <td>{item.action}</td>
                  <td>{item.staff}</td>
                  <td><span className={`update-status ${(item.status || 'synced').toLowerCase().replace(' ', '-')}`}>{item.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    </Layout>
  )
}

export default ParkingMapPage
