export async function getBuildings() {
  return [{ id: 'b1', name: 'Main Parking Building' }]
}

export async function getFloors() {
  return [{ id: 'f1', name: 'Floor 1' }, { id: 'f2', name: 'Floor 2' }]
}

export async function getZones() {
  return [{ id: 'z1', name: 'Zone A' }, { id: 'z2', name: 'Zone B' }]
}

export async function getParkingMap() {
  return {
    summary: { totalSlots: 120, available: 68, occupied: 42, reserved: 6, maintenance: 4, occupancyRate: 35 },
    slots: [
      { id: 'A-01', slotCode: 'A-01', status: 'Available', type: 'Car', building: 'Main Parking Building', floor: 'Floor 1', zone: 'Zone A' },
      { id: 'A-02', slotCode: 'A-02', status: 'Occupied', type: 'Car', vehicle: '51A-123.45', building: 'Main Parking Building', floor: 'Floor 1', zone: 'Zone A' }
    ],
    updates: []
  }
}

export async function updateParkingSlot(id, status) {
  return { slot: { id, status }, update: { id, status, time: 'Now' } }
}
