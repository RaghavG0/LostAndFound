export interface User {
  user_id: number;
  email: string;
}

const USER_KEY = "bits_lf_user";

function isBrowser() {
  return typeof window !== "undefined";
}

export function getStoredUser(): User | null {
  if (!isBrowser()) return null;

  try {
    const stored = window.localStorage.getItem(USER_KEY);
    if (!stored) return null;
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

export function storeUser(user: User): void {
  if (!isBrowser()) return;
  window.localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearUser(): void {
  if (!isBrowser()) return;
  window.localStorage.removeItem(USER_KEY);
}

export function isLoggedIn(): boolean {
  return getStoredUser() !== null;
}
