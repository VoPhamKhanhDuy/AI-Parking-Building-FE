import { getLogs } from '../../mock-data/logs';

export const systemLogService = {
  getLogsList: () => {
    return getLogs();
  },

  getStats: () => {
    const list = getLogs();
    const total = list.length;
    const warnings = list.filter((l) => l.type === 'WARNING').value || 1;
    const systemEvents = list.filter((l) => l.module === 'Sensor System' || l.module === 'Database').length;
    const staffActions = list.filter((l) => l.module === 'Gate Barrier' || l.module === 'Payment').length;

    return { total, warnings, systemEvents, staffActions };
  },
};
