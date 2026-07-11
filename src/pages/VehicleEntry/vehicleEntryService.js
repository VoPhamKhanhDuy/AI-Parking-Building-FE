import { getSlots, saveSlots } from '../../mock-data/slots';
import { getTickets, saveTickets } from '../../mock-data/tickets';
import { addLog } from '../../mock-data/logs';

export const vehicleEntryService = {
  getRecommendation: (plateNumber, vehicleType) => {
    const slots = getSlots();
    // Suggest first available slot matching type
    const recommendedSlot = slots.find((s) => s.status === 'available' && s.type === vehicleType);

    if (recommendedSlot) {
      return {
        success: true,
        slotId: recommendedSlot.id,
        floor: recommendedSlot.floor,
        zone: recommendedSlot.zone,
        score: 92,
        reasoning: [
          `Compatible with '${vehicleType}' dimensions.`,
          'Maintains balanced zone occupancy.',
          recommendedSlot.zone === 'Zone B' ? 'Optimal distance (12m) to Core Elevator.' : 'Close proximity to pedestrian exit.',
        ],
      };
    }
    return { success: false, message: 'No slots available for this vehicle type' };
  },

  confirmEntry: (plate, type, slotId, floor, zone) => {
    // 1. Mark slot as occupied
    const slots = getSlots();
    const updatedSlots = slots.map((s) => 
      s.id === slotId ? { ...s, status: 'occupied', plate } : s
    );
    saveSlots(updatedSlots);

    // 2. Add to active tickets
    const tickets = getTickets();
    const ticketId = `T-${1000 + tickets.length + 1}`;
    const newTicket = {
      id: ticketId,
      plate,
      type,
      entryTime: new Date().toISOString(),
      floor,
      zone,
      slot: slotId,
      ticketType: 'Regular',
      status: 'Active',
    };
    tickets.push(newTicket);
    saveTickets(tickets);

    // 3. Add to system logs
    addLog('Camera OCR', 'INFO', `License plate ${plate} recognized at Entry Gate A`);
    addLog('Recommendation Engine', 'AI', `Slot ${slotId} allocated for vehicle ${plate}`);
    addLog('Gate Barrier', 'SUCCESS', 'Entry Gate A Barrier raised');

    return { success: true, ticket: newTicket };
  },
};
