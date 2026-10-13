import { useCallback, useSyncExternalStore } from "react";

import { type CaseRecord, type NoteRecord, type Post, SEED_CASES, SEED_NOTES, SEED_POSTS } from "./medbridge-data";
import type { Activity } from "./posting-rules";

// Everything here lives only in the user's browser; nothing is sent to a server.
type Store = { cases: CaseRecord[]; notes: NoteRecord[]; posts: Post[]; helpful: string[]; activity: Activity[] };
const KEY = "medbridge-local-v1";
const seed: Store = { cases: SEED_CASES, notes: SEED_NOTES, posts: SEED_POSTS, helpful: [], activity: [] };

let cache: Store | null = null;
const listeners = new Set<() => void>();

function read(): Store {
  if (cache) return cache;
  if (typeof window === "undefined") return seed;
  try {
    const raw = window.localStorage.getItem(KEY);
    cache = raw ? { ...seed, ...(JSON.parse(raw) as Store) } : seed;
  } catch {
    cache = seed;
  }
  return cache;
}

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
