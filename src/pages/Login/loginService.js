import { demoUsers, mockUsers } from '../../mock-data/users'

export const getDemoUsers = () => demoUsers

export const login = ({ email, password }) => {
  if (!email || !password) {
    return { success: false, message: 'Please enter your email and password.' }
  }

  const user = mockUsers.find((item) => item.email.toLowerCase() === email.toLowerCase() && item.password === password)

  if (!user) {
    return { success: false, message: 'Invalid email or password.' }
  }

  return { success: true, user }
}
