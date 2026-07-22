import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import MainLayout from '../../layouts/MainLayout'
import {
  checkVehicleByPlate,
  checkMonthlyPass,
  checkReservation,
  getVehicleTypes,
  getFormattedCurrentTime
} from './vehicleEntryService'
import { assignParkingSlot } from './manualSlotService'
import { ROUTE_PATHS } from '../../routes/routePaths'
import { validateLicensePlate, normalizePlate } from '../../core/utils/vehicleValidation'
import './VehicleEntryPage.css'

// Preset scan data for dev demo
const PRESET_SCANS = [
  { plate: '51A-12345', vType: 'Car', tType: 'Hourly', label: '51A-12345 (Visitor)' },
  { plate: '29B-87654', vType: 'Car', tType: 'MonthlyPass', label: '29B-87654 (Monthly)' },
  { plate: '30A-99887', vType: 'ElectricVehicle', tType: 'Reservation', label: '30A-99887 (Reserved EV)' },
  { plate: '77C-90211', vType: 'Motorbike', tType: 'MonthlyPass', label: '77C-90211 (Monthly Motorbike)' }
]

// Ticket type options
const TICKET_TYPES = [
  { value: 'Hourly', label: 'Hourly (Visitor)' },
  { value: 'Daily', label: 'Daily' },
  { value: 'MonthlyPass', label: 'Monthly Pass' },
  { value: 'Reservation', label: 'Reservation' }
]

function VehicleEntryPage() {
  const navigate = useNavigate()
  const location = useLocation()

  // State
  const [recentEntries, setRecentEntries] = useState([])
  const [vehicleTypes, setVehicleTypes] = useState([])
  const [loading, setLoading] = useState(false)
  const [plateSource, setPlateSource] = useState('Camera Scan (Auto)')
  const [licensePlate, setLicensePlate] = useState('')
  const [vehicleType, setVehicleType] = useState('')
  const [ticketType, setTicketType] = useState('Hourly')
  const [reservationCode, setReservationCode] = useState('')
  const [entryTime, setEntryTime] = useState(getFormattedCurrentTime())
  const [checkStatus, setCheckStatus] = useState('Idle')
  const [aiRecommendation, setAiRecommendation] = useState(null)
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [notification, setNotification] = useState(null)
  const [validationError, setValidationError] = useState('')

  // Use ref to track if location state was initialized (only on mount)
  const initialized = useRef(false)

  // Load vehicle types on mount
  useEffect(() => {
    let cancelled = false
    const init = async () => {
      setLoading(true)
      try {
        const vtResult = await getVehicleTypes()
        if (!cancelled && vtResult.success && vtResult.data?.length > 0) {
          setVehicleTypes(vtResult.data)
          setVehicleType(vtResult.data[0]?.name || 'Car')
        }
      } catch {
        if (!cancelled) setVehicleType('Car')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    init()
    return () => { cancelled = true }
  }, [])

  // Handle redirect from Manual Slot Selection
  useEffect(() => {
    if (!initialized.current && location.state) {
      initialized.current = true
      const state = location.state
      queueMicrotask(() => {
        if (state.licensePlate !== undefined) setLicensePlate(state.licensePlate)
        if (state.vehicleType !== undefined) setVehicleType(state.vehicleType)
        if (state.ticketType !== undefined) setTicketType(state.ticketType)
        if (state.checkStatus !== undefined) setCheckStatus(state.checkStatus)
        if (state.plateSource !== undefined) setPlateSource(state.plateSource)
        if (state.selectedSlot !== undefined) {
          setSelectedSlot(state.selectedSlot)
          setAiRecommendation(null)
          setNotification({
            type: 'info',
            message: `Da chi dinh vi tri do thu cong: ${state.selectedSlot.slotCode}`
          })
        }
      })
    }
  }, [location.state])

  // Check Info handler
  const handleCheckInfo = useCallback(async () => {
    const plateError = validateLicensePlate(licensePlate)
    if (plateError) {
      setValidationError(plateError)
      return
    }

    const cleanPlate = normalizePlate(licensePlate)
    setLoading(true)
    setNotification(null)
    setValidationError('')

    try {
      // Check vehicle in system
      await checkVehicleByPlate(cleanPlate)

      // Check reservation
      const reservationResult = await checkReservation(cleanPlate)
      if (reservationResult.success && reservationResult.data) {
        setCheckStatus(`Confirmed Reservation: ${reservationResult.data.customerName || 'Customer'}`)
        setNotification({ type: 'success', message: 'Tim thay lich dat cho!' })
        setTicketType('Reservation')
        if (reservationResult.data.assignedSlotId) {
          setSelectedSlot({
            slotCode: reservationResult.data.assignedSlotCode,
            id: reservationResult.data.assignedSlotId
          })
        }
        return
      }

      // Check Monthly Pass
      const passResult = await checkMonthlyPass(cleanPlate)
      if (passResult.success && passResult.data) {
        setCheckStatus(`Active Monthly Pass: ${passResult.data.customerName || 'Pass Holder'}`)
        setNotification({ type: 'success', message: `Ve thang cua: ${passResult.data.customerName || 'Pass Holder'}!` })
        setTicketType('MonthlyPass')
        return
      }

      // New visitor
      setCheckStatus('New Visitor')
      setNotification({ type: 'info', message: 'Bien so moi (Ve vai lai).' })
    } catch {
      setNotification({ type: 'error', message: 'Loi khi kiem tra thong tin. Vui long thu lai.' })
    } finally {
      setLoading(false)
    }
  }, [licensePlate])

  // Navigate to AI Recommendation
  const handleRequestAIRecommendation = useCallback(() => {
    const plateError = validateLicensePlate(licensePlate)
    if (plateError) {
      setValidationError(plateError)
      return
    }
    navigate(ROUTE_PATHS.aiRecommendation, {
      state: { licensePlate: normalizePlate(licensePlate), vehicleType, ticketType, checkStatus, plateSource }
    })
  }, [licensePlate, vehicleType, ticketType, checkStatus, plateSource, navigate])

  // Navigate to Manual Slot
  const handleManualSlotClick = useCallback(() => {
    const plateError = validateLicensePlate(licensePlate)
    if (plateError) {
      setValidationError(plateError)
      return
    }
    navigate(ROUTE_PATHS.manualSlot, {
      state: { licensePlate: normalizePlate(licensePlate), vehicleType, ticketType, checkStatus, plateSource }
    })
  }, [licensePlate, vehicleType, ticketType, checkStatus, plateSource, navigate])

  // Confirm Entry
  const handleConfirmEntry = useCallback(async () => {
    const plateError = validateLicensePlate(licensePlate)
    if (plateError) {
      setValidationError(plateError)
      return
    }
    if (!selectedSlot) {
      setNotification({ type: 'warning', message: 'Vui lòng chọn vị trí đỗ xe!' })
      return
    }

    setLoading(true)
    setNotification(null)
    const cleanPlate = normalizePlate(licensePlate)

    try {
      const result = await assignParkingSlot({
        slotId: selectedSlot.id,
        licensePlate: cleanPlate,
        vehicleType,
        ticketType,
      })

      if (result.success && result.data) {
        const newEntry = {
          id: result.data.sessionId,
          time: getFormattedCurrentTime(),
          licensePlate: cleanPlate,
          vehicleType,
          ticketType,
          assignedSlot: selectedSlot.slotCode,
          status: 'Completed',
          isAiAssigned: !!aiRecommendation,
          highlight: true
        }
        setRecentEntries((prev) => [newEntry, ...prev.slice(0, 9)])

        navigate(ROUTE_PATHS.checkinSuccess, {
          state: {
            licensePlate: cleanPlate,
            vehicleType,
            ticketType: ticketType.split(' ')[0],
            checkStatus,
            plateSource,
            selectedSlotId: selectedSlot.slotCode,
            ticketCode: result.data.ticketCode,
            entryTime: result.data.entryTime || new Date().toISOString(),
            method: aiRecommendation ? 'AI Recommended' : 'Manual Selection',
            matchScore: aiRecommendation ? `${aiRecommendation.score}%` : '90%',
            sessionId: result.data.sessionId
          }
        })
      } else {
        setNotification({ type: 'error', message: result.message || 'Check-in thất bại. Vui lòng thử lại.' })
      }
    } catch {
      setNotification({ type: 'error', message: 'Lỗi khi check-in. Vui lòng thử lại.' })
    } finally {
      setLoading(false)
    }
  }, [licensePlate, vehicleType, ticketType, selectedSlot, aiRecommendation, checkStatus, plateSource, navigate])

  // Clear Form
  const handleClearForm = useCallback(() => {
    setLicensePlate('')
    setReservationCode('')
    setCheckStatus('Idle')
    setSelectedSlot(null)
    setAiRecommendation(null)
    setValidationError('')
    setNotification({ type: 'info', message: 'Đã xóa trắng form.' })
  }, [])

  // Preset Scan
  const handlePresetScan = useCallback((plate, vType, tType) => {
    setLicensePlate(plate)
    setVehicleType(vType)
    setTicketType(tType)
    setAiRecommendation(null)
    setSelectedSlot(null)
    setEntryTime(getFormattedCurrentTime())
    setCheckStatus('Ready to check')
    setNotification({ type: 'info', message: `Da chon preset: ${plate}` })
  }, [])

  // Get status color
  const getStatusColor = useCallback(() => {
    if (checkStatus.includes('Reservation')) return 'green'
    if (checkStatus.includes('Monthly Pass')) return 'purple'
    if (checkStatus.includes('New Visitor') || checkStatus === 'Ready to check') return 'blue'
    return 'gray'
  }, [checkStatus])

  return (
    <MainLayout>
      <div className="vehicle-entry-page max-w-container-max mx-auto px-md md:px-lg pb-lg">
        <ToastNotification notification={notification} onDismiss={() => setNotification(null)} />

        <PageHeader />

        <PresetScanner presets={PRESET_SCANS} onPresetScan={handlePresetScan} />

        <div className="entry-main-grid grid grid-cols-1 xl:grid-cols-12 gap-lg mb-lg">
          <div className="xl:col-span-8">
            <EntryForm
              plateSource={plateSource}
              setPlateSource={setPlateSource}
              licensePlate={licensePlate}
              setLicensePlate={setLicensePlate}
              vehicleTypes={vehicleTypes}
              vehicleType={vehicleType}
              setVehicleType={setVehicleType}
              ticketType={ticketType}
              setTicketType={setTicketType}
              reservationCode={reservationCode}
              setReservationCode={setReservationCode}
              entryTime={entryTime}
              checkStatus={checkStatus}
              getStatusColor={getStatusColor}
              selectedSlot={selectedSlot}
              onClearSlot={() => setSelectedSlot(null)}
              loading={loading}
              onCheckInfo={handleCheckInfo}
              onClearForm={handleClearForm}
              onManualSlot={handleManualSlotClick}
              onRequestAI={handleRequestAIRecommendation}
              onConfirmEntry={handleConfirmEntry}
              validationError={validationError}
              setValidationError={setValidationError}
            />
          </div>

          <div className="xl:col-span-4">
            <SidePanel
              aiRecommendation={aiRecommendation}
              entryTime={entryTime}
              recentEntries={recentEntries}
            />
          </div>
        </div>

        <RecentEntriesTable entries={recentEntries} />
      </div>
    </MainLayout>
  )
}

// Sub-components
function ToastNotification({ notification, onDismiss }) {
  if (!notification) return null

  const bgClass = {
    success: 'bg-green-50 border-green-200 text-green-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    info: 'bg-surface-container-high border-outline-variant text-on-surface'
  }[notification.type] || bgClass.info

  return (
    <div className={`flex items-center justify-between p-3 rounded-lg border mb-4 ${bgClass}`}>
      <span>{notification.message}</span>
      <button onClick={onDismiss}>X</button>
    </div>
  )
}

function PageHeader() {
  return (
    <div className="mb-lg">
      <nav className="flex text-on-surface-variant font-label-md text-label-md mb-2" aria-label="Breadcrumb">
        <ol className="inline-flex items-center space-x-1 md:space-x-2">
          <li className="inline-flex items-center">
            <a href={ROUTE_PATHS.dashboard} className="hover:text-primary transition-colors">
              Dashboard
            </a>
          </li>
          <li>
            <div className="flex items-center">
              <span className="material-symbols-outlined text-[16px] mx-1">chevron_right</span>
              <span className="text-on-surface">Vehicle Entry</span>
            </div>
          </li>
        </ol>
      </nav>
      <h2 className="font-headline-lg text-headline-lg font-bold text-on-surface">
        Vehicle Entry
      </h2>
    </div>
  )
}

function PresetScanner({ presets, onPresetScan }) {
  return (
    <div className="entry-preset-scanner bg-surface-container-low border border-outline-variant/30 rounded-xl p-4 mb-6">
      <span className="text-xs font-semibold text-outline uppercase tracking-wider block mb-2">
        Simulate License Plate Scanner (Presets)
      </span>
      <div className="flex flex-wrap gap-2">
        {presets.map((preset) => (
          <button
            key={preset.plate}
            className="px-3 py-1.5 bg-white border border-outline-variant rounded-lg text-xs font-medium hover:bg-surface-container-high transition-colors"
            onClick={() => onPresetScan(preset.plate, preset.vType, preset.tType)}
          >
            {preset.label}
          </button>
        ))}
      </div>
    </div>
  )
}

function EntryForm({
  plateSource, setPlateSource,
  licensePlate, setLicensePlate,
  vehicleTypes, vehicleType, setVehicleType,
  ticketType, setTicketType,
  reservationCode, setReservationCode,
  entryTime,
  checkStatus, getStatusColor,
  selectedSlot, onClearSlot,
  loading,
  onCheckInfo, onClearForm,
  onManualSlot, onRequestAI, onConfirmEntry,
  validationError, setValidationError
}) {
  return (
    <div className="entry-form-ui bg-surface-container-lowest rounded-xl shadow-[0_4px_12px_rgba(15,23,42,0.05)] border border-outline-variant/30 p-6 relative overflow-hidden h-full">
      <h3 className="font-headline-md text-[20px] font-semibold text-on-surface mb-6 flex items-center gap-2">
        <span className="material-symbols-outlined text-primary">directions_car</span>
        Vehicle Entry Form
      </h3>

      <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormSelect
            label="Plate Source"
            value={plateSource}
            onChange={setPlateSource}
            options={['Camera Scan (Auto)', 'Manual Input']}
            disabled={loading}
          />
          <div>
            <label className="block font-label-md text-label-md text-on-surface-variant mb-1">
              Vehicle Check Status
            </label>
            <div className="flex items-center h-[42px] px-3 bg-surface border border-outline-variant rounded-lg gap-2">
              <span className={`w-2 h-2 rounded-full bg-${getStatusColor()}-500`} />
              <span className="text-on-surface">{checkStatus}</span>
            </div>
          </div>

          <div>
            <label htmlFor="license-plate" className="block font-label-md text-label-md text-on-surface-variant mb-1">
              License Plate *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <span className="material-symbols-outlined text-outline">credit_card</span>
              </div>
              <input
                type="text"
                id="license-plate"
                className={`bg-surface border text-on-surface text-body-md rounded-lg focus:ring-primary focus:border-primary block w-full pl-10 p-2.5 uppercase font-mono-label font-bold tracking-wider ${validationError ? 'border-red-500 border-2' : 'border-outline-variant'}`}
                placeholder="51A-12345"
                value={licensePlate}
                onChange={(e) => { setLicensePlate(e.target.value); setValidationError('') }}
                disabled={loading}
              />
            </div>
            {validationError && <p className="mt-1 text-xs text-red-600 font-medium">{validationError}</p>}
          </div>

          <FormSelect
            label="Vehicle Type *"
            id="vehicle-type"
            value={vehicleType}
            onChange={setVehicleType}
            options={vehicleTypes.length > 0 ? vehicleTypes.map(vt => ({ value: vt.name || vt.category, label: vt.name || vt.category })) : [
              { value: 'Car', label: 'Car' },
              { value: 'Motorbike', label: 'Motorbike' },
              { value: 'ElectricVehicle', label: 'Electric Vehicle' }
            ]}
            disabled={loading}
          />

          <div className="md:col-span-2">
            <label htmlFor="res-code" className="block font-label-md text-label-md text-on-surface-variant mb-1">
              Reservation Code (Optional)
            </label>
            <input
              id="res-code"
              className="bg-surface border border-outline-variant text-on-surface text-body-md rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5"
              placeholder="Enter code for reserved slots"
              type="text"
              value={reservationCode}
              onChange={(e) => setReservationCode(e.target.value)}
              disabled={loading}
            />
          </div>

          <FormSelect
            label="Ticket Type *"
            id="ticket-type"
            value={ticketType}
            onChange={setTicketType}
            options={TICKET_TYPES}
            disabled={loading}
          />

          <div>
            <label htmlFor="entry-time" className="block font-label-md text-label-md text-on-surface-variant mb-1">
              Entry Time
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <span className="material-symbols-outlined text-outline">schedule</span>
              </div>
              <input
                type="text"
                id="entry-time"
                className="bg-surface-container-low border border-outline-variant/50 text-on-surface-variant text-body-md rounded-lg block w-full pl-10 p-2.5 cursor-not-allowed"
                value={entryTime}
                readOnly
              />
            </div>
          </div>
        </div>

        {selectedSlot && (
          <div className="mt-4 p-4 bg-primary/5 border border-primary/20 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-primary uppercase">Selected Slot</span>
                <div className="text-2xl font-bold text-primary font-mono">{selectedSlot.slotCode}</div>
              </div>
              <button type="button" className="text-sm text-error hover:underline" onClick={onClearSlot}>
                Clear Selection
              </button>
            </div>
          </div>
        )}

        <SlotOptions />

        <ActionButtons
          loading={loading}
          onClear={onClearForm}
          onCheck={onCheckInfo}
          onManual={onManualSlot}
          onAI={onRequestAI}
          selectedSlot={selectedSlot}
          onConfirm={onConfirmEntry}
          hasCheckedInfo={checkStatus !== 'Idle'}
          licensePlate={licensePlate}
        />

        {selectedSlot && (
          <ConfirmButton loading={loading} slotCode={selectedSlot.slotCode} onConfirm={onConfirmEntry} />
        )}
      </form>
    </div>
  )
}

function FormSelect({ label, id, value, onChange, options, disabled }) {
  const isOptionsArrayOfStrings = typeof options[0] === 'string'
  return (
    <div>
      <label htmlFor={id} className="block font-label-md text-label-md text-on-surface-variant mb-1">
        {label}
      </label>
      <select
        id={id}
        className="bg-surface border border-outline-variant text-on-surface text-body-md rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
      >
        {isOptionsArrayOfStrings
          ? options.map((opt) => <option key={opt} value={opt}>{opt}</option>)
          : options.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)
        }
      </select>
    </div>
  )
}

function SlotOptions() {
  return (
    <div className="mt-6 p-4 bg-surface-container-low rounded-lg border border-outline-variant/20">
      <h4 className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider mb-3">
        Available Slot Options
      </h4>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SlotOption icon="psychology" title="AI Recommendation" desc="Best optimized slot" color="primary" />
        <SlotOption icon="ads_click" title="Manual Selection" desc="Staff selects slot from map" color="secondary" />
        <SlotOption icon="layers" title="Alternative Slots" desc="Available backup slots" color="outline" />
      </div>
    </div>
  )
}

function SlotOption({ icon, title, desc, color }) {
  const colorClass = {
    primary: 'text-primary',
    secondary: 'text-secondary',
    outline: 'text-outline'
  }[color] || 'text-outline'
  return (
    <div className="flex items-start gap-3">
      <span className={`material-symbols-outlined ${colorClass} text-[20px]`}>{icon}</span>
      <div>
        <div className="font-medium text-on-surface">{title}</div>
        <div className="text-[11px] text-outline">{desc}</div>
      </div>
    </div>
  )
}

function ActionButtons({ loading, onClear, onCheck, onManual, onAI, hasCheckedInfo, licensePlate }) {
  const plateReady = !!(licensePlate && String(licensePlate).trim())
  const slotActionsDisabled = loading || !hasCheckedInfo
  return (
    <div className="entry-action-bar flex flex-col sm:flex-row items-center justify-end gap-4 mt-8 pt-6 border-t border-outline-variant/30">
      <button
        type="button"
        className="entry-action-clear w-full sm:w-auto px-6 py-2.5 border border-outline-variant text-on-surface font-label-md text-label-md rounded-lg hover:bg-surface-container-low transition-colors duration-200 active:scale-[0.98]"
        onClick={onClear}
        disabled={loading}
      >
        Clear Form
      </button>
      <button
        type="button"
        className="entry-action-check w-full sm:w-auto px-6 py-2.5 border border-primary text-primary font-label-md text-label-md rounded-lg hover:bg-primary-fixed transition-colors duration-200 active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={onCheck}
        disabled={loading || !plateReady}
        title={!plateReady ? 'Nhập biển số trước khi kiểm tra' : 'Kiểm tra thông tin xe'}
      >
        <span className="material-symbols-outlined text-[18px]">search</span>
        {loading ? 'Checking...' : 'Check Info'}
      </button>
      <div className="entry-action-main flex flex-col items-end gap-2 w-full sm:w-auto">
        <div className="entry-action-main-buttons flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <button
            type="button"
            className="w-full sm:w-auto px-6 py-2.5 border border-outline-variant text-on-surface font-label-md text-label-md rounded-lg hover:bg-surface-container-low transition-colors duration-200 active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
            onClick={onManual}
            disabled={slotActionsDisabled}
            title={!hasCheckedInfo ? 'Bấm "Check Info" trước để xác nhận thông tin xe' : 'Chọn vị trí thủ công'}
          >
            <span className="material-symbols-outlined text-[18px]">map</span>
            Manual Slot Selection
          </button>
          <button
            type="button"
            className="w-full sm:w-auto px-6 py-2.5 bg-primary text-white font-label-md text-label-md rounded-lg hover:opacity-90 transition-opacity duration-200 active:scale-[0.98] flex items-center justify-center gap-2 shadow-md disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
            onClick={onAI}
            disabled={slotActionsDisabled}
            title={!hasCheckedInfo ? 'Bấm "Check Info" trước để AI gợi ý vị trí phù hợp' : 'Yêu cầu AI gợi ý vị trí'}
          >
            <span className="material-symbols-outlined text-[18px]">psychology</span>
            Request AI Slot Recommendation
          </button>
        </div>
        <p className="entry-action-hint text-[11px] text-outline text-right max-w-[400px]">
          {hasCheckedInfo
            ? 'Chọn AI để được gợi ý vị trí phù hợp, hoặc chọn thủ công từ bản đồ.'
            : '⚠️ Bấm "Check Info" trước để xác nhận biển số, vé tháng hoặc đặt chỗ.'}
        </p>
      </div>
    </div>
  )
}

function ConfirmButton({ loading, slotCode, onConfirm }) {
  return (
    <div className="mt-4 pt-4 border-t border-dashed border-outline-variant/40">
      <button
        type="button"
        className="w-full py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors duration-200 shadow-md flex items-center justify-center gap-2 uppercase tracking-wide"
        onClick={onConfirm}
        disabled={loading}
      >
        {loading ? (
          <>Đang xử lý...</>
        ) : (
          <>
            <span className="material-symbols-outlined">check_circle</span>
            Xác nhận cho xe vào &amp; in vé — Vị trí: {slotCode}
          </>
        )}
      </button>
    </div>
  )
}

function SidePanel({ aiRecommendation, entryTime, recentEntries }) {
  return (
    <div className="entry-side-ui xl:col-span-4 flex flex-col gap-6">
      <AIStatusPanel aiRecommendation={aiRecommendation} entryTime={entryTime} />
      <FacilityStatusPanel recentEntries={recentEntries} />
    </div>
  )
}

function AIStatusPanel({ aiRecommendation, entryTime }) {
  return (
    <div className="entry-engine-ui bg-surface-container-lowest rounded-xl shadow-[0_4px_12px_rgba(15,23,42,0.05)] border border-outline-variant/30 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-headline-md text-[18px] font-semibold text-on-surface flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">memory</span>
          AI Slot Engine
        </h3>
        <span className="px-2.5 py-1 bg-green-100 text-green-800 rounded-full font-label-md text-[10px] uppercase tracking-wider flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-green-600 animate-pulse" />
          Ready
        </span>
      </div>
      <div className="space-y-2 text-body-sm text-on-surface-variant">
        <div className="flex justify-between">
          <span>Slot data synced</span>
          <span className="material-symbols-outlined text-green-600 text-[16px]">check_circle</span>
        </div>
        <div className="flex justify-between">
          <span>Pricing rules loaded</span>
          <span className="material-symbols-outlined text-green-600 text-[16px]">check_circle</span>
        </div>
        <div className="flex justify-between text-[11px] text-outline mt-2">
          <span>Last update</span>
          <span>{entryTime.split(' ')[1] || 'Just now'}</span>
        </div>
      </div>

      {aiRecommendation && (
        <div className="mt-4 p-4 bg-primary/5 border border-primary/20 rounded-lg">
          <div className="flex justify-between text-[11px] font-bold text-primary mb-2">
            <span>AI RECOMMENDED SLOT</span>
            <span>{aiRecommendation.score}% Match</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded bg-primary text-white flex items-center justify-center font-bold font-mono">P</div>
            <div>
              <div className="font-bold text-primary font-mono text-lg">{aiRecommendation.slotCode}</div>
              <div className="text-xs text-on-surface-variant">{aiRecommendation.floor} - {aiRecommendation.type}</div>
            </div>
          </div>
          <p className="text-[11px] text-outline mt-2 italic">Reason: {aiRecommendation.reason}</p>
        </div>
      )}
    </div>
  )
}

function FacilityStatusPanel({ recentEntries }) {
  return (
    <div className="entry-facility-ui bg-surface-container-lowest rounded-xl shadow-[0_4px_12px_rgba(15,23,42,0.05)] border border-outline-variant/30 p-5 flex-grow">
      <h3 className="font-headline-md text-[18px] font-semibold text-on-surface mb-5">Facility Status</h3>

      <div className="mb-4 flex items-center justify-between bg-primary/5 p-3 rounded-lg border border-primary/10">
        <span className="text-body-sm font-medium text-primary">Occupancy Rate</span>
        <span className="text-headline-md font-bold text-primary">--</span>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <MetricBox value="--" label="Available" color="green" />
        <MetricBox value="--" label="Occupied" color="error" />
      </div>

      <div className="mt-6 pt-5 border-t border-outline-variant/30 grid grid-cols-2 gap-4">
        <div>
          <div className="text-label-md text-on-surface-variant uppercase tracking-wider mb-1 text-[10px]">Today Entries</div>
          <div className="font-headline-md font-semibold text-on-surface">{recentEntries.length}</div>
        </div>
        <div>
          <div className="text-label-md text-on-surface-variant uppercase tracking-wider mb-1 text-[10px]">Gate Queue</div>
          <div className="font-headline-md font-semibold text-on-surface">0</div>
        </div>
      </div>
    </div>
  )
}

function MetricBox({ value, label, color }) {
  const colorClass = color === 'green' ? 'text-green-600' : 'text-error'
  return (
    <div className="bg-surface rounded-lg p-3 border border-outline-variant/20 flex flex-col items-center justify-center text-center">
      <span className={`font-headline-lg font-bold ${colorClass}`}>{value}</span>
      <span className="text-[11px] font-label-md text-on-surface-variant uppercase tracking-wider mt-1">{label}</span>
    </div>
  )
}

function RecentEntriesTable({ entries }) {
  return (
    <div className="entry-recent-ui bg-surface-container-lowest rounded-xl shadow-[0_4px_12px_rgba(15,23,42,0.05)] border border-outline-variant/30 overflow-hidden">
      <div className="px-6 py-5 border-b border-outline-variant/30 flex items-center justify-between">
        <h3 className="font-headline-md text-[18px] font-semibold text-on-surface">Recent Vehicle Entries</h3>
        <a href={ROUTE_PATHS.reports} className="text-primary hover:text-primary-container transition-colors text-body-sm font-medium flex items-center gap-1">
          View Full Log <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
        </a>
      </div>
      <div className="overflow-x-auto">
        {entries.length > 0 ? (
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
              {entries.map((entry, index) => (
                <tr
                  key={entry.id ?? `${entry.licensePlate}-${entry.time}-${entry.assignedSlot}-${index}`}
                  className={`hover:bg-surface-container/30 transition-colors ${entry.highlight ? 'bg-primary-fixed/20 border-l-2 border-primary' : ''}`}
                >
                  <td className="px-6 py-4 text-on-surface-variant whitespace-nowrap">{entry.time}</td>
                  <td className={`px-6 py-4 font-mono-label font-bold whitespace-nowrap ${entry.highlight ? 'text-primary' : 'text-on-surface'}`}>
                    {entry.licensePlate}
                  </td>
                  <td className="px-6 py-4">{entry.vehicleType}</td>
                  <td className="px-6 py-4">{entry.ticketType}</td>
                  <td className="px-6 py-4 font-mono-label">
                    <div className="flex items-center gap-1">
                      {entry.isAiAssigned && (
                        <span className="material-symbols-outlined text-[16px] text-tertiary">psychology</span>
                      )}
                      {entry.assignedSlot}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-label-md bg-green-100 text-green-800">
                      {entry.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-8 text-center text-on-surface-variant">
            <span className="material-symbols-outlined text-4xl text-outline mb-2">directions_car</span>
            <p>No recent entries. Use the form to check in vehicles.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default VehicleEntryPage
