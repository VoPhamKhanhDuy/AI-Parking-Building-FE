import { Link } from 'react-router-dom'
import { ROUTE_PATHS } from '../../routes/routePaths'
import {
  getDriverProfile,
  getDriverActiveTicket,
  getDriverVehicles,
  getDriverReservations,
  getDriverMonthlyPasses,
} from './driverService'
import DriverLayout from '../../layouts/DriverLayout'
import './DriverPortalPage.css'

function DriverPortalPage() {
  const profile = getDriverProfile()
  const activeTicket = getDriverActiveTicket()
  const vehicles = getDriverVehicles()
  const reservations = getDriverReservations()
  const monthlyPasses = getDriverMonthlyPasses()

  return (
    <DriverLayout>
      <div className="driver-portal-page">
        {/* Welcome Banner */}
        <section className="driver-welcome-hero">
          <div className="hero-text">
            <h1>Welcome back, {profile.name}! 👋</h1>
            <p>Smart Parking Building System · Track your vehicle, active ticket, reservations & payments in real-time.</p>
          </div>
          <div className="hero-stats">
            <div className="stat-pill">
              <span className="material-symbols-outlined">directions_car</span>
              <div>
                <strong>{vehicles.length}</strong>
                <small>Registered Vehicles</small>
              </div>
            </div>
            <div className="stat-pill">
              <span className="material-symbols-outlined">stars</span>
              <div>
                <strong>{profile.rewardPoints} Pts</strong>
                <small>{profile.membershipTier}</small>
              </div>
            </div>
          </div>
        </section>

        {/* Active Session / Ticket Alert Banner */}
        {activeTicket && activeTicket.status === 'Active' && (
          <section className="active-ticket-banner">
            <div className="banner-left">
              <div className="live-pulse">
                <span className="pulse-dot" />
                <strong>ACTIVE PARKING SESSION</strong>
              </div>
              <h2>
                <span className="material-symbols-outlined">pin_drop</span> Slot {activeTicket.slotId} ({activeTicket.locationDetails.floor}, {activeTicket.locationDetails.zone})
              </h2>
              <p>Vehicle <strong>{activeTicket.licensePlate}</strong> · Entered at {activeTicket.entryTime.slice(11)} ({activeTicket.durationMinutes} mins ago)</p>
            </div>
            <div className="banner-right">
              <div className="fee-preview">
                <small>Current Fee</small>
                <strong>{activeTicket.currentFee.toLocaleString()}đ</strong>
              </div>
              <div className="banner-actions">
                <Link to={ROUTE_PATHS.driverReceiveTicket} className="btn-secondary">
                  <span className="material-symbols-outlined">qr_code_2</span> View QR Ticket
                </Link>
                <Link to={ROUTE_PATHS.driverReceiveTicket + '?tab=pay-fee'} className="btn-primary">
                  <span className="material-symbols-outlined">payments</span> Pay Fee & Exit
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* Core Driver Actions Grid */}
        <section className="portal-section">
          <h2 className="section-title">Driver Quick Services</h2>
          <div className="driver-services-grid">
            <Link to={ROUTE_PATHS.driverParkVehicle} className="service-card">
              <div className="service-icon icon-blue">
                <span className="material-symbols-outlined">local_parking</span>
              </div>
              <h3>Park Vehicle</h3>
              <p>Check entry gate simulation, realtime available slots & AI slot recommendations.</p>
              <span className="service-link">Park Now →</span>
            </Link>

            <Link to={ROUTE_PATHS.driverReceiveTicket} className="service-card">
              <div className="service-icon icon-green">
                <span className="material-symbols-outlined">qr_code_2</span>
              </div>
              <h3>Receive Ticket</h3>
              <p>View your active digital parking ticket, QR barcode & parking location guide.</p>
              <span className="service-link">View Ticket →</span>
            </Link>

            <Link to={ROUTE_PATHS.driverReceiveTicket + '?tab=pay-fee'} className="service-card">
              <div className="service-icon icon-orange">
                <span className="material-symbols-outlined">payments</span>
              </div>
              <h3>Pay Parking Fee</h3>
              <p>Calculate your current parking fee, pay online via VietQR/MoMo & get receipt.</p>
              <span className="service-link">Pay Fee →</span>
            </Link>

            <Link to={ROUTE_PATHS.driverMonthlyPass} className="service-card">
              <div className="service-icon icon-purple">
                <span className="material-symbols-outlined">badge</span>
              </div>
              <h3>Register Monthly Pass</h3>
              <p>Apply for standard & EV monthly parking subscriptions with unlimited access.</p>
              <span className="service-link">Register Pass →</span>
            </Link>

            <Link to={ROUTE_PATHS.driverReservation} className="service-card">
              <div className="service-icon icon-teal">
                <span className="material-symbols-outlined">event_available</span>
              </div>
              <h3>Make Reservation</h3>
              <p>Reserve a parking spot in advance for peak hours or special EV charging access.</p>
              <span className="service-link">Reserve Spot →</span>
            </Link>
          </div>
        </section>

        {/* Dashboard Overview Widgets */}
        <div className="portal-widgets-row">
          {/* Active Reservations */}
          <div className="widget-card">
            <div className="widget-header">
              <h3><span className="material-symbols-outlined">event_seat</span> Upcoming Reservations</h3>
              <Link to={ROUTE_PATHS.driverReservation}>View all</Link>
            </div>
            <div className="widget-body">
              {reservations.slice(0, 2).map((r) => (
                <div key={r.id} className="reservation-mini-item">
                  <div className="res-icon"><span className="material-symbols-outlined">event_available</span></div>
                  <div className="res-info">
                    <strong>Slot {r.slot} ({r.vehicleType})</strong>
                    <small>{r.date} · {r.timeWindow}</small>
                  </div>
                  <span className={`status-tag ${r.status.toLowerCase().replace(' ', '-')}`}>{r.status}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Monthly Passes */}
          <div className="widget-card">
            <div className="widget-header">
              <h3><span className="material-symbols-outlined">card_membership</span> Active Monthly Passes</h3>
              <Link to={ROUTE_PATHS.driverMonthlyPass}>Manage</Link>
            </div>
            <div className="widget-body">
              {monthlyPasses.slice(0, 2).map((mp) => (
                <div key={mp.id} className="pass-mini-item">
                  <div className="pass-icon"><span className="material-symbols-outlined">verified</span></div>
                  <div className="pass-info">
                    <strong>{mp.vehicleName}</strong>
                    <small>Valid until {mp.validUntil} ({mp.daysRemaining} days left)</small>
                  </div>
                  <span className={`status-tag ${mp.status.toLowerCase().replace(' ', '-')}`}>{mp.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DriverLayout>
  )
}

export default DriverPortalPage
