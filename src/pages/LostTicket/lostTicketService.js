import { getTickets } from '../../mock-data/tickets';
import { vehicleExitService } from '../VehicleExit/vehicleExitService';
import { addLog } from '../../mock-data/logs';

export const lostTicketService = {
  findSessionByPlate: (plate) => {
    const tickets = getTickets();
    const cleanPlate = plate.trim().toUpperCase();
    return tickets.find(
      (t) => t.status === 'Active' && t.plate.toUpperCase() === cleanPlate
    );
  },

  calculateLostTicketFees: (ticket) => {
    const baseCalc = vehicleExitService.calculateParkingFee(ticket);
    const penaltyFee = 50000; // Flat lost fine
    const totalFee = baseCalc.totalFee + penaltyFee;

    return {
      ...baseCalc,
      penaltyFee,
      totalFee,
    };
  },

  processLostCheckout: (ticketId, totalPaid) => {
    const res = vehicleExitService.processCheckout(ticketId, totalPaid, 'Lost Ticket Panel (Cash/QR)');
    if (res.success) {
      addLog('Lost Ticket', 'SUCCESS', `Lost ticket resolved for session ${ticketId}. Paid fine total: ${totalPaid.toLocaleString()} VND`);
    }
    return res;
  },
};
