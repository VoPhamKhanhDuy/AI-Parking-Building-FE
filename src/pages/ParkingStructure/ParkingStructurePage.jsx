import { useEffect, useMemo, useState } from 'react'
import ManagerLayout from '../../layouts/ManagerLayout'
import { getParkingStructure } from './parkingStructureService'
import { getParkingMap, updateParkingSlot } from '../ParkingMap/parkingMapService'
import './ParkingStructurePage.css'
import '../ParkingMap/ParkingMapPage.css'

function Badge({ children }) {
  return <span className={`structure-badge ${children.toLowerCase().replaceAll(' ', '-')}`}>{children}</span>
}

const STATUS_ICON = { Occupied: 'directions_car', Reserved: 'lock', Maintenance: 'build' }

function ParkingSlotItem({ slot, selected, onClick }) {
  const typeIcon = slot.type === 'Motorcycle' ? 'two_wheeler' : slot.type === 'Electric Vehicle' ? 'ev_station' : null
  return (
    <button 
      className={`map-slot ${slot.status.toLowerCase()}${selected ? ' selected' : ''}`} 
      onClick={() => onClick(slot.id)} 
      aria-pressed={selected}
    >
      <strong>{slot.id}</strong>
      {(STATUS_ICON[slot.status] || typeIcon) && <span className="material-symbols-outlined">{STATUS_ICON[slot.status] || typeIcon}</span>}
      {selected && slot.vehicle && <em><small>Current session</small>{slot.vehicle}</em>}
    </button>
  )
}

function ParkingStructurePage() {
  const [activeTab, setActiveTab] = useState('overview') // 'overview' | 'map'
  const [data, setData] = useState(null)
  const [floor, setFloor] = useState('Floor 2')
  const [selectedZone, setSelectedZone] = useState('Zone B')
  const [query, setQuery] = useState('')

  // Map view states
  const [mapData, setMapData] = useState({ summary: {}, slots: [], updates: [] })
  const [mapSelectedId, setMapSelectedId] = useState('B2-18')
  const [mapSearch, setMapSearch] = useState('')
  const [mapStatus, setMapStatus] = useState('All Statuses')
  const [mapBuilding, setMapBuilding] = useState('All Buildings')
  const [mapFloor, setMapFloor] = useState('All Floors')
  const [mapZone, setMapZone] = useState('All Zones')
  const [mapVehicleType, setMapVehicleType] = useState('All Vehicles')
  const [mapLoading, setMapLoading] = useState(true)
  const [mapSaving, setMapSaving] = useState(false)
  const [mapError, setMapError] = useState('')

  useEffect(() => {
    getParkingStructure().then(setData)
  }, [])

  useEffect(() => {
    if (activeTab === 'map') {
      let active = true
      const timer = setTimeout(() => {
        getParkingMap({
          search: mapSearch,
          status: mapStatus,
          building: mapBuilding,
          floor: mapFloor,
          zone: mapZone,
          vehicleType: mapVehicleType
        })
          .then((result) => active && setMapData(result))
          .catch(() => active && setMapError('Unable to load parking map.'))
          .finally(() => active && setMapLoading(false))
      }, 180)
      return () => {
        active = false
        clearTimeout(timer)
      }
    }
  }, [activeTab, mapSearch, mapStatus, mapBuilding, mapFloor, mapZone, mapVehicleType])

  const filteredZones = useMemo(() => data?.zones.filter((item) => (
    `${item.location} ${item.zone} ${item.type}`.toLowerCase().includes(query.toLowerCase())
  )) ?? [], [data, query])

  const detail = data?.zones.find((item) => item.location === floor && item.zone === selectedZone)
    ?? data?.zones.find((item) => item.location === floor)
    ?? data?.zones[0]

  const selectFloor = (nextFloor) => {
    setFloor(nextFloor)
    const firstZone = data.zones.find((item) => item.location === nextFloor)
    if (firstZone) setSelectedZone(firstZone.zone)
  }

  const selectZone = (item) => {
    setFloor(item.location)
    setSelectedZone(item.zone)
  }

  const handleViewZoneMap = () => {
    if (detail?.location) {
      setMapFloor(detail.location)
    }
    setActiveTab('map')
  }

  // Map calculations
  const mapSelectedSlot = mapData.slots.find((slot) => slot.id === mapSelectedId) || mapData.slots[0]
  const zoneGroups = useMemo(() => [
    { key: 'motorcycle', label: 'Zone A', name: 'Motorcycle', slots: mapData.slots.filter((slot) => slot.type === 'Motorcycle') },
    { key: 'car', label: 'Zone B', name: 'Car', slots: mapData.slots.filter((slot) => slot.type === 'Car') },
    { key: 'ev', label: 'Zone C', name: 'EV charging', slots: mapData.slots.filter((slot) => slot.type === 'Electric Vehicle') },
  ].filter((group) => group.slots.length), [mapData.slots])

  const changeSlotStatus = async (nextStatus) => {
    if (!mapSelectedSlot) return
    setMapSaving(true)
    setMapError('')
    try {
      const result = await updateParkingSlot(mapSelectedSlot.id, nextStatus)
      setMapData((current) => ({
        ...current,
        summary: result.summary,
        slots: current.slots.map((slot) => slot.id === mapSelectedSlot.id ? result.slot : slot),
        updates: [result.update, ...current.updates]
      }))
    } catch (requestError) {
      setMapError(requestError.message || 'Could not update slot.')
    } finally {
      setMapSaving(false)
    }
  }

  const mapSummaryItems = [
    ['Total slots', mapData.summary.totalSlots],
    ['Available', mapData.summary.available],
    ['Occupied', mapData.summary.occupied],
    ['Reserved', mapData.summary.reserved],
    ['Maintenance', mapData.summary.maintenance],
    ['Occupancy', `${mapData.summary.occupancyRate || 0}%`]
  ]

  if (!data) return <ManagerLayout><div className="structure-loading">Loading parking structure...</div></ManagerLayout>

  return (
    <ManagerLayout>
      <div className="structure-page">
        <header className="structure-heading">
          <div>
            <p>Dashboard <span>/</span> Parking Structure</p>
            <h1>Parking Structure</h1>
            <h2>Building A capacity, zone allocation, and live map view.</h2>
          </div>
          <span><i />Data current</span>
        </header>

        {/* Tab Navigation */}
        <div style={{ display: 'flex', gap: '16px', borderBottom: '1px solid var(--color-outline-variant, #e2e8f0)', marginBottom: '24px', paddingBottom: '4px' }}>
          <button 
            style={{ 
              padding: '8px 16px', 
              fontSize: '14px', 
              fontWeight: 'bold', 
              borderBottom: activeTab === 'overview' ? '3px solid #2563eb' : '3px solid transparent',
              color: activeTab === 'overview' ? '#2563eb' : '#64748b',
              background: 'none',
              borderTop: 'none',
              borderLeft: 'none',
              borderRight: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
            onClick={() => setActiveTab('overview')}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>table_chart</span>
            Structure &amp; Capacity Overview
          </button>
          <button 
            style={{ 
              padding: '8px 16px', 
              fontSize: '14px', 
              fontWeight: 'bold', 
              borderBottom: activeTab === 'map' ? '3px solid #2563eb' : '3px solid transparent',
              color: activeTab === 'map' ? '#2563eb' : '#64748b',
              background: 'none',
              borderTop: 'none',
              borderLeft: 'none',
              borderRight: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
            onClick={() => setActiveTab('map')}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>map</span>
            Live Zone Map View
          </button>
        </div>

        {activeTab === 'overview' ? (
          <>
            <section className="structure-kpis" aria-label="Structure summary">
              {data.kpis.map((item) => (
                <article key={item.label}>
                  <small>{item.label}</small>
                  <strong className={item.tone ?? ''}>{item.value}</strong>
                  <span>{item.note}</span>
                </article>
              ))}
            </section>

            <div className="structure-workspace">
              <div className="structure-column structure-left-column">
                <aside className="structure-card structure-navigator">
                  <header><h3>Building &amp; floor</h3></header>
                  <div className="building-row"><span className="material-symbols-outlined">apartment</span><strong>Building A</strong></div>
                  <nav>
                    {data.buildings[0].floors.map((item) => {
                      const zoneCount = data.zones.filter((zone) => zone.location === item).length
                      return (
                        <button className={floor === item ? 'active' : ''} key={item} onClick={() => selectFloor(item)}>
                          <span>{item}</span><small>{zoneCount} {zoneCount === 1 ? 'zone' : 'zones'}</small>
                        </button>
                      )
                    })}
                  </nav>
                </aside>

                <section className="structure-card slot-summary">
                  <header><h3>Slot type summary</h3></header>
                  <div className="compact-summary">
                    {data.slotTypes.map((item) => (
                      <div key={item.type}>
                        <span><strong>{item.type}</strong><small>{item.total} total</small></span>
                        <span><b>{item.available}</b><small>available</small></span>
                      </div>
                    ))}
                  </div>
                  <footer><span>Total capacity</span><strong>524 slots</strong></footer>
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
                      <tbody>
                        {filteredZones.map((item) => (
                          <tr className={detail === item ? 'selected' : ''} key={`${item.location}-${item.zone}`} onClick={() => selectZone(item)}>
                            <td>{item.location}</td><td><strong>{item.zone}</strong></td><td>{item.type}</td><td>{item.capacity}</td><td>{item.occupied}</td><td>{item.available}</td><td><Badge>{item.status}</Badge></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>

                <section className="structure-card updates">
                  <header><div><h3>Recent updates</h3><p>Structure and maintenance activity</p></div><button>View all</button></header>
                  <div className="updates-list">
                    {data.recentUpdates.map((item) => (
                      <article key={`${item.time}-${item.area}`}>
                        <time>{item.time}</time>
                        <div><strong>{item.update}</strong><span>{item.area} · {item.staff}</span></div>
                        <Badge>{item.status}</Badge>
                      </article>
                    ))}
                  </div>
                </section>
              </div>

              <aside className="structure-card zone-detail">
                <header><div><h3>{detail.zone} · {detail.location}</h3><p>Building A · {detail.type}</p></div><Badge>{detail.status}</Badge></header>
                <div className="utilization"><span>Utilization <b>{Math.round(detail.occupied / detail.capacity * 100)}%</b></span><div><i style={{ width: `${Math.round(detail.occupied / detail.capacity * 100)}%` }} /></div></div>
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
                  <button className="primary" onClick={handleViewZoneMap}><span className="material-symbols-outlined">map</span>View Zone Map</button>
                </div>
              </aside>
            </div>
          </>
        ) : (
          <div className="parking-page" style={{ padding: 0 }}>
            <section className="parking-summary">
              {mapSummaryItems.map(([label, val]) => (
                <div className={label.toLowerCase().replace(' ', '-')} key={label}>
                  <small>{label}</small>
                  <strong>{val ?? '—'}</strong>
                </div>
              ))}
            </section>

            <section className="parking-filters">
              <select aria-label="Building" value={mapBuilding} onChange={(e) => setMapBuilding(e.target.value)}>
                <option>All Buildings</option>
                <option>Building A</option>
                <option>Building B</option>
              </select>
              <select aria-label="Floor" value={mapFloor} onChange={(e) => setMapFloor(e.target.value)}>
                <option>All Floors</option>
                <option>Basement</option>
                <option>Floor 1</option>
                <option>Floor 2</option>
                <option>Floor 3</option>
                <option>Floor 4</option>
              </select>
              <select aria-label="Zone" value={mapZone} onChange={(e) => setMapZone(e.target.value)}>
                <option>All Zones</option>
                <option>Car</option>
                <option>Motorcycle</option>
                <option>EV Charging</option>
              </select>
              <select aria-label="Vehicle" value={mapVehicleType} onChange={(e) => setMapVehicleType(e.target.value)}>
                <option>All Vehicles</option>
                <option>Car</option>
                <option>Motorcycle</option>
                <option>Electric Vehicle</option>
              </select>
              <select aria-label="Status" value={mapStatus} onChange={(e) => setMapStatus(e.target.value)}>
                <option>All Statuses</option>
                <option>Available</option>
                <option>Occupied</option>
                <option>Reserved</option>
                <option>Maintenance</option>
              </select>
              <label>
                <span className="material-symbols-outlined">search</span>
                <input value={mapSearch} onChange={(e) => setMapSearch(e.target.value)} placeholder="Search slot or license plate" />
              </label>
            </section>

            {mapError && <div className="parking-error">{mapError}</div>}

            <div className="parking-layout">
              <section className="parking-map-card">
                <div className="parking-card-heading">
                  <div>
                    <h2>Parking Slot Map</h2>
                    <p>{mapFloor} · {mapZone} · {mapVehicleType}</p>
                  </div>
                  <div className="parking-legend">
                    {['Available', 'Occupied', 'Reserved', 'Maintenance'].map((item) => (
                      <span key={item}><i className={item.toLowerCase()} />{item}</span>
                    ))}
                  </div>
                </div>
                <div className="parking-canvas">
                  {mapLoading ? (
                    <div className="parking-loading"><i />Loading availability…</div>
                  ) : mapData.slots.length === 0 ? (
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
                                <ParkingSlotItem key={slot.id} slot={slot} selected={slot.id === mapSelectedSlot?.id} onClick={setMapSelectedId} />
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
                  <div><small>Selected slot</small><h2>{mapSelectedSlot?.id || '—'}</h2></div>
                  <span className={`slot-status ${mapSelectedSlot?.status?.toLowerCase()}`}>{mapSelectedSlot?.status || 'Unknown'}</span>
                </div>
                {mapSelectedSlot && (
                  <div className="inspector-body">
                    <div className="vehicle-panel">
                      <span className="material-symbols-outlined">
                        {mapSelectedSlot.type === 'Motorcycle' ? 'two_wheeler' : mapSelectedSlot.type === 'Electric Vehicle' ? 'electric_car' : 'directions_car'}
                      </span>
                      <div>
                        <small>{mapSelectedSlot.type}</small>
                        <strong>{mapSelectedSlot.vehicle || 'No active vehicle'}</strong>
                      </div>
                    </div>
                    <dl>
                      <div><dt>Building</dt><dd>{mapSelectedSlot.building}</dd></div>
                      <div><dt>Floor</dt><dd>{mapSelectedSlot.floor}</dd></div>
                      <div><dt>Zone</dt><dd>{mapSelectedSlot.zone}</dd></div>
                      <div><dt>Ticket ID</dt><dd>{mapSelectedSlot.ticketId || '—'}</dd></div>
                      <div><dt>Session status</dt><dd>{mapSelectedSlot.vehicle ? 'Active' : 'Inactive'}</dd></div>
                      <div><dt>Entry time</dt><dd>{mapSelectedSlot.entryTime || '—'}</dd></div>
                      <div><dt>Assignment</dt><dd>{mapSelectedSlot.method || 'Manual / Idle'}</dd></div>
                      <div><dt>Processed by</dt><dd>{mapSelectedSlot.processedBy || '—'}</dd></div>
                    </dl>
                  </div>
                )}
                <div className="inspector-actions">
                  <div>
                    <button disabled={mapSaving || !['Occupied', 'Reserved'].includes(mapSelectedSlot?.status)} onClick={() => changeSlotStatus('Available')}>Release slot</button>
                    <button disabled={mapSaving || mapSelectedSlot?.status === 'Maintenance'} onClick={() => changeSlotStatus('Maintenance')}>{mapSaving ? 'Updating…' : 'Maintenance'}</button>
                  </div>
                </div>
              </aside>
            </div>

            <section className="updates-card" style={{ marginTop: '24px' }}>
              <div><h2>Recent Slot Updates</h2><button>View full history →</button></div>
              <table>
                <thead><tr><th>Time</th><th>Slot</th><th>Vehicle</th><th>Action</th><th>Staff</th><th>Status</th></tr></thead>
                <tbody>
                  {mapData.updates.map((item) => (
                    <tr key={item.id}>
                      <td>{item.time}</td>
                      <td><b>{item.slot}</b></td>
                      <td>{item.vehicle}</td>
                      <td>{item.action}</td>
                      <td>{item.staff}</td>
                      <td><span className={`update-status ${item.status.toLowerCase().replace(' ', '-')}`}>{item.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          </div>
        )}
      </div>
    </ManagerLayout>
  )
}

export default ParkingStructurePage
