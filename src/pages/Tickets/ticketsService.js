import { getTickets } from '../../mock-data/tickets';

export const ticketsService = {
  getTicketsList: () => {
    return getTickets();
  },

  getStats: () => {
    const list = getTickets();
    const active = list.filter((t) => t.status === 'Active').length;
    const closed = list.filter((t) => t.status === 'Completed').length;
    const lost = 5; // mock lost cases
    const reservations = list.filter((t) => t.ticketType === 'Reservation').length;
    const monthly = list.filter((t) => t.ticketType === 'Monthly').length;

    return { active, closed, lost, reservations, monthly };
  },
};
