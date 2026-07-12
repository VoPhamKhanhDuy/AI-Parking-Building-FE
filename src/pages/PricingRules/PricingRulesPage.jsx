import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import MainLayout from '../../layouts/MainLayout'
import { ROUTE_PATHS } from '../../routes/routePaths'
import {
  filterPricingRules,
  getMonthlyPassPlans,
  getPricingOverview,
  getPricingUpdates,
  getPricingRules,
} from './pricingRulesService'
import './PricingRulesPage.css'

const categories = [
  'All Categories',
  'Standard Parking',
  'Motorcycle Parking',
  'Car Parking',
  'EV Charging',
  'Monthly Pass',
  'Reservation',
  'Lost Ticket Penalty',
  'Overtime Rules',
]

function PricingRulesPage() {
  const navigate = useNavigate()
  const overview = useMemo(() => getPricingOverview(), [])
  const rules = useMemo(() => getPricingRules(), [])
  const plans = useMemo(() => getMonthlyPassPlans(), [])
  const updates = useMemo(() => getPricingUpdates(), [])
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('Car Parking')
  const [selectedRuleId, setSelectedRuleId] = useState(rules[0]?.id)

  const filteredRules = useMemo(
    () => filterPricingRules(rules, { query, category }),
    [rules, query, category],
  )

  const selectedRule = filteredRules.find((item) => item.id === selectedRuleId) || filteredRules[0] || rules[0]

  return (
    <MainLayout>
      <div className="pricing-page">
        <header className="pricing-header">
          <div className="breadcrumb">
            <button type="button" onClick={() => navigate(ROUTE_PATHS.dashboard)}>Dashboard</button>
            <span className="material-symbols-outlined">chevron_right</span>
            <strong>Pricing Rules</strong>
          </div>
          <div className="pricing-title">
            <div>
              <h1>Pricing Rules Management</h1>
              <p>Manage parking fees, vehicle-based pricing, overtime charges, monthly pass fees, reservation fees, and lost ticket penalties.</p>
            </div>
            <button type="button" className="button-primary">
              <span className="material-symbols-outlined">add</span>
              Create New Rule
            </button>
          </div>
        </header>

        <section className="pricing-overview-grid">
          {overview.map((item) => (
            <article key={item.label} className="pricing-card">
              <span>{item.label}</span>
              <strong>{item.value}</strong>
            </article>
          ))}
        </section>

        <div className="pricing-main-grid">
          <aside className="pricing-sidebar">
            <h2>Pricing Category</h2>
            <div className="category-list">
              {categories.map((item) => (
                <button
                  type="button"
                  key={item}
                  className={`category-item ${item === category ? 'active' : ''}`}
                  onClick={() => setCategory(item)}
                >
                  {item}
                </button>
              ))}
            </div>
          </aside>

          <section className="pricing-table-card">
            <div className="table-toolbar">
              <h2>Pricing Rules Table</h2>
              <label className="search-box">
                <span className="material-symbols-outlined">search</span>
                <input
                  type="text"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search rules..."
                />
              </label>
            </div>

            <div className="table-wrap">
              <table className="pricing-table">
                <thead>
                  <tr>
                    <th>Rule Code</th>
                    <th>Category</th>
                    <th>Vehicle Type</th>
                    <th>Base Fee</th>
                    <th>Additional Fee</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRules.map((rule) => (
                    <tr
                      key={rule.id}
                      className={selectedRule?.id === rule.id ? 'selected' : ''}
                      onClick={() => setSelectedRuleId(rule.id)}
                    >
                      <td className="mono">{rule.code}</td>
                      <td>{rule.category}</td>
                      <td>{rule.vehicleType}</td>
                      <td>{rule.baseFee}</td>
                      <td>{rule.additionalFee}</td>
                      <td><span className={`status-pill ${rule.status.toLowerCase().replace(/ /g, '-')}`}>{rule.status}</span></td>
                    </tr>
                  ))}
                  {!filteredRules.length && (
                    <tr>
                      <td colSpan="6" className="empty-state">No rules match the current filters.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <aside className="pricing-detail-card">
            <div className="detail-header">
              <div>
                <h2>Rule Detail</h2>
                <p>{selectedRule?.code}</p>
              </div>
              <span className={`detail-status ${selectedRule?.status.toLowerCase().replace(/ /g, '-')}`}>{selectedRule?.status}</span>
            </div>

            <div className="detail-list">
              <div>
                <span>Category</span>
                <strong>{selectedRule?.category}</strong>
              </div>
              <div>
                <span>Vehicle</span>
                <strong>{selectedRule?.vehicleType}</strong>
              </div>
              <div>
                <span>Base Fee</span>
                <strong>{selectedRule?.baseFee}</strong>
              </div>
              <div>
                <span>Additional Fee</span>
                <strong>{selectedRule?.additionalFee}</strong>
              </div>
              <div>
                <span>Applied To</span>
                <strong>{selectedRule?.appliedTo}</strong>
              </div>
              <div>
                <span>Effective</span>
                <strong>{selectedRule?.effectiveDate}</strong>
              </div>
            </div>

            <div className="detail-actions">
              <button type="button" className="button-primary">Edit Rule</button>
              <button type="button" className="button-secondary">Duplicate</button>
              <button type="button" className="button-secondary">View Tickets</button>
              <button type="button" className="button-danger">Deactivate</button>
            </div>
          </aside>
        </div>

        <section className="pricing-bottom-grid">
          <div className="pricing-bottom-card">
            <div className="bottom-card-header">
              <h2>Monthly Pass Pricing</h2>
            </div>
            <div className="table-wrap">
              <table className="bottom-table">
                <thead>
                  <tr>
                    <th>Plan Name</th>
                    <th>Vehicle Type</th>
                    <th>Monthly Fee</th>
                    <th>Validity</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {plans.map((plan) => (
                    <tr key={plan.id}>
                      <td>{plan.planName}</td>
                      <td>{plan.vehicleType}</td>
                      <td>{plan.monthlyFee}</td>
                      <td>{plan.validity}</td>
                      <td>{plan.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="bottom-card-footer">
              <button type="button" className="text-button">View All Plans</button>
            </div>
          </div>

          <div className="pricing-bottom-card">
            <div className="bottom-card-header">
              <h2>Recent Pricing Updates</h2>
            </div>
            <div className="table-wrap">
              <table className="bottom-table">
                <thead>
                  <tr>
                    <th>Time</th>
                    <th>Rule</th>
                    <th>Update Action</th>
                    <th>User</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {updates.map((update) => (
                    <tr key={`${update.time}-${update.rule}`}>
                      <td className="mono small-text">{update.time}</td>
                      <td>{update.rule}</td>
                      <td>{update.action}</td>
                      <td>{update.user}</td>
                      <td><span className="update-pill">{update.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
    </MainLayout>
  )
}

export default PricingRulesPage
