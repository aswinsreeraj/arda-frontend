import { create } from 'zustand';
import type { RunDetail } from './types';

interface RunsState {
  runs: RunDetail[];
  selectedRunId: string | null;
  addRun: (run: RunDetail) => void;
  updateRun: (id: string, updates: Partial<RunDetail>) => void;
  setSelectedRunId: (id: string | null) => void;
  setRuns: (runs: RunDetail[]) => void;
}

const STORAGE_KEY = 'arda_runs_cache';

const loadSavedRuns = (): RunDetail[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {
    // ignore
  }
  return [];
};

export const useRunsStore = create<RunsState>((set, get) => ({
  runs: loadSavedRuns(),
  selectedRunId: null,

  setRuns: (runs: RunDetail[]) => {
    set({ runs });
  },

  addRun: (run: RunDetail) => {
    const updated = [run, ...get().runs.filter((r) => r.id !== run.id)];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated.slice(0, 100)));
    set({ runs: updated, selectedRunId: run.id });
  },

  updateRun: (id: string, updates: Partial<RunDetail>) => {
    const updated = get().runs.map((r) => (r.id === id ? { ...r, ...updates } : r));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated.slice(0, 100)));
    set({ runs: updated });
  },

  setSelectedRunId: (id: string | null) => {
    set({ selectedRunId: id });
  },
}));
