"use client";

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { create } from "zustand";
import { persist } from "zustand/middleware";

import { getCurrentSession, type AuthSession } from "@/features/auth/api";
import { ApiResponseError } from "@/shared/api/client";

type AuthState = {
  sessionId: string | null;
  hasHydrated: boolean;
  setSessionId: (sessionId: string) => void;
  clearSessionId: () => void;
  setHasHydrated: (hasHydrated: boolean) => void;
};

export const authKeys = {
  all: ["auth"] as const,
  me: (sessionId: string | null) => [...authKeys.all, "me", sessionId ?? "guest"] as const,
};

export function isAuthSessionExpired(session: AuthSession | null | undefined) {
  if (!session) {
    return true;
  }

  return new Date(session.expiresAt).getTime() <= Date.now();
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      sessionId: null,
      hasHydrated: false,
      setSessionId: (sessionId) => set({ sessionId }),
      clearSessionId: () => set({ sessionId: null }),
      setHasHydrated: (hasHydrated) => set({ hasHydrated }),
    }),
    {
      name: "somabiseo-auth",
      partialize: (state) => ({ sessionId: state.sessionId }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);

export function useAuthSessionQuery() {
  const sessionId = useAuthStore((state) => state.sessionId);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const setSessionId = useAuthStore((state) => state.setSessionId);
  const clearSessionId = useAuthStore((state) => state.clearSessionId);
  const query = useQuery({
    queryKey: authKeys.me(sessionId),
    queryFn: () => getCurrentSession(sessionId),
    enabled: hasHydrated,
    retry: false,
    staleTime: 5 * 60_000,
  });

  useEffect(() => {
    if (!hasHydrated) {
      return;
    }

    if (query.data && isAuthSessionExpired(query.data)) {
      clearSessionId();
    }

    if (query.data && query.data.sessionId !== sessionId) {
      setSessionId(query.data.sessionId);
    }

    if (query.error instanceof ApiResponseError && query.error.status === 401) {
      clearSessionId();
    }
  }, [clearSessionId, hasHydrated, query.data, query.error, sessionId, setSessionId]);

  return {
    ...query,
    isLoading: !hasHydrated || query.isLoading,
    hasHydrated,
    sessionId,
    session: hasHydrated ? query.data ?? null : null,
    isAuthenticated: Boolean(hasHydrated && query.data && !isAuthSessionExpired(query.data)),
    isInviteVerified: Boolean(
      hasHydrated &&
        query.data &&
        !isAuthSessionExpired(query.data) &&
        query.data.inviteVerified,
    ),
  };
}
