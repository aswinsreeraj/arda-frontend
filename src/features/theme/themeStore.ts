import { create } from 'zustand';

export type ThemeMode = 'dark';

interface ThemeState {
  theme: 'dark';
  resolvedTheme: 'dark';
  setTheme: (mode: string) => void;
  toggleTheme: () => void;
}

if (typeof document !== 'undefined') {
  document.documentElement.classList.add('dark');
  try {
    localStorage.removeItem('arda_theme');
  } catch {
    // ignore
  }
}

export const useThemeStore = create<ThemeState>(() => ({
  theme: 'dark',
  resolvedTheme: 'dark',
  setTheme: () => {
    if (typeof document !== 'undefined') {
      document.documentElement.classList.add('dark');
    }
  },
  toggleTheme: () => {},
}));
