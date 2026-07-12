import { useState } from 'react'
import MainLayout from '../../layouts/MainLayout'
import { initialMapStats, initialSlotDetails, initialRecentUpdates } from './parkingMapService'

function ParkingMapPage() {
  // Real-time states
  const [stats, setStats] = useState(initialMapStats)
  const [slots, setSlots] = useState(initialSlotDetails)
  const [recentUpdates, setRecentUpdates] = useState(initialRecentUpdates)
  const [selectedSlotId, setSelectedSlotId] = useState('B2-18')

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('')
  const [building, setBuilding] = useState('Building A')
  const [floor, setFloor] = useState('Floor 2')
  const [zone, setZone] = useState('Zone B - Car')
  const [vehicle, setVehicle] = useState('Vehicle: Car')
  const [statusFilter, setStatusFilter] = useState('All Statuses')

  // Active details inspector
  const activeDetail = slots[selectedSlotId] || {
    status: 'Available',
    floor: '2',
    zone: 'B - Car',
    vehicle: '',
    ticketId: '',
    entryTime: '',
    method: '',
    processedBy: ''
  }

  // Helper to trigger slot update log
  const addLog = (slotId, action, newStatus, vehicle = '') => {
    const timeStr = new Date().toTimeString().split(' ')[0]
    const newLog = {
      time: timeStr,
      slot: slotId,
      vehicle: vehicle || 'N/A',
      action,
      staff: 'Parking Staff',
      status: newStatus,
      statusClass: newStatus === 'Checked In' || newStatus === 'Available' ? 'green' : newStatus === 'Occupied' ? 'red' : 'blue'
    }
    setRecentUpdates([newLog, ...recentUpdates])
  }

  // Action: Release Slot
  const handleReleaseSlot = () => {
    if (!selectedSlotId) return
    const prevStatus = slots[selectedSlotId]?.status
    if (prevStatus !== 'Occupied' && prevStatus !== 'Reserved') return

    const targetVehicle = slots[selectedSlotId]?.vehicle

    // Update state
    setSlots((prev) => ({
      ...prev,
      [selectedSlotId]: {
        ...prev[selectedSlotId],
        status: 'Available',
        vehicle: '',
        ticketId: '',
        entryTime: '',
        method: '',
        processedBy: ''
      }
    }))

    // Update counters
    setStats((prev) => {
      const availInc = 1
      const occDec = prevStatus === 'Occupied' ? 1 : 0
      const resDec = prevStatus === 'Reserved' ? 1 : 0
      const totalOcc = prev.occupied - occDec
      return {
        ...prev,
        available: prev.available + availInc,
        occupied: totalOcc,
        reserved: prev.reserved - resDec,
        occupancyRate: `${Math.round((totalOcc / prev.totalSlots) * 100)}%`
      }
    })

    addLog(selectedSlotId, 'Released Slot', 'Available', targetVehicle)
    window.alert(`Đã giải phóng thành công ô đỗ ${selectedSlotId}! Trạng thái chuyển sang TRỐNG.`)
  }

  // Action: Mark Maintenance
  const handleMarkMaintenance = () => {
    if (!selectedSlotId) return
    const prevStatus = slots[selectedSlotId]?.status
    if (prevStatus === 'Maintenance') return

    // Update state
    setSlots((prev) => ({
      ...prev,
      [selectedSlotId]: {
        ...prev[selectedSlotId],
        status: 'Maintenance',
        vehicle: '',
        ticketId: '',
        entryTime: '',
        method: '',
        processedBy: ''
      }
    }))

    // Update counters
    setStats((prev) => {
      const availDec = prevStatus === 'Available' ? 1 : 0
      const occDec = prevStatus === 'Occupied' ? 1 : 0
      const resDec = prevStatus === 'Reserved' ? 1 : 0
      const totalOcc = prev.occupied - occDec
      return {
        ...prev,
        available: prev.available - availDec,
        occupied: totalOcc,
        reserved: prev.reserved - resDec,
        maintenance: prev.maintenance + 1,
        occupancyRate: `${Math.round((totalOcc / prev.totalSlots) * 100)}%`
      }
    })

    addLog(selectedSlotId, 'Mark Maintenance', 'Maintenance')
    window.alert(`Đã chuyển ô đỗ ${selectedSlotId} sang trạng thái BẢO TRÌ.`)
  }

  // Slot rendering helper to bind details
  const renderSlot = (id, labelPosition = 'top') => {
    const s = slots[id] || { status: 'Available' }
    const isSelected = selectedSlotId === id
    const isOccupied = s.status === 'Occupied'
    const isReserved = s.status === 'Reserved'
    const isMaint = s.status === 'Maintenance'

    let bgClass = 'bg-green-100 border-green-300 hover:border-primary text-green-800'
    if (isSelected) {
      bgClass = 'bg-white border-2 border-primary ring-2 ring-primary/20 shadow-md z-10'
    } else if (isOccupied) {
      bgClass = 'border-red-300 bg-red-50/50 hover:border-primary text-red-800'
    } else if (isReserved) {
      bgClass = 'bg-amber-100 border-amber-300 hover:border-primary text-amber-800'
    } else if (isMaint) {
      bgClass = 'bg-gray-200 border-gray-400 cursor-not-allowed text-gray-600'
    }

    const labelClass = labelPosition === 'top' 
      ? 'absolute top-1 left-1 font-bold' 
      : 'absolute bottom-1 right-1 font-bold'

    return (
      <div
        key={id}
        className={`w-12 h-16 rounded text-[10px] flex flex-col items-center justify-center font-mono-label relative cursor-pointer ${bgClass}`}
        onClick={() => setSelectedSlotId(id)}
      >
        <span className={labelClass}>{id}</span>
        
        {/* Tooltip for selected slot */}
        {isSelected && isOccupied && (
          <span className="absolute -top-10 whitespace-nowrap bg-white border border-slate-300 px-2 py-1 rounded shadow-sm text-[10px] text-slate-800 font-medium flex flex-col items-center z-20">
            <span className="text-slate-500 text-[8px]">Current Session</span>
            {s.vehicle}
          </span>
        )}

        {/* Status indicator inside slots */}
        {isOccupied && (
          <span className={`material-symbols-outlined text-[20px] text-red-500 mt-2 ${labelPosition === 'bottom' ? 'rotate-180 mb-2' : ''}`}>
            directions_car
          </span>
        )}
        {isReserved && <span className="text-amber-600 font-bold mt-2">RES</span>}
        {isMaint && <span className="material-symbols-outlined text-[20px] text-gray-500 mt-2">build</span>}
      </div>
    )
  }

  return (
    <MainLayout>
      <div className="max-w-container-max mx-auto px-md md:px-lg pb-lg flex flex-col gap-6 text-slate-900">
        
        {/* Page Header */}
        <div className="flex justify-between items-end">
          <div>
            <nav aria-label="Breadcrumb" className="flex text-slate-500 font-label-md text-[12px] mb-2">
              <ol className="inline-flex items-center space-x-1 md:space-x-2">
                <li className="inline-flex items-center">
                  <a className="hover:text-primary transition-colors cursor-pointer" onClick={() => navigate('/dashboard')}>Dashboard</a>
                </li>
                <li className="">
                  <div className="flex items-center">
                    <span className="material-symbols-outlined text-[16px] mx-1">chevron_right</span>
                    <span className="text-slate-900 font-medium">Parking Map</span>
                  </div>
                </li>
              </ol>
            </nav>
            <h2 className="font-headline-lg text-[28px] font-bold text-slate-900 tracking-tight">Parking Map</h2>
            <p className="text-[14px] text-slate-500 mt-1">Real-time parking slot status by floor, zone, and vehicle type.</p>
          </div>
        </div>

        {/* Top Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
            <div className="text-[10px] font-label-md text-slate-500 uppercase tracking-wider mb-1">Total Slots</div>
            <div className="text-[24px] font-bold text-slate-900">{stats.totalSlots}</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 border-b-4 border-b-emerald-500">
            <div className="text-[10px] font-label-md text-slate-500 uppercase tracking-wider mb-1">Available</div>
            <div className="text-[24px] font-bold text-emerald-600">{stats.available}</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 border-b-4 border-b-red-500">
            <div className="text-[10px] font-label-md text-slate-500 uppercase tracking-wider mb-1">Occupied</div>
            <div className="text-[24px] font-bold text-red-600">{stats.occupied}</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 border-b-4 border-b-amber-500">
            <div className="text-[10px] font-label-md text-slate-500 uppercase tracking-wider mb-1">Reserved</div>
            <div className="text-[24px] font-bold text-amber-600">{stats.reserved}</div>
          </div>
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 border-b-4 border-b-slate-400">
            <div className="text-[10px] font-label-md text-slate-500 uppercase tracking-wider mb-1">Maintenance</div>
            <div className="text-[24px] font-bold text-slate-600">{stats.maintenance}</div>
          </div>
          <div className="bg-primary/5 rounded-xl border border-primary/10 p-4">
            <div className="text-[10px] font-label-md text-primary uppercase tracking-wider mb-1">Occupancy Rate</div>
            <div className="text-[24px] font-bold text-primary">{stats.occupancyRate}</div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-3 flex flex-wrap items-center gap-3">
          <select 
            className="bg-slate-50 border border-slate-300 text-slate-700 text-[13px] rounded-lg focus:ring-primary focus:border-primary block p-2"
            value={building}
            onChange={(e) => setBuilding(e.target.value)}
          >
            <option>Building A</option>
          </select>
          <select 
            className="bg-slate-50 border border-slate-300 text-slate-700 text-[13px] rounded-lg focus:ring-primary focus:border-primary block p-2"
            value={floor}
            onChange={(e) => setFloor(e.target.value)}
          >
            <option>Floor 2</option>
          </select>
          <select 
            className="bg-slate-50 border border-slate-300 text-slate-700 text-[13px] rounded-lg focus:ring-primary focus:border-primary block p-2"
            value={zone}
            onChange={(e) => setZone(e.target.value)}
          >
            <option>Zone B - Car</option>
          </select>
          <select 
            className="bg-slate-50 border border-slate-300 text-slate-700 text-[13px] rounded-lg focus:ring-primary focus:border-primary block p-2"
            value={vehicle}
            onChange={(e) => setVehicle(e.target.value)}
          >
            <option>Vehicle: Car</option>
          </select>
          <select 
            className="bg-slate-50 border border-slate-300 text-slate-700 text-[13px] rounded-lg focus:ring-primary focus:border-primary block p-2"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option>All Statuses</option>
          </select>
          <div className="flex-grow"></div>
          <div className="relative w-full md:w-72">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <span className="material-symbols-outlined text-slate-400 text-[18px]">search</span>
            </div>
            <input 
              className="bg-slate-50 border border-slate-300 text-slate-700 text-[13px] rounded-lg focus:ring-primary focus:border-primary block w-full pl-10 p-2" 
              placeholder="Search slot code or license plate" 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Two Column Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          
          {/* Left Column: Parking Map */}
          <div className="xl:col-span-8">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 relative overflow-hidden h-full flex flex-col min-h-[500px]">
              
              <div className="flex flex-wrap justify-between items-center mb-6 gap-2">
                <div>
                  <h3 className="font-headline-md text-[18px] font-semibold text-slate-900">Parking Slot Map</h3>
                  <p className="text-[13px] text-slate-500">Floor 2 - Zone B - Car Parking Layout</p>
                </div>
                <div className="flex flex-wrap gap-4 text-[11px] font-medium text-slate-600">
                  <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-green-100 border border-green-300"></span> Available</div>
                  <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-red-100 border border-red-300 bg-red-50/50"></span> Occupied</div>
                  <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-amber-100 border border-amber-300"></span> Reserved</div>
                  <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-gray-200 border border-gray-400"></span> Maintenance</div>
                </div>
              </div>

              {/* Map Container Canvas */}
              <div className="flex-grow bg-slate-50 rounded-lg border border-slate-200 p-8 relative min-h-[500px] overflow-auto">
                
                {/* Lift Core */}
                <div className="absolute top-1/2 left-8 -translate-y-1/2 w-24 h-32 bg-slate-200 border border-slate-300 flex flex-col items-center justify-center rounded text-slate-500 font-medium select-none shadow-inner">
                  <span className="material-symbols-outlined text-[32px] mb-1">elevator</span>
                  Lift Core
                </div>

                {/* Entry/Exit Markers */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-32">
                  <div className="flex items-center gap-2 text-emerald-600 font-bold uppercase tracking-wider text-[12px]">
                    <span className="material-symbols-outlined">login</span> ENTRY
                  </div>
                  <div className="flex items-center gap-2 text-red-600 font-bold uppercase tracking-wider text-[12px]">
                    <span className="material-symbols-outlined">logout</span> EXIT
                  </div>
                </div>

                {/* Lane Arrows */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 flex justify-between px-16 pointer-events-none opacity-20">
                  <span className="material-symbols-outlined text-[64px]">arrow_forward</span>
                  <span className="material-symbols-outlined text-[64px]">arrow_forward</span>
                </div>

                {/* Parking Grid drawing */}
                <div className="ml-40 flex flex-col gap-12 justify-center h-full min-w-[500px]">
                  
                  {/* Row A & B (Top) */}
                  <div className="flex gap-2 justify-center">
                    
                    {/* Group 1 (01-06) */}
                    <div className="flex flex-col gap-2">
                      <div className="flex gap-2">
                        {renderSlot('A1-01', 'top')}
                        {renderSlot('A1-02', 'top')}
                        {renderSlot('A1-03', 'top')}
                        {renderSlot('A1-04', 'top')}
                        {renderSlot('A1-05', 'top')}
                        {renderSlot('A1-06', 'top')}
                      </div>
                      <div className="flex gap-2">
                        {renderSlot('B2-13', 'bottom')}
                        {renderSlot('B2-14', 'bottom')}
                        {renderSlot('B2-15', 'bottom')}
                        {renderSlot('B2-16', 'bottom')}
                        {renderSlot('B2-17', 'bottom')}
                        {renderSlot('B2-18', 'bottom')}
                      </div>
                    </div>

                    <div className="w-8"></div> {/* Aisle */}

                    {/* Group 2 (07-12) */}
                    <div className="flex flex-col gap-2">
                      <div className="flex gap-2">
                        {renderSlot('A1-07', 'top')}
                        {renderSlot('A1-08', 'top')}
                        {renderSlot('A1-09', 'top')}
                        {renderSlot('A1-10', 'top')}
                        {renderSlot('A1-11', 'top')}
                        {renderSlot('A1-12', 'top')}
                      </div>
                      <div className="flex gap-2">
                        {renderSlot('B2-19', 'bottom')}
                        {renderSlot('B2-20', 'bottom')}
                        {renderSlot('B2-21', 'bottom')}
                        {renderSlot('B2-22', 'bottom')}
                        {renderSlot('B2-23', 'bottom')}
                        {renderSlot('B2-24', 'bottom')}
                      </div>
                    </div>

                  </div>

                  {/* Row C & D (Bottom) */}
                  <div className="flex gap-2 justify-center">
                    
                    {/* Group 1 (01-06) */}
                    <div className="flex flex-col gap-2">
                      <div className="flex gap-2">
                        {renderSlot('C3-01', 'top')}
                        {renderSlot('C3-02', 'top')}
                        {renderSlot('C3-03', 'top')}
                        {renderSlot('C3-04', 'top')}
                        {renderSlot('C3-05', 'top')}
                        {renderSlot('C3-06', 'top')}
                      </div>
                      <div className="flex gap-2">
                        {renderSlot('D4-13', 'bottom')}
                        {renderSlot('D4-14', 'bottom')}
                        {renderSlot('D4-15', 'bottom')}
                        {renderSlot('D4-16', 'bottom')}
                        {renderSlot('D4-17', 'bottom')}
                        {renderSlot('D4-18', 'bottom')}
                      </div>
                    </div>

                    <div className="w-8"></div> {/* Aisle */}

                    {/* Group 2 (07-12) */}
                    <div className="flex flex-col gap-2">
                      <div className="flex gap-2">
                        {renderSlot('C3-07', 'top')}
                        {renderSlot('C3-08', 'top')}
                        {renderSlot('C3-09', 'top')}
                        {renderSlot('C3-10', 'top')}
                        {renderSlot('C3-11', 'top')}
                        {renderSlot('C3-12', 'top')}
                      </div>
                      <div className="flex gap-2">
                        {renderSlot('D4-19', 'bottom')}
                        {renderSlot('D4-20', 'bottom')}
                        {renderSlot('D4-21', 'bottom')}
                        {renderSlot('D4-22', 'bottom')}
                        {renderSlot('D4-23', 'bottom')}
                        {renderSlot('D4-24', 'bottom')}
                      </div>
                    </div>

                  </div>

                </div>

              </div>

            </div>
          </div>

          {/* Right Column: Selected Slot Detail Panel */}
          <div className="xl:col-span-4 flex flex-col gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex-grow flex flex-col">
              
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-headline-md text-[16px] font-semibold text-slate-900">Selected Slot Detail</h3>
                <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider border ${
                  activeDetail.status === 'Occupied' ? 'text-red-600 border-red-200 bg-red-50/50' :
                  activeDetail.status === 'Available' ? 'text-emerald-600 border-emerald-200 bg-emerald-50' :
                  activeDetail.status === 'Reserved' ? 'text-amber-600 border-amber-200 bg-amber-50' :
                  'text-slate-600 border-slate-300 bg-slate-100'
                }`}>
                  {activeDetail.status}
                </span>
              </div>

              <div className="mb-5 pb-5 border-b border-slate-100">
                <div className="flex items-baseline gap-2 mb-3">
                  <span className="text-[32px] font-bold text-primary font-mono-label">{selectedSlotId}</span>
                  <span className="text-[13px] text-slate-500">Floor {activeDetail.floor} • Zone {activeDetail.zone}</span>
                </div>
                
                {activeDetail.vehicle && (
                  <div className="bg-slate-50 rounded-lg p-3 border border-slate-200 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] font-label-md text-slate-500 uppercase tracking-wider mb-1">Vehicle</div>
                      <div className="font-mono-label text-[18px] font-bold text-slate-900">{activeDetail.vehicle}</div>
                    </div>
                    <span className="material-symbols-outlined text-[24px] text-primary">directions_car</span>
                  </div>
                )}
              </div>

              <div className="space-y-4 mb-6 flex-grow text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Ticket ID</span>
                  <span className="font-mono-label font-medium text-slate-900">{activeDetail.ticketId || 'None'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Session Status</span>
                  <span className={`font-medium ${activeDetail.vehicle ? 'text-emerald-600' : 'text-slate-400'}`}>
                    {activeDetail.vehicle ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Entry Time</span>
                  <span className="font-mono-label font-medium text-slate-900">{activeDetail.entryTime || 'N/A'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Assignment Method</span>
                  <span className="text-slate-900 font-medium flex items-center gap-1">
                    {activeDetail.method && <span className="material-symbols-outlined text-[14px] text-purple-600">psychology</span>}
                    {activeDetail.method || 'Manual / Idle'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Processed By</span>
                  <span className="text-slate-900 font-medium">{activeDetail.processedBy || 'N/A'}</span>
                </div>
              </div>

              <div className="flex flex-col gap-3 mt-auto">
                <button className="w-full px-4 py-2.5 bg-primary hover:bg-blue-700 text-white font-medium text-[13px] rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm">
                  View Session Detail
                </button>
                <button className="w-full px-4 py-2.5 border border-slate-300 text-slate-700 font-medium text-[13px] rounded-lg hover:bg-slate-50 transition-colors">
                  Update Actual Parking Slot
                </button>
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    className="w-full px-4 py-2 border border-slate-300 text-red-600 font-medium text-[12px] rounded-lg hover:bg-red-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    onClick={handleReleaseSlot}
                    disabled={activeDetail.status !== 'Occupied' && activeDetail.status !== 'Reserved'}
                  >
                    Release Slot
                  </button>
                  <button 
                    className="w-full px-4 py-2 border border-slate-300 text-slate-500 font-medium text-[12px] rounded-lg hover:bg-slate-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    onClick={handleMarkMaintenance}
                    disabled={activeDetail.status === 'Maintenance'}
                  >
                    Mark Maintenance
                  </button>
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* Bottom Section: Recent Updates Table */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-headline-md text-[16px] font-semibold text-slate-900">Recent Slot Updates</h3>
            <button className="text-primary hover:text-primary-container transition-colors text-[13px] font-medium flex items-center gap-1">
              View Full History <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[13px]">
              <thead className="bg-[#F8FAFC] text-slate-500 font-label-md text-[11px] uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3 font-semibold" scope="col">Time</th>
                  <th className="px-6 py-3 font-semibold" scope="col">Slot</th>
                  <th className="px-6 py-3 font-semibold" scope="col">Vehicle</th>
                  <th className="px-6 py-3 font-semibold" scope="col">Action</th>
                  <th className="px-6 py-3 font-semibold" scope="col">Staff</th>
                  <th className="px-6 py-3 font-semibold" scope="col">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {recentUpdates.map((log, index) => {
                  return (
                    <tr 
                      key={index} 
                      className={`hover:bg-slate-50 transition-colors ${
                        log.highlight ? 'bg-blue-50/50 border-l-2 border-primary' : ''
                      }`}
                    >
                      <td className="px-6 py-3 text-slate-500 whitespace-nowrap">{log.time}</td>
                      <td className={`px-6 py-3 font-mono-label font-bold whitespace-nowrap ${log.highlight ? 'text-primary' : 'text-slate-900'}`}>
                        <div className="flex items-center gap-1">
                          {log.highlight && <span className="material-symbols-outlined text-[14px]">psychology</span>}
                          {log.slot}
                        </div>
                      </td>
                      <td className="px-6 py-3 font-mono-label font-medium text-slate-700">{log.vehicle}</td>
                      <td className="px-6 py-3 text-slate-700">{log.action}</td>
                      <td className="px-6 py-3 text-slate-700">{log.staff}</td>
                      <td className="px-6 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${
                          log.statusClass === 'green' ? 'bg-emerald-50 text-emerald-700' :
                          log.statusClass === 'red' ? 'bg-red-50 text-red-700' :
                          'bg-blue-50 text-blue-700'
                        }`}>
                          {log.status}
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
    </MainLayout>
  )
}

export default ParkingMapPage
