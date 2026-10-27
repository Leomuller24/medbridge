export type AppRole = "provider" | "patient";
const KEY = "medbridge-role";

export function getStoredRole(): AppRole | null {
  if (typeof window === "undefined") return null;
  const v = window.localStorage.getItem(KEY);
  return v === "provider" || v === "patient" ? v : null;
}

export function setStoredRole(role: AppRole) {
  window.localStorage.setItem(KEY, role);
}

export function clearStoredRole() {
  window.localStorage.removeItem(KEY);
}
