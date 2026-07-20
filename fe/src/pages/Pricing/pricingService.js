import { api } from '../../core/api/apiClient'
import logger from '../../core/utils/logger'
import {
  sanitizeParams,
  stripUnsupportedParams,
  unwrapList,
  shapeRule,
  MOCK_PRICING_RULES,
} from '../../core/models/entities'

export { shapeRule } from '../../core/models/entities'

export async function getPricingRules(params = {}) {
  try {
    const safeParams = sanitizeParams(stripUnsupportedParams(params, null, ['category', 'vehicleType']))
    const { data } = await api.get('/pricing-rules', { params: safeParams })
    const rules = unwrapList(data).map((r, i) => shapeRule(r, i))
    return {
      success: true,
      rules,
      categories: Array.isArray(data?.categories) ? data.categories : MOCK_PRICING_RULES.categories,
      summaries: Array.isArray(data?.summaries) ? data.summaries : [
        { label: 'Active Rules', value: String(rules.filter((r) => r.status === 'Active').length), note: 'Currently applied', tone: 'success' },
        { label: 'Inactive Rules', value: String(rules.filter((r) => r.status !== 'Active').length), note: 'Disabled', tone: 'warning' },
      ],
      monthlyPasses: Array.isArray(data?.monthlyPasses) ? data.monthlyPasses : MOCK_PRICING_RULES.monthlyPasses,
      recentUpdates: Array.isArray(data?.recentUpdates) ? data.recentUpdates : MOCK_PRICING_RULES.recentUpdates,
    }
  } catch (error) {
    logger.warn('Pricing', `getPricingRules fallback: ${error.message}`)
    return { success: false, ...MOCK_PRICING_RULES }
  }
}

export async function createPricingRule(rule) {
  try {
    const { data } = await api.post('/pricing-rules', rule)
    return { success: true, data: shapeRule(data) }
  } catch (error) {
    logger.error('Pricing', `Failed to create: ${error.message}`)
    return { success: false, message: error.response?.data?.message || 'Failed to create' }
  }
}

export async function updatePricingRule(id, rule) {
  try {
    const { data } = await api.patch(`/pricing-rules/${id}`, rule)
    return { success: true, data: shapeRule(data) }
  } catch (error) {
    logger.error('Pricing', `Failed to update: ${error.message}`)
    return { success: false, message: error.response?.data?.message || 'Failed to update' }
  }
}

export async function deletePricingRule(id) {
  try {
    await api.delete(`/pricing-rules/${id}`)
    return { success: true }
  } catch (error) {
    logger.error('Pricing', `Failed to delete: ${error.message}`)
    return { success: false }
  }
}

export async function getPricingRuleById(id) {
  try {
    const { data } = await api.get(`/pricing-rules/${id}`)
    return { success: true, data: shapeRule(data) }
  } catch (error) {
    logger.error('Pricing', `Failed to get rule: ${error.message}`)
    return { success: false }
  }
}

export async function togglePricingRule(id, enabled) {
  try {
    const { data } = await api.post(`/pricing-rules/${id}/set-active`, { isActive: !!enabled })
    return { success: true, data: shapeRule(data) }
  } catch (error) {
    logger.error('Pricing', `Failed to toggle: ${error.message}`)
    return { success: false }
  }
}
