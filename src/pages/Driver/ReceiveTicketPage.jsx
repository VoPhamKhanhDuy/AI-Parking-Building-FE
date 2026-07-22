import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ROUTE_PATHS } from '../../routes/routePaths'
import {
  getDriverActiveTicket,
  getDriverTicketHistory,
  getDriverCurrentUnpaidFee,
  getDriverPaymentMethods,
  getDriverPaymentHistory,
  processFeePayment,
} from './driverService'
import DriverLayout from '../../layouts/DriverLayout'
import './ReceiveTicketPage.css'

function ReceiveTicketPage() {
  const location = useLocation()
  const navigate = useNavigate()

  // Tab State: 'ticket' | 'pay-fee'
  const [activeTab, setActiveTab] = useState('ticket')

  // Data sources
  const activeTicket = getDriverActiveTicket()
  const ticketHistory = getDriverTicketHistory()
  const feeData = getDriverCurrentUnpaidFee()
  const paymentMethods = getDriverPaymentMethods()
  const paymentHistory = getDriverPaymentHistory()

  // Check URL search params (e.g. ?tab=pay-fee)
  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const tabParam = params.get('tab')
    if (tabParam === 'pay-fee') {
      setActiveTab('pay-fee')
    }
  }, [location.search])

  // Payment states
  const [selectedMethod, setSelectedMethod] = useState(paymentMethods[0].id)
  const [isProcessing, setIsProcessing] = useState(false)
  const [paidReceipt, setPaidReceipt] = useState(null)
  const [copied, setCopied] = useState(false)

  const handleCopyCode = () => {
    navigator.clipboard.writeText(activeTicket.ticketCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handlePayNow = () => {
    setIsProcessing(true)
    setTimeout(() => {
      const res = processFeePayment(feeData.ticketCode, selectedMethod)
      setPaidReceipt(res.receipt)
      setIsProcessing(false)
    }, 1200)
  }

  return (
    <DriverLayout>
      <div className="receive-ticket-page">
        {/* Breadcrumb Navigation */}
        <nav className="driver-breadcrumb">
          <button onClick={() => navigate(ROUTE_PATHS.driverPortal)}>Dashboard</button>
          <span>/</span>
          <b>Tickets & Pay Fee</b>
        </nav>

        {/* Page Heading */}
        <header className="driver-heading">
          <div>
            <h1>Digital Ticket & Fee Checkout</h1>
            <p>View your active parking ticket pass, location guide, and checkout payment gateway.</p>
          </div>
          <span className="gate-pill">
            <i /> Session Active
          </span>
        </header>

        {/* Top Tab Controls */}
        <div className="ticket-tab-controls">
          <button
            className={`tab-btn ${activeTab === 'ticket' ? 'active' : ''}`}
            onClick={() => setActiveTab('ticket')}
          >
            <span className="material-symbols-outlined">qr_code_2</span>
            <span>Digital Ticket Pass</span>
          </button>

          <button
            className={`tab-btn ${activeTab === 'pay-fee' ? 'active' : ''}`}
            onClick={() => setActiveTab('pay-fee')}
          >
            <span className="material-symbols-outlined">payments</span>
            <span>Pay Parking Fee</span>
            {activeTicket && <span className="tab-fee-tag">{activeTicket.currentFee.toLocaleString()}đ</span>}
          </button>
        </div>

        {/* TAB 1: Digital Ticket View */}
        {activeTab === 'ticket' && (
          <div className="ticket-layout-grid">
            <div className="ticket-card-main">
              <div className="ticket-header-strip">
                <div className="strip-left">
                  <span className="material-symbols-outlined logo-symbol">directions_car</span>
                  <div>
                    <strong>AI PARKING BUILDING</strong>
                    <small>Smart Entry Pass</small>
                  </div>
                </div>
                <span className="ticket-type-badge">{activeTicket.ticketType} Ticket</span>
              </div>

              <div className="ticket-body-content">
                {/* QR Code */}
                <div className="qr-container">
                  <img src={activeTicket.qrCodeUrl} alt="Parking Ticket QR Code" className="qr-img" />
                  <div className="ticket-code-wrap">
                    <span className="t-code">{activeTicket.ticketCode}</span>
                    <button type="button" onClick={handleCopyCode} className="btn-copy">
                      <span className="material-symbols-outlined">{copied ? 'check' : 'content_copy'}</span>
                      {copied ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                  <small className="qr-hint">Scan at Exit Gate A/B or Pay Terminal</small>
                </div>

                {/* Details Grid */}
                <div className="ticket-details-grid">
                  <div className="detail-item highlight">
                    <span className="detail-label">ASSIGNED PARKING SLOT</span>
                    <strong className="slot-big">{activeTicket.slotId}</strong>
                    <span className="detail-sub">{activeTicket.locationDetails.floor} · {activeTicket.locationDetails.zone}</span>
                  </div>

                  <div className="detail-item">
                    <span className="detail-label">LICENSE PLATE</span>
                    <strong className="val-text">{activeTicket.licensePlate}</strong>
                    <span className="detail-sub">{activeTicket.vehicleType}</span>
                  </div>

                  <div className="detail-item">
                    <span className="detail-label">ENTRY TIMESTAMP</span>
                    <strong className="val-text">{activeTicket.entryTime}</strong>
                    <span className="detail-sub">{activeTicket.entryGate}</span>
                  </div>

                  <div className="detail-item">
                    <span className="detail-label">PARKED DURATION</span>
                    <strong className="val-text text-blue">{Math.floor(activeTicket.durationMinutes / 60)}h {activeTicket.durationMinutes % 60}m</strong>
                    <span className="detail-sub">Timer Running</span>
                  </div>
                </div>
              </div>

              {/* Parking Location Guide */}
              <div className="location-guide-box">
                <h3><span className="material-symbols-outlined">explore</span> How to find your parked vehicle</h3>
                <div className="guide-chips">
                  <span>📍 Pillar: {activeTicket.locationDetails.pillar}</span>
                  <span>🚶 Elevator: {activeTicket.locationDetails.nearestElevator}</span>
                  <span>🏢 Floor: {activeTicket.locationDetails.floor}</span>
                </div>
              </div>

              {/* Proceed to Checkout Action Button */}
              <div className="ticket-actions-bar">
                <button
                  type="button"
                  className="btn-pay-now"
                  onClick={() => setActiveTab('pay-fee')}
                >
                  <span className="material-symbols-outlined">payments</span>
                  <span>Proceed to Checkout & Pay Fee ({activeTicket.currentFee.toLocaleString()}đ)</span>
                  <span className="material-symbols-outlined">arrow_forward</span>
                </button>
              </div>
            </div>

            {/* Sidebar Ticket History */}
            <div className="ticket-sidebar-panel">
              <h3><span className="material-symbols-outlined">history</span> Ticket History</h3>
              <div className="history-list">
                {ticketHistory.map((t) => (
                  <div key={t.id} className="history-card">
                    <div className="h-card-top">
                      <strong>{t.ticketCode}</strong>
                      <span className={`h-status ${t.status.toLowerCase()}`}>{t.status}</span>
                    </div>
                    <div className="h-card-meta">
                      <span>{t.licensePlate} · Slot {t.slotId}</span>
                      <small>{t.entryTime.slice(0, 10)} ({t.duration})</small>
                    </div>
                    <div className="h-card-fee">
                      <span>Total Fee: <strong>{t.totalFee.toLocaleString()}đ</strong></span>
                      {t.paidVia && <small>Paid via {t.paidVia}</small>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Pay Parking Fee View */}
        {activeTab === 'pay-fee' && (
          <div className="pay-tab-content">
            {paidReceipt ? (
              <div className="receipt-success-card">
                <div className="success-icon-wrap">
                  <span className="material-symbols-outlined">check_circle</span>
                </div>
                <h2>Payment Successful!</h2>
                <p>Your parking session has been closed. Exit barrier Gate A is now authorized to open.</p>

                <div className="receipt-box">
                  <div className="receipt-header">
                    <strong>OFFICIAL PARKING E-RECEIPT</strong>
                    <small>Receipt ID: {paidReceipt.receiptId}</small>
                  </div>
                  <hr />
                  <div className="receipt-line">
                    <span>Ticket Code:</span>
                    <strong>{paidReceipt.ticketCode}</strong>
                  </div>
                  <div className="receipt-line">
                    <span>Total Amount Paid:</span>
                    <strong className="receipt-amount">{paidReceipt.amount.toLocaleString()}đ</strong>
                  </div>
                  <div className="receipt-line">
                    <span>Payment Method:</span>
                    <strong>{paidReceipt.method}</strong>
                  </div>
                  <div className="receipt-line">
                    <span>Paid At:</span>
                    <strong>{paidReceipt.paidAt}</strong>
                  </div>
                  <div className="receipt-line">
                    <span>Gate Authorization:</span>
                    <span className="gate-pass-tag">✓ Exit Barrier Unlocked</span>
                  </div>
                </div>

                <button className="btn-print" onClick={() => window.print()}>
                  <span className="material-symbols-outlined">print</span> Print / Download Receipt
                </button>
              </div>
            ) : (
              <div className="pay-fee-grid">
                {/* Fee Breakdown Panel */}
                <div className="card-panel">
                  <h2><span className="material-symbols-outlined">receipt_long</span> Session Fee Breakdown</h2>

                  <div className="session-meta-box">
                    <div className="meta-col">
                      <small>Ticket Code</small>
                      <strong>{feeData.ticketCode}</strong>
                    </div>
                    <div className="meta-col">
                      <small>License Plate</small>
                      <strong>{feeData.licensePlate}</strong>
                    </div>
                    <div className="meta-col">
                      <small>Assigned Slot</small>
                      <strong>{feeData.slotId} ({feeData.floorZone})</strong>
                    </div>
                    <div className="meta-col">
                      <small>Parked Duration</small>
                      <strong className="text-blue">{feeData.durationText}</strong>
                    </div>
                  </div>

                  <div className="rate-info-pill">
                    <span className="material-symbols-outlined">info</span> {feeData.baseRateText}
                  </div>

                  <div className="breakdown-table">
                    {feeData.feeBreakdown.map((item, idx) => (
                      <div key={idx} className="breakdown-row">
                        <span>{item.label}</span>
                        <span className={`amount ${item.amount < 0 ? 'discount' : ''}`}>
                          {item.amount < 0 ? `- ${Math.abs(item.amount).toLocaleString()}đ` : `${item.amount.toLocaleString()}đ`}
                        </span>
                      </div>
                    ))}
                    <hr />
                    <div className="breakdown-row total">
                      <strong>Total Amount To Pay</strong>
                      <strong className="total-amount">{feeData.totalToPay.toLocaleString()}đ</strong>
                    </div>
                  </div>
                </div>

                {/* Payment Method Panel */}
                <div className="card-panel">
                  <h2><span className="material-symbols-outlined">account_balance_wallet</span> Select Payment Method</h2>

                  <div className="methods-list">
                    {paymentMethods.map((m) => (
                      <label
                        key={m.id}
                        className={`method-option ${selectedMethod === m.id ? 'selected' : ''}`}
                      >
                        <input
                          type="radio"
                          name="payMethod"
                          value={m.id}
                          checked={selectedMethod === m.id}
                          onChange={(e) => setSelectedMethod(e.target.value)}
                        />
                        <span className="material-symbols-outlined method-icon">{m.icon}</span>
                        <div className="method-text">
                          <strong>{m.name}</strong>
                          <small>{m.type}</small>
                        </div>
                        {m.recommended && <span className="rec-tag">Fastest</span>}
                      </label>
                    ))}
                  </div>

                  {selectedMethod === 'banking_qr' && (
                    <div className="vietqr-box">
                      <small>Scan VietQR with any Mobile Banking App</small>
                      <img src={feeData.qrPayment.qrImageUrl} alt="VietQR Transfer Code" className="vietqr-img" />
                      <div className="qr-meta">
                        <p><strong>Bank:</strong> {feeData.qrPayment.bankName}</p>
                        <p><strong>Account:</strong> {feeData.qrPayment.accountNumber}</p>
                        <p><strong>Content:</strong> <code>{feeData.qrPayment.transferContent}</code></p>
                      </div>
                    </div>
                  )}

                  <button
                    className="btn-pay-submit"
                    disabled={isProcessing}
                    onClick={handlePayNow}
                  >
                    <span className="material-symbols-outlined">payments</span>
                    {isProcessing ? 'Processing Secure Payment...' : `Pay ${feeData.totalToPay.toLocaleString()}đ Now`}
                  </button>
                </div>
              </div>
            )}

            {/* Payment History Section */}
            <section className="card-panel" style={{ marginTop: 20 }}>
              <h2><span className="material-symbols-outlined">history_edu</span> Payment History</h2>
              <div className="history-table-wrap">
                <table className="driver-table">
                  <thead>
                    <tr>
                      <th>Receipt ID</th>
                      <th>Ticket / Order</th>
                      <th>Plate</th>
                      <th>Type</th>
                      <th>Payment Method</th>
                      <th>Amount</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paymentHistory.map((ph) => (
                      <tr key={ph.id}>
                        <td><strong>{ph.id}</strong></td>
                        <td>{ph.ticketCode}</td>
                        <td>{ph.licensePlate}</td>
                        <td>{ph.type}</td>
                        <td>{ph.method}</td>
                        <td><strong>{ph.amount.toLocaleString()}đ</strong></td>
                        <td><span className="status-badge success">{ph.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        )}
      </div>
    </DriverLayout>
  )
}

export default ReceiveTicketPage
