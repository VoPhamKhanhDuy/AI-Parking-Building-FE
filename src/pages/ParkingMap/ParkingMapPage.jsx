import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../../layouts/MainLayout';
import { ROUTE_PATHS } from '../../routes/routePaths';
import { getStoredSlots, saveStoredSlots } from '../../mock-data/slots';
import './ParkingMapPage.css';

function Icon({ children, className = '' }) {
  return <span className={`material-symbols-outlined ${className}`}>{children}</span>;
}

function ParkingMapPage() {
  const navigate = useNavigate();
  const [slots, setSlots] = useState([]);
  const [activeFloor, setActiveFloor] = useState('Floor 1');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('All');
  const [inspectingSlot, setInspectingSlot] = useState(null);

  // Load slots from localStorage
  const loadSlots = () => {
    setSlots(getStoredSlots());
  };

  useEffect(() => {
    loadSlots();
  }, []);

  // Filter slots for the active floor
  const floorSlots = slots.filter((s) => s.floor === activeFloor);

  // Calculate statistics for the active floor
  const totalFloorSlots = floorSlots.length;
  const occupiedCount = floorSlots.filter((s) => s.status === 'Occupied').length;
  const availableCount = floorSlots.filter((s) => s.status === 'Available').length;
  const reservedCount = floorSlots.filter((s) => s.status === 'Reserved').length;
  const maintenanceCount = floorSlots.filter((s) => s.status === 'Maintenance').length;
  const occupancyPercentage = totalFloorSlots > 0 
    ? Math.round(((occupiedCount + reservedCount) / totalFloorSlots) * 100) 
    : 0;

  // Filter slots by status (Available, Occupied, Reserved, Maintenance)
  const getFilteredSlots = (zoneName) => {
    let list = floorSlots.filter((s) => s.zone === zoneName);
    if (selectedStatusFilter !== 'All') {
      list = list.filter((s) => s.status === selectedStatusFilter);
    }
    return list;
  };

  // Toggle status of slot for admin mock control
  const handleToggleStatus = (slotCode, newStatus) => {
    const updated = slots.map((s) => {
      if (s.code === slotCode) {
        const nextStatus = newStatus || (s.status === 'Available' ? 'Occupied' : 'Available');
        const updatedSlot = { ...s, status: nextStatus };
        if (inspectingSlot && inspectingSlot.code === slotCode) {
          setInspectingSlot(updatedSlot);
        }
        return updatedSlot;
      }
      return s;
    });
    setSlots(updated);
    saveStoredSlots(updated);
  };

  const handleInspectSlot = (slot) => {
    setInspectingSlot(slot);
  };

  const handleCloseInspect = () => {
    setInspectingSlot(null);
  };

  const zonesList = ['Zone A', 'Zone B', 'Zone C'];

  return (
    <MainLayout>
      <div className="parking-map-page">
        <header className="page-heading">
          <div className="log-breadcrumb">
            <button onClick={() => navigate(ROUTE_PATHS.dashboard)}>Dashboard</button>
            <span className="material-symbols-outlined">chevron_right</span>
            <strong>Parking Map</strong>
          </div>
          <h1>Live Parking Structure Map</h1>
          <p>Real-time slot monitoring, IoT sensor status updates, and floor occupancy loads.</p>
        </header>

        {/* Live Metrics Ribbons */}
        <section className="floor-metrics-row animate-fade-in">
          <article className="metric-panel-card">
            <div className="metric-hdr">
              <small>Floor Occupancy Load</small>
              <strong>{occupancyPercentage}%</strong>
            </div>
            <div className="occupancy-progress-bar">
              <div 
                className={`fill ${occupancyPercentage > 85 ? 'red' : occupancyPercentage > 60 ? 'yellow' : 'green'}`} 
                style={{ width: `${occupancyPercentage}%` }} 
              />
            </div>
          </article>
          
          <div className="mini-stats-grid">
            <button 
              className={`stat-pill green ${selectedStatusFilter === 'Available' ? 'active' : ''}`}
              onClick={() => setSelectedStatusFilter(selectedStatusFilter === 'Available' ? 'All' : 'Available')}
            >
              <i className="available" />
              <strong>{availableCount}</strong>
              <small>Available</small>
            </button>

            <button 
              className={`stat-pill blue ${selectedStatusFilter === 'Occupied' ? 'active' : ''}`}
              onClick={() => setSelectedStatusFilter(selectedStatusFilter === 'Occupied' ? 'All' : 'Occupied')}
            >
              <i className="occupied" />
              <strong>{occupiedCount}</strong>
              <small>Occupied</small>
            </button>

            <button 
              className={`stat-pill yellow ${selectedStatusFilter === 'Reserved' ? 'active' : ''}`}
              onClick={() => setSelectedStatusFilter(selectedStatusFilter === 'Reserved' ? 'All' : 'Reserved')}
            >
              <i className="reserved" />
              <strong>{reservedCount}</strong>
              <small>Reserved</small>
            </button>

            <button 
              className={`stat-pill slate ${selectedStatusFilter === 'Maintenance' ? 'active' : ''}`}
              onClick={() => setSelectedStatusFilter(selectedStatusFilter === 'Maintenance' ? 'All' : 'Maintenance')}
            >
              <i className="maintenance" />
              <strong>{maintenanceCount}</strong>
              <small>Maintenance</small>
            </button>
          </div>
        </section>

        {/* Floor selectors */}
        <section className="map-content-card">
          <div className="floor-tabs">
            {['Basement', 'Floor 1', 'Floor 2', 'Floor 3'].map((floor) => (
              <button
                key={floor}
                className={`floor-tab-btn ${activeFloor === floor ? 'active' : ''}`}
                onClick={() => {
                  setActiveFloor(floor);
                  handleCloseInspect();
                }}
              >
                <Icon>layers</Icon> {floor}
              </button>
            ))}
            {selectedStatusFilter !== 'All' && (
              <button className="clear-filter-pill" onClick={() => setSelectedStatusFilter('All')}>
                Filter: {selectedStatusFilter} <Icon>close</Icon>
              </button>
            )}
          </div>

          <div className="map-view-wrapper">
            <div className="parking-map-layout">
              {zonesList.map((zoneName) => {
                const zoneSlots = getFilteredSlots(zoneName);
                if (zoneSlots.length === 0 && selectedStatusFilter !== 'All') return null;

                return (
                  <div key={zoneName} className="map-zone-block">
                    <div className="zone-header">
                      <h3>{zoneName}</h3>
                      <span className="zone-type-tag">
                        {zoneName === 'Zone A' && <><Icon>directions_car</Icon> Cars</>}
                        {zoneName === 'Zone B' && <><Icon>moped</Icon> Motorbikes</>}
                        {zoneName === 'Zone C' && <><Icon>electric_car</Icon> EVs</>}
                      </span>
                    </div>

                    <div className="slots-grid-map">
                      {zoneSlots.map((slot) => {
                        const isInspected = inspectingSlot?.code === slot.code;
                        return (
                          <button
                            key={slot.code}
                            className={`slot-space ${slot.status.toLowerCase()} ${isInspected ? 'selected' : ''}`}
                            onClick={() => handleInspectSlot(slot)}
                          >
                            <span className="slot-num-code">{slot.code.split('-')[1]}</span>
                            {slot.status === 'Occupied' && <Icon className="slot-status-icon">directions_car</Icon>}
                            {slot.status === 'Reserved' && <Icon className="slot-status-icon">lock</Icon>}
                            {slot.status === 'Maintenance' && <Icon className="slot-status-icon">build</Icon>}
                          </button>
                        );
                      })}
                      {zoneSlots.length === 0 && (
                        <p className="empty-zone-slots">No slots matching filters on this floor zone.</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Inspect Side Modal/Card */}
            {inspectingSlot && (
              <aside className="slot-inspector-sidebar animate-fade-in">
                <header className="inspector-header">
                  <h3>Slot Detail Inspector</h3>
                  <button className="close-btn" aria-label="Close details" onClick={handleCloseInspect}>
                    <Icon>close</Icon>
                  </button>
                </header>
                
                <div className="inspector-body">
                  <div className="inspector-main-code">
                    <small>Slot Code</small>
                    <strong>{inspectingSlot.code}</strong>
                    <span className={`status-pill-badge ${inspectingSlot.status.toLowerCase()}`}>
                      {inspectingSlot.status}
                    </span>
                  </div>

                  <dl className="inspector-details-list">
                    <dt>Floor Level</dt>
                    <dd>{inspectingSlot.floor}</dd>
                    
                    <dt>Zone Area</dt>
                    <dd>{inspectingSlot.zone}</dd>
                    
                    <dt>Vehicle Fitment</dt>
                    <dd>{inspectingSlot.vehicleType}</dd>
                    
                    <dt>Distance to Exit</dt>
                    <dd>{inspectingSlot.distanceToExit} meters</dd>
                    
                    <dt>Distance to Lift</dt>
                    <dd>{inspectingSlot.distanceToElevator} meters</dd>

                    <dt>IoT Detector</dt>
                    <dd className="green-text">
                      <Icon className="inspector-inline-icon">sensors</Icon> Online (Active)
                    </dd>
                  </dl>

                  <div className="inspector-action-block">
                    <h4>Administrative Commands</h4>
                    <p className="admin-notice">Operator privileges: force-override slot occupancy or trigger maintenance blocks.</p>
                    
                    <div className="admin-btn-grid">
                      {inspectingSlot.status === 'Available' ? (
                        <>
                          <button 
                            onClick={() => handleToggleStatus(inspectingSlot.code, 'Occupied')} 
                            className="admin-action-btn blue-btn"
                          >
                            <Icon>directions_car</Icon> Force Occupy
                          </button>
                          <button 
                            onClick={() => handleToggleStatus(inspectingSlot.code, 'Reserved')} 
                            className="admin-action-btn orange-btn"
                          >
                            <Icon>lock</Icon> Reserve Slot
                          </button>
                          <button 
                            onClick={() => handleToggleStatus(inspectingSlot.code, 'Maintenance')} 
                            className="admin-action-btn gray-btn"
                          >
                            <Icon>build</Icon> Lock (Maintenance)
                          </button>
                        </>
                      ) : (
                        <button 
                          onClick={() => handleToggleStatus(inspectingSlot.code, 'Available')} 
                          className="admin-action-btn green-btn reset-btn"
                        >
                          <Icon>lock_open</Icon> Release & Reset Slot to Available
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </aside>
            )}
          </div>
        </section>
      </div>
    </MainLayout>
  );
}

export default ParkingMapPage;
