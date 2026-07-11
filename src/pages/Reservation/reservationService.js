import { getReservations, saveReservations } from '../../mock-data/reservations';
import { getSlots, saveSlots } from '../../mock-data/slots';
import { getTickets, saveTickets } from '../../mock-data/tickets';
import { addLog } from '../../mock-data/logs';

export const reservationService = {
  getReservationsList: () => {
    return getReservations();
  },

  checkInReservation: (resId) => {
    const list = getReservations();
    const res = list.find((r) => r.id === resId);
    if (!res) return { success: false, message: 'Reservation not found' };

    // 1. Mark reservation completed
    const updatedReservations = list.map((r) => 
      r.id === resId ? { ...r, status: 'Completed' } : r
    );
    saveReservations(updatedReservations);

    // 2. Mark allocated slot occupied
    const slots = getSlots();
    const updatedSlots = slots.map((s) => 
      s.id === res.slot ? { ...s, status: 'occupied', plate: res.plate } : s
    );
    saveSlots(updatedSlots);

    // 3. Create active ticket
    const tickets = getTickets();
    const ticketId = `T-${1000 + tickets.length + 1}`;
    const newTicket = {
      id: ticketId,
      plate: res.plate,
      type: res.type,
      entryTime: new Date().toISOString(),
      floor: res.slot.startsWith('A') ? 'Floor 1' : res.slot.startsWith('B') ? 'Floor 2' : 'Floor 3',
      zone: 'Zone A',
      slot: res.slot,
      ticketType: 'Reservation',
      status: 'Active',
    };
    tickets.push(newTicket);
    saveTickets(tickets);

    // 4. Log event
    addLog('Camera OCR', 'INFO', `Reservation ${resId} vehicle ${res.plate} checked in at Entry Gate A`);
    addLog('Gate Barrier', 'SUCCESS', 'Entry Gate A Barrier raised');

    return { success: true, ticket: newTicket };
  },
};
