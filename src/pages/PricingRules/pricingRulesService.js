import { pricingOverview, pricingRulesList, monthlyPassPlans, pricingUpdates } from '../../mock-data/pricingRules'

export const getPricingOverview = () => pricingOverview
export const getPricingRules = () => pricingRulesList
export const getMonthlyPassPlans = () => monthlyPassPlans
export const getPricingUpdates = () => pricingUpdates

export const filterPricingRules = (items, { query, category }) => {
  const keyword = query.trim().toLowerCase()

  return items.filter((item) => {
    const matchesSearch = !keyword || [item.code, item.category, item.vehicleType, item.baseFee, item.additionalFee]
      .some((value) => value.toLowerCase().includes(keyword))
    const matchesCategory = category === 'All Categories' || item.category === category

    return matchesSearch && matchesCategory
  })
}
