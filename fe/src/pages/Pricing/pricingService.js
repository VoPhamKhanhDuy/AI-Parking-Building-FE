import { api } from '../../core/api/apiClient'
import logger from '../../core/utils/logger'

export async function getPricingRules(params = {}) {
  try {
    const { data } = await api.get('/pricing-rules', { params })
    // Handle array response or object with rules property
    const rulesList = Array.isArray(data) ? data : (data?.rules || [])
    const rules = rulesList.map((r, i) => ({
      code: r.code || r.id || `PRC-${String(i + 1).padStart(3, '0')}`,
      name: r.name || r.pricingRuleName || `Rule ${i + 1}`,
      type: r.type || 'Standard',
      rate: r.rate || r.price || 0,
      duration: r.duration || '1 hour',
      category: r.category || r.type || 'Car Parking',
      vehicleType: r.vehicleType || 'Car',
      baseFee: r.baseFee || `$${r.rate || 5}.00`,
      additionalFee: r.additionalFee || '$2.00/hour',
      gracePeriod: r.gracePeriod || '15 mins',
      appliedTo: r.appliedTo || 'All vehicles',
      status: r.status || 'Active',
      effectiveDate: r.effectiveDate || new Date().toISOString()
    }))
    return {
      rules,
      categories: data?.categories || ['Car Parking', 'Motorcycle Parking', 'EV Charging', 'Monthly Pass'],
      summaries: data?.summaries || [{ label: 'Active Rules', value: String(rules.length), note: 'Currently applied', tone: 'success' }],
      monthlyPasses: data?.monthlyPasses || [
        { name: 'Basic Monthly', vehicleType: 'Car', monthlyFee: '$150', validity: '1 month', status: 'Active' }
      ],
      recentUpdates: data?.recentUpdates || []
    }
  } catch (error) {
    logger.error('Pricing', `Failed to load: ${error.message}`)
    return getMockPricingRules()
  }
}

export async function createPricingRule(rule) {
  try {
    const { data } = await api.post('/pricing-rules', rule)
    return data
  } catch (error) {
    logger.error('Pricing', `Failed to create: ${error.message}`)
    return null
  }
}

export async function updatePricingRule(id, rule) {
  try {
    const { data } = await api.put(`/pricing-rules/${id}`, rule)
    return data
  } catch (error) {
    logger.error('Pricing', `Failed to update: ${error.message}`)
    return null
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

// Additional functions
export async function getPricingRuleById(id) {
  try {
    const { data } = await api.get(`/pricing-rules/${id}`)
    return data
  } catch (error) {
    logger.error('Pricing', `Failed to get rule: ${error.message}`)
    return null
  }
}

export async function togglePricingRule(id, enabled) {
  try {
    const { data } = await api.patch(`/pricing-rules/${id}`, { isEnabled: enabled })
    return data
  } catch (error) {
    logger.error('Pricing', `Failed to toggle: ${error.message}`)
    return null
  }
}

function getMockPricingRules() {
  return {
    rules: [
      { code: 'PRC-001', name: 'Standard Parking', type: 'Car Parking', category: 'Car Parking', vehicleType: 'Car', baseFee: '$5.00', additionalFee: '$2.00/hour', gracePeriod: '15 mins', status: 'Active', effectiveDate: new Date().toISOString(), appliedTo: 'All vehicles' },
      { code: 'PRC-002', name: 'Motorcycle Parking', type: 'Motorcycle Parking', category: 'Motorcycle Parking', vehicleType: 'Motorcycle', baseFee: '$2.00', additionalFee: '$1.00/hour', gracePeriod: '15 mins', status: 'Active', effectiveDate: new Date().toISOString(), appliedTo: 'Motorcycles' },
      { code: 'PRC-003', name: 'EV Charging', type: 'EV Charging', category: 'EV Charging', vehicleType: 'EV', baseFee: '$10.00', additionalFee: '$5.00/hour', gracePeriod: '30 mins', status: 'Active', effectiveDate: new Date().toISOString(), appliedTo: 'Electric vehicles' },
      { code: 'PRC-004', name: 'Monthly Pass', type: 'Monthly Pass', category: 'Car Parking', vehicleType: 'Car', baseFee: '$150.00', additionalFee: 'N/A', gracePeriod: 'N/A', status: 'Active', effectiveDate: new Date().toISOString(), appliedTo: 'Monthly subscribers' },
      { code: 'PRC-005', name: 'Lost Ticket Penalty', type: 'Lost Ticket', category: 'Car Parking', vehicleType: 'All', baseFee: '$50.00', additionalFee: 'N/A', gracePeriod: 'N/A', status: 'Active', effectiveDate: new Date().toISOString(), appliedTo: 'Lost tickets' }
    ],
    categories: ['Car Parking', 'Motorcycle Parking', 'EV Charging', 'Monthly Pass'],
    summaries: [
      { label: 'Active Rules', value: '5', note: 'Currently applied', tone: 'success' },
      { label: 'Monthly Revenue', value: '$12,450', note: 'This month', tone: 'success' }
    ],
    monthlyPasses: [
      { name: 'Basic Monthly', vehicleType: 'Car', monthlyFee: '$150', validity: '1 month', status: 'Active' },
      { name: 'Premium Monthly', vehicleType: 'Car', monthlyFee: '$250', validity: '1 month', status: 'Active' },
      { name: 'Motorcycle Monthly', vehicleType: 'Motorcycle', monthlyFee: '$50', validity: '1 month', status: 'Active' },
      { name: 'EV Monthly', vehicleType: 'EV', monthlyFee: '$200', validity: '1 month', status: 'Active' }
    ],
    recentUpdates: [
      { time: '2 hours ago', rule: 'PRC-003', action: 'Rate Updated', user: 'Admin', status: 'Completed' },
      { time: '1 day ago', rule: 'PRC-004', action: 'New Rule Created', user: 'Manager', status: 'Completed' },
      { time: '2 days ago', rule: 'PRC-001', action: 'Grace Period Changed', user: 'Admin', status: 'Completed' }
    ]
  }
}
