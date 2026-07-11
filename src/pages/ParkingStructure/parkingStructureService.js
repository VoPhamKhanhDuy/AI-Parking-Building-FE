import { getSlots, saveSlots } from '../../mock-data/slots';

export const parkingStructureService = {
  getStructureStats: () => {
    const slots = getSlots();
    const total = slots.length || 524;
    const occupied = slots.filter((s) => s.status === 'occupied').length;
    const reserved = slots.filter((s) => s.status === 'reserved').length;
    const available = slots.filter((s) => s.status === 'available').length;
    const maintenance = total - occupied - reserved - available;

    return { total, occupied, reserved, available, maintenance };
  },

  getFloors: () => {
    const slots = getSlots();
    const floors = [...new Set(slots.map((s) => s.floor))];
    return floors.sort(); // e.g. ['Floor 1', 'Floor 2', 'Floor 3']
  },

  getZonesForFloor: (floor) => {
    const slots = getSlots();
    const floorSlots = slots.filter((s) => s.floor === floor);
    
    // Group slots by zone
    const zones = {};
    floorSlots.forEach((s) => {
      if (!zones[s.zone]) {
        zones[s.zone] = {
          name: s.zone,
          type: s.type,
          capacity: 0,
          occupied: 0,
          available: 0,
          reserved: 0,
          slots: [],
        };
      }
      zones[s.zone].capacity += 1;
      if (s.status === 'occupied') zones[s.zone].occupied += 1;
      else if (s.status === 'available') zones[s.zone].available += 1;
      else if (s.status === 'reserved') zones[s.zone].reserved += 1;
      zones[s.zone].slots.push(s);
    });

    return Object.values(zones);
  },

  updateSlotStatus: (slotId, status) => {
    const slots = getSlots();
    const updated = slots.map((s) => (s.id === slotId ? { ...s, status } : s));
    saveSlots(updated);
    return updated;
  },
};
