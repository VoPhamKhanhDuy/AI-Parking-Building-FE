import axios from 'axios'
import { manualSlotLayouts } from '../../mock-data/slots'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 8000,
  headers: { 'Content-Type': 'application/json' },
})

const useMockData = import.meta.env.VITE_USE_MOCK_DATA !== 'false'
const wait = (value, delay = 250) => new Promise((resolve) => setTimeout(() => resolve(value), delay))

const normalizeFloor = (floor) => ({
  ...floor,
  slots: floor.slots.map((slot) => ({ ...slot })),
})

export async function getParkingFloors() {
  if (useMockData) return wait(manualSlotLayouts.map(normalizeFloor))
  const { data } = await api.get('/parking/floors', { params: { includeSlots: true } })
  return data.data || data
}

export async function assignParkingSlot({ slotId, licensePlate, vehicleType, ticketType }) {
  if (useMockData) {
    const slot = manualSlotLayouts.flatMap((floor) => floor.slots).find((item) => item.id === slotId)
    if (!slot || slot.status !== 'available') throw new Error('Chỗ đỗ này không còn khả dụng.')
    return wait({
      assignmentId: `ASN-${Date.now()}`,
      ticketCode: `TCK-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`,
      entryTime: new Date().toISOString(),
      slotId,
      licensePlate,
      vehicleType,
      ticketType,
    }, 400)
  }

  const { data } = await api.post('/parking/slot-assignments', {
    slotId,
    licensePlate,
    vehicleType,
    ticketType,
    assignmentMethod: 'MANUAL',
  })
  return data.data || data
}

export function getFloorStats(floor) {
  const total = floor.slots.length
  const unavailable = floor.slots.filter((slot) => slot.status !== 'available').length
  return { total, available: total - unavailable, occupancy: total ? Math.round((unavailable / total) * 100) : 0 }
}

export function isCompatible(slot, vehicleType) {
  const normalized = vehicleType?.toLowerCase() || 'car'
  if (normalized.includes('motor')) return slot.type === 'motorcycle'
  if (normalized.includes('electric') || normalized === 'ev') return slot.type === 'ev' || slot.type === 'car'
  return slot.type === 'car' || slot.type === 'ev'
}
