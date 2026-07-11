import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import MainLayout from '../../layouts/MainLayout'
import { mockPreviewSlots, mockAlternatives, mockAIRecommendationDetails } from './aiRecommendationService'

function AIRecommendationPage() {
  const location = useLocation()
  const navigate = useNavigate()

  // Extract form state passed from VehicleEntryPage, or default to mock image state
  const parentState = location.state || {
    licensePlate: '51A-12345',
    vehicleType: 'Car',
    ticketType: 'Normal',
    checkStatus: 'Existing Vehicle',
    plateSource: 'Camera Scan'
  }

  // Active selected slot
  const [selectedSlotId, setSelectedSlotId] = useState('B2-18')

  // Get active layout details
  const activeDetails = mockAIRecommendationDetails[selectedSlotId] || mockAIRecommendationDetails['B2-18']

  // Confirm slot selection and redirect to success page
  const handleConfirmSlot = () => {
    const ticketCode = `TCK-2026-${String(Math.floor(100000 + Math.random() * 900000))}`
    navigate('/vehicle-entry/success', {
      state: {
        ...parentState,
        selectedSlotId,
        ticketCode,
        entryTime: '14:32:05',
        method: 'AI Recommended',
        matchScore: `${activeDetails.score}%`
      }
    })
  }

  // Redirect to manual slot selection
  const handleManualSlotSelection = () => {
    navigate('/vehicle-entry/manual-slot', {
      state: parentState
    })
  }

  // Go back to form
  const handleBackToEntry = () => {
    navigate('/vehicle-entry', {
      state: parentState
    })
  }

  return (
    <MainLayout>
      <div className="max-w-container-max mx-auto px-md md:px-lg pb-lg flex flex-col gap-6 text-slate-900">
        
        {/* Breadcrumb & Title */}
        <div className="space-y-1">
          <nav className="flex items-center gap-2 font-body-sm text-body-sm text-slate-500">
            <a className="hover:text-primary transition-colors cursor-pointer" onClick={handleBackToEntry}>Dashboard</a>
            <span className="material-symbols-outlined text-[16px]">chevron_right</span>
            <a className="hover:text-primary transition-colors cursor-pointer" onClick={handleBackToEntry}>Vehicle Entry</a>
            <span className="material-symbols-outlined text-[16px]">chevron_right</span>
            <span className="text-on-surface font-medium">AI Recommendation</span>
          </nav>
          <div className="pt-2">
            <h2 className="font-headline-lg text-headline-lg font-semibold text-on-surface">AI Slot Recommendation</h2>
            <p className="font-body-md text-body-md text-slate-500 mt-1">AI suggests a suitable slot. Staff makes the final decision.</p>
          </div>
        </div>

        {/* Vehicle Summary Horizontal Card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 md:p-5 flex flex-wrap lg:flex-nowrap items-center gap-6 justify-between">
          <div className="flex items-center gap-4">
            <div className="w-24 h-12 bg-slate-100 border-2 border-slate-300 rounded flex items-center justify-center font-mono-label text-[18px] font-bold text-on-surface tracking-wider">
              {parentState.licensePlate}
            </div>
            <div>
              <p className="font-label-md text-label-md text-slate-500 uppercase">License Plate</p>
              <p className="font-body-lg text-body-lg font-medium text-slate-900">Verified</p>
            </div>
          </div>
          <div className="w-px h-10 bg-slate-200 hidden lg:block"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 flex-1">
            <div>
              <p className="font-label-md text-label-md text-slate-500 uppercase">Vehicle Type</p>
              <div className="flex items-center gap-2 mt-1 text-on-surface">
                <span className="material-symbols-outlined text-slate-500 text-[20px]">directions_car</span>
                <span className="font-body-md text-body-md font-medium">{parentState.vehicleType}</span>
              </div>
            </div>
            <div>
              <p className="font-label-md text-label-md text-slate-500 uppercase">Ticket Type</p>
              <div className="flex items-center gap-2 mt-1 text-on-surface">
                <span className="material-symbols-outlined text-slate-500 text-[20px]">local_activity</span>
                <span className="font-body-md text-body-md font-medium">{parentState.ticketType}</span>
              </div>
            </div>
            <div>
              <p className="font-label-md text-label-md text-slate-500 uppercase">Source</p>
              <div className="flex items-center gap-2 mt-1 text-on-surface">
                <span className="material-symbols-outlined text-slate-500 text-[20px]">photo_camera</span>
                <span className="font-body-md text-body-md font-medium">{parentState.plateSource}</span>
              </div>
            </div>
            <div>
              <p className="font-label-md text-label-md text-slate-500 uppercase">Status</p>
              <div className="mt-1">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded bg-blue-100 text-blue-800 font-label-md text-[11px] uppercase tracking-wide">
                  {parentState.checkStatus}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Layout 70/30 Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column (70%) */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            
            {/* Hero Recommended Slot Card */}
            <div className="bg-white rounded-xl border-2 border-primary shadow-md overflow-hidden">
              <div className="p-6 md:p-8 flex flex-col md:flex-row gap-8">
                <div className="flex-1">
                  <p className="text-primary font-bold text-sm uppercase tracking-wider mb-2">AI Recommended Slot</p>
                  <div className="flex items-baseline gap-4 mb-4">
                    <h3 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tighter whitespace-nowrap">{activeDetails.slotId}</h3>
                    <div className="bg-primary/10 px-3 py-1 rounded-full">
                      <span className="text-primary font-bold text-lg">{activeDetails.score}% Match</span>
                    </div>
                  </div>
                  <p className="text-lg text-slate-600 mb-6">{activeDetails.floor} | {activeDetails.zone} | Status: <span className="text-emerald-500 font-semibold">{activeDetails.status}</span></p>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600 font-medium">
                    <div className="flex items-center gap-1"><span className="material-symbols-outlined text-[18px]">near_me</span> {activeDetails.distExit}</div>
                    <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                    <div className="flex items-center gap-1"><span className="material-symbols-outlined text-[18px]">elevator</span> {activeDetails.distElevator}</div>
                    <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                    <div className="flex items-center gap-1"><span className="material-symbols-outlined text-[18px]">analytics</span> {activeDetails.occupancyReason}</div>
                  </div>
                </div>
                <div className="w-full md:w-64 bg-slate-50 rounded-lg p-5 border border-slate-200">
                  <h4 className="font-label-md text-slate-500 uppercase mb-3">AI Evaluation</h4>
                  <ul className="space-y-2.5 font-body-sm text-slate-600">
                    <li className="flex justify-between"><span className="">Vehicle fit</span><span className="font-semibold">{activeDetails.fit}</span></li>
                    <li className="flex justify-between"><span className="">Zone occupancy</span><span class="font-semibold">{activeDetails.zoneOccupancy}</span></li>
                    <li className="flex justify-between"><span className="">Route efficiency</span><span class="font-semibold">{activeDetails.routeEfficiency}</span></li>
                    <li className="flex justify-between"><span className="">Conflict check</span><span class="font-semibold text-emerald-500">{activeDetails.conflictCheck}</span></li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Recommendation Preview Map */}
            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <div>
                  <h3 className="font-headline-md text-body-lg font-semibold text-on-surface">Recommendation Preview Map</h3>
                  <p className="font-body-sm text-slate-500">Zone B - Car · Floor 2</p>
                </div>
                <button 
                  className="text-primary font-medium text-sm hover:underline flex items-center gap-1"
                  onClick={handleManualSlotSelection}
                >
                  <span className="material-symbols-outlined text-[18px]">map</span>
                  Open Full Map
                </button>
              </div>
              <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4">
                <div className="grid grid-cols-6 gap-3">
                  {mockPreviewSlots.map((s) => {
                    const isCurrent = s.id === selectedSlotId
                    const isOccupied = s.status === 'Occupied'
                    const isMaint = s.status === 'Maintenance'
                    const isAlt = s.status === 'Alternative'
                    const isAvail = s.status === 'Available'
                    const isRecommended = s.status === 'Recommended'

                    let styleClass = 'border-slate-200 bg-slate-50 text-slate-500'
                    if (isCurrent) {
                      styleClass = 'border-2 border-primary bg-primary text-white font-bold shadow-md ring-2 ring-primary ring-offset-2'
                    } else if (isRecommended) {
                      styleClass = 'border-2 border-primary/40 bg-primary/5 font-bold text-primary cursor-pointer hover:bg-primary/10'
                    } else if (isAlt) {
                      styleClass = 'border-2 border-primary/40 bg-primary/5 font-bold text-primary cursor-pointer hover:bg-primary/10'
                    } else if (isAvail) {
                      styleClass = 'border-2 border-emerald-500 bg-emerald-50/50 font-bold text-emerald-600 cursor-pointer hover:bg-emerald-100/50'
                    } else if (isOccupied) {
                      styleClass = 'border-2 border-red-500 bg-red-50 font-bold text-red-600'
                    }

                    return (
                      <div
                        key={s.id}
                        className={`h-14 border rounded flex items-center justify-center text-[10px] transition-all ${styleClass}`}
                        onClick={() => {
                          if (isAvail || isAlt || isRecommended) {
                            setSelectedSlotId(s.id)
                          }
                        }}
                      >
                        {s.id}
                      </div>
                    )
                  })}
                  
                  {/* Elevator & Exit labels */}
                  <div className="col-span-6 h-6 flex items-center justify-between px-4">
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium">
                      <span className="material-symbols-outlined text-[14px]">elevator</span> Lift Core
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium">
                      Exit <span className="material-symbols-outlined text-[14px]">east</span>
                    </div>
                  </div>
                </div>

                {/* Legend */}
                <div className="mt-6 flex flex-wrap gap-4 pt-4 border-t border-slate-100">
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                    <span className="w-2.5 h-2.5 rounded-full bg-primary"></span> Recommended
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                    <span className="w-2.5 h-2.5 rounded-full bg-primary/20 border border-primary/40"></span> Alternative
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Available
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span> Occupied
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-300"></span> Maintenance
                  </div>
                </div>
              </div>
            </div>

            {/* Alternative Slots list */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="font-headline-md text-body-lg font-semibold text-on-surface">Alternative Slots</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {mockAlternatives.map((alt) => {
                  const isCurrent = alt.id === selectedSlotId
                  return (
                    <div 
                      key={alt.id} 
                      className={`bg-white border rounded-xl p-4 shadow-sm flex flex-col justify-between transition-all ${
                        isCurrent ? 'border-primary ring-1 ring-primary' : 'border-slate-200'
                      }`}
                    >
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-lg font-bold text-slate-900">{alt.id}</span>
                        <span className="text-primary font-bold">Score {alt.score}</span>
                      </div>
                      <button 
                        className={`w-full py-2 rounded font-medium text-sm transition-colors ${
                          isCurrent 
                            ? 'bg-primary text-white' 
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        }`}
                        onClick={() => setSelectedSlotId(alt.id)}
                      >
                        {isCurrent ? 'Selected' : 'Select'}
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>

          </div>

          {/* Right Column (30%) - Staff Decision Panel */}
          <div className="lg:col-span-4 flex flex-col gap-6 lg:sticky lg:top-24">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">
              <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                <h3 className="font-headline-md text-body-lg font-semibold text-slate-900">Staff Decision</h3>
              </div>
              <div className="flex-1 bg-white space-y-6 p-5">
                <div className="space-y-4 font-body-sm text-slate-700">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Recommendation:</span>
                    <span className="font-bold text-lg text-slate-950">{selectedSlotId}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Status:</span>
                    <span className="text-amber-600 font-semibold flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                      Pending
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Mode:</span>
                    <span className="font-semibold text-slate-900">AI-assisted</span>
                  </div>
                </div>
                <div className="pt-4 border-t border-slate-100 space-y-2">
                  <button 
                    className="w-full bg-primary hover:bg-blue-700 text-white font-body-md font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center shadow-sm"
                    onClick={handleConfirmSlot}
                  >
                    Confirm Recommended Slot
                  </button>
                  <button 
                    className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-body-md font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
                    onClick={() => {
                      // Automatically toggle next alternative in list
                      const nextIndex = (mockAlternatives.findIndex((alt) => alt.id === selectedSlotId) + 1) % mockAlternatives.length
                      setSelectedSlotId(mockAlternatives[nextIndex].id)
                    }}
                  >
                    Choose Alternative
                  </button>
                  <button 
                    className="w-full border border-slate-300 hover:bg-slate-50 text-slate-700 font-body-md font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
                    onClick={handleManualSlotSelection}
                  >
                    Manual Slot Selection
                  </button>
                </div>
              </div>
              <div className="p-4 bg-slate-50 border-t border-slate-200 text-center">
                <button 
                  className="text-slate-500 hover:text-slate-900 font-body-sm text-[13px] transition-colors"
                  onClick={handleBackToEntry}
                >
                  Back to Vehicle Entry
                </button>
              </div>
            </div>
          </div>

        </div>

      </div>
    </MainLayout>
  )
}

export default AIRecommendationPage
