/**
 * Service managing the real-time Parking Map state and operations
 */

export const initialMapStats = {
  totalSlots: 524,
  available: 123,
  occupied: 343,
  reserved: 45,
  maintenance: 13,
  occupancyRate: '73%'
}

export const initialSlotDetails = {
  'A1-01': { status: 'Available', floor: '1', zone: 'A - Car', vehicle: '', ticketId: '', entryTime: '', method: '', processedBy: '' },
  'A1-02': { status: 'Available', floor: '1', zone: 'A - Car', vehicle: '', ticketId: '', entryTime: '', method: '', processedBy: '' },
  'A1-03': { status: 'Available', floor: '1', zone: 'A - Car', vehicle: '', ticketId: '', entryTime: '', method: '', processedBy: '' },
  'A1-04': { status: 'Available', floor: '1', zone: 'A - Car', vehicle: '', ticketId: '', entryTime: '', method: '', processedBy: '' },
  'A1-05': { status: 'Maintenance', floor: '1', zone: 'A - Car', vehicle: '', ticketId: '', entryTime: '', method: '', processedBy: '' },
  'A1-06': { status: 'Reserved', floor: '1', zone: 'A - Car', vehicle: 'Reservation Hold', ticketId: 'TCK-RES-998', entryTime: '', method: 'Reservation', processedBy: 'System' },
  'B2-13': { status: 'Available', floor: '2', zone: 'B - Car', vehicle: '', ticketId: '', entryTime: '', method: '', processedBy: '' },
  'B2-14': { status: 'Available', floor: '2', zone: 'B - Car', vehicle: '', ticketId: '', entryTime: '', method: '', processedBy: '' },
  'B2-15': { status: 'Available', floor: '2', zone: 'B - Car', vehicle: '', ticketId: '', entryTime: '', method: '', processedBy: '' },
  'B2-16': { status: 'Available', floor: '2', zone: 'B - Car', vehicle: '', ticketId: '', entryTime: '', method: '', processedBy: '' },
  'B2-17': { status: 'Available', floor: '2', zone: 'B - Car', vehicle: '', ticketId: '', entryTime: '', method: '', processedBy: '' },
  'B2-18': { status: 'Occupied', floor: '2', zone: 'B - Car', vehicle: '51A-12345', ticketId: 'TCK-2026-000128', entryTime: '14:32:05', method: 'AI Recommended', processedBy: 'Parking Staff' },
  
  'A1-07': { status: 'Occupied', floor: '1', zone: 'A - Car', vehicle: '29B-44444', ticketId: 'TCK-2026-000120', entryTime: '14:10:05', method: 'Manual Selection', processedBy: 'Parking Staff' },
  'A1-08': { status: 'Occupied', floor: '1', zone: 'A - Car', vehicle: '29B-55555', ticketId: 'TCK-2026-000121', entryTime: '14:15:10', method: 'Manual Selection', processedBy: 'Parking Staff' },
  'A1-09': { status: 'Available', floor: '1', zone: 'A - Car', vehicle: '', ticketId: '', entryTime: '', method: '', processedBy: '' },
  'A1-10': { status: 'Available', floor: '1', zone: 'A - Car', vehicle: '', ticketId: '', entryTime: '', method: '', processedBy: '' },
  'A1-11': { status: 'Occupied', floor: '1', zone: 'A - Car', vehicle: '59C-99887', ticketId: 'TCK-2026-000122', entryTime: '14:18:22', method: 'AI Recommended', processedBy: 'Parking Staff' },
  'A1-12': { status: 'Occupied', floor: '1', zone: 'A - Car', vehicle: '43A-66551', ticketId: 'TCK-2026-000123', entryTime: '14:20:00', method: 'AI Recommended', processedBy: 'Parking Staff' },

  'B2-19': { status: 'Occupied', floor: '2', zone: 'B - Car', vehicle: '29B-87654', ticketId: 'TCK-2026-000124', entryTime: '14:30:12', method: 'Manual Selection', processedBy: 'Parking Staff' },
  'B2-20': { status: 'Reserved', floor: '2', zone: 'B - Car', vehicle: 'Reserved Slot', ticketId: 'TCK-RES-999', entryTime: '', method: 'Reservation', processedBy: 'System' },
  'B2-21': { status: 'Reserved', floor: '2', zone: 'B - Car', vehicle: 'Reserved Slot', ticketId: 'TCK-RES-100', entryTime: '', method: 'Reservation', processedBy: 'System' },
  'B2-22': { status: 'Available', floor: '2', zone: 'B - Car', vehicle: '', ticketId: '', entryTime: '', method: '', processedBy: '' },
  'B2-23': { status: 'Available', floor: '2', zone: 'B - Car', vehicle: '', ticketId: '', entryTime: '', method: '', processedBy: '' },
  'B2-24': { status: 'Occupied', floor: '2', zone: 'B - Car', vehicle: '61C-23111', ticketId: 'TCK-2026-000127', entryTime: '14:28:45', method: 'AI Recommended', processedBy: 'Parking Staff' },

  'C3-01': { status: 'Available', floor: '3', zone: 'C - Car', vehicle: '', ticketId: '', entryTime: '', method: '', processedBy: '' },
  'C3-02': { status: 'Available', floor: '3', zone: 'C - Car', vehicle: '', ticketId: '', entryTime: '', method: '', processedBy: '' },
  'C3-03': { status: 'Available', floor: '3', zone: 'C - Car', vehicle: '', ticketId: '', entryTime: '', method: '', processedBy: '' },
  'C3-04': { status: 'Available', floor: '3', zone: 'C - Car', vehicle: '', ticketId: '', entryTime: '', method: '', processedBy: '' },
  'C3-05': { status: 'Maintenance', floor: '3', zone: 'C - Car', vehicle: '', ticketId: '', entryTime: '', method: '', processedBy: '' },
  'C3-06': { status: 'Maintenance', floor: '3', zone: 'C - Car', vehicle: '', ticketId: '', entryTime: '', method: '', processedBy: '' },
  'D4-13': { status: 'Available', floor: '4', zone: 'D - Car', vehicle: '', ticketId: '', entryTime: '', method: '', processedBy: '' },
  'D4-14': { status: 'Available', floor: '4', zone: 'D - Car', vehicle: '', ticketId: '', entryTime: '', method: '', processedBy: '' },
  'D4-15': { status: 'Available', floor: '4', zone: 'D - Car', vehicle: '', ticketId: '', entryTime: '', method: '', processedBy: '' },
  'D4-16': { status: 'Available', floor: '4', zone: 'D - Car', vehicle: '', ticketId: '', entryTime: '', method: '', processedBy: '' },
  'D4-17': { status: 'Available', floor: '4', zone: 'D - Car', vehicle: '', ticketId: '', entryTime: '', method: '', processedBy: '' },
  'D4-18': { status: 'Available', floor: '4', zone: 'D - Car', vehicle: '', ticketId: '', entryTime: '', method: '', processedBy: '' },

  'C3-07': { status: 'Occupied', floor: '3', zone: 'C - Car', vehicle: '51F-99900', ticketId: 'TCK-2026-000109', entryTime: '13:50:00', method: 'AI Recommended', processedBy: 'Parking Staff' },
  'C3-08': { status: 'Occupied', floor: '3', zone: 'C - Car', vehicle: '30L-11223', ticketId: 'TCK-2026-000110', entryTime: '13:55:00', method: 'Manual Selection', processedBy: 'Parking Staff' },
  'C3-09': { status: 'Available', floor: '3', zone: 'C - Car', vehicle: '', ticketId: '', entryTime: '', method: '', processedBy: '' },
  'C3-10': { status: 'Available', floor: '3', zone: 'C - Car', vehicle: '', ticketId: '', entryTime: '', method: '', processedBy: '' },
  'C3-11': { status: 'Reserved', floor: '3', zone: 'C - Car', vehicle: 'EV Reserve', ticketId: 'TCK-RES-101', entryTime: '', method: 'Reservation', processedBy: 'System' },
  'C3-12': { status: 'Reserved', floor: '3', zone: 'C - Car', vehicle: 'EV Reserve', ticketId: 'TCK-RES-102', entryTime: '', method: 'Reservation', processedBy: 'System' },

  'D4-19': { status: 'Occupied', floor: '4', zone: 'D - Car', vehicle: '75A-09876', ticketId: 'TCK-2026-000111', entryTime: '14:02:11', method: 'AI Recommended', processedBy: 'Parking Staff' },
  'D4-20': { status: 'Occupied', floor: '4', zone: 'D - Car', vehicle: '37C-55432', ticketId: 'TCK-2026-000112', entryTime: '14:05:00', method: 'AI Recommended', processedBy: 'Parking Staff' },
  'D4-21': { status: 'Occupied', floor: '4', zone: 'D - Car', vehicle: '47A-88776', ticketId: 'TCK-2026-000113', entryTime: '14:08:15', method: 'Manual Selection', processedBy: 'Parking Staff' },
  'D4-22': { status: 'Available', floor: '4', zone: 'D - Car', vehicle: '', ticketId: '', entryTime: '', method: '', processedBy: '' },
  'D4-23': { status: 'Available', floor: '4', zone: 'D - Car', vehicle: '', ticketId: '', entryTime: '', method: '', processedBy: '' },
  'D4-24': { status: 'Occupied', floor: '4', zone: 'D - Car', vehicle: '92A-44332', ticketId: 'TCK-2026-000114', entryTime: '14:09:44', method: 'Manual Selection', processedBy: 'Parking Staff' },
}

export const initialRecentUpdates = [
  { time: '14:30:12', slot: 'A1-45', vehicle: '29B-87654', action: 'Assigned (Manual)', staff: 'Parking Staff', status: 'Checked In', statusClass: 'green' },
  { time: '14:28:45', slot: 'M-12', vehicle: '61C-23111', action: 'Assigned (Auto)', staff: 'System', status: 'Pending AI', statusClass: 'blue' },
  { time: '14:32:05', slot: 'B2-18', vehicle: '51A-12345', action: 'Assigned (AI)', staff: 'Parking Staff', status: 'Occupied', statusClass: 'red', highlight: true }
]
