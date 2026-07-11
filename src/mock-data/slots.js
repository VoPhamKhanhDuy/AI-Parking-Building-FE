export const INITIAL_SLOTS = [
  // Floor 1
  { id: 'A1-01', floor: 'Floor 1', zone: 'Zone A', type: 'Car', status: 'occupied', plate: '30A-12345' },
  { id: 'A1-02', floor: 'Floor 1', zone: 'Zone A', type: 'Car', status: 'occupied', plate: '51F-99988' },
  { id: 'A1-03', floor: 'Floor 1', zone: 'Zone A', type: 'Car', status: 'available' },
  { id: 'A1-04', floor: 'Floor 1', zone: 'Zone A', type: 'Car', status: 'reserved', plate: '29C-55544' },
  { id: 'A1-05', floor: 'Floor 1', zone: 'Zone A', type: 'Car', status: 'available' },
  
  { id: 'A1-06', floor: 'Floor 1', zone: 'Zone B', type: 'EV', status: 'occupied', plate: '30H-88899' },
  { id: 'A1-07', floor: 'Floor 1', zone: 'Zone B', type: 'EV', status: 'available' },
  { id: 'A1-08', floor: 'Floor 1', zone: 'Zone B', type: 'EV', status: 'reserved', plate: '30K-12456' },
  
  // Floor 2
  { id: 'B2-01', floor: 'Floor 2', zone: 'Zone A', type: 'Car', status: 'occupied', plate: '30E-22233' },
  { id: 'B2-02', floor: 'Floor 2', zone: 'Zone A', type: 'Car', status: 'occupied', plate: '30F-44455' },
  { id: 'B2-03', floor: 'Floor 2', zone: 'Zone A', type: 'Car', status: 'available' },
  
  { id: 'B2-16', floor: 'Floor 2', zone: 'Zone B', type: 'Car', status: 'occupied', plate: '51G-11223' },
  { id: 'B2-18', floor: 'Floor 2', zone: 'Zone B', type: 'Car', status: 'available' }, // Target AI Recommended
  { id: 'B2-19', floor: 'Floor 2', zone: 'Zone B', type: 'Car', status: 'available' },
  { id: 'B2-21', floor: 'Floor 2', zone: 'Zone B', type: 'Car', status: 'available' },
  
  // Floor 3
  { id: 'C3-01', floor: 'Floor 3', zone: 'Zone A', type: 'Bike', status: 'occupied', plate: '29A-9999' },
  { id: 'C3-02', floor: 'Floor 3', zone: 'Zone A', type: 'Bike', status: 'available' },
  { id: 'C3-03', floor: 'Floor 3', zone: 'Zone A', type: 'Bike', status: 'available' },
  { id: 'C3-04', floor: 'Floor 3', zone: 'Zone B', type: 'Bike', status: 'occupied', plate: '29B-8888' },
  { id: 'C3-05', floor: 'Floor 3', zone: 'Zone B', type: 'Bike', status: 'available' },
];

export const getSlots = () => {
  const cached = localStorage.getItem('aps_slots');
  if (cached) return JSON.parse(cached);
  localStorage.setItem('aps_slots', JSON.stringify(INITIAL_SLOTS));
  return INITIAL_SLOTS;
};

export const saveSlots = (slots) => {
  localStorage.setItem('aps_slots', JSON.stringify(slots));
};
