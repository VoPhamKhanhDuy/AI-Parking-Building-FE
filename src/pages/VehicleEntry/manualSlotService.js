/**
 * Service dealing with manual slot selection map layouts and slot properties.
 */

// Initial mock slots status database for the map
export const mockMapSlots = {
  'Floor 2': {
    motorcycle: Array.from({ length: 32 }, (_, i) => {
      const id = `M${String(i + 1).padStart(2, '0')}`
      let status = 'Available'
      if (['M03', 'M06', 'M13', 'M20'].includes(id)) status = 'Occupied'
      if (['M08', 'M17'].includes(id)) status = 'Reserved'
      return { id, type: 'Motorcycle', status }
    }),
    car: Array.from({ length: 24 }, (_, i) => {
      const id = `C${String(i + 1).padStart(2, '0')}`
      let status = 'Available'
      if (['C03', 'C04', 'C10', 'C15', 'C22'].includes(id)) status = 'Occupied'
      if (['C06', 'C19'].includes(id)) status = 'Reserved'
      if (['C09'].includes(id)) status = 'Maintenance'
      return { id, type: 'Car', status }
    }),
    ev: Array.from({ length: 6 }, (_, i) => {
      const id = `EV${String(i + 1).padStart(2, '0')}`
      let status = 'Available'
      if (['EV03'].includes(id)) status = 'Occupied'
      if (['EV04'].includes(id)) status = 'Reserved'
      return { id, type: 'EV', status }
    })
  },
  'Floor 1': {
    motorcycle: Array.from({ length: 20 }, (_, i) => ({
      id: `M1-${String(i + 1).padStart(2, '0')}`,
      type: 'Motorcycle',
      status: i % 4 === 0 ? 'Occupied' : 'Available'
    })),
    car: Array.from({ length: 20 }, (_, i) => ({
      id: `C1-${String(i + 1).padStart(2, '0')}`,
      type: 'Car',
      status: i % 3 === 0 ? 'Occupied' : i % 7 === 0 ? 'Reserved' : 'Available'
    })),
    ev: Array.from({ length: 8 }, (_, i) => ({
      id: `EV1-${String(i + 1).padStart(2, '0')}`,
      type: 'EV',
      status: i % 2 === 0 ? 'Occupied' : 'Available'
    }))
  },
  'Basement': {
    motorcycle: Array.from({ length: 40 }, (_, i) => ({
      id: `MB-${String(i + 1).padStart(2, '0')}`,
      type: 'Motorcycle',
      status: i % 5 === 0 ? 'Occupied' : 'Available'
    })),
    car: Array.from({ length: 15 }, (_, i) => ({
      id: `CB-${String(i + 1).padStart(2, '0')}`,
      type: 'Car',
      status: i % 2 === 0 ? 'Occupied' : 'Available'
    })),
    ev: []
  },
  'Floor 3': {
    motorcycle: [],
    car: Array.from({ length: 30 }, (_, i) => ({
      id: `C3-${String(i + 1).padStart(2, '0')}`,
      type: 'Car',
      status: i % 6 === 0 ? 'Occupied' : 'Available'
    })),
    ev: []
  }
}

/**
 * Get occupancy statistics for a given floor
 */
export const getFloorOccupancy = (floorName) => {
  const layout = mockMapSlots[floorName]
  if (!layout) return '0%'
  const allSlots = [...(layout.motorcycle || []), ...(layout.car || []), ...(layout.ev || [])]
  if (!allSlots.length) return '0%'
  const occupiedCount = allSlots.filter((s) => s.status === 'Occupied').length
  return `${Math.round((occupiedCount / allSlots.length) * 100)}%`
}

/**
 * Fetch detailed metrics for a given slot node
 */
export const getSlotDetails = (slotId, floorName) => {
  if (!slotId) return null
  
  // Parse zone
  let zone = 'B'
  if (slotId.startsWith('M')) zone = 'A'
  if (slotId.startsWith('EV')) zone = 'C'

  // Determine type
  let type = 'Car'
  if (slotId.startsWith('M')) type = 'Motorcycle'
  if (slotId.startsWith('EV')) type = 'EV'

  // Get status
  let status = 'Available for Allocation'
  let color = 'text-emerald-600'
  let dotColor = 'bg-emerald-500'

  // Distances mock
  const index = parseInt(slotId.replace(/[^0-9]/g, '')) || 1
  const distExit = 30 + index * 2
  const distElevator = 8 + (index % 5) * 3

  return {
    id: slotId,
    floor: floorName.replace('Floor ', ''),
    zone,
    statusText: status,
    statusColor: color,
    statusDotColor: dotColor,
    vehicleTypeRequired: type,
    slotCompatibility: type,
    reservationConflict: 'None',
    readiness: 'Ready',
    distExit: `${distExit}m`,
    distElevator: `${distElevator}m`
  }
}
