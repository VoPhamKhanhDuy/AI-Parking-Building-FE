import { api } from '../../core/api/apiClient'
import logger from '../../core/utils/logger'

export async function getPricingRules(params = {}) {
  try {
    const { data } = await api.get('/pricing-rules', { params })
    return { success: true, data }
  } catch (error) {
    logger.error('Pricing', `Failed to load: ${error.message}`)
    return { success: false }
  }
}

export async function createPricingRule(rule) {
  try {
    const { data } = await api.post('/pricing-rules', rule)
    return { success: true, data }
  } catch (error) {
    logger.error('Pricing', `Failed to create: ${error.message}`)
    return { success: false, message: error.response?.data?.message || 'Failed to create rule' }
  }
}

export async function updatePricingRule(id, rule) {
  try {
    const { data } = await api.put(`/pricing-rules/${id}`, rule)
    return { success: true, data }
  } catch (error) {
    logger.error('Pricing', `Failed to update: ${error.message}`)
    return { success: false, message: error.response?.data?.message || 'Failed to update rule' }
  }
}

export async function deletePricingRule(id) {
  try {
    await api.delete(`/pricing-rules/${id}`)
    return { success: true }
  } catch (error) {
    logger.error('Pricing', `Failed to delete: ${error.message}`)
    return { success: false, message: 'Failed to delete rule' }
  }
}

// Additional functions
export async function getPricingRuleById(id) {
  try {
    const { data } = await api.get(`/pricing-rules/${id}`)
    return { success: true, data }
  } catch (error) {
    logger.error('Pricing', `Failed to get rule: ${error.message}`)
    return { success: false }
  }
}

export async function togglePricingRule(id, enabled) {
  try {
    const { data } = await api.patch(`/pricing-rules/${id}`, { isEnabled: enabled })
    return { success: true, data }
  } catch (error) {
    logger.error('Pricing', `Failed to toggle: ${error.message}`)
    return { success: false }
  }
}
