import { useEffect, useMemo, useState } from 'react'
import ManagerLayout from '../../layouts/ManagerLayout'
import { getParkingStructure } from './parkingStructureService'
import './ParkingStructurePage.css'

function Badge({ children }) {
  const text = String(children ?? '—')
  const safe = text.toLowerCase().replaceAll(' ', '-')
  return <span className={`structure-badge ${safe}`}>{text}</span>
}

function ParkingStructurePage() {
  const [data, setData] = useState(null)
  const [floor, setFloor] = useState('Floor 2')
  const [selectedZone, setSelectedZone] = useState('Zone B')
  const [query, setQuery] = useState('')
  const [mapModalOpen, setMapModalOpen] = useState(false)
  const [activeSlot, setActiveSlot] = useState(null)

  useEffect(() => { getParkingStructure().then(setData) }, [])

  const filteredZones = useMemo(() => (data?.zones || []).filter((item) => (
    `${item.location || ''} ${item.zone || ''} ${item.type || ''}`.toLowerCase().includes(query.toLowerCase())
  )), [data, query])

  const building = data?.buildings?.[0]
  const detail = (data?.zones || []).find((item) => item.location === floor && item.zone === selectedZone)
    ?? (data?.zones || []).find((item) => item.location === floor)
    ?? (data?.zones || [])[0]
    ?? { zone: 'N/A', location: 'N/A', type: 'Standard', status: 'Available', capacity: 0, occupied: 0, available: 0, reserved: 0, maintenance: 0 }

  const floorZones = useMemo(() => {
    return (data?.zones || []).filter((z) => z.location === floor)
  }, [data, floor])

  const selectFloor = (nextFloor) => {
    setFloor(nextFloor)
    const firstZone = (data?.zones || []).find((item) => item.location === nextFloor)
    if (firstZone) setSelectedZone(firstZone.zone)
  }

  const selectZone = (item) => {
    setFloor(item.location)
    setSelectedZone(item.zone)
  }

  if (!data) return <ManagerLayout><div className="structure-loading">Loading parking structure...</div></ManagerLayout>

  const utilizationPct = detail.capacity ? Math.round((detail.occupied / detail.capacity) * 100) : 0

  // Generate slots for selected zone with vehicles
  const slotsInZone = Array.from({ length: detail.capacity || 20 }, (_, idx) => {
    const num = String(idx + 1).padStart(2, '0')
    const code = `${(detail.zone || 'Z').replace('Zone ', '')}-${num}`
    let status = 'Available'
    let vehicle = null

    if (idx < (detail.occupied || 0)) {
      status = 'Occupied'
      vehicle = `51A-${120 + idx * 7}.${34 + idx}`
    } else if (idx < (detail.occupied || 0) + (detail.reserved || 0)) {
      status = 'Reserved'
    } else if (idx >= (detail.capacity || 20) - (detail.maintenance || 0)) {
      status = 'Maintenance'
    }

    return { id: code, slotCode: code, status, vehicle, type: detail.type }
  })

  return (
    <ManagerLayout>
      <div className="structure-page">
        <header className="structure-heading">
          <div>
            <p>Dashboard <span>/</span> Parking Structure</p>
            <h1>Parking Structure</h1>
            <h2>Building capacity, zone allocation, and operational status.</h2>
          </div>
          <span><i />Data current</span>
        </header>

        <section className="structure-kpis" aria-label="Structure summary">
          {(data.kpis || []).map((item, index) => (
            <article key={item.id ?? `${item.label ?? 'kpi'}-${index}`}>
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
              <div className="building-row">
                <span className="material-symbols-outlined">apartment</span>
                <strong>{building?.name || 'Building'}</strong>
              </div>
              <nav>
                {(building?.floors || []).map((item) => {
                  const zoneCount = data.zones.filter((zone) => zone.location === item).length
                  return (
                    <button className={floor === item ? 'active' : ''} key={item} onClick={() => selectFloor(item)}>
                      <span>{item}</span>
                      <small>{zoneCount} {zoneCount === 1 ? 'zone' : 'zones'}</small>
                    </button>
                  )
                })}
              </nav>
            </aside>

            <section className="structure-card slot-summary">
              <header><h3>Slot type summary</h3></header>
              <div className="compact-summary">
                {(data.slotTypes || []).map((item, index) => (
                  <div key={item.id ?? `${item.type ?? 'type'}-${index}`}>
                    <span><strong>{item.type}</strong><small>{item.total} total</small></span>
                    <span><b>{item.available}</b><small>available</small></span>
                  </div>
                ))}
              </div>
              <footer><span>Total capacity</span><strong>{detail.capacity || 0} slots</strong></footer>
            </section>
          </div>

          <div className="structure-column structure-center-column">
            <section className="structure-card zone-capacity">
              <header>
                <div><h3>Zone capacity</h3><p>{filteredZones.length} zones shown</p></div>
                <label>
                  <span className="material-symbols-outlined">search</span>
                  <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search zone" />
                </label>
              </header>
              <div className="structure-table-wrap">
                <table>
                  <thead><tr><th>Location</th><th>Zone</th><th>Type</th><th>Capacity</th><th>Occupied</th><th>Available</th><th>Status</th></tr></thead>
                  <tbody>
                    {filteredZones.map((item, index) => (
                      <tr className={detail === item ? 'selected' : ''} key={item.id ?? `${item.location ?? 'loc'}-${item.zone ?? 'zone'}-${item.type ?? 'type'}-${index}`} onClick={() => selectZone(item)}>
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
                {(data.recentUpdates || []).map((item, index) => (
                  <article key={item.id ?? `${item.time ?? 't'}-${item.area ?? 'a'}-${index}`}>
                    <time>{item.time || '—'}</time>
                    <div><strong>{item.update || '—'}</strong><span>{item.area || '—'} · {item.staff || '—'}</span></div>
                    <Badge>{item.status || 'Updated'}</Badge>
                  </article>
                ))}
              </div>
            </section>
          </div>

          <aside className="structure-card zone-detail">
            <header>
              <div><h3>{detail.zone} · {detail.location}</h3><p>{building?.name || 'Building'} · {detail.type}</p></div>
              <Badge>{detail.status}</Badge>
            </header>
            <div className="utilization">
              <span>Utilization <b>{utilizationPct}%</b></span>
              <div><i style={{ width: `${utilizationPct}%` }} /></div>
            </div>
            <dl>
              <div><dt>Total slots</dt><dd>{detail.capacity}</dd></div>
              <div><dt>Type</dt><dd>{detail.type}</dd></div>
              <div><dt>Occupied</dt><dd>{detail.occupied}</dd></div>
              <div><dt>Available</dt><dd className="zone-available-value">{detail.available}</dd></div>
              <div><dt>Reserved</dt><dd>{detail.reserved}</dd></div>
              <div><dt>Maintenance</dt><dd className={detail.maintenance > 0 ? 'zone-maintenance-value' : ''}>{detail.maintenance}</dd></div>
            </dl>
            <div className="zone-meta">
              <span>Last Updated: <strong>Today 10:43</strong></span>
              <span>Managed By: <strong>Facility Manager</strong></span>
            </div>
            <div className="zone-actions">
              <button className="primary" onClick={() => setMapModalOpen(true)}>
                <span className="material-symbols-outlined">map</span>View Zone Map
              </button>
            </div>
          </aside>
        </div>

        {/* Zone Location Map Modal */}
        {mapModalOpen && (
          <div className="structure-modal-backdrop" role="presentation" onClick={(e) => e.target === e.currentTarget && setMapModalOpen(false)}>
            <section className="zone-map-modal bg-white rounded-xl shadow-2xl w-full max-w-4xl overflow-hidden border border-slate-200" role="dialog" aria-label="Zone Floor Location Map">
              <header className="flex justify-between items-center p-4 border-b border-slate-200 bg-slate-50">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-[22px]">location_on</span>
                    <h3 className="font-bold text-base text-slate-900 m-0">Zone Location Map — {detail.location} Floor Plan</h3>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Highlighted Zone: <strong className="text-primary font-bold">{detail.zone}</strong> ({detail.type} · {detail.occupied}/{detail.capacity} occupied)
                  </p>
                </div>
                <button className="text-slate-400 hover:text-slate-700 p-1 rounded-full transition-colors" aria-label="Close" onClick={() => setMapModalOpen(false)}>
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </header>

              <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
                {/* Floor selector tabs */}
                <div className="flex items-center justify-between bg-slate-100 p-2 rounded-lg border border-slate-200">
                  <div className="flex items-center gap-1">
                    {(building?.floors || ['Floor 1', 'Floor 2']).map((fName) => (
                      <button
                        key={fName}
                        className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${floor === fName ? 'bg-primary text-white shadow' : 'text-slate-600 hover:bg-slate-200'}`}
                        onClick={() => selectFloor(fName)}
                      >
                        {fName}
                      </button>
                    ))}
                  </div>
                  <div className="text-xs text-slate-500 font-medium">
                    Building: <strong>{building?.name || 'Building A'}</strong>
                  </div>
                </div>

                {/* Spatial Zone Layout Canvas */}
                <div className="bg-slate-900 rounded-xl p-5 border border-slate-800 text-white relative overflow-hidden">
                  <div className="flex justify-between items-center mb-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
                    <span>⬅ Entry Ramp</span>
                    <span className="flex items-center gap-1.5 text-blue-400">
                      <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                      {floor} Zone Location Distribution Map
                    </span>
                    <span>Exit Ramp ➔</span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {floorZones.map((z) => {
                      const isTarget = z.zone === detail.zone
                      const util = Math.round((z.occupied / z.capacity) * 100)
                      return (
                        <div
                          key={z.zone}
                          onClick={() => selectZone(z)}
                          className={`relative p-4 rounded-xl border transition-all cursor-pointer ${isTarget
                            ? 'bg-blue-950/90 border-blue-400 shadow-lg shadow-blue-500/25 ring-2 ring-blue-400'
                            : 'bg-slate-800/80 border-slate-700 hover:border-slate-500'
                            }`}
                        >
                          {isTarget && (
                            <span className="absolute -top-2.5 right-3 px-2 py-0.5 bg-blue-500 text-white text-[10px] font-extrabold rounded-full uppercase tracking-wider shadow">
                              Selected Zone
                            </span>
                          )}

                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <strong className="text-base font-extrabold text-white block">{z.zone}</strong>
                              <small className="text-xs text-slate-400 font-medium">{z.type}</small>
                            </div>
                            <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${z.status === 'Available' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'}`}>
                              {z.status}
                            </span>
                          </div>

                          <div className="space-y-1 mt-3">
                            <div className="flex justify-between text-xs text-slate-300 font-medium">
                              <span>Occupancy</span>
                              <strong className={util > 80 ? 'text-amber-400' : 'text-blue-400'}>{util}%</strong>
                            </div>
                            <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
                              <div className={`h-full ${util > 80 ? 'bg-amber-400' : 'bg-blue-400'}`} style={{ width: `${util}%` }} />
                            </div>
                            <div className="flex justify-between text-[11px] text-slate-400 pt-1">
                              <span>Free: <strong className="text-green-400">{z.available}</strong></span>
                              <span>Total: <strong>{z.capacity}</strong></span>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Slots & Vehicle Locations inside Selected Zone */}
                <div className="bg-white rounded-xl p-4 border border-slate-200 space-y-3">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                    <h4 className="text-sm font-bold text-slate-900">
                      Vehicle & Slot Locations inside {detail.zone} ({detail.location})
                    </h4>
                    <span className="text-xs text-slate-500">
                      Occupied: <strong>{detail.occupied}</strong> · Free: <strong className="text-green-600">{detail.available}</strong>
                    </span>
                  </div>

                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2.5 max-h-48 overflow-y-auto p-1">
                    {slotsInZone.map((slot) => {
                      const isAct = activeSlot?.id === slot.id
                      return (
                        <div
                          key={slot.id}
                          onClick={() => setActiveSlot(slot)}
                          className={`p-2.5 rounded-lg border text-center transition-all cursor-pointer ${slot.status === 'Occupied'
                            ? 'bg-blue-50 border-blue-200 text-blue-900 hover:border-blue-400'
                            : slot.status === 'Reserved'
                              ? 'bg-purple-50 border-purple-200 text-purple-900'
                              : slot.status === 'Maintenance'
                                ? 'bg-amber-50 border-amber-200 text-amber-900'
                                : 'bg-green-50 border-green-200 text-green-900 hover:border-green-400'
                            } ${isAct ? 'ring-2 ring-primary' : ''}`}
                        >
                          <strong className="text-xs font-mono font-bold block">{slot.slotCode}</strong>
                          <span className="text-[10px] font-semibold block uppercase opacity-80 mt-0.5">{slot.status}</span>
                          {slot.vehicle && (
                            <span className="text-[9px] font-mono font-extrabold text-blue-700 bg-white px-1 py-0.5 rounded border border-blue-200 mt-1 block truncate">
                              {slot.vehicle}
                            </span>
                          )}
                        </div>
                      )
                    })}
                  </div>

                  {activeSlot && (
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 flex justify-between items-center text-xs">
                      <div>
                        <span className="text-slate-500 font-medium">Selected Slot: </span>
                        <strong className="text-slate-900 font-bold font-mono">{activeSlot.slotCode}</strong>
                        <span className="mx-2 text-slate-300">|</span>
                        <span className="text-slate-500 font-medium">Status: </span>
                        <strong className="text-primary font-bold">{activeSlot.status}</strong>
                      </div>
                      {activeSlot.vehicle ? (
                        <div>
                          <span className="text-slate-500 font-medium">Vehicle License Plate: </span>
                          <strong className="text-blue-700 font-mono font-bold">{activeSlot.vehicle}</strong>
                        </div>
                      ) : (
                        <span className="text-green-700 font-bold">Ready for parking</span>
                      )}
                    </div>
                  )}
                </div>

              </div>

              <footer className="flex justify-end p-4 border-t border-slate-200 bg-slate-50">
                <button
                  className="px-5 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800 transition-colors"
                  onClick={() => setMapModalOpen(false)}
                >
                  Close Zone Map
                </button>
              </footer>
            </section>
          </div>
        )}

      </div>
    </ManagerLayout>
  )
}

export default ParkingStructurePage
