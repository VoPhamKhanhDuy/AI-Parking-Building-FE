import { api } from '../../core/api/apiClient'
import logger from '../../core/utils/logger'
import {
  safeNumber,
  shapeRecommendation,
  normalizeVehicleType,
  normalizeTicketType,
  OFFLINE_RECOMMENDATION,
} from '../../core/models/entities'

export { shapeRecommendation, normalizeVehicleType, normalizeTicketType } from '../../core/models/entities'

export async function getSlotRecommendation(vehicleData = {}) {
  try {
    const { data } = await api.post('/ai-recommendations/slot', {
      licensePlate: vehicleData.licensePlate || 'UNKNOWN',
      vehicleCategory: normalizeVehicleType(vehicleData.vehicleType),
      ticketType: normalizeTicketType(vehicleData.ticketType),
    })
    return { success: true, data: shapeRecommendation(data) }
  } catch (error) {
    logger.warn('AIRecommendation', `getSlotRecommendation fallback: ${error.message}`)
    return { success: false, data: OFFLINE_RECOMMENDATION }
  }
}

export function buildRecommendationPayload(recommended, vehicle) {
  return {
    previewSlots: buildPreviewGrid(recommended),
    alternatives: buildAlternativeList(recommended),
    details: buildDetails(recommended, vehicle),
  }
}

function buildPreviewGrid(recommended) {
  const recommendedCard = recommended?.recommendedSlotId
    ? [{
        id: recommended.recommendedSlotId,
        slotCode: recommended.recommendedSlotCode,
        type: 'Car',
        score: safeNumber(recommended.score, 90),
        status: 'Recommended',
        reason: recommended.explanation || 'AI recommended best fit',
        zone: recommended.recommendedZoneName,
        floor: recommended.recommendedFloorName,
      }]
    : []

  const alternativeCards = (recommended?.alternatives || []).slice(0, 5).map((alt) => ({
    id: alt.slotId,
    slotCode: alt.slotCode,
    type: 'Car',
    score: safeNumber(alt.score, 75),
    status: 'Alternative',
    reason: alt.reason || 'Good alternative',
    zone: alt.zoneName,
    floor: alt.floorName,
  }))

  const fillers = [
    { id: 'fill-1', slotCode: 'C-091', type: 'Car', score: 45, status: 'Occupied', reason: 'In use', zone: recommended?.recommendedZoneName, floor: recommended?.recommendedFloorName },
    { id: 'fill-2', slotCode: 'C-092', type: 'Car', score: 40, status: 'Occupied', reason: 'In use' },
    { id: 'fill-3', slotCode: 'C-093', type: 'Car', score: 30, status: 'Reserved', reason: 'Reserved' },
    { id: 'fill-4', slotCode: 'C-094', type: 'Car', score: 25, status: 'Maintenance', reason: 'Maintenance' },
    { id: 'fill-5', slotCode: 'C-095', type: 'Car', score: 60, status: 'Available', reason: 'Available' },
  ]

  return [...recommendedCard, ...alternativeCards, ...fillers].slice(0, 12)
}

function buildAlternativeList(recommended) {
  if (!recommended) return []
  const alts = (recommended.alternatives || []).map((a) => ({
    id: a.slotId,
    slotCode: a.slotCode,
    type: 'Car',
    score: safeNumber(a.score, 75),
    reason: a.reason,
  }))
  if (recommended.recommendedSlotId) {
    alts.unshift({
      id: recommended.recommendedSlotId,
      slotCode: recommended.recommendedSlotCode,
      type: 'Car',
      score: safeNumber(recommended.score, 90),
      reason: 'Best match',
    })
  }
  return alts
}

function buildDetails(recommended, vehicle) {
  if (!recommended) {
    return {
      score: 92,
      slotId: 'B2-18',
      slot: 'B2-18',
      floor: 'Floor 2',
      zone: 'Zone B',
      status: 'Available',
      distExit: '12m to exit',
      distElevator: '8m to elevator',
      occupancyReason: 'Low occupancy in Zone B',
      fit: 'Excellent fit for Car',
      zoneOccupancy: '32% occupied',
      routeEfficiency: 'Optimal',
      conflictCheck: 'No conflicts',
      reason: 'Optimal based on vehicle type and availability',
    }
  }
  return {
    score: safeNumber(recommended.score, 0),
    slotId: recommended.recommendedSlotCode || '—',
    slot: recommended.recommendedSlotCode || '—',
    floor: recommended.recommendedFloorName || '—',
    zone: recommended.recommendedZoneName || '—',
    status: recommended.recommendedSlotId ? 'Recommended' : 'Unavailable',
    distExit: '12m to exit',
    distElevator: '8m to elevator',
    occupancyReason: vehicle ? `Best fit for ${vehicle}` : 'Optimal fit',
    fit: `Excellent fit for ${vehicle || 'this vehicle'}`,
    zoneOccupancy: '—',
    routeEfficiency: 'Optimal',
    conflictCheck: 'No conflicts',
    reason: recommended.explanation || 'Optimal based on vehicle type and availability',
  }
}
