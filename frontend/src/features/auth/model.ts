import { create } from "zustand";
import { persist } from "zustand/middleware";

export type PortalSession = {
  sessionId: string;
  username: string;
  expiresAt: string;
};

type PortalAuthState = {
  session: PortalSession | null;
  setSession: (session: PortalSession) => void;
  clearSession: () => void;
};

export function isPortalSessionExpired(session: PortalSession | null) {
  if (!session) {
    return true;
  }

  return new Date(session.expiresAt).getTime() <= Date.now();
}

export const usePortalAuthStore = create<PortalAuthState>()(
  persist(
    (set) => ({
      session: null,
      setSession: (session) => set({ session }),
      clearSession: () => set({ session: null }),
    }),
    {
      name: "somabiseo-app-session",
    },
  ),
);
