import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import MainLayout from '../../layouts/MainLayout'
import { ROUTE_PATHS } from '../../routes/routePaths'
import { getLostTicketCases, processLostTicketCase } from './lostTicketService'
import '../VehicleExit/VehicleExitPage.css'

function LostTicketPage() {
  const navigate = useNavigate()
  const [selectedCase, setSelectedCase] = useState(getLostTicketCases()[0])
  const [isProcessing, setIsProcessing] = useState(false)

  const cases = useMemo(() => getLostTicketCases(), [])

  const handleProcess = async () => {
    if (!selectedCase) return
    setIsProcessing(true)
    await new Promise((resolve) => setTimeout(resolve, 800))
    const processed = processLostTicketCase(selectedCase.id)
    setIsProcessing(false)
    setSelectedCase(processed)
  }

  return (
    <MainLayout>
      <div className="vehicle-exit-page">
        <header className="page-heading">
          <div className="page-breadcrumb">
            <button onClick={() => navigate(ROUTE_PATHS.dashboard)}>Dashboard</button>
            <span className="material-symbols-outlined">chevron_right</span>
            <strong>Lost Ticket</strong>
          </div>
          <h1>Lost Ticket Management</h1>
          <p>Review lost ticket claims and simulate the manual verification process.</p>
        </header>

        <div className="page-grid">
          <section className="card">
            <div className="card-title">
              <h2>Open Cases</h2>
              <span className="status-pill">Manual Review</span>
            </div>
            <div className="session-list">
              {cases.map((item) => (
                <button key={item.id} className={`session-item ${selectedCase?.id === item.id ? 'active' : ''}`} onClick={() => setSelectedCase(item)}>
                  <div>
                    <strong>{item.caseCode}</strong>
                    <p>{item.licensePlate}</p>
                  </div>
                  <span>{item.status}</span>
                </button>
              ))}
            </div>
          </section>

          <section className="card">
            <div className="card-title">
              <h2>Case Details</h2>
              <span className="status-pill muted">Processing</span>
            </div>
            {selectedCase && (
              <>
                <div className="session-summary">
                  <div className="summary-row"><span>Case Code</span><strong>{selectedCase.caseCode}</strong></div>
                  <div className="summary-row"><span>License Plate</span><strong>{selectedCase.licensePlate}</strong></div>
                  <div className="summary-row"><span>Original Ticket</span><strong>{selectedCase.ticketCode}</strong></div>
                  <div className="summary-row"><span>Status</span><strong>{selectedCase.status}</strong></div>
                  <div className="summary-row"><span>Fee</span><strong>{selectedCase.fee.toLocaleString('vi-VN')} VND</strong></div>
                  <div className="summary-row"><span>Note</span><strong>{selectedCase.note}</strong></div>
                </div>
                <div className="button-row">
                  <button className="primary" onClick={handleProcess} disabled={isProcessing}>{isProcessing ? 'Processing...' : 'Process Case'}</button>
                  <button className="secondary" onClick={() => setSelectedCase(cases[0])}>Reset</button>
                </div>
              </>
            )}
          </section>
        </div>
      </div>
    </MainLayout>
  )
}

export default LostTicketPage
