export const INITIAL_PRICING_RULES = [
  { id: 'PR-01', name: 'Standard Car Tarif', vehicleType: 'Car', baseRate: 35000, blockTime: '60 min', overnightRate: 150000, status: 'Active' },
  { id: 'PR-02', name: 'Standard Motorcycle Tariff', vehicleType: 'Bike', baseRate: 5000, blockTime: '60 min', overnightRate: 30000, status: 'Active' },
  { id: 'PR-03', name: 'EV Station Tariff', vehicleType: 'EV', baseRate: 45000, blockTime: '60 min', overnightRate: 200000, status: 'Active' },
  { id: 'PR-04', name: 'VIP Reservation Fee', vehicleType: 'Car', baseRate: 120000, blockTime: 'Per Booking', overnightRate: 0, status: 'Active' },
  { id: 'PR-05', name: 'Lost Ticket Fine', vehicleType: 'All', baseRate: 250000, blockTime: 'Flat Fine', overnightRate: 0, status: 'Active' },
];

export const pricingService = {
  getRules: () => {
    const cached = localStorage.getItem('aps_pricing_rules');
    if (cached) return JSON.parse(cached);
    localStorage.setItem('aps_pricing_rules', JSON.stringify(INITIAL_PRICING_RULES));
    return INITIAL_PRICING_RULES;
  },

  saveRules: (rules) => {
    localStorage.setItem('aps_pricing_rules', JSON.stringify(rules));
  },

  addRule: (rule) => {
    const rules = pricingService.getRules();
    const newRule = {
      ...rule,
      id: `PR-0${rules.length + 1}`,
      status: 'Active',
    };
    rules.push(newRule);
    pricingService.saveRules(rules);
    return newRule;
  },
};
