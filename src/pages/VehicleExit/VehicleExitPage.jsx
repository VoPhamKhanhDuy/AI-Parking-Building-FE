import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import MainLayout from '../../layouts/MainLayout'
import { ROUTE_PATHS } from '../../routes/routePaths'
import {
  findVehicleExitSession,
  getPaymentSummary,
  getVehicleExitSessions,
  processVehicleExit
} from './vehicleExitService'
import './VehicleExitPage.css'

function VehicleExitPage() {
  const navigate = useNavigate()
  const [searchValue, setSearchValue] = useState('51A-12345')
  const [selectedSession, setSelectedSession] = useState(getVehicleExitSessions()[0])
  const [isSearching, setIsSearching] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [feedback, setFeedback] = useState('Locate a vehicle by ticket code or license plate to begin the exit flow.')

  const handleSearch = async () => {
    setIsSearching(true)
    setFeedback('Checking the current parking record...')
    await new Promise((resolve) => setTimeout(resolve, 600))
    const match = findVehicleExitSession(searchValue)
    if (!match) {
      setSelectedSession(null)
      setFeedback('No matching session was found. Double-check the ticket code or plate number.')
    } else {
      setSelectedSession(match)
      setFeedback(`Session found for ${match.licensePlate}.`)
    }
    setIsSearching(false)
  }

  const handleConfirmExit = async () => {
    if (!selectedSession) return

    setIsProcessing(true)
    setFeedback('Processing the exit and opening the gate...')
    const completed = await processVehicleExit(selectedSession.id)
    setIsProcessing(false)
    if (completed) {
      navigate(ROUTE_PATHS.vehicleExitSuccess, { state: { session: completed, mode: 'exit' } })
    }
  }

  const handlePayNow = () => {
    if (!selectedSession) return
    navigate('/payment', { state: { session: selectedSession } })
  }

  const summary = getPaymentSummary(selectedSession)

  return (
    <MainLayout>
      <div className="vehicle-exit-page">
        <header className="page-heading">
          <div className="page-breadcrumb">
            <button onClick={() => navigate(ROUTE_PATHS.dashboard)}>Dashboard</button>
            <span className="material-symbols-outlined">chevron_right</span>
            <strong>Vehicle Exit</strong>
          </div>
          <h1>Vehicle Exit</h1>
          <p>Validate the parking session, collect payment when needed, and complete the vehicle exit workflow.</p>
        </header>

        <div className="page-grid">
          <section className="card">
            <div className="card-title">
              <h2>Find Exit Session</h2>
              <span className="status-pill">Mock Flow</span>
            </div>
            <div className="search-row">
              <input
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
                placeholder="Ticket code or license plate"
              />
              <button className="primary" onClick={handleSearch} disabled={isSearching}>
                {isSearching ? 'Searching...' : 'Find Session'}
              </button>
            </div>
            <p className="feedback">{feedback}</p>

            {selectedSession ? (
              <div className="session-summary">
                <div className="summary-row"><span>License Plate</span><strong>{selectedSession.licensePlate}</strong></div>
                <div className="summary-row"><span>Ticket Code</span><strong>{selectedSession.ticketCode}</strong></div>
                <div className="summary-row"><span>Vehicle Type</span><strong>{selectedSession.vehicleType}</strong></div>
                <div className="summary-row"><span>Entry Time</span><strong>{selectedSession.entryTime}</strong></div>
                <div className="summary-row"><span>Slot</span><strong>{selectedSession.slotId}</strong></div>
                <div className="summary-row"><span>Payment Status</span><strong>{selectedSession.paymentStatus}</strong></div>
                {summary && (
                  <div className="summary-row total"><span>Amount Due</span><strong>{summary.formattedTotal}</strong></div>
                )}
              </div>
            ) : (
              <div className="empty-card">No active session selected yet.</div>
            )}

            <div className="button-row">
              <button className="primary" onClick={handleConfirmExit} disabled={!selectedSession || isProcessing || selectedSession.paymentStatus === 'Pending'}>
                {isProcessing ? 'Processing...' : 'Confirm Exit'}
              </button>
              <button className="secondary" onClick={handlePayNow} disabled={!selectedSession || selectedSession.paymentStatus !== 'Pending'}>
                Pay Now
              </button>
            </div>
          </section>

          <section className="card">
            <div className="card-title">
              <h2>Pending Exit Sessions</h2>
              <span className="status-pill muted">Mock Data</span>
            </div>
            <div className="session-list">
              {getVehicleExitSessions().map((session) => (
                <button key={session.id} className={`session-item ${selectedSession?.id === session.id ? 'active' : ''}`} onClick={() => setSelectedSession(session)}>
                  <div>
                    <strong>{session.licensePlate}</strong>
                    <p>{session.ticketCode}</p>
                  </div>
                  <span>{session.paymentStatus}</span>
                </button>
              ))}
            </div>
          </section>
        </div>
      </div>
    </MainLayout>
  )
}

export default VehicleExitPage
