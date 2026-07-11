import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../../layouts/MainLayout';
import { ROUTE_PATHS } from '../../routes/routePaths';
import { getStoredSlots } from '../../mock-data/slots';
import { getAIRecommendation, checkInVehicle } from './vehicleEntryService';
import './VehicleEntryPage.css';

function Icon({ children, className = '' }) {
  return <span className={`material-symbols-outlined ${className}`}>{children}</span>;
}

function VehicleEntryPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Entry Form, 2: AI Rec, 3: Manual Selection, 4: Success
  const [form, setForm] = useState({
    licensePlate: '',
    vehicleType: 'Car',
    ticketType: 'Daily'
  });

  // Flow State
  const [aiResult, setAiResult] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null); // The final chosen slot object
  const [activeFloor, setActiveFloor] = useState('Floor 1'); // For map
  const [ticketDetails, setTicketDetails] = useState(null);
  const [allSlots, setAllSlots] = useState([]);
  const [errorMsg, setErrorMsg] = useState('');

  // Load slots for capacity preview
  useEffect(() => {
    setAllSlots(getStoredSlots());
  }, [step]);

  const updateField = (e) => {
    const { name, value } = e.target;
    setForm((current) => ({ ...current, [name]: value }));
    setErrorMsg('');
  };

  const handlePlateInput = (e) => {
    let val = e.target.value.toUpperCase();
    setForm((current) => ({ ...current, licensePlate: val }));
    setErrorMsg('');
  };

  // Step 1: Submit Form to get Recommendation
  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!form.licensePlate.trim()) {
      setErrorMsg('Please enter a license plate.');
      return;
    }
    
    // Validate Vietnamese/standard plate format (rough validation)
    const cleanPlate = form.licensePlate.replace(/[^A-Z0-9-.]/g, '');
    if (cleanPlate.length < 4) {
      setErrorMsg('Invalid license plate length.');
      return;
    }

    // Call service to get AI suggestions
    const rec = getAIRecommendation(form.vehicleType, form.ticketType);
    if (!rec.recommendedSlot) {
      setErrorMsg(`No available slots found for vehicle type '${form.vehicleType}'.`);
      return;
    }

    setAiResult(rec);
    setSelectedSlot(rec.recommendedSlot); // Default selection is AI recommended slot
    setActiveFloor(rec.recommendedSlot.floor); // Default floor tab on map
    setStep(2);
  };

  // Step 2: Confirm AI Slot
  const handleConfirmAI = () => {
    if (!selectedSlot) return;
    
    const ticket = checkInVehicle(
      form.licensePlate,
      form.vehicleType,
      form.ticketType,
      selectedSlot.code,
      aiResult.recommendedSlot.code,
      aiResult.score
    );

    setTicketDetails(ticket);
    setStep(4);
  };

  // Step 3: Choose Slot Manually
  const handleSelectAlternative = (slotCode) => {
    const slot = allSlots.find((s) => s.code === slotCode);
    if (slot) {
      setSelectedSlot(slot);
      setActiveFloor(slot.floor);
    }
  };

  const handleManualMapSelect = (slot) => {
    if (slot.status !== 'Available') return;
    setSelectedSlot(slot);
  };

  const handleConfirmManualSelection = () => {
    if (!selectedSlot) {
      alert('Please select a slot.');
      return;
    }
    const ticket = checkInVehicle(
      form.licensePlate,
      form.vehicleType,
      form.ticketType,
      selectedSlot.code,
      aiResult.recommendedSlot.code,
      aiResult.score
    );

    setTicketDetails(ticket);
    setStep(4);
  };

  const handleResetFlow = () => {
    setForm({ licensePlate: '', vehicleType: 'Car', ticketType: 'Daily' });
    setAiResult(null);
    setSelectedSlot(null);
    setTicketDetails(null);
    setErrorMsg('');
    setStep(1);
  };

  // Live Slot Availability Counts for Form Preview
  const getAvailabilityStats = (type) => {
    const filtered = allSlots.filter((s) => s.vehicleType === type);
    const available = filtered.filter((s) => s.status === 'Available').length;
    return { total: filtered.length, available };
  };

  const carStats = getAvailabilityStats('Car');
  const bikeStats = getAvailabilityStats('Motorbike');
  const evStats = getAvailabilityStats('Electric Vehicle');

  // Filter slots by selected floor
  const floorSlots = allSlots.filter((s) => s.floor === activeFloor);
  
  // Group slots by Zone on the map
  const zonesList = ['Zone A', 'Zone B', 'Zone C'];

  return (
    <MainLayout>
      <div className="vehicle-entry-container">
        
        {/* Wizard Progress Indicator */}
        <header className="page-heading">
          <div className="log-breadcrumb">
            <button onClick={() => navigate(ROUTE_PATHS.dashboard)}>Dashboard</button>
            <span className="material-symbols-outlined">chevron_right</span>
            <strong>Vehicle Entry</strong>
          </div>
          <h1>Vehicle Check-In</h1>
          <p>Process incoming vehicles, run AI slot matching, or manually allocate parking slots.</p>
        </header>

        <section className="checkin-wizard-steps">
          <div className={`step-pill ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>
            <span className="step-num">{step > 1 ? <Icon>check</Icon> : '1'}</span>
            <span className="step-lbl">Vehicle Info</span>
          </div>
          <div className="step-divider" />
          <div className={`step-pill ${step >= 2 ? 'active' : ''} ${step > 2 ? 'completed' : ''}`}>
            <span className="step-num">{step > 2 ? <Icon>check</Icon> : '2'}</span>
            <span className="step-lbl">AI Recommendation</span>
          </div>
          <div className="step-divider" />
          <div className={`step-pill ${step === 3 ? 'active' : ''} ${step > 3 ? 'completed' : ''}`}>
            <span className="step-num">{step > 3 ? <Icon>check</Icon> : '3'}</span>
            <span className="step-lbl">Manual Selection</span>
          </div>
          <div className="step-divider" />
          <div className={`step-pill ${step === 4 ? 'active' : ''}`}>
            <span className="step-num">4</span>
            <span className="step-lbl">Success</span>
          </div>
        </section>

        {/* STEP 1: VEHICLE ENTRY FORM */}
        {step === 1 && (
          <div className="wizard-panel grid-2col animate-fade-in">
            <article className="entry-form-card">
              <div className="card-title">
                <h2><Icon>input</Icon> Register Vehicle Entry</h2>
              </div>
              <form onSubmit={handleFormSubmit} className="entry-form">
                <div className="form-group">
                  <label htmlFor="licensePlate">License Plate Number</label>
                  <div className="plate-input-wrap">
                    <Icon className="plate-icon">badge</Icon>
                    <input
                      id="licensePlate"
                      name="licensePlate"
                      value={form.licensePlate}
                      onChange={handlePlateInput}
                      placeholder="e.g. 51A-123.45"
                      autoFocus
                      required
                    />
                  </div>
                  <span className="input-hint">Input license plate exactly as shown on the entry camera snapshot.</span>
                </div>

                <div className="form-group">
                  <label>Vehicle Category</label>
                  <div className="radio-tile-grid">
                    <label className={`radio-tile ${form.vehicleType === 'Car' ? 'checked' : ''}`}>
                      <input
                        type="radio"
                        name="vehicleType"
                        value="Car"
                        checked={form.vehicleType === 'Car'}
                        onChange={updateField}
                      />
                      <Icon>directions_car</Icon>
                      <strong>Car</strong>
                      <small>{carStats.available} free</small>
                    </label>
                    
                    <label className={`radio-tile ${form.vehicleType === 'Motorbike' ? 'checked' : ''}`}>
                      <input
                        type="radio"
                        name="vehicleType"
                        value="Motorbike"
                        checked={form.vehicleType === 'Motorbike'}
                        onChange={updateField}
                      />
                      <Icon>moped</Icon>
                      <strong>Motorbike</strong>
                      <small>{bikeStats.available} free</small>
                    </label>

                    <label className={`radio-tile ${form.vehicleType === 'Electric Vehicle' ? 'checked' : ''}`}>
                      <input
                        type="radio"
                        name="vehicleType"
                        value="Electric Vehicle"
                        checked={form.vehicleType === 'Electric Vehicle'}
                        onChange={updateField}
                      />
                      <Icon>electric_car</Icon>
                      <strong>EV Car</strong>
                      <small>{evStats.available} free</small>
                    </label>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="ticketType">Ticket Type</label>
                  <select
                    id="ticketType"
                    name="ticketType"
                    value={form.ticketType}
                    onChange={updateField}
                    className="styled-select"
                  >
                    <option value="Daily">Daily Ticket (Standard Visitor)</option>
                    <option value="Monthly Pass">Monthly Pass holder</option>
                    <option value="Reservation">Pre-booked Reservation</option>
                  </select>
                </div>

                {errorMsg && (
                  <div className="error-banner">
                    <Icon>error</Icon>
                    <span>{errorMsg}</span>
                  </div>
                )}

                <button type="submit" className="primary-action-btn">
                  Analyze & Suggest Slot <Icon>psychology</Icon>
                </button>
              </form>
            </article>

            {/* Side summary panel */}
            <aside className="capacity-summary-card">
              <div className="card-title">
                <h2>Live Capacity Summary</h2>
              </div>
              <div className="capacity-stats">
                <div className="capacity-item">
                  <div className="stats-header">
                    <span>Cars (Zone A)</span>
                    <strong>{carStats.available} / {carStats.total} Available</strong>
                  </div>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill green" 
                      style={{ width: `${(carStats.available / carStats.total) * 100}%` }} 
                    />
                  </div>
                </div>

                <div className="capacity-item">
                  <div className="stats-header">
                    <span>Motorbikes (Zone B)</span>
                    <strong>{bikeStats.available} / {bikeStats.total} Available</strong>
                  </div>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill blue" 
                      style={{ width: `${(bikeStats.available / bikeStats.total) * 100}%` }} 
                    />
                  </div>
                </div>

                <div className="capacity-item">
                  <div className="stats-header">
                    <span>Electric Vehicles (Zone C)</span>
                    <strong>{evStats.available} / {evStats.total} Available</strong>
                  </div>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill purple" 
                      style={{ width: `${(evStats.available / evStats.total) * 100}%` }} 
                    />
                  </div>
                </div>
              </div>

              <div className="gate-camera-feed">
                <span className="feed-tag"><i />Entry Gate A - Live Feed</span>
                <div className="mock-feed-screen">
                  {form.licensePlate ? (
                    <div className="ocr-preview">
                      <span className="plate-badge">{form.licensePlate}</span>
                      <small className="confidence-pill"><Icon>verified</Icon> OCR: 98% Confident</small>
                    </div>
                  ) : (
                    <div className="feed-placeholder">
                      <Icon>photo_camera</Icon>
                      <p>Awaiting vehicle presence sensor trigger...</p>
                    </div>
                  )}
                </div>
              </div>
            </aside>
          </div>
        )}

        {/* STEP 2: AI SLOT RECOMMENDATION */}
        {step === 2 && aiResult && (
          <div className="wizard-panel grid-2col animate-fade-in">
            <article className="ai-rec-card">
              <div className="card-title">
                <h2><Icon className="spark">psychology</Icon> AI Smart Recommendation</h2>
                <span className="shift-pill">Gate Assistant Engine v1.2</span>
              </div>
              
              <div className="ai-gauge-section">
                <div className="ai-score-donut">
                  <svg viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="16" className="bg-circle" />
                    <circle 
                      cx="18" 
                      cy="18" 
                      r="16" 
                      className="progress-circle" 
                      style={{ strokeDasharray: `${aiResult.score} 100` }}
                    />
                  </svg>
                  <div className="donut-center">
                    <strong>{aiResult.score}%</strong>
                    <small>Match Score</small>
                  </div>
                </div>
                
                <button 
                  className={`recommended-slot-highlight-btn ${selectedSlot?.code === aiResult.recommendedSlot.code ? 'active' : ''}`}
                  onClick={() => setSelectedSlot(aiResult.recommendedSlot)}
                  title="Click to select this recommendation"
                  type="button"
                >
                  <small>Recommended Slot</small>
                  <div className="slot-glow-pill">{aiResult.recommendedSlot.code}</div>
                  <span className="slot-meta">
                    {aiResult.recommendedSlot.floor} · {aiResult.recommendedSlot.zone}
                  </span>
                  {selectedSlot?.code !== aiResult.recommendedSlot.code && (
                    <span className="reset-hint-badge"><Icon>restore</Icon> Reset to AI</span>
                  )}
                </button>
              </div>

              <div className="rec-logic-explanation">
                <h4>Recommendation Rationale:</h4>
                <p>{aiResult.explanation}</p>
                <div className="metric-badges">
                  <span><Icon>directions_run</Icon> Exit: {aiResult.recommendedSlot.distanceToExit}m</span>
                  <span><Icon>elevator</Icon> Lift: {aiResult.recommendedSlot.distanceToElevator}m</span>
                  <span><Icon>sensors</Icon> Sensor Sync: Active</span>
                </div>
              </div>

              <div className="action-buttons-wrap">
                <button onClick={handleConfirmAI} className="confirm-btn">
                  {selectedSlot?.code === aiResult.recommendedSlot.code 
                    ? 'Accept AI Suggestion & Issue Ticket' 
                    : `Confirm Slot ${selectedSlot?.code} & Issue Ticket`}
                  <Icon>check_circle</Icon>
                </button>
                
                <button onClick={() => setStep(3)} className="secondary-btn">
                  Select Another Slot Manually <Icon>map</Icon>
                </button>
              </div>


              <div className="cancel-flow-wrap">
                <button onClick={handleResetFlow} className="cancel-text-btn">
                  <Icon>arrow_back</Icon> Back and Edit Info
                </button>
              </div>
            </article>

            {/* Alternative recommendations list */}
            <aside className="alternatives-card">
              <div className="card-title">
                <h2>Alternative Options</h2>
              </div>
              <p className="alternative-desc">Other available slots scoring high under the current load balance score:</p>
              
              <div className="alternatives-list">
                {aiResult.allScored && aiResult.allScored.slice(1, 4).map((item, index) => (
                  <button 
                    key={item.slot.code} 
                    className={`alternative-item ${selectedSlot?.code === item.slot.code ? 'selected' : ''}`}
                    onClick={() => handleSelectAlternative(item.slot.code)}
                  >
                    <div className="alt-info">
                      <span className="alt-badge">{item.slot.code}</span>
                      <div className="alt-details">
                        <strong>{item.slot.floor} - {item.slot.zone}</strong>
                        <small>Exit: {item.slot.distanceToExit}m · Lift: {item.slot.distanceToElevator}m</small>
                      </div>
                    </div>
                    <div className="alt-score-badge">
                      <strong>{item.score}%</strong>
                      <small>Match</small>
                    </div>
                  </button>
                ))}
                
                {(!aiResult.allScored || aiResult.allScored.length <= 1) && (
                  <p className="empty-alternatives">No other suitable slots available on this floor.</p>
                )}
              </div>

              {selectedSlot && selectedSlot.code !== aiResult.recommendedSlot.code && (
                <div className="override-alert">
                  <Icon>warning</Icon>
                  <div>
                    <strong>Manual Override Selected</strong>
                    <p>You have chosen alternative slot <strong>{selectedSlot.code}</strong>. The system will log this choice.</p>
                  </div>
                </div>
              )}
            </aside>
          </div>
        )}

        {/* STEP 3: MANUAL SLOT SELECTION (PARKING MAP) */}
        {step === 3 && (
          <div className="wizard-panel flex-col animate-fade-in">
            <article className="manual-map-card">
              <div className="card-title select-header">
                <div>
                  <h2><Icon>map</Icon> Live Parking Floor Map</h2>
                  <p>Choose any available (green) slot on the grid. Selected: <strong className="glow-text">{selectedSlot ? selectedSlot.code : 'None'}</strong></p>
                </div>
                <div className="map-legend">
                  <span><i className="sq available" /> Available</span>
                  <span><i className="sq occupied" /> Occupied</span>
                  <span><i className="sq reserved" /> Reserved</span>
                  <span><i className="sq maintenance" /> Maintenance</span>
                </div>
              </div>

              {/* Floor Tabs */}
              <div className="floor-tabs">
                {['Basement', 'Floor 1', 'Floor 2', 'Floor 3'].map((floor) => (
                  <button
                    key={floor}
                    className={`floor-tab-btn ${activeFloor === floor ? 'active' : ''}`}
                    onClick={() => setActiveFloor(floor)}
                  >
                    <Icon>layers</Icon> {floor}
                  </button>
                ))}
              </div>

              {/* Interactive Grid Map */}
              <div className="parking-map-layout">
                {zonesList.map((zoneName) => {
                  const zoneSlots = floorSlots.filter((s) => s.zone === zoneName);
                  if (zoneSlots.length === 0) return null;
                  
                  return (
                    <div key={zoneName} className="map-zone-block">
                      <div className="zone-header">
                        <h3>{zoneName}</h3>
                        <small className="zone-type-tag">
                          {zoneName === 'Zone A' && <><Icon>directions_car</Icon> Cars Only</>}
                          {zoneName === 'Zone B' && <><Icon>moped</Icon> Motorbikes Only</>}
                          {zoneName === 'Zone C' && <><Icon>electric_car</Icon> Electric Vehicles</>}
                        </small>
                      </div>

                      <div className="slots-grid-map">
                        {zoneSlots.map((slot) => {
                          const isSelected = selectedSlot?.code === slot.code;
                          const isRecommended = aiResult?.recommendedSlot?.code === slot.code;
                          
                          return (
                            <button
                              key={slot.code}
                              className={`slot-space ${slot.status.toLowerCase()} ${isSelected ? 'selected' : ''} ${isRecommended ? 'recommended-border' : ''}`}
                              disabled={slot.status !== 'Available'}
                              onClick={() => handleManualMapSelect(slot)}
                              title={`${slot.code} (${slot.status})\nExit: ${slot.distanceToExit}m\nElevator: ${slot.distanceToElevator}m`}
                            >
                              <span className="slot-num-code">{slot.code.split('-')[1]}</span>
                              {isRecommended && <span className="rec-star-badge" title="AI Recommended"><Icon>psychology</Icon></span>}
                              {slot.status === 'Occupied' && <Icon className="slot-status-icon">directions_car</Icon>}
                              {slot.status === 'Reserved' && <Icon className="slot-status-icon">lock</Icon>}
                              {slot.status === 'Maintenance' && <Icon className="slot-status-icon">build</Icon>}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Bottom detail action section */}
              <footer className="map-footer-details">
                {selectedSlot ? (
                  <div className="selected-slot-details">
                    <div className="details-header">
                      <Icon className="accent-color">push_pin</Icon>
                      <div>
                        <h4>Selected Slot: {selectedSlot.code}</h4>
                        <p>{selectedSlot.floor} · {selectedSlot.zone} · {selectedSlot.vehicleType}</p>
                      </div>
                    </div>
                    <div className="details-stats">
                      <span><strong>{selectedSlot.distanceToExit}m</strong><small>Distance to Exit</small></span>
                      <span><strong>{selectedSlot.distanceToElevator}m</strong><small>Distance to Lift</small></span>
                      <span><strong className="green-txt">Ready</strong><small>IoT Sensor Status</small></span>
                    </div>
                  </div>
                ) : (
                  <div className="selected-slot-details placeholder">
                    <Icon>touch_app</Icon>
                    <p>Select an available (green) slot on the map above to allocate.</p>
                  </div>
                )}

                <div className="action-row">
                  <button 
                    disabled={!selectedSlot} 
                    onClick={handleConfirmManualSelection} 
                    className="confirm-btn"
                  >
                    Confirm Allocated Slot <Icon>check_circle</Icon>
                  </button>
                  <button onClick={() => setStep(2)} className="secondary-btn">
                    Back to AI Recommendation <Icon>psychology</Icon>
                  </button>
                </div>
              </footer>
            </article>
          </div>
        )}

        {/* STEP 4: CHECK-IN SUCCESS */}
        {step === 4 && ticketDetails && (
          <div className="wizard-panel success-panel animate-scale-up">
            <div className="success-icon-ring">
              <Icon className="check-animated">check</Icon>
            </div>
            
            <h2>Check-In Processed Successfully</h2>
            <p className="success-subtitle">The gate barrier has opened. Please direct the vehicle to the assigned slot.</p>

            {/* Printed Ticket Presentation Card */}
            <article className="receipt-ticket-card">
              <header className="ticket-header-brand">
                <div className="ticket-logo"><Icon>directions_car</Icon></div>
                <div>
                  <h3>AI PARKING SYSTEM</h3>
                  <small>Gate Entry A · Operations Ticket</small>
                </div>
              </header>

              <div className="dashed-separator">
                <span className="left-notch" />
                <span className="right-notch" />
              </div>

              <div className="ticket-body">
                <div className="main-slot-pill">
                  <small>Assigned Slot</small>
                  <strong>{ticketDetails.slotCode}</strong>
                </div>

                <div className="ticket-data-grid">
                  <div>
                    <small>Ticket Number</small>
                    <strong>{ticketDetails.ticketCode}</strong>
                  </div>
                  <div>
                    <small>License Plate</small>
                    <strong className="mono">{ticketDetails.licensePlate}</strong>
                  </div>
                  <div>
                    <small>Vehicle Category</small>
                    <strong>{ticketDetails.vehicleType}</strong>
                  </div>
                  <div>
                    <small>Ticket Class</small>
                    <strong>{ticketDetails.ticketType}</strong>
                  </div>
                  <div className="grid-span-2">
                    <small>Check-In Timestamp</small>
                    <strong>{new Date(ticketDetails.checkInTime).toLocaleString()}</strong>
                  </div>
                </div>
              </div>

              <div className="dashed-separator">
                <span className="left-notch" />
                <span className="right-notch" />
              </div>

              <footer className="ticket-footer-barcode">
                <div className="barcode-mock">
                  <div className="line l-1" /><div className="line l-2" /><div className="line l-3" /><div className="line l-1" /><div className="line l-4" /><div className="line l-2" /><div className="line l-3" /><div className="line l-2" /><div className="line l-1" /><div className="line l-4" /><div className="line l-1" /><div className="line l-3" /><div className="line l-2" />
                </div>
                <small>{ticketDetails.ticketCode}</small>
              </footer>
            </article>

            <div className="success-action-buttons">
              <button onClick={handleResetFlow} className="confirm-btn">
                Print Ticket & Open Gate <Icon>print</Icon>
              </button>
              <button onClick={() => navigate(ROUTE_PATHS.dashboard)} className="secondary-btn">
                Go to Dashboard <Icon>dashboard</Icon>
              </button>
            </div>
          </div>
        )}

      </div>
    </MainLayout>
  );
}

export default VehicleEntryPage;
