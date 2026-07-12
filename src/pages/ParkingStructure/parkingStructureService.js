import {
  parkingStructureOverview,
  parkingStructureZones,
  parkingStructureSlotTypes,
  parkingStructureUpdates,
} from '../../mock-data/parkingStructure'

export const getParkingStructureOverview = () => parkingStructureOverview
export const getParkingStructureZones = () => parkingStructureZones
export const getParkingStructureSlotTypes = () => parkingStructureSlotTypes
export const getParkingStructureUpdates = () => parkingStructureUpdates

export const filterParkingZones = (items, { query, floor, zone }) => {
  const keyword = query.trim().toLowerCase()

  return items.filter((item) => {
    const matchesSearch = !keyword || [item.location, item.zone, item.type]
      .some((value) => value.toLowerCase().includes(keyword))
    const matchesFloor = floor === 'All Floors' || item.location.toLowerCase().includes(floor.toLowerCase())
    const matchesZone = zone === 'All Zones' || item.zone === zone

    return matchesSearch && matchesFloor && matchesZone
  })
}
