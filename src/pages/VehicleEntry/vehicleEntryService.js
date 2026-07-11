import { mockMonthlyPasses, mockReservations } from '../../mock-data/vehicleEntries'

/**
 * Clean plate number for flexible match
 */
const cleanPlate = (plate) => plate.replace(/[^a-zA-Z0-9]/g, '').toUpperCase()

/**
 * Check if the plate has an active Monthly Pass
 */
export const checkMonthlyPass = (licensePlate) => {
  if (!licensePlate) return null
  const cleanedInput = cleanPlate(licensePlate)
  return mockMonthlyPasses.find(
    (pass) => cleanPlate(pass.licensePlate) === cleanedInput && pass.status === 'Active'
  ) || null
}

/**
 * Check if there is an active reservation code
 */
export const checkReservation = (code) => {
  if (!code) return null
  const cleanedCode = code.trim().toUpperCase()
  return mockReservations.find(
    (res) => res.code.toUpperCase() === cleanedCode || res.licensePlate.replace(/[^a-zA-Z0-9]/g, '').toUpperCase() === cleanPlate(cleanedCode)
  ) || null
}

/**
 * Engine recommending the best slot based on vehicle & ticket type
 */
export const getAIRecommendation = (vehicleType, ticketType, slots = []) => {
  if (!slots.length) return null

  // 1. If it's a reservation and matches pre-assigned slot, try to assign it.
  // Otherwise, we query standard slots.
  let recommendedSlot = null
  let score = 95
  let reason = 'Optimized match for vehicle class'

  if (vehicleType === 'Motorcycle') {
    // Find Basement Motorbike slot
    recommendedSlot = slots.find(
      (s) => s.type === 'Motorbike' && s.status === 'Available' && s.floor === 'Basement'
    )
    if (!recommendedSlot) {
      recommendedSlot = slots.find((s) => s.type === 'Motorbike' && s.status === 'Available')
    }
    if (!recommendedSlot) {
      recommendedSlot = slots.find((s) => s.type === 'Standard' && s.status === 'Available' && s.floor === 'Basement')
    }
    score = 98
    reason = 'Basement Motorbike designated area'
  } else if (vehicleType === 'Electric Vehicle') {
    // Find EV charging slot
    recommendedSlot = slots.find(
      (s) => s.type === 'EV' && s.status === 'Available'
    )
    if (!recommendedSlot) {
      recommendedSlot = slots.find((s) => s.type === 'Standard' && s.status === 'Available' && s.floor === 'Floor 1')
    }
    score = 97
    reason = 'Floor 1 Charging Station'
  } else {
    // Standard Car
    if (ticketType === 'VIP') {
      recommendedSlot = slots.find(
        (s) => s.type === 'VIP' && s.status === 'Available'
      )
      score = 99
      reason = 'Premium VIP zone near elevator'
    } else {
      // Find standard slots, try Floor 2 first, then Floor 3, then Floor 1
      recommendedSlot = slots.find(
        (s) => s.type === 'Standard' && s.status === 'Available' && s.floor === 'Floor 2'
      )
      if (!recommendedSlot) {
        recommendedSlot = slots.find(
          (s) => s.type === 'Standard' && s.status === 'Available' && s.floor === 'Floor 3'
        )
      }
      if (!recommendedSlot) {
        recommendedSlot = slots.find(
          (s) => s.type === 'Standard' && s.status === 'Available' && s.floor === 'Floor 1'
        )
      }
      score = 92
      reason = 'Standard parking deck area'
    }
  }

  // Fallback to any available standard slot
  if (!recommendedSlot) {
    recommendedSlot = slots.find((s) => s.status === 'Available')
    score = 85
    reason = 'General available slot fallback'
  }

  if (!recommendedSlot) return null

  return {
    slotId: recommendedSlot.id,
    floor: recommendedSlot.floor,
    type: recommendedSlot.type,
    score,
    reason
  }
}

/**
 * Format current timestamp for display
 */
export const getFormattedCurrentTime = () => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const date = String(now.getDate()).padStart(2, '0')
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  const seconds = String(now.getSeconds()).padStart(2, '0')
  return `${year}-${month}-${date} ${hours}:${minutes}:${seconds}`
}
