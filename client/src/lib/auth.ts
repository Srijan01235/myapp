import type { Admin } from "@shared/schema";

const ADMIN_KEY = "restaurant_admin";

export const authStorage = {
  getAdmin: (): Admin | null => {
    try {
      const stored = localStorage.getItem(ADMIN_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  },

  setAdmin: (admin: Admin) => {
    localStorage.setItem(ADMIN_KEY, JSON.stringify(admin));
  },

  removeAdmin: () => {
    localStorage.removeItem(ADMIN_KEY);
  },

  isAuthenticated: (): boolean => {
    return authStorage.getAdmin() !== null;
  }
};
