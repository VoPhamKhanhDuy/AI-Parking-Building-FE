import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import MainLayout from '../../layouts/MainLayout'
import { ROUTE_PATHS } from '../../routes/routePaths'
import { getBuildings, getFloors, getZones, getSlotsByZone } from '../ParkingMap/parkingMapService'
import { assignParkingSlot, isCompatible } from './manualSlotService'
import './ManualSlotPage.css'

function getFloorStats(floor) {
  const slots = floor?.slots || []
  const total = slots.length
  const occupied = slots.filter((s) => s.status === 'Occupied').length
  const reserved = slots.filter((s) => s.status === 'Reserved').length
  const available = slots.filter((s) => s.status === 'Available').length
  const occupiedLike = total ? occupied + reserved : 0
  return {
    total,
    available,
    occupied,
    reserved,
    occupancy: total ? Math.round((occupiedLike * 100) / total) : 0,
  }
}

async function loadFloorsWithSlots() {
  const buildings = await getBuildings()
  const all = []
  for (const building of buildings) {
    const floors = await getFloors(building.id)
    for (const floor of floors) {
      // The slots endpoint is keyed by zoneId, not floorId. Walk down through
      // zones so a stale or missing floorId cannot trip a 404 on /api/slots.
      const zones = await getZones(floor.id)
      const slotBatches = await Promise.all(
        zones.map(async (zone) => {
          const slots = await getSlotsByZone(zone.id, 'All Statuses').catch(() => [])
          return slots.map((slot) => ({ ...slot, zoneId: zone.id, zone: zone.name, floor: floor.name }))
        })
      )
      const slots = slotBatches.flat()
      all.push({
        id: floor.id,
        name: floor.name || `Floor ${floor.floorNumber || ''}`,
        building: building.name,
        slots,
      })
    }
  }
  return all
}

const DEFAULT_ENTRY = {
  licensePlate: '51A-12345', vehicleType: 'Car', ticketType: 'Normal (Visitor)',
  checkStatus: 'Existing Vehicle', plateSource: 'Camera Scan (Auto)',
}

const ZONES = [
  { value: 'all', label: 'All zones' },
  { value: 'motorcycle', label: 'Zone A · Motorcycle' },
  { value: 'car', label: 'Zone B · Car' },
  { value: 'ev', label: 'Zone C · EV charging' },
]

const STATUS_META = {
  available: { label: 'Available', icon: null }, occupied: { label: 'Occupied', icon: 'directions_car' },
  reserved: { label: 'Reserved', icon: 'lock' }, maintenance: { label: 'Maintenance', icon: 'build' },
}

function Slot({ slot, selected, compatible, onSelect }) {
  const statusKey = (slot.status || '').toLowerCase()
  const meta = STATUS_META[statusKey] || { label: slot.status || 'Unknown', icon: null }
  const disabled = statusKey !== 'available' || !compatible
  return (
    <button className={`parking-slot ${slot.vehicleType || slot.type || ''} ${slot.status || ''}${selected ? ' selected' : ''}${!compatible ? ' incompatible' : ''}`}
      type="button" disabled={disabled} onClick={() => onSelect(slot)}
      aria-label={`${slot.slotCode || slot.id}, ${meta.label}${!compatible ? ', incompatible' : ''}`} aria-pressed={selected}>
      <strong>{slot.slotCode || slot.id}</strong>
      {meta.icon && <span className="material-symbols-outlined">{slot.vehicleType === 'motorcycle' && statusKey === 'occupied' ? 'two_wheeler' : meta.icon}</span>}
      {slot.vehicleType === 'ev' && statusKey === 'available' && <span className="material-symbols-outlined">ev_station</span>}
    </button>
  )
}

function ManualSlotPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const entry = { ...DEFAULT_ENTRY, ...(location.state || {}) }
  const [floors, setFloors] = useState([])
  const [floorId, setFloorId] = useState('floor-2')
  const [zone, setZone] = useState('all')
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    loadFloorsWithSlots()
      .then((list) => {
        if (!active) return
        setFloors(list)
        const preferred = list.find((floor) => floor.name.toLowerCase().includes('floor 2')) || list[0]
        const initial = preferred?.slots.find((slot) => slot.status === 'Available' && isCompatible(slot, entry.vehicleType))
        setFloorId(preferred?.id || '')
        setSelectedSlot(initial || null)
      })
      .catch(() => active && setError('Unable to load the parking layout. Please try again.'))
      .finally(() => active && setLoading(false))
    return () => { active = false }
  }, [entry.vehicleType])

  const activeFloor = floors.find((floor) => floor.id === floorId)
  const visibleSlots = useMemo(() => (activeFloor?.slots || []).filter((slot) => zone === 'all' || slot.vehicleType?.toLowerCase() === zone || slot.type?.toLowerCase() === zone), [activeFloor, zone])
  const groupedSlots = Object.groupBy ? Object.groupBy(visibleSlots, (slot) => slot.vehicleType?.toLowerCase() || slot.type?.toLowerCase() || 'other') : visibleSlots.reduce((groups, slot) => { const key = slot.vehicleType?.toLowerCase() || slot.type?.toLowerCase() || 'other'; return { ...groups, [key]: [...(groups[key] || []), slot] } }, {})

  const chooseFloor = (id) => {
    setFloorId(id); setSelectedSlot(null); setError('')
  }

  const confirmSelection = async () => {
    if (!selectedSlot) return setError('Please select an available, compatible slot.')
    setSubmitting(true); setError('')
    try {
      const assignment = await assignParkingSlot({ slotId: selectedSlot.id, licensePlate: entry.licensePlate, vehicleType: entry.vehicleType, ticketType: entry.ticketType })
      if (!assignment.success) {
        setError(assignment.message || 'Could not assign this slot.')
        return
      }
      navigate(ROUTE_PATHS.checkinSuccess, { state: { ...entry, selectedSlotId: selectedSlot.id, ticketCode: assignment.data.ticketCode, entryTime: assignment.data.entryTime, method: 'Manual Selection', matchScore: 'Staff selected', sessionId: assignment.data.sessionId } })
    } catch (requestError) {
      const message = typeof requestError.response?.data?.message === 'string'
        ? requestError.response.data.message
        : (requestError.response?.data?.message?.message || requestError.message || 'Could not assign this slot.')
      setError(message)
    } finally { setSubmitting(false) }
  }

  return (
    <MainLayout>
      <div className="manual-slot-page">
        <nav className="manual-breadcrumb" aria-label="Breadcrumb">
          <button onClick={() => navigate(ROUTE_PATHS.dashboard)}>Dashboard</button><span>/</span>
          <button onClick={() => navigate(ROUTE_PATHS.vehicleEntry, { state: entry })}>Vehicle Entry</button><span>/</span><b>Manual Slot Selection</b>
        </nav>
        <header className="manual-page-heading"><div><h1>Select parking slot</h1><p>Vehicle entry · Manual assignment</p></div><span className="live-indicator"><i /> Updated just now</span></header>

        <section className="vehicle-summary" aria-label="Vehicle summary">
          <div><small>License plate</small><strong>{entry.licensePlate}</strong></div>
          <div><small>Vehicle type</small><span><i className="material-symbols-outlined">directions_car</i>{entry.vehicleType}</span></div>
          <div><small>Ticket type</small><span>{entry.ticketType}</span></div>
          <div><small>Status</small><span className="summary-badge">{entry.checkStatus}</span></div>
          <div><small>Plate source</small><span><i className="material-symbols-outlined">photo_camera</i>{entry.plateSource}</span></div>
        </section>

        <div className="floor-tabs" role="tablist" aria-label="Parking floors">
          {floors.map((floor) => { const stats = getFloorStats(floor); return <button key={floor.id} role="tab" aria-selected={floor.id === floorId} onClick={() => chooseFloor(floor.id)}><span>{floor.name}</span><small>{stats.occupancy}% occupied</small></button> })}
        </div>

        {error && <div className="manual-alert" role="alert"><span className="material-symbols-outlined">error</span>{error}</div>}

        <div className="slot-workspace">
          <section className="map-card">
            <div className="map-toolbar">
              <div><label htmlFor="floor-select">Floor</label><select id="floor-select" value={floorId} onChange={(event) => chooseFloor(event.target.value)}>{floors.map((floor) => <option key={floor.id} value={floor.id}>{floor.name}</option>)}</select></div>
              <div><label htmlFor="zone-select">Parking zone</label><select id="zone-select" value={zone} onChange={(event) => setZone(event.target.value)}>{ZONES.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></div>
              <div className="map-count"><strong>{activeFloor ? getFloorStats(activeFloor).available : 0}</strong><span>available</span></div>
            </div>
            <div className="map-title"><div><h2>{activeFloor?.name || 'Parking'}</h2><p>Showing slots compatible with {entry.vehicleType.toLowerCase()}.</p></div><div className="map-legend">{Object.entries(STATUS_META).map(([key, item]) => <span key={key}><i className={key} />{item.label}</span>)}<span><i className="selected" />Selected</span></div></div>

            <div className="parking-map">
              {loading ? <div className="map-state"><span className="manual-spinner" />Loading parking availability…</div> : visibleSlots.length === 0 ? <div className="map-state">No parking spaces in this zone.</div> : <>
                <div className="map-landmark entry"><span className="material-symbols-outlined">login</span>Entry</div>
                <div className="map-landmark lift"><span className="material-symbols-outlined">elevator</span>Lift</div>
                {['motorcycle', 'car', 'ev'].map((type) => groupedSlots[type]?.length ? <div className={`parking-zone zone-${type}`} key={type}>
                  <h3><b>Zone {type === 'motorcycle' ? 'A' : type === 'car' ? 'B' : 'C'}</b><span>{type === 'motorcycle' ? 'Motorcycle' : type === 'car' ? 'Car' : 'EV charging'}</span></h3>
                  <div className="slot-grid">{groupedSlots[type].map((slot) => <Slot key={slot.id} slot={slot} selected={selectedSlot?.id === slot.id} compatible={isCompatible(slot, entry.vehicleType)} onSelect={setSelectedSlot} />)}</div>
                  <div className="drive-lane"><span>ENTRY FLOW</span><i>→</i><i>→</i><i>→</i></div>
                </div> : null)}
                <div className="map-landmark exit"><span className="material-symbols-outlined">logout</span>Exit</div>
              </>}
            </div>
          </section>

          <aside className="slot-details">
            <div className="details-header"><div><small>Selected slot</small><h2>{selectedSlot?.id || 'None'}</h2></div>{selectedSlot && <span>Available</span>}</div>
            {selectedSlot ? <div className="details-body">
              <div className="slot-visual"><span>Zone {selectedSlot.zone}</span><strong>{selectedSlot.id}</strong><small>{selectedSlot.floor}</small></div>
              <dl><div><dt>Floor</dt><dd>{selectedSlot.floor}</dd></div><div><dt>Status</dt><dd className="available-text"><i />Available</dd></div><div><dt>Space type</dt><dd>{selectedSlot.type === 'ev' ? 'EV charging' : selectedSlot.type}</dd></div><div><dt>Vehicle match</dt><dd>Compatible</dd></div><div><dt>Reservation conflict</dt><dd>None</dd></div><div><dt>Distance to exit</dt><dd>{selectedSlot.distanceToExit} m</dd></div><div><dt>Distance to elevator</dt><dd>{selectedSlot.distanceToElevator} m</dd></div></dl>
              <p className="operator-note"><span className="material-symbols-outlined">info</span>Confirm the space only after checking the live status and vehicle compatibility.</p>
            </div> : <div className="empty-selection"><span className="material-symbols-outlined">touch_app</span><h3>Select a parking space</h3><p>Available and compatible spaces can be selected from the map.</p></div>}
            <div className="details-actions"><button className="confirm-slot" disabled={!selectedSlot || submitting} onClick={confirmSelection}>{submitting ? <><span className="manual-spinner small" />Assigning…</> : 'Confirm selected slot'}</button><button className="back-entry" onClick={() => navigate(ROUTE_PATHS.vehicleEntry, { state: entry })}>Back to vehicle entry</button></div>
          </aside>
        </div>
      </div>
    </MainLayout>
  )
}

export default ManualSlotPage
