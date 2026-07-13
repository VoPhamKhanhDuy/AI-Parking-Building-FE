export const parkingStructureData = {
  kpis: [
    { label: 'Total Slots', value: '524', note: '4 floors · 12 zones' },
    { label: 'Occupancy Rate', value: '76%', note: 'Building-wide utilization' },
    { label: 'Available Slots', value: '123', note: 'Ready for assignment', tone: 'positive' },
    { label: 'Active Zones', value: '12', note: 'All zones reporting' },
    { label: 'Maintenance Slots', value: '13', note: 'Requires attention', tone: 'warning' },
  ],
  buildings: [
    { name: 'Building A', floors: ['Basement', 'Floor 1', 'Floor 2', 'Floor 3'] },
  ],
  zones: [
    { location: 'Basement', zone: 'Zone A', type: 'Motorcycle', capacity: 120, occupied: 82, available: 38, reserved: 0, maintenance: 0, status: 'Normal' },
    { location: 'Floor 1', zone: 'Zone B', type: 'Car', capacity: 140, occupied: 115, available: 18, reserved: 7, maintenance: 0, status: 'High Occupancy' },
    { location: 'Floor 2', zone: 'Zone B', type: 'Car Parking', capacity: 144, occupied: 105, available: 27, reserved: 12, maintenance: 0, status: 'Normal' },
    { location: 'Floor 3', zone: 'Zone C', type: 'EV Charging', capacity: 80, occupied: 61, available: 19, reserved: 0, maintenance: 0, status: 'Normal' },
    { location: 'Floor 3', zone: 'Zone D', type: 'Reserved / VIP', capacity: 40, occupied: 18, available: 19, reserved: 0, maintenance: 3, status: 'Maintenance' },
  ],
  slotTypes: [
    { type: 'Motorcycle', total: 120, occupied: 82, available: 38, status: 'Normal' },
    { type: 'Car Parking', total: 284, occupied: 220, available: 47, status: 'High Occupancy' },
    { type: 'EV Charging', total: 80, occupied: 61, available: 19, status: 'Normal' },
    { type: 'Reserved / VIP', total: 40, occupied: 18, available: 19, status: 'Normal' },
  ],
  recentUpdates: [
    { time: '10:32 AM', area: 'Zone B · Floor 2', update: 'Added 4 slots', staff: 'Nguyễn Văn An', status: 'Completed' },
    { time: 'Yesterday', area: 'Zone A · Floor 3', update: 'Marked as maintenance', staff: 'Trần Minh Đức', status: 'Completed' },
    { time: 'Yesterday 3:45 PM', area: 'Zone C · Floor 3', update: 'EV charger offline detected', staff: 'Phạm Thu Hà', status: 'Resolved' },
    { time: 'May 21, 7:20 AM', area: 'Zone B · Basement', update: 'High occupancy alert', staff: 'System', status: 'Alert' },
    { time: 'May 21, 3:05 PM', area: 'Zone D · Floor 3', update: 'Ticket sync checked', staff: 'System', status: 'Info' },
  ],
}
