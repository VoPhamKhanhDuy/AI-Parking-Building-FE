import axios from 'axios'
import { pricingRulesData } from '../../mock-data/pricingRulesData'

export async function getPricingRules() {
  if (import.meta.env.VITE_USE_MOCK_DATA !== 'false') return Promise.resolve(pricingRulesData)
  const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/manager/pricing-rules`)
  return data
}

export async function updatePricingRule(ruleCode, changes) {
  if (import.meta.env.VITE_USE_MOCK_DATA !== 'false') return Promise.resolve({ success: true, ruleCode, ...changes })
  const { data } = await axios.patch(`${import.meta.env.VITE_API_URL}/manager/pricing-rules/${ruleCode}`, changes)
  return data
}
