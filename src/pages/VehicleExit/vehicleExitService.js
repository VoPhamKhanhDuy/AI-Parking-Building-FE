import { getTickets, saveTickets } from '../../mock-data/tickets';
import { getSlots, saveSlots } from '../../mock-data/slots';
import { addLog } from '../../mock-data/logs';

export const vehicleExitService = {
  findTicketByQuery: (query) => {
    const tickets = getTickets();
    const cleanQuery = query.trim().toUpperCase();
    return tickets.find(
      (t) => t.status === 'Active' && (t.id.toUpperCase() === cleanQuery || t.plate.toUpperCase() === cleanQuery)
    );
  },

  calculateParkingFee: (ticket) => {
    const entry = new Date(ticket.entryTime);
    const exit = new Date();
    const elapsedMs = exit - entry;
    
    // Convert to hours (minimum 1 hour)
    const elapsedMinutes = Math.max(1, Math.round(elapsedMs / (1000 * 60)));
    const elapsedHours = Math.ceil(elapsedMinutes / 60);

    let hourlyRate = 35000; // default Car
    if (ticket.type === 'Bike') hourlyRate = 5000;
    else if (ticket.type === 'EV') hourlyRate = 45000;

    const totalFee = ticket.ticketType === 'Monthly' ? 0 : elapsedHours * hourlyRate;

    const hoursPart = Math.floor(elapsedMinutes / 60);
    const minutesPart = elapsedMinutes % 60;
    const durationStr = `${hoursPart}h ${minutesPart}m`;

    return {
      durationStr,
      totalFee,
      exitTime: exit.toISOString(),
    };
  },

  processCheckout: (ticketId, paidAmount, paymentMethod) => {
    const tickets = getTickets();
    const ticket = tickets.find((t) => t.id === ticketId);
    if (!ticket) return { success: false, message: 'Ticket not found' };

    // 1. Update ticket state
    const updatedTickets = tickets.map((t) => 
      t.id === ticketId ? { ...t, status: 'Completed', exitTime: new Date().toISOString() } : t
    );
    saveTickets(updatedTickets);

    // 2. Release allocated slot
    const slots = getSlots();
    const updatedSlots = slots.map((s) => 
      s.id === ticket.slot ? { ...s, status: 'available', plate: undefined } : s
    );
    saveSlots(updatedSlots);

    // 3. Log events
    addLog('Payment', 'SUCCESS', `Ticket ${ticketId} payment processed (${paidAmount.toLocaleString()} VND) via ${paymentMethod}`);
    addLog('Gate Barrier', 'SUCCESS', 'Exit Gate 1 Barrier raised');

    return { success: true };
  },
};
