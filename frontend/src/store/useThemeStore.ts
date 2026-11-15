import { create } from 'zustand';

export type ThemeMode = 'emerald-navy' | 'dark-ai' | 'minimal-light';

interface ThemeState {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
  theme: (localStorage.getItem('lms_theme') as ThemeMode) || 'emerald-navy',
  setTheme: (theme) => {
    localStorage.setItem('lms_theme', theme);
    set({ theme });
  },
}));
