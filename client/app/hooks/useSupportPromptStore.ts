import { create } from 'zustand';

const NEXT_PROMPT_STORAGE_KEY = 'hydrodane.support.nextPromptAt';
const STATIONS_STORAGE_KEY = 'hydrodane.support.sessionStations';
const sessionStations = new Set<number>();
let nextPromptAt = 0;

function getNextPromptDate(now: number) {
  const date = new Date(now);
  const day = date.getDate();
  date.setDate(1);
  date.setMonth(date.getMonth() + 3);
  const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  date.setDate(Math.min(day, lastDay));
  return date.getTime();
}

interface SupportPromptStore {
  opened: boolean;
  requestPrompt: () => void;
  recordStationSelection: (stationId: number) => void;
  close: () => void;
}

export const useSupportPromptStore = create<SupportPromptStore>((set, get) => ({
  opened: false,
  requestPrompt: () => {
    if (typeof window === 'undefined' || get().opened) return;

    const now = Date.now();
    try {
      const stored = Number(window.localStorage.getItem(NEXT_PROMPT_STORAGE_KEY));
      if (Number.isFinite(stored)) nextPromptAt = Math.max(nextPromptAt, stored);
    } catch {
      // Keep the cooldown in memory when browser storage is unavailable.
    }

    if (now < nextPromptAt) return;

    nextPromptAt = getNextPromptDate(now);
    try {
      window.localStorage.setItem(NEXT_PROMPT_STORAGE_KEY, String(nextPromptAt));
    } catch {
      // The in-memory cooldown still prevents repeated prompts on this page.
    }
    set({ opened: true });
  },
  recordStationSelection: (stationId) => {
    if (typeof window === 'undefined') return;

    try {
      const stored: unknown = JSON.parse(window.sessionStorage.getItem(STATIONS_STORAGE_KEY) ?? '[]');
      if (Array.isArray(stored)) {
        stored.forEach((id: unknown) => {
          if (typeof id === 'number' && Number.isInteger(id) && id > 0) sessionStations.add(id);
        });
      }
    } catch {
      // Count selections in memory if session storage is unavailable or invalid.
    }

    if (sessionStations.has(stationId)) return;
    sessionStations.add(stationId);
    try {
      window.sessionStorage.setItem(STATIONS_STORAGE_KEY, JSON.stringify(Array.from(sessionStations)));
    } catch {
      // Station selection must also work without browser storage.
    }

    if (sessionStations.size >= 2) get().requestPrompt();
  },
  close: () => set({ opened: false }),
}));
