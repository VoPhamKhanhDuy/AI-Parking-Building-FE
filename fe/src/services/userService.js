import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 10000
})

const useMockData = import.meta.env.VITE_USE_MOCK_DATA !== 'false'

// Add auth header
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('parking_access_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// ==================== User APIs ====================

// Get all users
export async function getUsers() {
  if (useMockData) {
    return { success: true, data: getMockUsers() }
  }
  try {
    const { data } = await api.get('/users')
    const items = Array.isArray(data) ? data : (Array.isArray(data?.value) ? data.value : (Array.isArray(data?.items) ? data.items : []))
    return { success: true, data: items }
  } catch (error) {
    return { success: false, message: extractErrorMessage(error, 'Failed to load users') }
  }
}

// Get user by ID
export async function getUserById(id) {
  if (useMockData) {
    const user = getMockUsers().find(u => u.id === id)
    return { success: true, data: user }
  }
  try {
    const { data } = await api.get(`/users/${id}`)
    return { success: true, data }
  } catch (error) {
    return { success: false, message: extractErrorMessage(error, 'User not found') }
  }
}

// Create new user
export async function createUser(userData) {
  if (useMockData) {
    const newUser = {
      id: 'user-' + Date.now(),
      ...userData,
      status: 'Active',
      createdAt: new Date().toISOString()
    }
    return { success: true, data: newUser }
  }
  try {
    const { data } = await api.post('/users', userData)
    return { success: true, data }
  } catch (error) {
    return { success: false, message: extractErrorMessage(error, 'Failed to create user') }
  }
}

// Update user
export async function updateUser(id, userData) {
  if (useMockData) {
    return { success: true, data: { id, ...userData } }
  }
  try {
    const { data } = await api.put(`/users/${id}`, userData)
    return { success: true, data }
  } catch (error) {
    return { success: false, message: extractErrorMessage(error, 'Failed to update user') }
  }
}

// Update user status (suspend/activate)
export async function updateUserStatus(id, status) {
  if (useMockData) {
    return { success: true, data: { id, status } }
  }
  try {
    const { data } = await api.patch(`/users/${id}/status`, { status })
    return { success: true, data }
  } catch (error) {
    return { success: false, message: extractErrorMessage(error, 'Failed to update user status') }
  }
}

// Delete user
export async function deleteUser(id) {
  if (useMockData) {
    return { success: true }
  }
  try {
    await api.delete(`/users/${id}`)
    return { success: true }
  } catch (error) {
    return { success: false, message: extractErrorMessage(error, 'Failed to delete user') }
  }
}

// ==================== Role APIs ====================

// Get roles
export async function getRoles() {
  if (useMockData) {
    return {
      success: true,
      data: [
        { id: 'admin', name: 'Admin', description: 'Full system access' },
        { id: 'manager', name: 'Manager', description: 'Facility management' },
        { id: 'operator', name: 'Operator', description: 'Operational staff' },
        { id: 'attendant', name: 'Attendant', description: 'Entry/exit staff' }
      ]
    }
  }
  try {
    const { data } = await api.get('/roles')
    return { success: true, data }
  } catch (error) {
    return { success: false, message: extractErrorMessage(error, 'Failed to load roles') }
  }
}

// ==================== Error helpers ====================

function extractErrorMessage(error, fallback) {
  const payload = error.response?.data
  return (
    payload?.error?.message ||
    payload?.message ||
    payload?.title ||
    error.message ||
    fallback
  )
}

// ==================== Mock Data ====================

function getMockUsers() {
  return [
    {
      id: 'user-1',
      name: 'Trần Thanh Vân',
      email: 'admin@parking.vn',
      role: 'Admin',
      area: 'System Wide',
      status: 'Active',
      lastLogin: 'Today 09:30',
      createdAt: '2026-01-15'
    },
    {
      id: 'user-2',
      name: 'Nguyễn Minh Tuấn',
      email: 'manager@parking.vn',
      role: 'Manager',
      area: 'Building A',
      status: 'Active',
      lastLogin: 'Today 08:45',
      createdAt: '2026-02-20'
    },
    {
      id: 'user-3',
      name: 'Lê Hoàng Nam',
      email: 'staff1@parking.vn',
      role: 'Attendant',
      area: 'Entry Gate A',
      status: 'Active',
      lastLogin: 'Yesterday 17:30',
      createdAt: '2026-03-10'
    },
    {
      id: 'user-4',
      name: 'Phạm Thị Hương',
      email: 'staff2@parking.vn',
      role: 'Attendant',
      area: 'Entry Gate B',
      status: 'Active',
      lastLogin: 'Yesterday 18:00',
      createdAt: '2026-03-12'
    },
    {
      id: 'user-5',
      name: 'Đặng Văn Hùng',
      email: 'operator1@parking.vn',
      role: 'Operator',
      area: 'Building A',
      status: 'Active',
      lastLogin: 'Today 07:00',
      createdAt: '2026-04-01'
    },
    {
      id: 'user-6',
      name: 'Bùi Thị Lan',
      email: 'suspended@parking.vn',
      role: 'Attendant',
      area: 'Entry Gate C',
      status: 'Suspended',
      lastLogin: '2026-06-28',
      createdAt: '2026-05-15'
    }
  ]
}
