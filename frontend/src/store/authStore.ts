import { create } from "zustand";
import { api } from "../lib/api";
import type { User } from "../types";

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  fetchMe: () => Promise<void>;
  login: (emailOrUsername: string, password: string) => Promise<void>;
  register: (data: { username: string; email: string; password: string; full_name?: string }) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,

  fetchMe: async () => {
    try {
      const res = await api.get("/auth/me");
      set({ user: res.data.user, isAuthenticated: true, isLoading: false });
    } catch {
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  login: async (emailOrUsername, password) => {
    const res = await api.post("/auth/login", { emailOrUsername, password });
    set({ user: res.data.user, isAuthenticated: true });
  },

  register: async (data) => {
    const res = await api.post("/auth/register", data);
    set({ user: res.data.user, isAuthenticated: true });
  },

  logout: async () => {
    await api.post("/auth/logout");
    set({ user: null, isAuthenticated: false });
  },

  setUser: (user) => set({ user }),
}));
