import { useLocation, useNavigate } from 'react-router-dom'
import MainLayout from '../../layouts/MainLayout'
import { ROUTE_PATHS } from '../../routes/routePaths'
import './VehicleExitPage.css'

function ExitSuccessPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const session = location.state?.session
  const mode = location.state?.mode || 'exit'

  return (
    <MainLayout>
      <div className="vehicle-exit-page">
        <div className="success-card">
          <span className="material-symbols-outlined success-icon">check_circle</span>
          <h1>{mode === 'payment' ? 'Payment Completed' : 'Vehicle Exit Completed'}</h1>
          <p>{mode === 'payment' ? 'The parking fee has been recorded and the gate can be opened.' : 'The vehicle has been successfully logged out of the parking facility.'}</p>

          {session && (
            <div className="summary-box">
              <div className="summary-row"><span>License Plate</span><strong>{session.licensePlate}</strong></div>
              <div className="summary-row"><span>Ticket</span><strong>{session.ticketCode}</strong></div>
              <div className="summary-row"><span>Status</span><strong>{session.status}</strong></div>
            </div>
          )}

          <div className="button-row">
            <button className="primary" onClick={() => navigate(ROUTE_PATHS.tickets)}>View Tickets</button>
            <button className="secondary" onClick={() => navigate(ROUTE_PATHS.vehicleExit)}>Back to Exit Flow</button>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}

export default ExitSuccessPage
