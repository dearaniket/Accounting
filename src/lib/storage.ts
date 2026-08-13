import { AppData } from "@/lib/types";

export const STORAGE_KEY = "house-ledger-app-data";

export function saveToStorage(data: AppData) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function loadFromStorage() {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  return raw ? (JSON.parse(raw) as AppData) : null;
}
