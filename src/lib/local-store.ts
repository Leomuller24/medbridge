import { useCallback, useSyncExternalStore } from "react";

import { type CaseRecord, type NoteRecord, SEED_CASES, SEED_NOTES } from "./medbridge-data";

// Cases and notes live only in the user's browser; nothing here is sent to a server.
// Community content lives in the backend (see src/lib/community.ts).
type Store = { cases: CaseRecord[]; notes: NoteRecord[] };
const KEY = "medbridge-local-v1";
const seed: Store = { cases: SEED_CASES, notes: SEED_NOTES };

let cache: Store | null = null;
const listeners = new Set<() => void>();

function read(): Store {
  if (cache) return cache;
  if (typeof window === "undefined") return seed;
  try {
    const raw = window.localStorage.getItem(KEY);
    const parsed = raw ? (JSON.parse(raw) as Partial<Store> & Record<string, unknown>) : null;
    cache = { cases: parsed?.cases ?? seed.cases, notes: parsed?.notes ?? seed.notes };
    // Drop community data left over from the browser-only version.
    if (parsed && ["posts", "helpful", "activity", "reported", "modLog", "warnings"].some((k) => k in parsed)) {
      window.localStorage.setItem(KEY, JSON.stringify(cache));
    }
  } catch {
    cache = seed;
  }
  return cache;
}

export const getStore = () => read();

export function updateStore(fn: (s: Store) => Store) {
  cache = fn(read());
  window.localStorage.setItem(KEY, JSON.stringify(cache));
  listeners.forEach((l) => l());
}

export function useStore() {
  const subscribe = useCallback((l: () => void) => {
    listeners.add(l);
    return () => listeners.delete(l);
  }, []);
  return useSyncExternalStore(subscribe, read, () => seed);
}

export const newId = () => Math.random().toString(36).slice(2, 10);
