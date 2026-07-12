export const parkingStructureOverview = [
  { label: 'Total Slots', value: '524' },
  { label: 'Available Slots', value: '123' },
  { label: 'Active Zones', value: '14' },
  { label: 'Reserved Slots', value: '37' },
  { label: 'Maintenance Slots', value: '13' },
]

export const parkingStructureZones = [
  { id: 'zone-1', location: 'Basement', zone: 'Zone A', type: 'Motorcycle', capacity: 120, occupied: 82, available: 31, reserved: 7, maintenance: 0, status: 'Normal', utilization: '68%' },
  { id: 'zone-2', location: 'Floor 1', zone: 'Zone B', type: 'Car', capacity: 140, occupied: 115, available: 18, reserved: 5, maintenance: 2, status: 'High Occupancy', utilization: '82%' },
  { id: 'zone-3', location: 'Floor 2', zone: 'Zone B', type: 'Car', capacity: 144, occupied: 105, available: 27, reserved: 12, maintenance: 0, status: 'Normal', utilization: '73%' },
  { id: 'zone-4', location: 'Floor 3', zone: 'Zone C', type: 'EV Charging', capacity: 80, occupied: 41, available: 28, reserved: 7, maintenance: 4, status: 'Normal', utilization: '63%' },
  { id: 'zone-5', location: 'Floor 3', zone: 'Zone D', type: 'Reserved / VIP', capacity: 40, occupied: 8, available: 19, reserved: 13, maintenance: 0, status: 'Maintenance Review', utilization: '60%' },
  { id: 'zone-6', location: 'Floor 1', zone: 'Zone E', type: 'Compact Car', capacity: 50, occupied: 30, available: 15, reserved: 4, maintenance: 1, status: 'Normal', utilization: '70%' },
  { id: 'zone-7', location: 'Basement', zone: 'Zone F', type: 'Disabled', capacity: 22, occupied: 14, available: 6, reserved: 2, maintenance: 0, status: 'Normal', utilization: '64%' },
]

export const parkingStructureSlotTypes = [
  { type: 'Motorcycle', icon: 'two_wheeler', total: 120, occupied: 82, available: 31, status: 'Normal' },
  { type: 'Car', icon: 'directions_car', total: 304, occupied: 220, available: 45, status: 'Normal' },
  { type: 'EV Charging', icon: 'ev_station', total: 60, occupied: 41, available: 16, status: 'Normal' },
  { type: 'Reserved / VIP', icon: 'local_activity', total: 27, occupied: 8, available: 19, status: 'Reserved' },
  { type: 'Compact Car', icon: 'directions_car_filled', total: 50, occupied: 30, available: 15, status: 'Normal' },
  { type: 'Disabled', icon: 'accessible', total: 22, occupied: 14, available: 6, status: 'Normal' },
]

export const parkingStructureUpdates = [
  { time: '17:32:05', slot: 'B2-18', action: 'Slot released after vehicle exit', staff: 'System', status: 'Updated', highlight: true },
  { time: '16:40:12', slot: 'Floor 1 Zone B', action: 'Occupancy exceeded 80%', staff: 'System', status: 'Warning' },
  { time: '15:22:33', slot: 'EV-04', action: 'Marked as reserved', staff: 'Staff', status: 'Updated' },
  { time: '14:15:44', slot: 'C3-09', action: 'Maintenance check started', staff: 'Maintenance Team', status: 'In Progress' },
  { time: '13:02:56', slot: 'D1-01', action: 'Reserved slot converted to VIP', staff: 'Staff', status: 'Updated' },
]
