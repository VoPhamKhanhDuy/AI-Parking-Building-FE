import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import MainLayout from '../../layouts/MainLayout'
import { ROUTE_PATHS } from '../../routes/routePaths'
import { mockPreviewSlots, mockAlternatives, mockAIRecommendationDetails } from './aiRecommendationService'
import './AIRecommendationPage.css'

const DEFAULT_ENTRY = { licensePlate: '51A-12345', vehicleType: 'Car', ticketType: 'Normal', checkStatus: 'Existing Vehicle', plateSource: 'Camera Scan' }

function AIRecommendationPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const entry = { ...DEFAULT_ENTRY, ...(location.state || {}) }
  const [selectedSlotId, setSelectedSlotId] = useState('B2-18')
  const details = mockAIRecommendationDetails[selectedSlotId] || mockAIRecommendationDetails['B2-18']

  const goBack = () => navigate(ROUTE_PATHS.vehicleEntry, { state: entry })
  const openManualMap = () => navigate(ROUTE_PATHS.manualSlot, { state: entry })
  const confirmSlot = () => navigate(ROUTE_PATHS.checkinSuccess, { state: { ...entry, selectedSlotId, ticketCode: `TCK-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`, entryTime: new Date().toISOString(), method: 'AI Recommended', matchScore: `${details.score}%` } })

  const chooseNextAlternative = () => {
    const currentIndex = mockAlternatives.findIndex((slot) => slot.id === selectedSlotId)
    setSelectedSlotId(mockAlternatives[(currentIndex + 1) % mockAlternatives.length].id)
  }

  return (
    <MainLayout>
      <div className="ai-page">
        <div className="ai-title-block">
          <nav aria-label="Breadcrumb"><button onClick={() => navigate(ROUTE_PATHS.dashboard)}>Dashboard</button><span className="material-symbols-outlined">chevron_right</span><button onClick={goBack}>Vehicle Entry</button><span className="material-symbols-outlined">chevron_right</span><b>AI Recommendation</b></nav>
          <h1>AI Slot Recommendation</h1>
          <p>AI suggests a suitable slot. Staff makes the final decision.</p>
        </div>

        <section className="ai-vehicle-summary">
          <div className="ai-plate-group"><div className="ai-license-plate">{entry.licensePlate}</div><div><small>License Plate</small><strong>Verified</strong></div></div>
          <i />
          <div className="ai-summary-grid">
            <div><small>Vehicle Type</small><span><b className="material-symbols-outlined">directions_car</b>{entry.vehicleType}</span></div>
            <div><small>Ticket Type</small><span><b className="material-symbols-outlined">local_activity</b>{entry.ticketType}</span></div>
            <div><small>Source</small><span><b className="material-symbols-outlined">photo_camera</b>{entry.plateSource}</span></div>
            <div><small>Status</small><em>{entry.checkStatus}</em></div>
          </div>
        </section>

        <div className="ai-content-grid">
          <div className="ai-left-column">
            <section className="ai-hero-card">
              <div className="ai-hero-main">
                <div className="ai-slot-overview">
                  <small>AI Recommended Slot</small>
                  <div className="ai-slot-line"><h2>{details.slotId}</h2><span>{details.score}% Match</span></div>
                  <p>{details.floor} <i /> {details.zone} <i /> Status: <b>{details.status}</b></p>
                  <div className="ai-slot-metrics"><span><b className="material-symbols-outlined">near_me</b>{details.distExit}</span><i /><span><b className="material-symbols-outlined">elevator</b>{details.distElevator}</span><i /><span><b className="material-symbols-outlined">analytics</b>{details.occupancyReason}</span></div>
                </div>
                <div className="ai-evaluation"><h3>AI Evaluation</h3><dl><div><dt>Vehicle fit</dt><dd>{details.fit}</dd></div><div><dt>Zone occupancy</dt><dd>{details.zoneOccupancy}</dd></div><div><dt>Route efficiency</dt><dd>{details.routeEfficiency}</dd></div><div><dt>Conflict check</dt><dd>{details.conflictCheck}</dd></div></dl></div>
              </div>
            </section>

            <section className="ai-map-section">
              <div className="ai-section-heading"><div><h2>Recommendation Preview Map</h2><p>Zone B - Car · Floor 2</p></div><button onClick={openManualMap}><span className="material-symbols-outlined">map</span>Open Full Map</button></div>
              <div className="ai-preview-card">
                <div className="ai-preview-grid">
                  {mockPreviewSlots.map((slot, index) => {
                    const selectable = ['Recommended', 'Alternative', 'Available'].includes(slot.status)
                    return <div key={slot.id} className="ai-preview-cell-wrap">
                      <button className={`ai-preview-slot ${slot.status.toLowerCase()}${slot.id === selectedSlotId ? ' selected' : ''}`} disabled={!selectable} onClick={() => setSelectedSlotId(slot.id)}>{slot.id}</button>
                      {index === 5 && <div className="ai-map-lane"><span><b className="material-symbols-outlined">elevator</b>Lift Core</span><span>Exit <b className="material-symbols-outlined">east</b></span></div>}
                    </div>
                  })}
                </div>
                <div className="ai-map-legend"><span><i className="recommended" />Recommended</span><span><i className="alternative" />Alternative</span><span><i className="available" />Available</span><span><i className="occupied" />Occupied</span><span><i className="maintenance" />Maintenance</span></div>
              </div>
            </section>

            <section className="ai-alternatives">
              <h2>Alternative Slots</h2>
              <div className="ai-alternative-grid">{mockAlternatives.map((slot) => <article className={slot.id === selectedSlotId ? 'active' : ''} key={slot.id}><div><strong>{slot.id}</strong><b>Score {slot.score}</b></div><button onClick={() => setSelectedSlotId(slot.id)}>{slot.id === selectedSlotId ? 'Selected' : 'Select'}</button></article>)}</div>
            </section>
          </div>

          <aside className="ai-decision-card">
            <h2>Staff Decision</h2>
            <div className="ai-decision-body"><dl><div><dt>Recommendation:</dt><dd>{selectedSlotId}</dd></div><div><dt>Status:</dt><dd className="pending">Pending</dd></div><div><dt>Mode:</dt><dd>AI-assisted</dd></div></dl><div className="ai-decision-actions"><button className="primary" onClick={confirmSlot}>Confirm Recommended Slot</button><button onClick={chooseNextAlternative}>Choose Alternative</button><button onClick={openManualMap}>Manual Slot Selection</button></div></div>
            <div className="ai-decision-footer"><button onClick={goBack}>Back to Vehicle Entry</button></div>
          </aside>
        </div>
      </div>
    </MainLayout>
  )
}

export default AIRecommendationPage
