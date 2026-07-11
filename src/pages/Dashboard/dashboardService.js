import { getSlots } from '../../mock-data/slots';
import { getTickets } from '../../mock-data/tickets';
import { getReservations } from '../../mock-data/reservations';
import { getLogs } from '../../mock-data/logs';

export const dashboardService = {
  getSummaryData: () => {
    const slots = getSlots();
    const tickets = getTickets();
    const reservations = getReservations();
    const logs = getLogs();

    const totalCapacity = slots.length || 524;
    const occupiedCount = slots.filter((s) => s.status === 'occupied').length;
    const reservedCount = slots.filter((s) => s.status === 'reserved').length;
    const availableCount = slots.filter((s) => s.status === 'available').length;
    const maintenanceCount = totalCapacity - occupiedCount - reservedCount - availableCount;

    const occupancyRate = Math.round((occupiedCount / totalCapacity) * 100);

    // Calculate today's entries (active tickets + some mock completed check-ins)
    const activeSessionsCount = tickets.filter((t) => t.status === 'Active').length;
    const completedSessionsCount = tickets.filter((t) => t.status === 'Completed').length;
    const lostTicketCount = 5; // Fixed mock lost tickets

    return {
      occupancyRate,
      availableCount,
      occupiedCount,
      reservedCount,
      maintenanceCount,
      totalCapacity,
      todayEntries: 892 + activeSessionsCount - 8, // align with mockup base + dynamic entries
      todayExits: 764 + completedSessionsCount,
      todayRevenue: 12850000 + (completedSessionsCount * 50000), // in VND
      activeSessions: activeSessionsCount,
      pendingPayments: 9,
      lostTicketCases: lostTicketCount,
      reservationsToday: reservations.length,
      recentLogs: logs.slice(0, 5),
    };
  },
};
