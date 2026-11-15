import { create } from 'zustand';

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  roles: string[];
  avatarUrl?: string;
  streak?: { current: number; longest: number };
}

interface AuthState {
  token: string | null;
  user: UserProfile | null;
  activeRole: 'student' | 'instructor' | 'admin';
  setAuth: (token: string, user: UserProfile) => void;
  logout: () => void;
  setActiveRole: (role: 'student' | 'instructor' | 'admin') => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: localStorage.getItem('lms_token') || 'demo-token',
  user: {
    id: 'student-uuid-1',
    fullName: 'Ananya Sharma',
    email: 'student@example.com',
    roles: ['student'],
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    streak: { current: 5, longest: 12 },
  },
  activeRole: 'student',

  setAuth: (token, user) => {
    localStorage.setItem('lms_token', token);
    const primaryRole = (user.roles[0] as any) || 'student';
    set({ token, user, activeRole: primaryRole });
  },

  logout: () => {
    localStorage.removeItem('lms_token');
    set({ token: null, user: null });
  },

  setActiveRole: (role) => set({ activeRole: role }),
}));
