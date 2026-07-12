import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import MainLayout from '../../layouts/MainLayout'
import { initialSlots } from '../../mock-data/slots'
import { initialRecentEntries } from '../../mock-data/vehicleEntries'
import {
  checkMonthlyPass,
  checkReservation,
  getAIRecommendation,
  getFormattedCurrentTime
} from './vehicleEntryService'
import './VehicleEntryPage.css'

function VehicleEntryPage() {
  const navigate = useNavigate()
  const location = useLocation()

  // State for persistent logs and slot occupancy
  const [slots, setSlots] = useState(initialSlots)
  const [recentEntries, setRecentEntries] = useState(initialRecentEntries)

  // Form Fields
  const [plateSource, setPlateSource] = useState('Camera Scan (Auto)')
  const [licensePlate, setLicensePlate] = useState('51A-12345')
  const [vehicleType, setVehicleType] = useState('Car')
  const [ticketType, setTicketType] = useState('Normal (Visitor)')
  const [reservationCode, setReservationCode] = useState('')
  const [entryTime, setEntryTime] = useState('2023-10-27 14:32:05') // Initial mock time from image

  // Logic states
  const [checkStatus, setCheckStatus] = useState('Existing Vehicle')
  const [aiRecommendation, setAiRecommendation] = useState({
    slotId: 'B2-18',
    floor: 'Floor 2',
    type: 'Standard',
    score: 92,
    reason: 'Optimized match for vehicle class'
  }) // Prepopulated to match image initially
  const [selectedSlotId, setSelectedSlotId] = useState('B2-18') // Prepopulated to match image initially
  const [isRecommending, setIsRecommending] = useState(false)
  const [notification, setNotification] = useState(null)

  // Read state from Manual Slot Selection redirect
  useEffect(() => {
    if (location.state) {
      const s = location.state
      if (s.licensePlate !== undefined) setLicensePlate(s.licensePlate)
      if (s.vehicleType !== undefined) setVehicleType(s.vehicleType)
      if (s.ticketType !== undefined) setTicketType(s.ticketType)
      if (s.checkStatus !== undefined) setCheckStatus(s.checkStatus)
      if (s.plateSource !== undefined) setPlateSource(s.plateSource)
      if (s.selectedSlotId !== undefined) {
        setSelectedSlotId(s.selectedSlotId)
        setAiRecommendation(null) // Manual override
        setNotification({ type: 'info', message: `Đã chỉ định vị trí đỗ thủ công: ${s.selectedSlotId}` })
      }
    }
  }, [location.state])

  // Action: Check Info
  const handleCheckInfo = () => {
    if (!licensePlate.trim()) {
      setNotification({ type: 'warning', message: 'Vui lòng nhập biển số xe!' })
      return
    }
    const cleanInput = licensePlate.toUpperCase().trim()

    // 1. Check reservation
    const reservation = checkReservation(cleanInput)
    if (reservation) {
      setTicketType('Reservation')
      setVehicleType(reservation.vehicleType)
      setReservationCode(reservation.code)
      setSelectedSlotId(reservation.slotId)
      setCheckStatus(`Confirmed Reservation: ${reservation.name}`)
      setNotification({ type: 'success', message: `Tìm thấy lịch đặt chỗ của ${reservation.name}!` })
      return
    }

    // 2. Check Monthly Pass
    const pass = checkMonthlyPass(cleanInput)
    if (pass) {
      setTicketType('Monthly Pass')
      setVehicleType(pass.vehicleType)
      setReservationCode('')
      setCheckStatus(`Active Monthly Pass: ${pass.ownerName}`)
      setNotification({ type: 'success', message: `Vé tháng của: ${pass.ownerName}!` })
      return
    }

    // 3. New visitor
    setCheckStatus('New Visitor')
    setNotification({ type: 'info', message: 'Biển số mới (Vé vãng lai).' })
  }

  // Preset quick simulated scanning
  const handlePresetScan = (plate, vType, tType) => {
    setLicensePlate(plate)
    setVehicleType(vType)
    setTicketType(tType)
    setAiRecommendation(null)
    setSelectedSlotId('')
    setEntryTime(getFormattedCurrentTime())

    setTimeout(() => {
      const reservation = checkReservation(plate)
      if (reservation) {
        setTicketType('Reservation')
        setVehicleType(reservation.vehicleType)
        setReservationCode(reservation.code)
        setSelectedSlotId(reservation.slotId)
        setCheckStatus(`Confirmed Reservation: ${reservation.name}`)
        return
      }

      const pass = checkMonthlyPass(plate)
      if (pass) {
        setTicketType('Monthly Pass')
        setVehicleType(pass.vehicleType)
        setCheckStatus(`Active Monthly Pass: ${pass.ownerName}`)
        return
      }

      setCheckStatus('New Visitor')
    }, 100)
  }

  // Request AI Recommendation
  const handleRequestAIRecommendation = () => {
    if (!licensePlate.trim()) {
      setNotification({ type: 'warning', message: 'Vui lòng nhập biển số xe trước khi yêu cầu AI!' })
      return
    }

    navigate('/ai-recommendation', {
      state: {
        licensePlate,
        vehicleType,
        ticketType,
        checkStatus,
        plateSource
      }
    })
  }

  // Handle click on Manual Slot Selection button -> redirect to page passing current state
  const handleManualSlotClick = () => {
    navigate('/vehicle-entry/manual-slot', {
      state: {
        licensePlate,
        vehicleType,
        ticketType,
        checkStatus,
        plateSource
      }
    })
  }

  // Confirm Entry check-in
  const handleConfirmEntry = () => {
    if (!licensePlate.trim()) {
      setNotification({ type: 'warning', message: 'Vui lòng nhập biển số xe!' })
      return
    }
    if (!selectedSlotId) {
      setNotification({ type: 'warning', message: 'Vui lòng chỉ định vị trí đỗ xe!' })
      return
    }

    // Verify availability
    const slotObj = slots.find((s) => s.id === selectedSlotId)
    if (slotObj && slotObj.status === 'Occupied') {
      setNotification({ type: 'warning', message: `Vị trí đỗ ${selectedSlotId} đã có xe đỗ!` })
      return
    }

    // Occupy slot in state
    setSlots((prevSlots) =>
      prevSlots.map((s) =>
        s.id === selectedSlotId ? { ...s, status: 'Occupied' } : s
      )
    )

    // Prepend log entry
    const timeStr = getFormattedCurrentTime().split(' ')[1]
    const cleanPlateInput = licensePlate.toUpperCase().trim()
    const ticketCode = `TCK-2026-${String(Math.floor(100000 + Math.random() * 900000))}`
    
    // Redirect directly to success page
    navigate('/vehicle-entry/success', {
      state: {
        licensePlate: cleanPlateInput,
        vehicleType,
        ticketType: ticketType.split(' ')[0],
        checkStatus,
        plateSource,
        selectedSlotId,
        ticketCode,
        entryTime: getFormattedCurrentTime().split(' ')[1],
        method: !!aiRecommendation ? 'AI Recommended' : 'Manual Selection',
        matchScore: !!aiRecommendation ? `${aiRecommendation.score}%` : '90%'
      }
    })
  }

  // Clear Form handler
  const handleClearForm = () => {
    setLicensePlate('')
    setReservationCode('')
    setCheckStatus('Idle')
    setSelectedSlotId('')
    setAiRecommendation(null)
    setNotification({ type: 'info', message: 'Đã xóa trắng form.' })
  }

  // Facility Status calculations
  const totalCount = slots.length
  const occupiedCount = slots.filter((s) => s.status === 'Occupied').length
  const availableCount = slots.filter((s) => s.status === 'Available').length
  const reservedCount = slots.filter((s) => s.status === 'Reserved').length
  const maintenanceCount = 12 // Simulated or disabled
  const occupancyRate = Math.round((occupiedCount / totalCount) * 100)

  return (
    <MainLayout>
      <div className="vehicle-entry-page max-w-container-max mx-auto px-md md:px-lg pb-lg">
        
        {/* Toast alerts */}
        {notification && (
          <div className="flex items-center justify-between p-3 rounded-lg border mb-4 bg-surface-container-high border-outline-variant text-on-surface" style={{ display: 'flex', width: '100%' }}>
            <span>{notification.message}</span>
            <button className="text-primary hover:text-primary-container font-semibold" onClick={() => setNotification(null)}>✕</button>
          </div>
        )}

        {/* Page Header */}
        <div className="mb-lg">
          <nav className="flex text-on-surface-variant font-label-md text-label-md mb-2" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-2">
              <li className="inline-flex items-center">
                <a href="/dashboard" className="hover:text-primary transition-colors">Dashboard</a>
              </li>
              <li className="">
                <div className="flex items-center">
                  <span className="material-symbols-outlined text-[16px] mx-1">chevron_right</span>
                  <span className="text-on-surface">Vehicle Entry</span>
                </div>
              </li>
            </ol>
          </nav>
          <h2 className="font-headline-lg text-headline-lg font-bold text-on-surface">Vehicle Entry</h2>
        </div>

        {/* Dynamic Preset Scan Helper for Dev demo */}
        <div className="entry-preset-scanner bg-surface-container-low border border-outline-variant/30 rounded-xl p-4 mb-6">
          <span className="text-xs font-semibold text-outline uppercase tracking-wider block mb-2">Simulate License Plate Scanner (Presets)</span>
          <div className="flex flex-wrap gap-2">
            <button className="px-3 py-1.5 bg-white border border-outline-variant rounded-lg text-xs font-medium hover:bg-surface-container-high transition-colors" onClick={() => handlePresetScan('51A-12345', 'Car', 'Normal (Visitor)')}>
              🚗 51A-12345 (Visitor)
            </button>
            <button className="px-3 py-1.5 bg-white border border-outline-variant rounded-lg text-xs font-medium hover:bg-surface-container-high transition-colors" onClick={() => handlePresetScan('29B-87654', 'Car', 'Monthly Pass')}>
              💳 29B-87654 (Monthly)
            </button>
            <button className="px-3 py-1.5 bg-white border border-outline-variant rounded-lg text-xs font-medium hover:bg-surface-container-high transition-colors" onClick={() => handlePresetScan('30A-99887', 'Electric Vehicle', 'Reservation')}>
              ⚡ 30A-99887 (Reserved EV)
            </button>
            <button className="px-3 py-1.5 bg-white border border-outline-variant rounded-lg text-xs font-medium hover:bg-surface-container-high transition-colors" onClick={() => handlePresetScan('59A-11111', 'Motorcycle', 'Monthly Pass')}>
              🏍️ 59A-11111 (Monthly Motorbike)
            </button>
          </div>
        </div>

        {/* Two Column Grid */}
        <div className="entry-main-grid grid grid-cols-1 xl:grid-cols-12 gap-lg mb-lg">
          
          {/* Left Column: Vehicle Entry Form */}
          <div className="xl:col-span-8">
            <div className="entry-form-ui bg-surface-container-lowest rounded-xl shadow-[0_4px_12px_rgba(15,23,42,0.05)] border border-outline-variant/30 p-6 relative overflow-hidden h-full">
              
              <h3 className="font-headline-md text-[20px] font-semibold text-on-surface mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">directions_car</span>
                Vehicle Entry Form
              </h3>

              <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block font-label-md text-label-md text-on-surface-variant mb-1">Plate Source</label>
                    <select 
                      className="bg-surface border border-outline-variant text-on-surface text-body-md rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5"
                      value={plateSource}
                      onChange={(e) => setPlateSource(e.target.value)}
                    >
                      <option>Camera Scan (Auto)</option>
                      <option>Manual Input</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-label-md text-label-md text-on-surface-variant mb-1">Vehicle Check Status</label>
                    <div className="flex items-center h-[42px] px-3 bg-surface border border-outline-variant rounded-lg gap-2">
                      <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                      <span className="text-on-surface">{checkStatus}</span>
                    </div>
                  </div>
                  
                  {/* License Plate */}
                  <div>
                    <label htmlFor="license-plate" className="block font-label-md text-label-md text-on-surface-variant mb-1">License Plate *</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <span className="material-symbols-outlined text-outline">credit_card</span>
                      </div>
                      <input 
                        type="text" 
                        id="license-plate" 
                        className="bg-surface border border-outline-variant text-on-surface text-body-md rounded-lg focus:ring-primary focus:border-primary block w-full pl-10 p-2.5 uppercase font-mono-label font-bold tracking-wider" 
                        placeholder="51A-12345" 
                        value={licensePlate}
                        onChange={(e) => setLicensePlate(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Vehicle Type */}
                  <div>
                    <label htmlFor="vehicle-type" className="block font-label-md text-label-md text-on-surface-variant mb-1">Vehicle Type *</label>
                    <select 
                      id="vehicle-type" 
                      className="bg-surface border border-outline-variant text-on-surface text-body-md rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5"
                      value={vehicleType}
                      onChange={(e) => setVehicleType(e.target.value)}
                    >
                      <option>Car</option>
                      <option>Motorcycle</option>
                      <option>Electric Vehicle</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block font-label-md text-label-md text-on-surface-variant mb-1" htmlFor="res-code">Reservation Code (Optional)</label>
                    <input 
                      className="bg-surface border border-outline-variant text-on-surface text-body-md rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5" 
                      id="res-code" 
                      placeholder="Enter code for reserved slots" 
                      type="text"
                      value={reservationCode}
                      onChange={(e) => setReservationCode(e.target.value)}
                    />
                  </div>

                  {/* Ticket Type */}
                  <div>
                    <label htmlFor="ticket-type" className="block font-label-md text-label-md text-on-surface-variant mb-1">Ticket Type *</label>
                    <select 
                      id="ticket-type" 
                      className="bg-surface border border-outline-variant text-on-surface text-body-md rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5"
                      value={ticketType}
                      onChange={(e) => setTicketType(e.target.value)}
                    >
                      <option>Normal (Visitor)</option>
                      <option>Monthly Pass</option>
                      <option>Reservation</option>
                    </select>
                  </div>

                  {/* Entry Time (Read Only) */}
                  <div>
                    <label htmlFor="entry-time" className="block font-label-md text-label-md text-on-surface-variant mb-1">Entry Time</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <span className="material-symbols-outlined text-outline">schedule</span>
                      </div>
                      <input 
                        type="text" 
                        id="entry-time" 
                        className="bg-surface-container-low border border-outline-variant/50 text-on-surface-variant text-body-md rounded-lg block w-full pl-10 p-2.5 cursor-not-allowed" 
                        value={entryTime} 
                        readonly
                      />
                    </div>
                  </div>

                </div>

                {/* Available Slot Options */}
                <div className="mt-6 p-4 bg-surface-container-low rounded-lg border border-outline-variant/20">
                  <h4 className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider mb-3">Available Slot Options</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-primary text-[20px]">psychology</span>
                      <div>
                        <div className="font-medium text-on-surface">AI Recommendation</div>
                        <div className="text-[11px] text-outline">Best optimized slot</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-secondary text-[20px]">ads_click</span>
                      <div>
                        <div className="font-medium text-on-surface">Manual Selection</div>
                        <div className="text-[11px] text-outline">Staff selects slot from map</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-outline text-[20px]">layers</span>
                      <div>
                        <div className="font-medium text-on-surface">Alternative Slots</div>
                        <div className="text-[11px] text-outline">Available backup slots</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Form Action Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-end gap-4 mt-8 pt-6 border-t border-outline-variant/30">
                  <button 
                    type="button" 
                    className="w-full sm:w-auto px-6 py-2.5 border border-outline-variant text-on-surface font-label-md text-label-md rounded-lg hover:bg-surface-container-low transition-colors duration-200 active:scale-[0.98]"
                    onClick={handleClearForm}
                  >
                    Clear Form
                  </button>
                  <button 
                    type="button" 
                    className="w-full sm:w-auto px-6 py-2.5 border border-primary text-primary font-label-md text-label-md rounded-lg hover:bg-primary-fixed transition-colors duration-200 active:scale-[0.98] flex items-center justify-center gap-2"
                    onClick={handleCheckInfo}
                  >
                    <span className="material-symbols-outlined text-[18px]">search</span>
                    Check Info
                  </button>
                  <div className="flex flex-col items-end gap-2 w-full sm:w-auto">
                    <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                      <button 
                        className="w-full sm:w-auto px-6 py-2.5 border border-outline-variant text-on-surface font-label-md text-label-md rounded-lg hover:bg-surface-container-low transition-colors duration-200 active:scale-[0.98] flex items-center justify-center gap-2" 
                        type="button"
                        onClick={handleManualSlotClick}
                      >
                        <span className="material-symbols-outlined text-[18px]">map</span>
                        Manual Slot Selection
                      </button>
                      <button 
                        className="w-full sm:w-auto px-6 py-2.5 bg-primary text-white font-label-md text-label-md rounded-lg hover:opacity-90 transition-opacity duration-200 active:scale-[0.98] flex items-center justify-center gap-2 shadow-md" 
                        type="button"
                        onClick={handleRequestAIRecommendation}
                      >
                        <span className="material-symbols-outlined text-[18px]">psychology</span>
                        Request AI Slot Recommendation
                      </button>
                    </div>
                    <p className="text-[11px] text-outline text-right max-w-[400px]">
                      Staff can use AI recommendation or manually select an available slot from the parking map. AI suggests while staff confirms.
                    </p>
                  </div>
                </div>

                {/* Giant Confirmation Button visible when a slot is assigned */}
                {selectedSlotId && (
                  <div className="mt-4 pt-4 border-t border-dashed border-outline-variant/40">
                    <button 
                      type="button" 
                      className="w-full py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors duration-200 shadow-md flex items-center justify-center gap-2"
                      onClick={handleConfirmEntry}
                    >
                      <span className="material-symbols-outlined">check_circle</span>
                      XÁC NHẬN CHO XE VÀO & IN VÉ (VỊ TRÍ: {selectedSlotId})
                    </button>
                  </div>
                )}

              </form>
            </div>
          </div>

          {/* Right Column: Live Status */}
          <div className="entry-side-ui xl:col-span-4 flex flex-col gap-6">
            
            {/* AI Module Status */}
            <div className="entry-engine-ui bg-surface-container-lowest rounded-xl shadow-[0_4px_12px_rgba(15,23,42,0.05)] border border-outline-variant/30 p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-headline-md text-[18px] font-semibold text-on-surface flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">memory</span>
                  AI Slot Engine
                </h3>
                <span className="px-2.5 py-1 bg-green-100 text-green-800 rounded-full font-label-md text-[10px] uppercase tracking-wider flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-600 animate-pulse"></span>
                  Ready
                </span>
              </div>
              <div className="space-y-2 text-body-sm text-on-surface-variant">
                <div className="flex justify-between">
                  <span className="">Slot data synced</span>
                  <span className="material-symbols-outlined text-green-600 text-[16px]">check_circle</span>
                </div>
                <div className="flex justify-between">
                  <span className="">Pricing rules loaded</span>
                  <span className="material-symbols-outlined text-green-600 text-[16px]">check_circle</span>
                </div>
                <div className="flex justify-between text-[11px] text-outline mt-2">
                  <span className="">Last update</span>
                  <span className="">5 seconds ago</span>
                </div>
              </div>

              {/* Dynamic recommendation results */}
              {isRecommending && (
                <div className="mt-4 p-4 border border-dashed border-outline-variant/30 rounded-lg text-center">
                  <div style={{ display: 'inline-block', width: '20px', height: '20px', border: '2px solid rgba(0,74,198,0.2)', borderTopColor: '#004ac6', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                  <p className="text-xs text-outline mt-2">AI is thinking...</p>
                </div>
              )}

              {!isRecommending && aiRecommendation && (
                <div className="mt-4 p-4 bg-primary/5 border border-primary/20 rounded-lg">
                  <div className="flex justify-between text-[11px] font-bold text-primary mb-2">
                    <span>AI RECOMMENDED SLOT</span>
                    <span>{aiRecommendation.score}% Match</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded bg-primary text-white flex items-center justify-center font-bold font-mono">P</div>
                    <div>
                      <div className="font-bold text-primary font-mono text-lg">{aiRecommendation.slotId}</div>
                      <div className="text-xs text-on-surface-variant">{aiRecommendation.floor} • {aiRecommendation.type}</div>
                    </div>
                  </div>
                  <p className="text-[11px] text-outline mt-2 italic">💡 Reason: {aiRecommendation.reason}</p>
                </div>
              )}
            </div>

            {/* Slot Metrics */}
            <div className="entry-facility-ui bg-surface-container-lowest rounded-xl shadow-[0_4px_12px_rgba(15,23,42,0.05)] border border-outline-variant/30 p-5 flex-grow">
              <h3 className="font-headline-md text-[18px] font-semibold text-on-surface mb-5">Facility Status</h3>
              <div className="mb-4 flex items-center justify-between bg-primary/5 p-3 rounded-lg border border-primary/10">
                <span className="text-body-sm font-medium text-primary">Occupancy Rate</span>
                <span className="text-headline-md font-bold text-primary">{occupancyRate}%</span>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-surface rounded-lg p-3 border border-outline-variant/20 flex flex-col items-center justify-center text-center">
                  <span className="text-headline-lg font-bold text-green-600">{availableCount}</span>
                  <span className="text-[11px] font-label-md text-on-surface-variant uppercase tracking-wider mt-1">Available</span>
                </div>
                <div className="bg-surface rounded-lg p-3 border border-outline-variant/20 flex flex-col items-center justify-center text-center">
                  <span className="text-headline-lg font-bold text-error">{occupiedCount}</span>
                  <span className="text-[11px] font-label-md text-on-surface-variant uppercase tracking-wider mt-1">Occupied</span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-body-sm">
                  <div className="flex items-center gap-2 text-on-surface-variant">
                    <span className="w-3 h-3 rounded bg-yellow-500"></span> Reserved
                  </div>
                  <span className="font-semibold text-on-surface">{reservedCount}</span>
                </div>
                <div className="flex items-center justify-between text-body-sm">
                  <div className="flex items-center gap-2 text-on-surface-variant">
                    <span className="w-3 h-3 rounded bg-gray-400"></span> Maintenance
                  </div>
                  <span className="font-semibold text-on-surface">{maintenanceCount}</span>
                </div>
              </div>
              
              <div className="mt-6 pt-5 border-t border-outline-variant/30 grid grid-cols-2 gap-4">
                <div>
                  <div className="text-label-md text-on-surface-variant uppercase tracking-wider mb-1 text-[10px]">Today Entries</div>
                  <div className="font-headline-md font-semibold text-on-surface">892</div>
                </div>
                <div>
                  <div className="text-label-md text-on-surface-variant uppercase tracking-wider mb-1 text-[10px]">Gate Queue</div>
                  <div className="font-headline-md font-semibold text-on-surface flex items-center gap-2">
                    3 <span className="text-body-sm text-error flex items-center"><span className="material-symbols-outlined text-[16px]">trending_up</span></span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Bottom Section: Recent Entries Table */}
        <div className="entry-recent-ui bg-surface-container-lowest rounded-xl shadow-[0_4px_12px_rgba(15,23,42,0.05)] border border-outline-variant/30 overflow-hidden">
          <div className="px-6 py-5 border-b border-outline-variant/30 flex items-center justify-between">
            <h3 className="font-headline-md text-[18px] font-semibold text-on-surface">Recent Vehicle Entries</h3>
            <a href="/reports" className="text-primary hover:text-primary-container transition-colors text-body-sm font-medium flex items-center gap-1">
              View Full Log <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </a>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-body-sm">
              <thead className="bg-[#F1F5F9] text-on-surface-variant font-label-md text-label-md uppercase tracking-wider">
                <tr>
                  <th scope="col" className="px-6 py-4">Time</th>
                  <th scope="col" className="px-6 py-4">License Plate</th>
                  <th scope="col" className="px-6 py-4">Type</th>
                  <th scope="col" className="px-6 py-4">Ticket</th>
                  <th scope="col" className="px-6 py-4">Assigned Slot</th>
                  <th scope="col" className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20 bg-surface-container-lowest">
                {recentEntries.map((entry, index) => {
                  const isHighlighted = entry.highlight || (index === 0 && entry.licensePlate === '51A-12345')
                  return (
                    <tr 
                      key={index} 
                      className={`hover:bg-surface-container/30 transition-colors ${
                        isHighlighted ? 'bg-primary-fixed/20 border-l-2 border-primary' : ''
                      }`}
                    >
                      <td className="px-6 py-4 text-on-surface-variant whitespace-nowrap">{entry.time}</td>
                      <td className={`px-6 py-4 font-mono-label font-bold whitespace-nowrap ${isHighlighted ? 'text-primary' : 'text-on-surface'}`}>
                        {entry.licensePlate}
                      </td>
                      <td className="px-6 py-4">{entry.vehicleType}</td>
                      <td className="px-6 py-4">{entry.ticketType}</td>
                      <td className={`px-6 py-4 font-mono-label ${isHighlighted ? 'text-tertiary font-bold' : ''}`}>
                        <div className="flex items-center gap-1">
                          {entry.isAiAssigned && (
                            <span className="material-symbols-outlined text-[16px] text-tertiary">psychology</span>
                          )}
                          {entry.assignedSlot}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-label-md ${
                          entry.statusClass === 'green' ? 'bg-green-100 text-green-800' :
                          entry.statusClass === 'purple' ? 'bg-purple-100 text-purple-800' :
                          entry.statusClass === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {entry.status}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>
      
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </MainLayout>
  )
}

export default VehicleEntryPage
