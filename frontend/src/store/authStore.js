import { create } from 'zustand';

const storedToken = localStorage.getItem('token');
const storedUser = localStorage.getItem('authUser');

export const useAuthStore = create((set) => ({
  user: storedUser ? JSON.parse(storedUser) : null,
  isAuthenticated: Boolean(storedToken),
  
  login: (userData) => {
    localStorage.setItem('token', userData.token);
    localStorage.setItem('authUser', JSON.stringify(userData));
    set({ user: userData, isAuthenticated: true });
  },
  
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('authUser');
    set({ user: null, isAuthenticated: false });
  }
}));