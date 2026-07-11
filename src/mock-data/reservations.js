export const INITIAL_RESERVATIONS = [
  { id: 'R-7001', name: 'James Smith', plate: '29C-55544', type: 'Car', arrivalTime: '2026-07-11T14:00:00', slot: 'A1-04', status: 'Pending' },
  { id: 'R-7002', name: 'Maria Garcia', plate: '30K-12456', type: 'EV', arrivalTime: '2026-07-11T15:30:00', slot: 'A1-08', status: 'Pending' },
  { id: 'R-7003', name: 'David Johnson', plate: '30E-99900', type: 'Car', arrivalTime: '2026-07-11T16:00:00', slot: 'B2-03', status: 'Pending' },
  { id: 'R-7004', name: 'Robert Miller', plate: '51F-12345', type: 'Car', arrivalTime: '2026-07-11T10:00:00', slot: 'B2-19', status: 'Completed' },
];

export const getReservations = () => {
  const cached = localStorage.getItem('aps_reservations');
  if (cached) return JSON.parse(cached);
  localStorage.setItem('aps_reservations', JSON.stringify(INITIAL_RESERVATIONS));
  return INITIAL_RESERVATIONS;
};

export const saveReservations = (reservations) => {
  localStorage.setItem('aps_reservations', JSON.stringify(reservations));
};
