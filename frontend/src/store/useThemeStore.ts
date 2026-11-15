import { create } from 'zustand';

export type ThemeMode = 'minimal-light' | 'dark-ai' | 'emerald-navy';

interface ThemeState {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  theme: (localStorage.getItem('lms_theme') as ThemeMode) || 'minimal-light',
  setTheme: (theme) => {
    localStorage.setItem('lms_theme', theme);
    set({ theme });
  },
}));
