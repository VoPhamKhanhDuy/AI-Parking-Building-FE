import { reservationActivities, reservationItems, upcomingArrivals } from '../../mock-data/reservations'

const STORAGE_KEY = 'parking-reservations'

export const getReservationData = () => {
  try {
    const savedData = localStorage.getItem(STORAGE_KEY)
    return savedData ? JSON.parse(savedData) : reservationItems.map((item) => ({ ...item }))
  } catch {
    return reservationItems.map((item) => ({ ...item }))
  }
}

export const saveReservationData = (items) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  } catch {
    // ignore storage errors
  }
}

export const getReservationActivities = () => reservationActivities

export const getUpcomingArrivals = () => upcomingArrivals

export const filterReservations = (items, { query, floor, zone, type, status }) => {
  const keyword = query.trim().toLowerCase()

  return items.filter((item) => {
    const matchesSearch = !keyword || [item.code, item.driver, item.plate, item.slot]
      .some((value) => value.toLowerCase().includes(keyword))
    const matchesFloor = floor === 'All Floors' || item.floor === floor
    const matchesZone = zone === 'All Zones' || item.zone === zone
    const matchesType = type === 'All Types' || item.type === type
    const matchesStatus = status === 'All Statuses' || item.status === status

    return matchesSearch && matchesFloor && matchesZone && matchesType && matchesStatus
  })
}

export const updateReservationStatus = (items, id, updates) => items.map((item) => (
  item.id === id ? { ...item, ...updates } : item
))

export const changeReservationSlot = (items, id, slot) => updateReservationStatus(items, id, { slot })
