import axios from 'axios'
import { parkingMapSlots, parkingMapSummary, parkingMapUpdates } from '../../mock-data/parkingMapData'

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api', timeout: 8000 })
const useMockData = import.meta.env.VITE_USE_MOCK_DATA !== 'false'
const wait = (value, delay = 280) => new Promise((resolve) => setTimeout(() => resolve(value), delay))
let mockSlots = parkingMapSlots.map((slot) => ({ ...slot }))
let mockUpdates = parkingMapUpdates.map((item) => ({ ...item }))

const calculateSummary = () => {
  const local = mockSlots.reduce((counts, slot) => ({ ...counts, [slot.status.toLowerCase()]: (counts[slot.status.toLowerCase()] || 0) + 1 }), {})
  return { ...parkingMapSummary, visibleAvailable: local.available || 0, visibleOccupied: local.occupied || 0 }
}

export async function getParkingMap(params = {}) {
  if (!useMockData) { const { data } = await api.get('/parking/map', { params }); return data.data || data }
  const query = params.search?.trim().toUpperCase()
  const slots = mockSlots.filter((slot) =>
    (!query || slot.id.includes(query) || slot.vehicle.includes(query)) &&
    (!params.status || params.status === 'All Statuses' || slot.status === params.status) &&
    (!params.building || params.building === 'All Buildings' || slot.building === params.building) &&
    (!params.floor || params.floor === 'All Floors' || slot.floor === params.floor) &&
    (!params.zone || params.zone === 'All Zones' || slot.zone === params.zone) &&
    (!params.vehicleType || params.vehicleType === 'All Vehicles' || slot.type === params.vehicleType)
  )
  return wait({ summary: calculateSummary(), slots, updates: mockUpdates })
}

export async function updateParkingSlot(slotId, status) {
  if (!useMockData) { const { data } = await api.patch(`/parking/slots/${slotId}`, { status }); return data.data || data }
  const slot = mockSlots.find((item) => item.id === slotId)
  if (!slot) throw new Error('Parking slot not found.')
  slot.status = status; slot.vehicle = ''; slot.ticketId = ''; slot.entryTime = ''; slot.method = ''; slot.processedBy = ''
  const update = { id: Date.now(), time: new Date().toLocaleTimeString('en-GB'), slot: slotId, vehicle: '—', action: status === 'Available' ? 'Released slot' : 'Marked maintenance', staff: 'Parking Staff', status }
  mockUpdates = [update, ...mockUpdates]
  return wait({ slot: { ...slot }, summary: calculateSummary(), update })
}
