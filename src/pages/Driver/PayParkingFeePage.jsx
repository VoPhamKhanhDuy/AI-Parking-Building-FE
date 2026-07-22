import { useState } from 'react'
import {
  getDriverCurrentUnpaidFee,
  getDriverPaymentMethods,
  getDriverPaymentHistory,
  processFeePayment,
} from './driverService'
import DriverLayout from '../../layouts/DriverLayout'
import './PayParkingFeePage.css'

function PayParkingFeePage() {
  const feeData = getDriverCurrentUnpaidFee()
  const paymentMethods = getDriverPaymentMethods()
  const paymentHistory = getDriverPaymentHistory()

  const [selectedMethod, setSelectedMethod] = useState(paymentMethods[0].id)
  const [isProcessing, setIsProcessing] = useState(false)
  const [paidReceipt, setPaidReceipt] = useState(null)

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
      <div className="pay-fee-page">
        {/* Page Header */}
        <header className="driver-page-header">
          <div>
            <h1>Pay Parking Fee</h1>
            <p>Checkout fee summary, digital payment gateway & automatic exit barrier authorization.</p>
          </div>
          <span className="secure-badge">
            <span className="material-symbols-outlined">lock</span> SSL 256-Bit Encrypted Payment
          </span>
        </header>

        {paidReceipt ? (
          /* Payment Success & Receipt Banner */
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
          /* Checkout Fee Calculator & Payment Selection */
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

            {/* Payment Gateway Panel */}
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

              {/* VietQR Bank Code Preview */}
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

        {/* Recent Payment History */}
        <section className="card-panel">
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
    </DriverLayout>
  )
}

export default PayParkingFeePage
