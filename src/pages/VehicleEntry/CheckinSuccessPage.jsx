import { useLocation, useNavigate } from 'react-router-dom'
import MainLayout from '../../layouts/MainLayout'

function CheckinSuccessPage() {
  const location = useLocation()
  const navigate = useNavigate()

  // State passed from confirm check-in, or default mock values
  const session = location.state || {
    licensePlate: '51A-12345',
    vehicleType: 'Car',
    ticketType: 'Normal',
    checkStatus: 'Existing Vehicle',
    plateSource: 'Camera Scan',
    selectedSlotId: 'B2-18',
    ticketCode: 'TCK-2026-000128',
    entryTime: '14:32:05',
    method: 'AI Recommended',
    matchScore: '92%'
  }

  // Action: Print ticket
  const handlePrintTicket = () => {
    window.alert(`Đang tiến hành in vé gửi xe mã số: ${session.ticketCode}\nBàn in nhiệt: PRINTER-01 (Hoạt động)`)
  }

  // Action: View slot map
  const handleViewSlotMap = () => {
    navigate('/vehicle-entry/manual-slot', {
      state: session
    })
  }

  // Action: New Entry check-in
  const handleNewVehicleEntry = () => {
    navigate('/vehicle-entry')
  }

  // Action: Back to dashboard
  const handleBackToDashboard = () => {
    navigate('/dashboard')
  }

  // Parse Zone and Floor
  const slotId = session.selectedSlotId || 'B2-18'
  const floorName = slotId.startsWith('B') ? '2' : slotId.startsWith('C') ? '2' : slotId.startsWith('EV') ? '2' : '1'
  const zoneName = slotId.startsWith('M') ? 'A - Motorcycle' : slotId.startsWith('C') || slotId.startsWith('B') ? 'B - Car' : 'C - EV Charging'

  return (
    <MainLayout>
      <div className="max-w-container-max mx-auto px-md md:px-lg pb-lg flex flex-col gap-6 text-slate-900">
        
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-slate-500 mb-2">
          <span className="font-body-sm text-body-sm cursor-pointer hover:text-primary transition-colors" onClick={handleBackToDashboard}>Dashboard</span>
          <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          <span className="font-body-sm text-body-sm cursor-pointer hover:text-primary transition-colors" onClick={handleNewVehicleEntry}>Vehicle Entry</span>
          <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          <span className="font-body-sm text-body-sm text-slate-900 font-medium">Check-in Success</span>
        </nav>

        {/* Page Header */}
        <div className="mb-2">
          <h2 className="font-display-lg text-display-lg text-slate-900 font-bold tracking-tight">Check-in Successful</h2>
          <p className="font-body-lg text-body-lg text-slate-500 mt-2">Ticket, parking session, and slot assignment have been created.</p>
        </div>

        {/* Top Vehicle Summary Card (Horizontal) */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex flex-wrap lg:flex-nowrap items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded bg-slate-100 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-[28px]">directions_car</span>
            </div>
            <div>
              <p className="font-label-md text-label-md text-slate-500 uppercase">License Plate</p>
              <p className="font-headline-md text-headline-md text-slate-900 font-bold tracking-wide">{session.licensePlate}</p>
            </div>
          </div>
          <div className="w-px h-10 bg-slate-200 hidden lg:block"></div>
          <div>
            <p className="font-label-md text-label-md text-slate-500 uppercase">Vehicle Type</p>
            <p className="font-body-md text-body-md text-slate-900 font-medium mt-1">{session.vehicleType}</p>
          </div>
          <div className="w-px h-10 bg-slate-200 hidden lg:block"></div>
          <div>
            <p className="font-label-md text-label-md text-slate-500 uppercase">Ticket Type</p>
            <p className="font-body-md text-body-md text-slate-900 font-medium mt-1">{session.ticketType}</p>
          </div>
          <div className="w-px h-10 bg-slate-200 hidden lg:block"></div>
          <div>
            <p className="font-label-md text-label-md text-slate-500 uppercase">Source</p>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="material-symbols-outlined text-[16px] text-primary">photo_camera</span>
              <p className="font-body-md text-body-md text-slate-900 font-medium">{session.plateSource}</p>
            </div>
          </div>
          <div className="w-px h-10 bg-slate-200 hidden lg:block"></div>
          <div>
            <p className="font-label-md text-label-md text-slate-500 uppercase mb-1">Status</p>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded bg-blue-100 text-blue-800 font-label-md text-label-md">
              {session.checkStatus}
            </span>
          </div>
        </div>

        {/* 70/30 Content Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column (70%) */}
          <div className="lg:col-span-8 flex flex-col gap-4">
            
            {/* Success Hero Card */}
            <div className="bg-white rounded-xl border border-emerald-200 shadow-sm p-5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-100 rounded-full blur-[60px] opacity-40 -mr-16 -mt-16 pointer-events-none"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 text-emerald-800">
                    <span className="material-symbols-outlined text-[20px] text-emerald-600">check_circle</span>
                    <span className="font-label-md text-label-md font-bold uppercase">Check-in Completed</span>
                  </div>
                  <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-label-md text-[11px]">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>Active Session
                  </span>
                </div>
                <div className="flex items-center gap-6">
                  <div className="bg-slate-50 px-4 py-2 rounded-lg border border-l-4 border-l-primary shadow-sm">
                    <p className="font-label-md text-[10px] text-slate-500 uppercase">Assigned Slot</p>
                    <p className="font-headline-lg text-headline-lg text-primary font-bold leading-none mt-1">{slotId}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-1 flex-1">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-slate-500 uppercase">Ticket Code</span>
                      <span className="font-mono-label text-slate-900">{session.ticketCode}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] text-slate-500 uppercase">Entry Time</span>
                      <span className="font-mono-label text-slate-900">{session.entryTime}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] text-slate-500 uppercase">Method</span>
                      <span className="font-body-sm text-primary flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">psychology</span> {session.method}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] text-slate-500 uppercase">Match Score</span>
                      <span className="font-body-sm text-emerald-700 font-bold">{session.matchScore} Optimal</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Ticket Information Card */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
              <h4 className="font-label-md text-label-md text-slate-900 mb-4 flex items-center gap-2 uppercase tracking-wider font-semibold">
                <span className="material-symbols-outlined text-slate-500 text-[18px]">confirmation_number</span>
                Ticket Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-8">
                <div className="flex justify-between border-b border-slate-100 pb-1.5">
                  <span className="text-slate-500 text-[12px]">Ticket Code</span>
                  <span className="font-mono-label text-slate-900 text-[13px]">{session.ticketCode}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-1.5">
                  <span className="text-slate-500 text-[12px]">License Plate</span>
                  <span className="font-medium text-slate-900 text-[13px]">{session.licensePlate}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-1.5">
                  <span className="text-slate-500 text-[12px]">Vehicle Type</span>
                  <span className="text-slate-900 text-[13px]">{session.vehicleType}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-1.5">
                  <span className="text-slate-500 text-[12px]">Ticket Type</span>
                  <span className="text-slate-900 text-[13px]">{session.ticketType}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-1.5">
                  <span className="text-slate-500 text-[12px]">Entry Gate</span>
                  <span className="text-slate-900 text-[13px]">Gate A</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-1.5">
                  <span className="text-slate-500 text-[12px]">Entry Time</span>
                  <span className="text-slate-900 text-[13px]">{session.entryTime}</span>
                </div>
                <div className="col-span-1 md:col-span-2 flex items-center gap-2 pt-2">
                  <span className="text-slate-500 text-[12px]">Processed by:</span>
                  <div className="flex items-center gap-1.5">
                    <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 text-[10px] font-bold">OP</div>
                    <p className="text-slate-900 text-[12px]">Staff Operator (ID: 001)</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Slot Assignment Detail Card */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
              <h4 className="font-label-md text-label-md text-slate-900 mb-4 flex items-center gap-2 uppercase tracking-wider font-semibold">
                <span className="material-symbols-outlined text-slate-500 text-[18px]">location_on</span>
                Slot Assignment Detail
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-8">
                <div className="flex justify-between border-b border-slate-100 pb-1.5">
                  <span className="text-slate-500 text-[12px]">Assigned Slot</span>
                  <span className="font-bold text-primary text-[13px]">{slotId}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-1.5">
                  <span className="text-slate-500 text-[12px]">Floor</span>
                  <span className="text-slate-900 text-[13px]">{floorName}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-1.5">
                  <span className="text-slate-500 text-[12px]">Zone</span>
                  <span className="text-slate-900 text-[13px]">{zoneName}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-1.5">
                  <span className="text-slate-500 text-[12px]">Slot Status</span>
                  <span className="text-emerald-600 font-medium text-[13px]">Occupied</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-1.5">
                  <span className="text-slate-500 text-[12px]">Assignment Method</span>
                  <span className="text-slate-900 text-[13px]">{session.method}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-1.5">
                  <span className="text-slate-500 text-[12px]">AI Match Score</span>
                  <span className="text-emerald-600 font-bold text-[13px]">{session.matchScore}</span>
                </div>
                <div className="col-span-1 md:col-span-2 flex items-center gap-2 pt-2">
                  <span className="text-slate-500 text-[12px]">AI Log Status:</span>
                  <span className="text-slate-900 text-[12px] flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px] text-emerald-600">check_circle</span> Saved
                  </span>
                </div>
              </div>
            </div>

          </div>

          {/* Right Column (30%) */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            
            {/* Action Buttons */}
            <div className="flex flex-col gap-3">
              <button 
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-primary text-white hover:bg-blue-700 rounded-lg font-label-md text-label-md transition-all duration-200 active:scale-95 shadow-sm font-semibold"
                onClick={handlePrintTicket}
              >
                <span className="material-symbols-outlined text-[18px]">print</span>
                Print Ticket
              </button>
              <button 
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-label-md text-label-md transition-all duration-200 active:scale-95 border border-slate-200 font-semibold"
                onClick={handleViewSlotMap}
              >
                <span className="material-symbols-outlined text-[18px]">map</span>
                View Slot Map
              </button>
              <button 
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-white border border-slate-300 text-slate-700 rounded-lg font-label-md text-label-md hover:bg-slate-50 transition-all duration-200 active:scale-95 font-semibold"
                onClick={handleNewVehicleEntry}
              >
                <span className="material-symbols-outlined text-[18px]">add_circle</span>
                New Vehicle Entry
              </button>
              <button 
                className="w-full mt-2 py-2 text-slate-500 hover:text-slate-900 transition-colors font-label-md text-label-md text-center font-medium"
                onClick={handleBackToDashboard}
              >
                Back to Dashboard
              </button>
            </div>

            {/* Operation Checks Panel */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
              <h5 className="font-label-md text-[11px] text-slate-900 uppercase tracking-wider mb-3 border-b border-slate-100 pb-2 font-bold">Operation Checks</h5>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-slate-700">
                  <span className="material-symbols-outlined text-emerald-600 text-[18px]">check_circle</span>
                  <span className="text-[13px]">Vehicle verified</span>
                </li>
                <li className="flex items-center gap-2 text-slate-700">
                  <span className="material-symbols-outlined text-emerald-600 text-[18px]">check_circle</span>
                  <span className="text-[13px]">AI recommendation confirmed</span>
                </li>
                <li className="flex items-center gap-2 text-slate-700">
                  <span className="material-symbols-outlined text-emerald-600 text-[18px]">check_circle</span>
                  <span className="text-[13px]">Ticket created</span>
                </li>
                <li className="flex items-center gap-2 text-slate-700">
                  <span className="material-symbols-outlined text-emerald-600 text-[18px]">check_circle</span>
                  <span className="text-[13px]">Session initiated</span>
                </li>
              </ul>
            </div>

            {/* Compact Ticket Preview */}
            <div className="bg-white rounded-xl border border-slate-300 border-dashed shadow-sm p-5 flex flex-col items-center text-center">
              <h5 className="font-label-md text-label-md text-slate-900 mb-1 font-bold">PARKING TICKET</h5>
              <p className="font-mono-label text-[11px] text-slate-400 mb-3 border-b border-slate-100 border-dashed pb-2 w-full">{session.ticketCode}</p>
              <div className="w-full space-y-2 mb-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">License Plate:</span>
                  <span className="font-bold text-slate-900">{session.licensePlate}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Slot:</span>
                  <span className="font-bold text-primary text-base">{slotId}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Entry Time:</span>
                  <span className="font-mono-label text-slate-900">{session.entryTime}</span>
                </div>
              </div>
              
              {/* Barcode image */}
              <div className="w-48 h-16 bg-slate-50 p-1 border border-slate-200 rounded flex items-center justify-center mb-2">
                <img 
                  className="w-full h-full object-contain opacity-80 mix-blend-multiply" 
                  alt="barcode"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCD9CZYdprTaXbMRpHceTvsofIvTkkJeyJkvgoB3GOfBtQ_vzy_DAi8qocBDSMdP9027SLV9eNAQ8ArnGnoH0v04zGgP4tWO2tw4VVqX6lPj1JyK0EpICaYf-thYKAZYweuPOcoYaAkK7CwehMFrzF18oV4ebE4NSDBwWvh5tk3ISFFM-RnaxvsKhyaKvDR0BCtqIMqI_O1ADp7lBFO9-eCCZpz1P7SyHAiJrZN1Nc7h16RltajCzglF9UHc6r0QFsbc61utPCVUtg"
                />
              </div>
              <p className="font-mono-label text-[9px] text-slate-400 w-full border-t border-slate-100 border-dashed pt-2">Oct 24, 2026</p>
            </div>

          </div>

        </div>

      </div>
    </MainLayout>
  )
}

export default CheckinSuccessPage
