import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  user: null, // { _id, email, role, token }
  isAuthenticated: false,
  
  login: (userData) => {
    localStorage.setItem('token', userData.token);
    set({ user: userData, isAuthenticated: true });
  },
  
  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, isAuthenticated: false });
  }
}));