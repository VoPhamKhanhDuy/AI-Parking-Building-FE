/**
 * Service dealing with AI recommendations, matching scores, and slot previews
 */

export const mockPreviewSlots = [
  { id: 'B2-01', status: 'Maintenance' },
  { id: 'B2-02', status: 'Maintenance' },
  { id: 'B2-03', status: 'Available' },
  { id: 'B2-04', status: 'Available' },
  { id: 'B2-07', status: 'Alternative', score: 80 },
  { id: 'B2-08', status: 'Maintenance' },
  { id: 'B2-15', status: 'Available' },
  { id: 'B2-16', status: 'Maintenance' },
  { id: 'B2-17', status: 'Occupied' },
  { id: 'B2-18', status: 'Recommended', score: 92 },
  { id: 'B2-19', status: 'Alternative', score: 87 },
  { id: 'B2-20', status: 'Maintenance' },
  { id: 'B2-21', status: 'Alternative', score: 84 },
  { id: 'B2-22', status: 'Maintenance' },
  { id: 'B2-23', status: 'Occupied' },
  { id: 'B2-24', status: 'Available' },
  { id: 'B2-25', status: 'Maintenance' },
  { id: 'B2-26', status: 'Maintenance' },
]

export const mockAlternatives = [
  { id: 'B2-19', score: 87, reason: 'Adjacent charging bay' },
  { id: 'B2-21', score: 84, reason: 'Close to entry ramp' },
  { id: 'B2-07', score: 80, reason: 'Near elevator lobby' },
]

export const mockAIRecommendationDetails = {
  'B2-18': {
    slotId: 'B2-18',
    score: 92,
    floor: 'Floor 2',
    zone: 'Zone B - Car',
    status: 'Available',
    distExit: '45m to Exit',
    distElevator: '12m to Lift',
    occupancyReason: 'Balanced Occupancy',
    fit: '100%',
    zoneOccupancy: '88%',
    routeEfficiency: '91%',
    conflictCheck: 'Clear'
  },
  'B2-19': {
    slotId: 'B2-19',
    score: 87,
    floor: 'Floor 2',
    zone: 'Zone B - Car',
    status: 'Available',
    distExit: '48m to Exit',
    distElevator: '15m to Lift',
    occupancyReason: 'Alternative Charging Zone',
    fit: '100%',
    zoneOccupancy: '85%',
    routeEfficiency: '89%',
    conflictCheck: 'Clear'
  },
  'B2-21': {
    slotId: 'B2-21',
    score: 84,
    floor: 'Floor 2',
    zone: 'Zone B - Car',
    status: 'Available',
    distExit: '52m to Exit',
    distElevator: '18m to Lift',
    occupancyReason: 'Close to Elevator Lift',
    fit: '100%',
    zoneOccupancy: '80%',
    routeEfficiency: '84%',
    conflictCheck: 'Clear'
  },
  'B2-07': {
    slotId: 'B2-07',
    score: 80,
    floor: 'Floor 2',
    zone: 'Zone B - Car',
    status: 'Available',
    distExit: '60m to Exit',
    distElevator: '6m to Lift',
    occupancyReason: 'General Parking Deck A',
    fit: '100%',
    zoneOccupancy: '75%',
    routeEfficiency: '80%',
    conflictCheck: 'Clear'
  }
}
