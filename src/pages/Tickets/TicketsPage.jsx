import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import MainLayout from '../../layouts/MainLayout'
import { ROUTE_PATHS } from '../../routes/routePaths'
import { searchTicketRecords } from './ticketsService'
import '../VehicleExit/VehicleExitPage.css'

function TicketsPage() {
  const navigate = useNavigate()
  const [searchValue, setSearchValue] = useState('')
  const filtered = searchTicketRecords(searchValue)

  return (
    <MainLayout>
      <div className="vehicle-exit-page">
        <header className="page-heading">
          <div className="page-breadcrumb">
            <button onClick={() => navigate(ROUTE_PATHS.dashboard)}>Dashboard</button>
            <span className="material-symbols-outlined">chevron_right</span>
            <strong>Tickets</strong>
          </div>
          <h1>Tickets</h1>
          <p>Review active and completed tickets for the mock parking operations.</p>
        </header>

        <div className="card">
          <div className="card-title">
            <h2>Ticket Search</h2>
            <span className="status-pill muted">Mock Records</span>
          </div>
          <div className="search-row">
            <input value={searchValue} onChange={(event) => setSearchValue(event.target.value)} placeholder="Search by ticket code or plate" />
            <button className="secondary" onClick={() => setSearchValue('')}>Clear</button>
          </div>

          <div className="session-list">
            {filtered.map((record) => (
              <div key={record.id} className="session-item" style={{ justifyContent: 'space-between' }}>
                <div>
                  <strong>{record.ticketCode}</strong>
                  <p>{record.licensePlate} • {record.vehicleType}</p>
                </div>
                <span>{record.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </MainLayout>
  )
}

export default TicketsPage
