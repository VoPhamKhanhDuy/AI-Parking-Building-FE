import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import MainLayout from '../../layouts/MainLayout'
import { mockMapSlots, getFloorOccupancy, getSlotDetails } from './manualSlotService'

function ManualSlotPage() {
  const location = useLocation()
  const navigate = useNavigate()

  // Extract form state passed from VehicleEntryPage, or default to mock image state
  const parentState = location.state || {
    licensePlate: '51A-12345',
    vehicleType: 'Car',
    ticketType: 'Normal',
    checkStatus: 'Existing Vehicle',
    plateSource: 'Camera Scan (Auto)'
  }

  // Active Floor and selected slot
  const [selectedFloor, setSelectedFloor] = useState('Floor 2')
  const [selectedSlotId, setSelectedSlotId] = useState('C18') // Default selected C18
  const [selectedZone, setSelectedZone] = useState('Zone B - Car')

  // Get active layout slots for the current floor
  const activeLayout = mockMapSlots[selectedFloor] || { motorcycle: [], car: [], ev: [] }

  // Get current slot details for the sidebar panel
  const slotDetails = getSlotDetails(selectedSlotId, selectedFloor)

  // Confirm slot selection and redirect to success page
  const handleConfirmSelectedSlot = () => {
    const ticketCode = `TCK-2026-${String(Math.floor(100000 + Math.random() * 900000))}`
    navigate('/vehicle-entry/success', {
      state: {
        ...parentState,
        selectedSlotId,
        ticketCode,
        entryTime: '14:32:05',
        method: 'Manual Selection',
        matchScore: '90%'
      }
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
      <div className="max-w-container-max mx-auto px-md md:px-lg pb-lg flex flex-col gap-4 text-slate-900">
        
        {/* Header & Breadcrumbs */}
        <div className="flex flex-col gap-1">
          <nav className="font-label-md text-label-md text-slate-500 flex items-center gap-2">
            <a className="hover:text-primary transition-colors cursor-pointer" onClick={handleBackToEntry}>Dashboard</a>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <a className="hover:text-primary transition-colors cursor-pointer" onClick={handleBackToEntry}>Vehicle Entry</a>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-slate-900 font-semibold">Manual Slot Selection</span>
          </nav>
          <h1 className="font-headline-lg text-headline-lg text-slate-900 font-semibold tracking-tight">Manual Slot Selection</h1>
        </div>

        {/* Compact Summary Bar */}
        <section className="bg-white rounded-xl border border-slate-200 shadow-sm px-6 py-4 flex flex-wrap lg:flex-nowrap items-center gap-8 text-sm">
          <div className="flex flex-col gap-1">
            <span className="text-slate-500 font-semibold text-xs tracking-wider uppercase">License Plate</span>
            <span className="text-slate-900 font-bold text-base">{parentState.licensePlate}</span>
          </div>
          <div className="h-8 w-px bg-slate-200 hidden lg:block"></div>
          <div className="flex flex-col gap-1">
            <span className="text-slate-500 font-semibold text-xs tracking-wider uppercase">Vehicle Type</span>
            <div className="flex items-center gap-2 text-slate-900">
              <span className="material-symbols-outlined text-primary text-[18px]">directions_car</span>
              <span className="">{parentState.vehicleType}</span>
            </div>
          </div>
          <div className="h-8 w-px bg-slate-200 hidden lg:block"></div>
          <div className="flex flex-col gap-1">
            <span className="text-slate-500 font-semibold text-xs tracking-wider uppercase">Ticket Type</span>
            <span className="text-slate-900 font-medium">{parentState.ticketType}</span>
          </div>
          <div className="h-8 w-px bg-slate-200 hidden lg:block"></div>
          <div className="flex flex-col gap-1">
            <span className="text-slate-500 font-semibold text-xs tracking-wider uppercase">Status</span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 whitespace-nowrap">
              {parentState.checkStatus}
            </span>
          </div>
          <div className="h-8 w-px bg-slate-200 hidden lg:block"></div>
          <div className="flex flex-col gap-1">
            <span className="text-slate-500 font-semibold text-xs tracking-wider uppercase">Source</span>
            <div className="flex items-center gap-2 text-slate-600">
              <span className="material-symbols-outlined text-[18px]">photo_camera</span>
              <span className="">{parentState.plateSource}</span>
            </div>
          </div>
        </section>

        {/* Floor Occupancy Overview tabs */}
        <div className="flex items-center gap-2 bg-white p-1 rounded-lg border border-slate-200 shadow-sm w-fit">
          {['Basement', 'Floor 1', 'Floor 2', 'Floor 3'].map((fl) => {
            const isActive = fl === selectedFloor
            const colorClass = fl === 'Basement' ? 'text-amber-700' : fl === 'Floor 1' ? 'text-red-700' : fl === 'Floor 3' ? 'text-emerald-700' : 'text-white/80'
            const rate = getFloorOccupancy(fl)
            return (
              <button
                key={fl}
                className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${
                  isActive 
                    ? 'bg-primary text-white font-bold shadow-sm' 
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
                onClick={() => setSelectedFloor(fl)}
              >
                {fl} <span className={`ml-1 text-[10px] ${isActive ? 'text-white/80' : colorClass}`}>{rate}</span>
              </button>
            )
          })}
        </div>

        {/* Main Grid Layout Workspace */}
        <div className="grid grid-cols-12 gap-6 flex-1 min-h-0">
          
          {/* Left Area: Controls & Map (9 cols) */}
          <div className="col-span-12 lg:col-span-9 flex flex-col gap-4">
            
            {/* Control Bar */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm px-4 py-3 flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-3">
                
                {/* Floor Select option */}
                <div className="relative">
                  <select 
                    className="appearance-none bg-white border border-slate-300 rounded-lg pl-3 pr-10 py-1.5 text-sm text-slate-700 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors cursor-pointer shadow-sm"
                    value={selectedFloor}
                    onChange={(e) => setSelectedFloor(e.target.value)}
                  >
                    <option>Basement</option>
                    <option>Floor 1</option>
                    <option>Floor 2</option>
                    <option>Floor 3</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">arrow_drop_down</span>
                </div>

                {/* Zone Select option */}
                <div className="relative">
                  <select 
                    className="appearance-none bg-white border border-slate-300 rounded-lg pl-3 pr-10 py-1.5 text-sm text-slate-700 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors cursor-pointer shadow-sm"
                    value={selectedZone}
                    onChange={(e) => setSelectedZone(e.target.value)}
                  >
                    <option>All Zones</option>
                    <option>Zone A - Motorcycle</option>
                    <option>Zone B - Car</option>
                    <option>Zone C - EV Charging</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">arrow_drop_down</span>
                </div>
              </div>

              {/* Filters stats */}
              <div className="flex items-center gap-4 text-sm">
                <span className="font-medium text-slate-500">Filters:</span>
                <div className="flex items-center gap-1.5 text-slate-700 cursor-pointer hover:text-slate-900 transition-colors">
                  <span>All Statuses</span>
                  <span className="material-symbols-outlined text-[18px]">filter_list</span>
                </div>
                <div className="w-px h-4 bg-slate-300"></div>
                <div className="flex items-center gap-1.5 text-slate-700 cursor-pointer hover:text-slate-900 transition-colors">
                  <span>Car Slots</span>
                  <span className="material-symbols-outlined text-[18px]">ev_station</span>
                </div>
              </div>
            </div>

            {/* Parking Map Container */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex-1 overflow-hidden flex flex-col relative min-h-[500px]">
              
              <div className="w-full py-4 border-b border-slate-100 bg-slate-50/50 text-center">
                <h2 className="text-sm font-bold text-slate-700 uppercase tracking-widest">{selectedFloor} Parking Layout</h2>
              </div>
              <div className="px-4 py-2 bg-blue-50/50 border-b border-blue-100 text-center">
                <span className="text-xs font-medium text-blue-700">Showing compatible slots for: {parentState.vehicleType}</span>
              </div>

              {/* Map Legend */}
              <div className="absolute top-24 left-4 z-10 bg-white/90 backdrop-blur-sm rounded-lg px-4 py-2 flex items-center gap-5 text-xs font-medium shadow-sm border border-slate-200">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-sm bg-emerald-50 border border-emerald-300"></div>
                  <span className="text-slate-700">Available</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-sm bg-red-50 border border-red-200 flex items-center justify-center">
                    <span className="material-symbols-outlined text-[10px] text-red-500">directions_car</span>
                  </div>
                  <span className="text-slate-700">Occupied</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-sm bg-blue-50 border-2 border-primary"></div>
                  <span className="text-slate-700">Selected</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-sm bg-amber-50 border border-amber-200 flex items-center justify-center">
                    <span className="material-symbols-outlined text-[10px] text-amber-500">lock</span>
                  </div>
                  <span className="text-slate-700">Reserved</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-sm bg-slate-100 border border-slate-300 flex items-center justify-center">
                    <span className="material-symbols-outlined text-[10px] text-slate-500">build</span>
                  </div>
                  <span className="text-slate-700">Maintenance</span>
                </div>
              </div>

              {/* Map Area */}
              <div className="flex-1 bg-slate-50 p-4 overflow-auto custom-scrollbar flex items-center justify-center relative">
                
                <div className="relative w-full max-w-5xl mx-auto flex flex-col items-center gap-8 py-8 px-12 bg-slate-200/50 rounded-2xl border border-slate-300/50 shadow-inner">
                  
                  {/* Map Markers */}
                  <div className="absolute top-4 left-4 flex flex-col items-center justify-center text-slate-500 bg-white w-10 h-10 rounded-lg border border-slate-200 shadow-sm z-10">
                    <span className="material-symbols-outlined text-[18px] text-blue-600">login</span>
                    <span className="text-[8px] font-bold uppercase tracking-wider text-slate-700 mt-0.5">Entry</span>
                  </div>

                  <div className="absolute bottom-4 right-4 flex flex-col items-center text-slate-500 bg-white p-2 rounded-lg border border-slate-200 shadow-sm z-10">
                    <span className="material-symbols-outlined text-[24px] text-red-600">logout</span>
                    <span className="text-[9px] font-bold uppercase tracking-wider text-slate-700 mt-1">Exit</span>
                  </div>

                  <div className="absolute top-4 right-4 flex flex-col items-center text-slate-500 bg-white p-2 rounded-lg border border-slate-200 shadow-sm z-10">
                    <span className="material-symbols-outlined text-[24px] text-slate-600">elevator</span>
                    <span className="text-[9px] font-bold uppercase tracking-wider text-slate-700 mt-1">Lift Core</span>
                  </div>

                  {/* Parking Layout Structure */}
                  <div className="flex flex-col w-full relative">
                    
                    {/* Zone A: Motorcycle */}
                    {(selectedZone === 'All Zones' || selectedZone.includes('Motorcycle')) && activeLayout.motorcycle.length > 0 && (
                      <div className="mb-4 flex flex-col items-start w-full">
                        <h3 className="text-xs font-bold text-slate-600 uppercase tracking-widest mb-2 bg-slate-100 px-3 py-1 rounded-md shadow-sm border border-slate-200">Zone A - Motorcycle Parking</h3>
                        <div className="flex flex-col w-full bg-slate-300/20 p-2 rounded-xl">
                          <div className="flex gap-1 justify-start flex-wrap w-full">
                            {activeLayout.motorcycle.map((s) => {
                              const isSelected = selectedSlotId === s.id
                              const isOccupied = s.status === 'Occupied'
                              const isReserved = s.status === 'Reserved'
                              
                              let bgClass = 'bg-emerald-50 border-emerald-300 hover:bg-emerald-100 cursor-pointer'
                              if (isSelected) bgClass = 'bg-blue-50 border-2 border-primary shadow-[0_0_0_4px_rgba(37,99,235,0.2)] z-10'
                              else if (isOccupied) bgClass = 'bg-red-50 border-red-200 cursor-not-allowed'
                              else if (isReserved) bgClass = 'bg-amber-50 border-amber-200 cursor-not-allowed'

                              return (
                                <div
                                  key={s.id}
                                  className={`w-8 h-12 border rounded flex flex-col items-center justify-center relative transition-all ${bgClass}`}
                                  onClick={() => s.status === 'Available' && setSelectedSlotId(s.id)}
                                >
                                  <span className={`text-[8px] font-bold absolute top-1 ${isSelected ? 'text-primary' : isOccupied ? 'text-red-700' : isReserved ? 'text-amber-700' : 'text-emerald-700'}`}>{s.id}</span>
                                  {isOccupied && <span className="material-symbols-outlined text-red-500 text-sm mt-3">two_wheeler</span>}
                                  {isReserved && <span className="material-symbols-outlined text-amber-500 text-xs mt-3">lock</span>}
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Lane Arrows */}
                    <div className="w-full h-8 flex items-center justify-between px-16 opacity-40 mb-4 mt-2">
                      <span className="material-symbols-outlined text-4xl text-slate-600">keyboard_double_arrow_right</span>
                      <span className="material-symbols-outlined text-4xl text-slate-600">keyboard_double_arrow_right</span>
                      <span className="material-symbols-outlined text-4xl text-slate-600">keyboard_double_arrow_right</span>
                      <span className="material-symbols-outlined text-4xl text-slate-600">keyboard_double_arrow_right</span>
                    </div>

                    {/* Zone B: Car */}
                    {(selectedZone === 'All Zones' || selectedZone.includes('Car')) && activeLayout.car.length > 0 && (
                      <div className="mb-4 flex flex-col items-start w-full">
                        <h3 className="text-xs font-bold text-slate-600 uppercase tracking-widest mb-2 bg-slate-100 px-3 py-1 rounded-md shadow-sm border border-slate-200">Zone B - Car Parking</h3>
                        <div className="flex flex-col w-full bg-slate-300/20 p-2 rounded-xl">
                          
                          {/* Row A (C01 - C12) */}
                          <div className="flex gap-1 justify-between w-full border-b-2 border-slate-400 border-dashed pb-1">
                            {activeLayout.car.slice(0, 12).map((s) => {
                              const isSelected = selectedSlotId === s.id
                              const isOccupied = s.status === 'Occupied'
                              const isReserved = s.status === 'Reserved'
                              const isMaint = s.status === 'Maintenance'
                              
                              let bgClass = 'bg-emerald-50 border-emerald-300 hover:bg-emerald-100 cursor-pointer'
                              if (isSelected) bgClass = 'bg-blue-50 border-2 border-primary shadow-[0_0_0_4px_rgba(37,99,235,0.2)] z-10'
                              else if (isOccupied) bgClass = 'bg-red-50 border-red-200 cursor-not-allowed'
                              else if (isReserved) bgClass = 'bg-amber-50 border-amber-200 cursor-not-allowed'
                              else if (isMaint) bgClass = 'bg-slate-100 border-slate-300 cursor-not-allowed'

                              return (
                                <div
                                  key={s.id}
                                  className={`w-12 h-20 border rounded flex flex-col items-center justify-center relative transition-all ${bgClass}`}
                                  onClick={() => s.status === 'Available' && setSelectedSlotId(s.id)}
                                >
                                  <span className={`text-[10px] font-bold absolute top-1 ${isSelected ? 'text-primary' : isOccupied ? 'text-red-700' : isReserved ? 'text-amber-700' : isMaint ? 'text-slate-500' : 'text-emerald-700'}`}>{s.id}</span>
                                  {isOccupied && <span className="material-symbols-outlined text-red-500 text-xl mt-3">directions_car</span>}
                                  {isReserved && <span className="material-symbols-outlined text-amber-500 text-lg mt-3">lock</span>}
                                  {isMaint && <span className="material-symbols-outlined text-slate-400 text-lg mt-3">build</span>}
                                </div>
                              )
                            })}
                          </div>

                          {/* Row B (C13 - C24) */}
                          <div className="flex gap-1 justify-between w-full pt-1">
                            {activeLayout.car.slice(12, 24).map((s) => {
                              const isSelected = selectedSlotId === s.id
                              const isOccupied = s.status === 'Occupied'
                              const isReserved = s.status === 'Reserved'
                              const isMaint = s.status === 'Maintenance'
                              
                              let bgClass = 'bg-emerald-50 border-emerald-300 hover:bg-emerald-100 cursor-pointer'
                              if (isSelected) bgClass = 'bg-blue-50 border-2 border-primary shadow-[0_0_0_4px_rgba(37,99,235,0.2)] z-10'
                              else if (isOccupied) bgClass = 'bg-red-50 border-red-200 cursor-not-allowed'
                              else if (isReserved) bgClass = 'bg-amber-50 border-amber-200 cursor-not-allowed'
                              else if (isMaint) bgClass = 'bg-slate-100 border-slate-300 cursor-not-allowed'

                              return (
                                <div
                                  key={s.id}
                                  className={`w-12 h-20 border rounded flex flex-col items-center justify-center relative transition-all ${bgClass}`}
                                  onClick={() => s.status === 'Available' && setSelectedSlotId(s.id)}
                                >
                                  <span className={`text-[10px] font-bold absolute bottom-1 ${isSelected ? 'text-primary' : isOccupied ? 'text-red-700' : isReserved ? 'text-amber-700' : isMaint ? 'text-slate-500' : 'text-emerald-700'}`}>{s.id}</span>
                                  {isOccupied && <span className="material-symbols-outlined text-red-500 text-xl mb-3 rotate-180">directions_car</span>}
                                  {isReserved && <span className="material-symbols-outlined text-amber-500 text-lg mb-3">lock</span>}
                                  {isMaint && <span className="material-symbols-outlined text-slate-400 text-lg mb-3">build</span>}
                                </div>
                              )
                            })}
                          </div>

                        </div>
                      </div>
                    )}

                    {/* Lane Arrows */}
                    <div className="w-full h-8 flex items-center justify-between px-16 opacity-40 mb-4 mt-2">
                      <span className="material-symbols-outlined text-4xl text-slate-600">keyboard_double_arrow_right</span>
                      <span className="material-symbols-outlined text-4xl text-slate-600">keyboard_double_arrow_right</span>
                      <span className="material-symbols-outlined text-4xl text-slate-600">keyboard_double_arrow_right</span>
                      <span className="material-symbols-outlined text-4xl text-slate-600">keyboard_double_arrow_right</span>
                    </div>

                    {/* Zone C: EV Charging */}
                    {(selectedZone === 'All Zones' || selectedZone.includes('EV')) && activeLayout.ev.length > 0 && (
                      <div className="mb-4 flex flex-col items-start w-full">
                        <h3 className="text-xs font-bold text-slate-600 uppercase tracking-widest mb-2 bg-slate-100 px-3 py-1 rounded-md shadow-sm border border-slate-200">Zone C - EV Charging</h3>
                        <div className="flex flex-col w-full bg-slate-300/20 p-2 rounded-xl">
                          <div className="flex gap-1 justify-between w-full pb-1">
                            {activeLayout.ev.map((s) => {
                              const isSelected = selectedSlotId === s.id
                              const isOccupied = s.status === 'Occupied'
                              const isReserved = s.status === 'Reserved'
                              
                              let bgClass = 'bg-emerald-50 border-emerald-300 hover:bg-emerald-100 cursor-pointer'
                              if (isSelected) bgClass = 'bg-blue-50 border-2 border-primary shadow-[0_0_0_4px_rgba(37,99,235,0.2)] z-10'
                              else if (isOccupied) bgClass = 'bg-red-50 border-red-200 cursor-not-allowed'
                              else if (isReserved) bgClass = 'bg-amber-50 border-amber-200 cursor-not-allowed'

                              return (
                                <div
                                  key={s.id}
                                  className={`w-12 h-20 border rounded flex flex-col items-center justify-center relative transition-all ${bgClass}`}
                                  onClick={() => s.status === 'Available' && setSelectedSlotId(s.id)}
                                >
                                  <span className={`text-[10px] font-bold absolute top-1 ${isSelected ? 'text-primary' : isOccupied ? 'text-red-700' : isReserved ? 'text-amber-700' : 'text-emerald-700'}`}>{s.id}</span>
                                  {!isOccupied && !isReserved && <span className="material-symbols-outlined text-emerald-500 text-lg mt-3">ev_station</span>}
                                  {isOccupied && <span className="material-symbols-outlined text-red-500 text-xl mt-3">directions_car</span>}
                                  {isReserved && <span className="material-symbols-outlined text-amber-500 text-lg mt-3">lock</span>}
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Lane Arrows */}
                    <div className="w-full h-8 flex items-center justify-between px-16 opacity-40 mt-2">
                      <span className="material-symbols-outlined text-4xl text-slate-600">keyboard_double_arrow_right</span>
                      <span className="material-symbols-outlined text-4xl text-slate-600">keyboard_double_arrow_right</span>
                      <span className="material-symbols-outlined text-4xl text-slate-600">keyboard_double_arrow_right</span>
                      <span className="material-symbols-outlined text-4xl text-slate-600">keyboard_double_arrow_right</span>
                    </div>

                  </div>

                </div>

              </div>

            </div>

          </div>

          {/* Right Sidebar: Details Content (3 cols) */}
          <div className="col-span-12 lg:col-span-3 flex flex-col h-full">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-full overflow-hidden">
              
              {/* Header */}
              <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-slate-900 m-0 tracking-tight">Slot {selectedSlotId}</h2>
                </div>
                <span className="bg-primary/10 text-primary border border-primary/20 text-xs font-semibold px-2.5 py-1 rounded-md shadow-sm">Selected</span>
              </div>

              {/* Details Content */}
              <div className="p-6 flex-1 flex flex-col gap-6 overflow-y-auto custom-scrollbar">
                
                {slotDetails && (
                  <div className="flex flex-col gap-3">
                    <div className="flex justify-between items-center pb-1.5 border-b border-slate-100">
                      <span className="text-[11px] font-medium text-slate-500">Floor</span>
                      <span className="text-[11px] font-semibold text-slate-900">{slotDetails.floor}</span>
                    </div>
                    <div className="flex justify-between items-center pb-1.5 border-b border-slate-100">
                      <span className="text-[11px] font-medium text-slate-500">Zone</span>
                      <span className="text-[11px] font-semibold text-slate-900">{slotDetails.zone}</span>
                    </div>
                    <div className="flex justify-between items-center pb-1.5 border-b border-slate-100">
                      <span className="text-[11px] font-medium text-slate-500">Status</span>
                      <span className="text-[11px] font-medium text-emerald-600 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        {slotDetails.statusText}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pb-1.5 border-b border-slate-100">
                      <span className="text-[11px] font-medium text-slate-500">Vehicle Type Required</span>
                      <span className="text-[11px] font-semibold text-slate-900">{slotDetails.vehicleTypeRequired}</span>
                    </div>
                    <div className="flex justify-between items-center pb-1.5 border-b border-slate-100">
                      <span className="text-[11px] font-medium text-slate-500">Slot Compatibility</span>
                      <span className="text-[11px] font-semibold text-slate-900">{slotDetails.slotCompatibility}</span>
                    </div>
                    <div className="flex justify-between items-center pb-1.5 border-b border-slate-100">
                      <span className="text-[11px] font-medium text-slate-500">Reservation Conflict</span>
                      <span className="text-[11px] font-semibold text-slate-900">{slotDetails.reservationConflict}</span>
                    </div>
                    <div className="flex justify-between items-center pb-1.5 border-b border-slate-100">
                      <span className="text-[11px] font-medium text-slate-500">Assignment Readiness</span>
                      <span className="text-[11px] font-semibold text-slate-900">{slotDetails.readiness}</span>
                    </div>
                    <div className="flex justify-between items-center pb-1.5 border-b border-slate-100">
                      <span className="text-[11px] font-medium text-slate-500">Distance to Exit</span>
                      <span className="text-[11px] font-bold text-slate-900">{slotDetails.distExit}</span>
                    </div>
                    <div className="flex justify-between items-center pb-1.5 border-b border-slate-100">
                      <span className="text-[11px] font-medium text-slate-500">Distance to Elevator</span>
                      <span className="text-[11px] font-bold text-slate-900">{slotDetails.distElevator}</span>
                    </div>
                  </div>
                )}

                {/* Note Box */}
                <div className="mt-6 bg-blue-50/50 rounded-lg p-3 border border-blue-100 flex gap-2 items-start">
                  <span className="material-symbols-outlined text-blue-500 text-[16px]">info</span>
                  <p className="text-[11px] text-slate-600 m-0 leading-tight font-medium">Staff selects slot based on operational judgment.</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-4 border-t border-slate-200 bg-slate-50 flex flex-col gap-3">
                <button 
                  className="w-full bg-primary hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors shadow-sm text-sm"
                  onClick={handleConfirmSelectedSlot}
                  disabled={!selectedSlotId}
                >
                  Confirm Selected Slot
                </button>
                <button 
                  className="w-full bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-medium py-2 px-4 rounded-lg transition-colors text-sm"
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

export default ManualSlotPage
