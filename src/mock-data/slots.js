const generateSlots = () => {
  const floors = ['Basement', 'Floor 1', 'Floor 2', 'Floor 3'];
  const zones = [
    { name: 'Zone A', type: 'Car', prefix: 'A', count: 12 },
    { name: 'Zone B', type: 'Motorbike', prefix: 'B', count: 12 },
    { name: 'Zone C', type: 'Electric Vehicle', prefix: 'C', count: 8 }
  ];

  const slots = [];
  
  floors.forEach((floor, fIdx) => {
    zones.forEach((zone) => {
      for (let i = 1; i <= zone.count; i++) {
        const floorPrefix = floor === 'Basement' ? 'B' : `F${fIdx}`;
        const slotCode = `${floorPrefix}-${zone.prefix}${String(i).padStart(2, '0')}`;
        
        // Deterministic but looks random occupancy status
        let status = 'Available';
        const rand = (fIdx * 7 + zone.prefix.charCodeAt(0) + i) % 10;
        if (rand < 5) {
          status = 'Occupied';
        } else if (rand === 5) {
          status = 'Reserved';
        } else if (rand === 6) {
          status = 'Maintenance';
        }
        
        slots.push({
          id: slotCode,
          code: slotCode,
          floor,
          zone: zone.name,
          vehicleType: zone.type,
          status,
          distanceToExit: 10 + (i * 3) + (fIdx * 8),
          distanceToElevator: 5 + ((zone.count - i) * 4) + (fIdx * 5),
          hasSensor: true
        });
      }
    });
  });

  return slots;
};

// Check if slots exist in localStorage, if not initialize
const STORAGE_KEY = 'ai_parking_slots';
if (typeof window !== 'undefined' && !window.localStorage.getItem(STORAGE_KEY)) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(generateSlots()));
}

export const getStoredSlots = () => {
  if (typeof window === 'undefined') return [];
  return JSON.parse(window.localStorage.getItem(STORAGE_KEY)) || generateSlots();
};

export const saveStoredSlots = (slots) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(slots));
};
