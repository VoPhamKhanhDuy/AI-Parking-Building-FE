import { useEffect, useMemo, useState } from 'react'
import ManagerLayout from '../../layouts/ManagerLayout'
import { getPricingRules, updatePricingRule } from './pricingService'
import './PricingRulesPage.css'

function Status({ children }) {
  return <span className={`pricing-status ${children.toLowerCase()}`}>{children}</span>
}

const categoryRuleCode = {
  'Standard Parking': 'PRC-001',
  'Motorcycle Parking': 'PRC-002',
  'Car Parking': 'PRC-001',
  'EV Charging': 'PRC-003',
  'Reservation Fee': 'PRC-004',
  'Lost Ticket Penalty': 'PRC-005',
}

const ruleCategory = {
  'PRC-001': 'Car Parking',
  'PRC-002': 'Motorcycle Parking',
  'PRC-003': 'EV Charging',
  'PRC-004': 'Reservation Fee',
  'PRC-005': 'Lost Ticket Penalty',
}

function PricingRulesPage() {
  const [data, setData] = useState(null)
  const [category, setCategory] = useState('Car Parking')
  const [selectedCode, setSelectedCode] = useState('PRC-001')
  const [query, setQuery] = useState('')
  const [notice, setNotice] = useState('')

  useEffect(() => { 
    getPricingRules().then((result) => {
      if (result) setData(result)
    })
  }, [])
  const rules = useMemo(() => (data?.rules || []).filter((rule) => Object.values(rule).join(' ').toLowerCase().includes(query.toLowerCase())), [data, query])
  const selected = (data?.rules || []).find((rule) => rule.code === selectedCode) || (data?.rules || [])[0]

  const notify = (message) => {
    setNotice(message)
    window.setTimeout(() => setNotice(''), 2500)
  }

  const deactivate = async () => {
    await updatePricingRule(selected.code, { status: 'Inactive' })
    notify(`${selected.code} deactivation request recorded.`)
  }

  const selectCategory = (item) => {
    if (item === 'Monthly Pass') {
      document.querySelector('.monthly-pricing')?.scrollIntoView({ behavior: 'smooth' })
      notify('Monthly Pass Pricing is shown below.')
      return
    }
    if (item === 'Overtime Rules') {
      notify('No overtime rule is configured in the current mock data.')
      return
    }
    setCategory(item)
    setSelectedCode(categoryRuleCode[item])
  }

  const selectRule = (rule) => {
    setSelectedCode(rule.code)
    setCategory(ruleCategory[rule.code])
  }

  if (!data) return <ManagerLayout><div className="pricing-loading">Loading pricing rules...</div></ManagerLayout>

  return <ManagerLayout>
    <div className="pricing-page">
      <header className="pricing-heading">
        <div><p>Dashboard <span>/</span> Pricing Rules</p><h1>Pricing Rules Management</h1><h2>Manage parking fees, vehicle-based pricing, overtime charges, monthly pass fees, reservation fees, and lost ticket penalties.</h2></div>
        <button className="create-rule" onClick={() => notify('New pricing rule form opened in mock mode.')}>Create New Rule</button>
      </header>

      <section className="pricing-kpis">{data.summaries.map((item) => <article key={item.label}><small>{item.label}</small><strong className={item.tone ?? ''}>{item.value}</strong><span>{item.note}</span></article>)}</section>

      <div className="pricing-workspace">
        <aside className="pricing-card category-nav">
          <header><h3>Pricing categories</h3></header>
          <nav>{data.categories.map((item) => <button className={category === item ? 'active' : ''} key={item} onClick={() => selectCategory(item)}><span>{item}</span></button>)}</nav>
        </aside>

        <section className="pricing-card rules-table">
          <header><div><h3>Pricing Rules Table</h3><p>{rules.length} rules shown</p></div><label><span className="material-symbols-outlined">search</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search pricing rules..." /></label></header>
          <div className="pricing-table-wrap"><table><thead><tr><th>Rule Code</th><th>Category</th><th>Vehicle Type</th><th>Base Fee</th><th>Additional Fee</th><th>Grace Period</th><th>Status</th></tr></thead><tbody>{rules.map((rule) => <tr className={selected.code === rule.code ? 'selected' : ''} key={rule.code} onClick={() => selectRule(rule)}><td><strong>{rule.code}</strong></td><td>{rule.category}</td><td>{rule.vehicleType}</td><td>{rule.baseFee}</td><td>{rule.additionalFee}</td><td>{rule.gracePeriod}</td><td><Status>{rule.status}</Status></td></tr>)}</tbody></table></div>
        </section>

        <aside className="pricing-card rule-detail">
          <header><div><small>Selected rule</small><h3>{selected.code}</h3></div><Status>{selected.status}</Status></header>
          <dl><div><dt>Category</dt><dd>{selected.detailCategory}</dd></div><div><dt>Vehicle Type</dt><dd>{selected.vehicleType}</dd></div><div><dt>Base Fee</dt><dd>{selected.baseFee}</dd></div><div><dt>Additional Fee</dt><dd>{selected.additionalFee}</dd></div><div><dt>Grace Period</dt><dd>{selected.gracePeriod}</dd></div><div><dt>Effective Date</dt><dd>{selected.effectiveDate}</dd></div><div><dt>Applied To</dt><dd>{selected.appliedTo}</dd></div><div><dt>Status</dt><dd><Status>{selected.status}</Status></dd></div></dl>
          <div className="rule-actions"><button className="primary" onClick={() => notify(`${selected.code} editor opened.`)}>Edit Rule</button><button onClick={() => notify(`${selected.code} duplicated in mock mode.`)}>Duplicate Rule</button><button className="danger" onClick={deactivate}>Deactivate Rule</button></div>
        </aside>
      </div>

      <div className="pricing-bottom-grid">
        <section className="pricing-card monthly-pricing"><header><h3>Monthly Pass Pricing</h3></header><div className="pricing-table-wrap"><table><thead><tr><th>Plan Name</th><th>Vehicle Type</th><th>Monthly Fee</th><th>Validity</th><th>Status</th></tr></thead><tbody>{data.monthlyPasses.map((plan) => <tr key={plan.name}><td><strong>{plan.name}</strong></td><td>{plan.vehicleType}</td><td>{plan.monthlyFee}</td><td>{plan.validity}</td><td><Status>{plan.status}</Status></td></tr>)}</tbody></table></div></section>
        <section className="pricing-card recent-pricing"><header><div><h3>Recent Pricing Updates</h3><p>Latest manager pricing activity</p></div></header><div className="pricing-table-wrap"><table><thead><tr><th>Time</th><th>Rule</th><th>Update Action</th><th>User</th><th>Status</th></tr></thead><tbody>{data.recentUpdates.map((item) => <tr key={`${item.time}-${item.rule}`}><td>{item.time}</td><td><strong>{item.rule}</strong></td><td>{item.action}</td><td>{item.user}</td><td><Status>{item.status}</Status></td></tr>)}</tbody></table></div></section>
      </div>

      {notice && <div className="pricing-notice" role="status">{notice}</div>}
    </div>
  </ManagerLayout>
}

export default PricingRulesPage
