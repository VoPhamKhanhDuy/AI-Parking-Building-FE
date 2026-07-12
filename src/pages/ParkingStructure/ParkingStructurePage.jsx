import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import MainLayout from '../../layouts/MainLayout'
import { ROUTE_PATHS } from '../../routes/routePaths'
import {
  filterParkingZones,
  getParkingStructureOverview,
  getParkingStructureUpdates,
  getParkingStructureSlotTypes,
  getParkingStructureZones,
} from './parkingStructureService'
import './ParkingStructurePage.css'

function ParkingStructurePage() {
  const navigate = useNavigate()
  const overview = useMemo(() => getParkingStructureOverview(), [])
  const zones = useMemo(() => getParkingStructureZones(), [])
  const slotTypes = useMemo(() => getParkingStructureSlotTypes(), [])
  const updates = useMemo(() => getParkingStructureUpdates(), [])

  const [query, setQuery] = useState('')
  const [floor, setFloor] = useState('Floor 2')
  const [zoneFilter, setZoneFilter] = useState('All Zones')
  const [selectedZoneId, setSelectedZoneId] = useState(zones[0]?.id)

  const filteredZones = useMemo(
    () => filterParkingZones(zones, { query, floor, zone: zoneFilter }),
    [zones, query, floor, zoneFilter],
  )

  const selectedZone = filteredZones.find((item) => item.id === selectedZoneId) || filteredZones[0] || zones[0]

  return (
    <MainLayout>
      <div className="parking-structure-page">
        <header className="structure-heading">
          <div className="structure-breadcrumb"><button onClick={() => navigate(ROUTE_PATHS.dashboard)}>Dashboard</button><span className="material-symbols-outlined">chevron_right</span><strong>Parking Structure</strong></div>
          <h1>Parking Structure Management</h1>
          <p>Manage buildings, floors, zones, slot capacity, and maintenance status.</p>
        </header>

        <section className="structure-overview-grid">
          {overview.map((item) => (
            <article key={item.label} className="overview-card">
              <small>{item.label}</small>
              <strong>{item.value}</strong>
            </article>
          ))}
        </section>

        <div className="structure-main-grid">
          <aside className="structure-sidebar">
            <div className="sidebar-card">
              <div className="sidebar-title">Navigator</div>
              <div className="sidebar-group">
                <button type="button" className="sidebar-item active">Building A</button>
                <div className="sidebar-sublist">
                  {['Basement', 'Floor 1', 'Floor 2', 'Floor 3'].map((floorItem) => (
                    <button
                      key={floorItem}
                      type="button"
                      className={`sidebar-item subitem ${floorItem === floor ? 'selected' : ''}`}
                      onClick={() => setFloor(floorItem)}
                    >
                      {floorItem}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          <section className="structure-table-card">
            <div className="table-toolbar">
              <div className="search-field">
                <span className="material-symbols-outlined">search</span>
                <input
                  type="text"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search zones..."
                />
              </div>
              <div className="filter-row">
                <select value={floor} onChange={(event) => setFloor(event.target.value)}>
                  {['Floor 1', 'Floor 2', 'Floor 3', 'Basement'].map((item) => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </select>
                <select value={zoneFilter} onChange={(event) => setZoneFilter(event.target.value)}>
                  {['All Zones', 'Zone A', 'Zone B', 'Zone C', 'Zone D'].map((item) => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="table-header">
              <h2>Zone Capacity</h2>
              <span>{filteredZones.length} zones found</span>
            </div>

            <div className="table-wrap">
              <table className="structure-table">
                <thead>
                  <tr>
                    <th>Location</th>
                    <th>Zone</th>
                    <th>Type</th>
                    <th className="text-right">Capacity</th>
                    <th className="text-right">Occ / Avail</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredZones.map((zoneItem) => (
                    <tr
                      key={zoneItem.id}
                      className={selectedZone?.id === zoneItem.id ? 'selected-row' : ''}
                      onClick={() => setSelectedZoneId(zoneItem.id)}
                    >
                      <td>{zoneItem.location}</td>
                      <td className="font-medium">{zoneItem.zone}</td>
                      <td>{zoneItem.type}</td>
                      <td className="text-right">{zoneItem.capacity}</td>
                      <td className="text-right">{zoneItem.occupied} / {zoneItem.available}</td>
                      <td><span className={`status-pill ${zoneItem.status.toLowerCase().replace(/ /g, '-')}`}>{zoneItem.status}</span></td>
                    </tr>
                  ))}
                  {!filteredZones.length && (
                    <tr>
                      <td colSpan="6" className="empty-state">No zones match the current filters.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <aside className="structure-detail-card">
            <div className="detail-card-header">
              <div>
                <h2>{selectedZone.location}</h2>
                <p>{selectedZone.zone}</p>
              </div>
              <span className={`detail-status ${selectedZone.status.toLowerCase().replace(/ /g, '-')}`}>{selectedZone.status}</span>
            </div>

            <div className="detail-summary">
              <div>
                <span className="detail-label">Utilization</span>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: selectedZone.utilization }} />
                </div>
                <strong>{selectedZone.utilization}</strong>
              </div>
            </div>

            <div className="detail-grid">
              <div>
                <span className="detail-label">Total Slots</span>
                <strong>{selectedZone.capacity}</strong>
              </div>
              <div>
                <span className="detail-label">Type</span>
                <strong>{selectedZone.type}</strong>
              </div>
              <div>
                <span className="detail-label">Occupied</span>
                <strong>{selectedZone.occupied}</strong>
              </div>
              <div>
                <span className="detail-label">Available</span>
                <strong>{selectedZone.available}</strong>
              </div>
              <div>
                <span className="detail-label">Reserved</span>
                <strong>{selectedZone.reserved}</strong>
              </div>
              <div>
                <span className="detail-label">Maintenance</span>
                <strong>{selectedZone.maintenance}</strong>
              </div>
            </div>

            <div className="detail-actions">
              <button type="button" className="primary">View Slot Map</button>
              <button type="button">Edit Zone</button>
              <button type="button">Add Slots</button>
              <button type="button" className="danger">Mark Maintenance</button>
            </div>
          </aside>
        </div>

        <section className="bottom-row">
          <div className="bottom-card">
            <div className="bottom-header">
              <h3>Slot Type Summary</h3>
            </div>
            <div className="table-wrap">
              <table className="summary-table">
                <thead>
                  <tr>
                    <th>Type</th>
                    <th className="text-right">Total</th>
                    <th className="text-right">Occupied</th>
                    <th className="text-right">Available</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {slotTypes.map((typeItem) => (
                    <tr key={typeItem.type}>
                      <td className="type-cell"><span className="material-symbols-outlined">{typeItem.icon}</span>{typeItem.type}</td>
                      <td className="text-right font-medium">{typeItem.total}</td>
                      <td className="text-right">{typeItem.occupied}</td>
                      <td className="text-right">{typeItem.available}</td>
                      <td className="status-text">{typeItem.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bottom-card">
            <div className="bottom-header">
              <h3>Recent Updates</h3>
            </div>
            <div className="table-wrap recent-updates-table">
              <table className="summary-table">
                <thead>
                  <tr>
                    <th>Time</th>
                    <th>Area</th>
                    <th>Update</th>
                    <th>Staff</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {updates.map((update) => (
                    <tr key={`${update.time}-${update.slot}`} className={update.highlight ? 'highlight-row' : ''}>
                      <td className="text-muted">{update.time}</td>
                      <td className="font-medium">{update.slot}</td>
                      <td>{update.action}</td>
                      <td className="text-muted">{update.staff}</td>
                      <td><span className={`status-pill ${update.status.toLowerCase().replace(/ /g, '-')}`}>{update.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
    </MainLayout>
  )
}

export default ParkingStructurePage
