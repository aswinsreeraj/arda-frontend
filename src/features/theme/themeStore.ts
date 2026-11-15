import { create } from 'zustand';

export type ThemeMode = 'dark' | 'light' | 'system';

interface ThemeState {
  theme: ThemeMode;
  resolvedTheme: 'dark' | 'light';
  setTheme: (mode: ThemeMode) => void;
  toggleTheme: () => void;
}

const STORAGE_KEY = 'arda_theme';

function getSystemPreference(): 'dark' | 'light' {
  if (typeof window === 'undefined') return 'dark';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function resolveTheme(mode: ThemeMode): 'dark' | 'light' {
  if (mode === 'system') return getSystemPreference();
  return mode;
}

function applyThemeToDOM(resolved: 'dark' | 'light') {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  if (resolved === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
}

// Initial theme from storage or default to 'dark'
const initialTheme: ThemeMode =
  typeof window !== 'undefined'
    ? ((localStorage.getItem(STORAGE_KEY) as ThemeMode) || 'dark')
    : 'dark';

const initialResolved = resolveTheme(initialTheme);
applyThemeToDOM(initialResolved);

export const useThemeStore = create<ThemeState>((set, get) => {
  // Listen for system changes if in system mode
  if (typeof window !== 'undefined') {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', () => {
      const current = get().theme;
      if (current === 'system') {
        const resolved = getSystemPreference();
        applyThemeToDOM(resolved);
        set({ resolvedTheme: resolved });
      }
    });
  }

  return {
    theme: initialTheme,
    resolvedTheme: initialResolved,
    setTheme: (mode: ThemeMode) => {
      const resolved = resolveTheme(mode);
      applyThemeToDOM(resolved);
      try {
        localStorage.setItem(STORAGE_KEY, mode);
      } catch {
        // ignore storage error
      }
      set({ theme: mode, resolvedTheme: resolved });
    },
    toggleTheme: () => {
      const current = get().resolvedTheme;
      const nextTheme = current === 'dark' ? 'light' : 'dark';
      get().setTheme(nextTheme);
    },
  };
});
