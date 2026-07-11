import { getTickets } from '../../mock-data/tickets';

export const sessionsService = {
  getSessionsList: () => {
    return getTickets();
  },
};
