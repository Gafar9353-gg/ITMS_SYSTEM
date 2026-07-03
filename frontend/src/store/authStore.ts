import { create } from 'zustand';
import axios from '../api/axios';

interface User {
  id: number;
  email: string;
  name: string;
  role: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem('token'),
  isLoading: false,
  error: null,

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await axios.post('/auth/login', { email, password });
      
      if (response.data.success) {
        localStorage.setItem('token', response.data.token);
        set({
          user: response.data.user,
          token: response.data.token,
          isLoading: false,
          error: null
        });
        return true;
      } else {
        set({
          isLoading: false,
          error: response.data.message || 'Login failed'
        });
        return false;
      }
    } catch (error: any) {
      console.error('Login error:', error);
      set({
        isLoading: false,
        error: error.response?.data?.message || error.message || 'Login failed'
      });
      return false;
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null, error: null });
  },

  clearError: () => {
    set({ error: null });
  }
}));