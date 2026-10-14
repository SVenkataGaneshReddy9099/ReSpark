import { useSyncExternalStore } from "react";
import { api } from "../services/api";
import type { User } from "../types";

/**
 * Demo identity for this local prototype (no authentication).
 * The chosen user id is persisted in localStorage and shared across pages.
 */
const STORAGE_KEY = "respark.demoUserId";

let currentUser: User | null = null;
const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

function store(id: number | null) {
  if (id === null) localStorage.removeItem(STORAGE_KEY);
  else localStorage.setItem(STORAGE_KEY, String(id));
}

export const demoUserStore = {
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  get: () => currentUser,
  async init() {
    if (currentUser) return currentUser;
    const saved = Number(localStorage.getItem(STORAGE_KEY)) || 1;
    try {
      currentUser = await api.getUser(saved);
    } catch {
      currentUser = await api.listUsers().then((u) => u[0]);
      if (currentUser) store(currentUser.id);
    }
    if (currentUser) store(currentUser.id);
    emit();
    return currentUser;
  },
  async setUser(id: number) {
    currentUser = await api.getUser(id);
    store(id);
    emit();
  },
};

export function useDemoUser(): User | null {
  return useSyncExternalStore(demoUserStore.subscribe, demoUserStore.get, () => null);
}
