import { api } from '../../core/api/apiClient'
import logger from '../../core/utils/logger'

export async function getAIRecommendations(params = {}) {
  try {
    const { data } = await api.get('/ai-recommendations', { params })
    return { success: true, data }
  } catch (error) {
    logger.error('AIRecommendation', `Failed to load: ${error.message}`)
    return { success: false }
  }
}

export async function getSlotRecommendation(vehicleData) {
  try {
    const { data } = await api.post('/ai-recommendations/slot', vehicleData)
    return { success: true, data }
  } catch (error) {
    logger.error('AIRecommendation', `Failed to get: ${error.message}`)
    return { success: false }
  }
}

// Mock data for development
export const mockPreviewSlots = [
  { id: 'A-001', floor: 'Floor 1', type: 'Car', score: 92, reason: 'Best available' },
  { id: 'A-002', floor: 'Floor 1', type: 'Car', score: 85, reason: 'Near elevator' },
  { id: 'B-003', floor: 'Floor 2', type: 'Car', score: 78, reason: 'Wide spot' }
]

export const mockAlternatives = [
  { id: 'C-005', floor: 'Floor 2', type: 'Car', score: 72 },
  { id: 'D-008', floor: 'Floor 3', type: 'Car', score: 65 }
]

export const mockAIRecommendationDetails = {
  score: 92,
  slot: 'A-001',
  floor: 'Floor 1',
  reason: 'Optimal based on vehicle type and availability'
}

export async function getAIRecommendationDetails(recommendationId) {
  try {
    const { data } = await api.get(`/ai-recommendations/${recommendationId}`)
    return { success: true, data }
  } catch (error) {
    logger.error('AIRecommendation', `Failed to get details: ${error.message}`)
    return { success: false }
  }
}

export async function getAIRecommendationHistory(params = {}) {
  try {
    const { data } = await api.get('/ai-recommendations/history', { params })
    return { success: true, data }
  } catch (error) {
    logger.error('AIRecommendation', `Failed to get history: ${error.message}`)
    return { success: false }
  }
}
