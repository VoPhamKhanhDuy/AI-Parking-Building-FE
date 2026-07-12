import axios from 'axios'
import { mockRecentExits } from '../../mock-data/vehicleExitData'

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api', timeout: 8000 })
const useMockData = import.meta.env.VITE_USE_MOCK_DATA !== 'false'
const wait = (value, delay = 250) => new Promise((resolve) => setTimeout(() => resolve(value), delay))
const money = (value) => new Intl.NumberFormat('vi-VN').format(value || 0) + ' VND'

export async function getExitCompletion(session) {
  if (!useMockData) { const { data } = await api.get(`/vehicle-exits/${session.id}/completion`); return data.data || data }
  const amount = (session.baseFee || 0) + (session.surcharge || 0)
  const exitTime = session.exitTime || new Date().toLocaleString('vi-VN', { hour12: false })
  return wait({
    session: { ...session, exitTime, paymentStatus: 'Paid', status: 'Completed' },
    receipt: { id: `PAY-${new Date().getFullYear()}-${String(session.id || 1).padStart(6, '0')}`, baseFee: money(session.baseFee), surcharge: money(session.surcharge), discount: '0 VND', totalPaid: money(amount), method: session.paymentMethod || 'QR Payment', staff: 'Parking Staff' },
    slotRelease: { slotId: session.slotId, previousStatus: 'Occupied', newStatus: 'Available', sessionStatus: 'Closed', logStatus: 'Saved' },
    checks: ['Ticket verified', 'Fee calculated', 'Payment completed', 'Vehicle exit confirmed', `Slot ${session.slotId} released`, 'Session closed', 'Transaction log saved'],
    recentExits: mockRecentExits.filter((item) => ['Exited', 'Completed', 'Paid'].includes(item.status)).slice(0, 3),
  })
}

export const formatPaidAmount = money
