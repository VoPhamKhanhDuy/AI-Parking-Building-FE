import { MOCK_USERS } from '../../mock-data/users';

export const loginService = {
  login: (email, password) => {
    const user = MOCK_USERS.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );
    if (user) {
      localStorage.setItem('aps_user', JSON.stringify(user));
      return { success: true, user };
    }
    return { success: false, message: 'Invalid email or password' };
  },

  getCurrentUser: () => {
    const cached = localStorage.getItem('aps_user');
    return cached ? JSON.parse(cached) : null;
  },

  logout: () => {
    localStorage.removeItem('aps_user');
  },
};
