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
  const [targetSlotId, setTargetSlotId] = useState(null)

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

  if (!data) return <ManagerLayout><div className="structure-loading">Loading parking structure...</div></ManagerLayout>

  const utilizationPct = detail.capacity ? Math.round((detail.occupied / detail.capacity) * 100) : 0

  // Mock slots inside Zone Map with vehicles parked in slots
  const zoneMapSlots = Array.from({ length: detail.capacity || 20 }, (_, idx) => {
    const num = String(idx + 1).padStart(2, '0')
    const code = `${(detail.zone || 'Z').replace('Zone ', '')}-${num}`
    let status = 'Available'
    let vehicle = null
    let time = null

    if (idx < (detail.occupied || 0)) {
      status = 'Occupied'
      vehicle = `51A-${124 + idx * 9}.${31 + idx * 2}`
      time = `${0 + (idx % 4)}h ${15 + idx * 3}m ago`
    } else if (idx < (detail.occupied || 0) + (detail.reserved || 0)) {
      status = 'Reserved'
    } else if (idx >= (detail.capacity || 20) - (detail.maintenance || 0)) {
      status = 'Maintenance'
    }

    return { id: code, slotCode: code, status, vehicle, time, type: detail.type, index: idx }
  })

  // Selected slot inside modal
  const activeSlot = zoneMapSlots.find((s) => s.id === targetSlotId) || zoneMapSlots.find((s) => s.status === 'Occupied') || zoneMapSlots[0]

  const upperRow = zoneMapSlots.slice(0, Math.ceil(zoneMapSlots.length / 2))
  const lowerRow = zoneMapSlots.slice(Math.ceil(zoneMapSlots.length / 2))

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

        {/* Centered Board Zone Map Modal */}
        {mapModalOpen && (
          <div className="structure-modal-backdrop" role="presentation" onClick={(e) => e.target === e.currentTarget && setMapModalOpen(false)}>
            <section className="zone-map-modal bg-white rounded-2xl shadow-2xl w-full max-w-5xl overflow-hidden border border-slate-200" role="dialog" aria-label="Zone Visual Slot Map">
              {/* Modal Header Board */}
              <header className="flex justify-between items-center px-6 py-4 border-b border-slate-200 bg-slate-900 text-white">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-blue-400 text-[24px]">map</span>
                    <h3 className="font-extrabold text-lg m-0 tracking-tight">{detail.zone} Zone Map — {detail.location}</h3>
                    <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-xs font-bold uppercase">
                      {detail.type}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Visual slot layout &amp; vehicle position map for <strong className="text-white">{building?.name || 'Main Building'}</strong>
                  </p>
                </div>
                <button className="text-slate-400 hover:text-white p-1.5 rounded-full hover:bg-slate-800 transition-colors" aria-label="Close" onClick={() => setMapModalOpen(false)}>
                  <span className="material-symbols-outlined text-[22px]">close</span>
                </button>
              </header>

              <div className="p-6 space-y-5 max-h-[78vh] overflow-y-auto bg-slate-950 text-slate-100">
                {/* Zone Summary Legend Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/90 p-3.5 rounded-xl border border-slate-800 text-xs">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1.5 font-semibold text-emerald-400">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                      Available ({detail.available})
                    </span>
                    <span className="flex items-center gap-1.5 font-semibold text-blue-400">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                      Vehicle Parked ({detail.occupied})
                    </span>
                    <span className="flex items-center gap-1.5 font-semibold text-purple-400">
                      <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                      Reserved ({detail.reserved})
                    </span>
                    <span className="flex items-center gap-1.5 font-semibold text-amber-400">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                      Maintenance ({detail.maintenance})
                    </span>
                  </div>

                  <div className="text-slate-400 font-medium">
                    Total Capacity: <strong className="text-white font-bold">{detail.capacity} slots</strong>
                  </div>
                </div>

                {/* 2D Parking Garage Zone Canvas Layout Board */}
                <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800 space-y-6 relative overflow-hidden shadow-inner">
                  {/* Upper Row Parking Bays */}
                  <div>
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex justify-between items-center">
                      <span>Row A — Wall Parking Bays</span>
                      <span className="text-slate-500 text-[11px] font-normal">Click any slot to locate vehicle</span>
                    </div>
                    <div className="grid grid-cols-5 sm:grid-cols-10 gap-3">
                      {upperRow.map((slot) => {
                        const isSelected = activeSlot?.id === slot.id
                        const isOccupied = slot.status === 'Occupied'
                        return (
                          <button
                            key={slot.id}
                            onClick={() => setTargetSlotId(slot.id)}
                            className={`relative flex flex-col items-center justify-between p-3 rounded-xl border transition-all ${isOccupied
                                ? 'bg-blue-950/80 border-blue-500 text-blue-200 hover:border-blue-300'
                                : slot.status === 'Reserved'
                                  ? 'bg-purple-950/80 border-purple-500 text-purple-200'
                                  : slot.status === 'Maintenance'
                                    ? 'bg-amber-950/80 border-amber-500 text-amber-200'
                                    : 'bg-emerald-950/60 border-emerald-500/60 text-emerald-200 hover:border-emerald-400'
                              } ${isSelected
                                ? 'ring-4 ring-blue-400 ring-offset-2 ring-offset-slate-900 shadow-xl shadow-blue-500/30 scale-105 z-10'
                                : ''
                              }`}
                          >
                            {isSelected && (
                              <span className="absolute -top-3 px-2 py-0.5 bg-blue-500 text-white text-[9px] font-black rounded-full uppercase tracking-wider shadow">
                                Selected
                              </span>
                            )}

                            <span className="text-xs font-mono font-extrabold text-white">{slot.slotCode}</span>

                            <div className="my-1.5 flex items-center justify-center">
                              {isOccupied ? (
                                <span className="material-symbols-outlined text-blue-400 text-[26px]">directions_car</span>
                              ) : slot.status === 'Reserved' ? (
                                <span className="material-symbols-outlined text-purple-400 text-[22px]">lock</span>
                              ) : slot.status === 'Maintenance' ? (
                                <span className="material-symbols-outlined text-amber-400 text-[22px]">build</span>
                              ) : (
                                <span className="material-symbols-outlined text-emerald-400/80 text-[22px]">check_circle</span>
                              )}
                            </div>

                            {isOccupied ? (
                              <span className="px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-400/30 text-[10px] font-mono font-bold truncate max-w-full">
                                {slot.vehicle}
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold uppercase opacity-75">{slot.status}</span>
                            )}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Driving Lane / Flow Arrows */}
                  <div className="my-4 py-3 px-4 bg-slate-950 rounded-xl border border-slate-800/80 flex items-center justify-between text-xs font-mono text-slate-400">
                    <span className="flex items-center gap-2 text-emerald-400 font-bold">
                      <span className="material-symbols-outlined text-base">login</span>
                      ENTRY DRIVE LANE ➡
                    </span>
                    <div className="flex items-center gap-4 text-slate-600 font-extrabold tracking-widest">
                      <span>───</span>
                      <span>───</span>
                      <span className="text-slate-400">MAIN VEHICLE LANE</span>
                      <span>───</span>
                      <span>───</span>
                    </div>
                    <span className="flex items-center gap-2 text-blue-400 font-bold">
                      EXIT DRIVE LANE ➔
                      <span className="material-symbols-outlined text-base">logout</span>
                    </span>
                  </div>

                  {/* Lower Row Parking Bays */}
                  <div>
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex justify-between items-center">
                      <span>Row B — Central Parking Bays</span>
                      <span className="text-slate-500 text-[11px] font-normal">{lowerRow.length} bays</span>
                    </div>
                    <div className="grid grid-cols-5 sm:grid-cols-10 gap-3">
                      {lowerRow.map((slot) => {
                        const isSelected = activeSlot?.id === slot.id
                        const isOccupied = slot.status === 'Occupied'
                        return (
                          <button
                            key={slot.id}
                            onClick={() => setTargetSlotId(slot.id)}
                            className={`relative flex flex-col items-center justify-between p-3 rounded-xl border transition-all ${isOccupied
                                ? 'bg-blue-950/80 border-blue-500 text-blue-200 hover:border-blue-300'
                                : slot.status === 'Reserved'
                                  ? 'bg-purple-950/80 border-purple-500 text-purple-200'
                                  : slot.status === 'Maintenance'
                                    ? 'bg-amber-950/80 border-amber-500 text-amber-200'
                                    : 'bg-emerald-950/60 border-emerald-500/60 text-emerald-200 hover:border-emerald-400'
                              } ${isSelected
                                ? 'ring-4 ring-blue-400 ring-offset-2 ring-offset-slate-900 shadow-xl shadow-blue-500/30 scale-105 z-10'
                                : ''
                              }`}
                          >
                            {isSelected && (
                              <span className="absolute -top-3 px-2 py-0.5 bg-blue-500 text-white text-[9px] font-black rounded-full uppercase tracking-wider shadow">
                                Selected
                              </span>
                            )}

                            <span className="text-xs font-mono font-extrabold text-white">{slot.slotCode}</span>

                            <div className="my-1.5 flex items-center justify-center">
                              {isOccupied ? (
                                <span className="material-symbols-outlined text-blue-400 text-[26px]">directions_car</span>
                              ) : slot.status === 'Reserved' ? (
                                <span className="material-symbols-outlined text-purple-400 text-[22px]">lock</span>
                              ) : slot.status === 'Maintenance' ? (
                                <span className="material-symbols-outlined text-amber-400 text-[22px]">build</span>
                              ) : (
                                <span className="material-symbols-outlined text-emerald-400/80 text-[22px]">check_circle</span>
                              )}
                            </div>

                            {isOccupied ? (
                              <span className="px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-400/30 text-[10px] font-mono font-bold truncate max-w-full">
                                {slot.vehicle}
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold uppercase opacity-75">{slot.status}</span>
                            )}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </div>

                {/* Selected Slot & Vehicle Inspector Panel */}
                {activeSlot && (
                  <div className="bg-slate-900 rounded-xl p-4 border border-slate-800 flex flex-wrap justify-between items-center gap-4 text-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-400">
                        <span className="material-symbols-outlined text-[24px]">directions_car</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <strong className="text-sm font-mono font-extrabold text-white">Slot {activeSlot.slotCode}</strong>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${activeSlot.status === 'Occupied' ? 'bg-blue-500/20 text-blue-300 border border-blue-400/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30'
                            }`}>
                            {activeSlot.status}
                          </span>
                        </div>
                        <p className="text-slate-400 text-[11px] margin-0 mt-0.5">
                          Location: <strong className="text-slate-200">{detail.location} · {detail.zone}</strong> ({detail.type})
                        </p>
                      </div>
                    </div>

                    {activeSlot.vehicle ? (
                      <div className="bg-slate-950 px-4 py-2 rounded-lg border border-slate-800 flex items-center gap-3">
                        <span className="text-slate-400 text-xs">Parked Vehicle License Plate:</span>
                        <strong className="text-blue-400 font-mono text-sm font-extrabold tracking-wider bg-blue-950/80 px-2.5 py-1 rounded border border-blue-400/40">
                          {activeSlot.vehicle}
                        </strong>
                        <span className="text-slate-500 text-[11px]">({activeSlot.time})</span>
                      </div>
                    ) : (
                      <div className="text-emerald-400 font-semibold bg-emerald-950/60 px-3 py-1.5 rounded-lg border border-emerald-500/30">
                        ✓ Open Slot — Ready for Vehicle Parking
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <footer className="flex justify-end px-6 py-4 border-t border-slate-800 bg-slate-900">
                <button
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-colors shadow-lg shadow-blue-500/20"
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
