import { useLocation, useNavigate } from 'react-router-dom'
import { useMemo, useState } from 'react'
import MainLayout from '../../layouts/MainLayout'
import { ROUTE_PATHS } from '../../routes/routePaths'
import { getPaymentHistory } from './paymentService'
import { getPaymentSummary, processPayment } from '../VehicleExit/vehicleExitService'
import '../VehicleExit/VehicleExitPage.css'

function PaymentPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const session = location.state?.session
  const [selectedMethod, setSelectedMethod] = useState('Card')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const summary = useMemo(() => getPaymentSummary(session), [session])
  const history = getPaymentHistory()

  const handlePayment = async () => {
    if (!session) return
    setIsSubmitting(true)
    const updatedSession = await processPayment(session.id, selectedMethod)
    setIsSubmitting(false)
    navigate(ROUTE_PATHS.vehicleExitSuccess, { state: { session: updatedSession || { ...session, status: 'Paid', paymentStatus: 'Paid' }, mode: 'payment' } })
  }

  return (
    <MainLayout>
      <div className="vehicle-exit-page">
        <header className="page-heading">
          <div className="page-breadcrumb">
            <button onClick={() => navigate(ROUTE_PATHS.dashboard)}>Dashboard</button>
            <span className="material-symbols-outlined">chevron_right</span>
            <strong>Payment</strong>
          </div>
          <h1>Payment</h1>
          <p>Finalize the parking fee with a mock payment flow and review recent payment history.</p>
        </header>

        <div className="page-grid">
          <section className="card">
            <div className="card-title">
              <h2>Payment Details</h2>
              <span className="status-pill">Mock Checkout</span>
            </div>
            {session ? (
              <>
                <div className="session-summary">
                  <div className="summary-row"><span>License Plate</span><strong>{session.licensePlate}</strong></div>
                  <div className="summary-row"><span>Ticket Code</span><strong>{session.ticketCode}</strong></div>
                  <div className="summary-row"><span>Base Fee</span><strong>{summary?.baseFee}</strong></div>
                  <div className="summary-row"><span>Surcharge</span><strong>{summary?.surcharge}</strong></div>
                  <div className="summary-row total"><span>Total Due</span><strong>{summary?.formattedTotal}</strong></div>
                </div>
                <div className="method-list">
                  {['Card', 'Cash', 'QR Payment'].map((method) => (
                    <button key={method} className={`method-card ${selectedMethod === method ? 'active' : ''}`} onClick={() => setSelectedMethod(method)}>
                      {method}
                    </button>
                  ))}
                </div>
                <div className="button-row">
                  <button className="primary" onClick={handlePayment} disabled={isSubmitting}>{isSubmitting ? 'Submitting...' : `Pay with ${selectedMethod}`}</button>
                  <button className="secondary" onClick={() => navigate(ROUTE_PATHS.vehicleExit)}>Cancel</button>
                </div>
              </>
            ) : (
              <div className="empty-card">No pending payment session selected.</div>
            )}
          </section>

          <section className="card">
            <div className="card-title">
              <h2>Recent Payments</h2>
              <span className="status-pill muted">History</span>
            </div>
            <div className="session-list">
              {history.map((entry) => (
                <div key={entry.id} className="session-item" style={{ justifyContent: 'space-between' }}>
                  <div>
                    <strong>{entry.ticketCode}</strong>
                    <p>{entry.licensePlate}</p>
                  </div>
                  <span>{entry.amount.toLocaleString('vi-VN')} VND</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </MainLayout>
  )
}

export default PaymentPage
