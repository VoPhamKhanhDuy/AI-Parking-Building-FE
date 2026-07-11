export const INITIAL_LOGS = [
  { timestamp: '2026-07-11T12:15:32', type: 'INFO', module: 'Camera OCR', message: 'License plate 51G-11223 recognized at Entry Gate 1' },
  { timestamp: '2026-07-11T12:15:33', type: 'AI', module: 'Recommendation Engine', message: 'Slot B2-16 allocated for vehicle 51G-11223' },
  { timestamp: '2026-07-11T12:15:35', type: 'SUCCESS', module: 'Gate Barrier', message: 'Entry Gate 1 Barrier raised' },
  { timestamp: '2026-07-11T12:10:04', type: 'INFO', module: 'Camera OCR', message: 'License plate 30F-44455 recognized at Entry Gate 2' },
  { timestamp: '2026-07-11T12:10:05', type: 'AI', module: 'Recommendation Engine', message: 'Slot B2-02 allocated for vehicle 30F-44455' },
  { timestamp: '2026-07-11T12:10:07', type: 'SUCCESS', module: 'Gate Barrier', message: 'Entry Gate 2 Barrier raised' },
  { timestamp: '2026-07-11T12:05:00', type: 'SUCCESS', module: 'Payment', message: 'Ticket T-1002 payment processed ($5.00)' },
  { timestamp: '2026-07-11T12:05:02', type: 'SUCCESS', module: 'Gate Barrier', message: 'Exit Gate 1 Barrier raised' },
  { timestamp: '2026-07-11T12:00:10', type: 'WARNING', module: 'Sensor System', message: 'Occupancy sensor at B2-05 reporting high noise' },
  { timestamp: '2026-07-11T11:45:11', type: 'SUCCESS', module: 'Database', message: 'System automated snapshot backup completed' },
];

export const getLogs = () => {
  const cached = localStorage.getItem('aps_logs');
  if (cached) return JSON.parse(cached);
  localStorage.setItem('aps_logs', JSON.stringify(INITIAL_LOGS));
  return INITIAL_LOGS;
};

export const saveLogs = (logs) => {
  localStorage.setItem('aps_logs', JSON.stringify(logs));
};

export const addLog = (module, type, message) => {
  const logs = getLogs();
  const timestamp = new Date().toISOString().replace('Z', '').split('.')[0];
  logs.unshift({ timestamp, type, module, message });
  saveLogs(logs);
};
