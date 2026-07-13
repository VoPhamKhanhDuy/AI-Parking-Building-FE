import axios from 'axios'
import { parkingStructureData } from '../../mock-data/parkingStructureData'

export async function getParkingStructure() {
  if (import.meta.env.VITE_USE_MOCK_DATA !== 'false') return Promise.resolve(parkingStructureData)
  const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/manager/parking-structure`)
  return data
}

export async function updateZone(zoneId, changes) {
  if (import.meta.env.VITE_USE_MOCK_DATA !== 'false') return Promise.resolve({ success: true, zoneId, ...changes })
  const { data } = await axios.patch(`${import.meta.env.VITE_API_URL}/manager/parking-structure/zones/${zoneId}`, changes)
  return data
}
