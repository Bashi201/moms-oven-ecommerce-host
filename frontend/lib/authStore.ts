import { create } from 'zustand';
import api from '@/lib/api';

interface User {
  id: number;
  username?: string;
  email: string;
  role: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  initializeAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isLoading: true,           // ← important for UI

  login: (token, user) => {
    localStorage.setItem('token', token);
    set({ token, user, isLoading: false });
  },

  logout: () => {
    localStorage.removeItem('token');
    set({ token: null, user: null, isLoading: false });
  },

  initializeAuth: async () => {
    const storedToken = localStorage.getItem('token');
    if (!storedToken) {
      set({ isLoading: false });
      return;
    }

    try {
      // Use the /auth/me protected route to validate token & get fresh user
      const res = await api.get('/auth/me');
      set({
        user: res.data.user,
        token: storedToken,
        isLoading: false
      });
    } catch (err) {
      console.warn('Invalid or expired token → logging out');
      localStorage.removeItem('token');
      set({ user: null, token: null, isLoading: false });
    }
  },
}));