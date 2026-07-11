const initialLogs = [
  {
    logId: 'REC-001',
    vehicleId: 'CAR-001',
    licensePlate: '30F-123.45',
    vehicleType: 'Car',
    ticketType: 'Daily',
    recommendedSlotId: 'F1-A03',
    score: 95,
    explanation: 'Slot F1-A03 matches vehicle type (Car), is currently Available, the floor has low occupancy (42%), and it is closest to the exit (14m).',
    alternativeSlots: ['F1-A04', 'F2-A02', 'B-A05'],
    status: 'Confirmed', // Confirmed or Overridden
    createdAt: '2026-07-11T08:15:30Z'
  },
  {
    logId: 'REC-002',
    vehicleId: 'BIKE-002',
    licensePlate: '29A-999.99',
    vehicleType: 'Motorbike',
    ticketType: 'Monthly Pass',
    recommendedSlotId: 'B-B02',
    score: 92,
    explanation: 'Slot B-B02 matches vehicle type (Motorbike), is Available, and is located in the basement close to the main staircase (8m) for easy staff parking.',
    alternativeSlots: ['B-B05', 'F1-B01'],
    status: 'Confirmed',
    createdAt: '2026-07-11T09:22:11Z'
  },
  {
    logId: 'REC-003',
    vehicleId: 'EV-003',
    licensePlate: '51G-888.88',
    vehicleType: 'Electric Vehicle',
    ticketType: 'Reservation',
    recommendedSlotId: 'F2-C01',
    score: 98,
    explanation: 'Slot F2-C01 matches Electric Vehicle, has an active charging station, is reserved for pre-booking, and has direct elevator access.',
    alternativeSlots: ['F1-C03', 'B-C02'],
    status: 'Overridden', // Selected F1-C03 instead
    createdAt: '2026-07-11T10:45:00Z'
  }
];

const LOGS_KEY = 'ai_parking_rec_logs';
if (typeof window !== 'undefined' && !window.localStorage.getItem(LOGS_KEY)) {
  window.localStorage.setItem(LOGS_KEY, JSON.stringify(initialLogs));
}

export const getStoredRecLogs = () => {
  if (typeof window === 'undefined') return [];
  return JSON.parse(window.localStorage.getItem(LOGS_KEY)) || initialLogs;
};

export const saveStoredRecLogs = (logs) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(LOGS_KEY, JSON.stringify(logs));
};
