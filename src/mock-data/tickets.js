export const INITIAL_TICKETS = [
  { id: 'T-1001', plate: '30A-12345', type: 'Car', entryTime: '2026-07-11T08:30:00', floor: 'Floor 1', zone: 'Zone A', slot: 'A1-01', ticketType: 'Regular', status: 'Active' },
  { id: 'T-1002', plate: '51F-99988', type: 'Car', entryTime: '2026-07-11T09:15:00', floor: 'Floor 1', zone: 'Zone A', slot: 'A1-02', ticketType: 'Regular', status: 'Active' },
  { id: 'T-1003', plate: '30H-88899', type: 'EV', entryTime: '2026-07-11T09:45:00', floor: 'Floor 1', zone: 'Zone B', slot: 'A1-06', ticketType: 'Monthly', status: 'Active' },
  { id: 'T-1004', plate: '30E-22233', type: 'Car', entryTime: '2026-07-11T10:00:00', floor: 'Floor 2', zone: 'Zone A', slot: 'B2-01', ticketType: 'Regular', status: 'Active' },
  { id: 'T-1005', plate: '30F-44455', type: 'Car', entryTime: '2026-07-11T10:10:00', floor: 'Floor 2', zone: 'Zone A', slot: 'B2-02', ticketType: 'Regular', status: 'Active' },
  { id: 'T-1006', plate: '51G-11223', type: 'Car', entryTime: '2026-07-11T10:30:00', floor: 'Floor 2', zone: 'Zone B', slot: 'B2-16', ticketType: 'Regular', status: 'Active' },
  { id: 'T-1007', plate: '29A-9999', type: 'Bike', entryTime: '2026-07-11T11:00:00', floor: 'Floor 3', zone: 'Zone A', slot: 'C3-01', ticketType: 'Monthly', status: 'Active' },
  { id: 'T-1008', plate: '29B-8888', type: 'Bike', entryTime: '2026-07-11T11:15:00', floor: 'Floor 3', zone: 'Zone B', slot: 'C3-04', ticketType: 'Regular', status: 'Active' },
];

export const getTickets = () => {
  const cached = localStorage.getItem('aps_tickets');
  if (cached) return JSON.parse(cached);
  localStorage.setItem('aps_tickets', JSON.stringify(INITIAL_TICKETS));
  return INITIAL_TICKETS;
};

export const saveTickets = (tickets) => {
  localStorage.setItem('aps_tickets', JSON.stringify(tickets));
};
