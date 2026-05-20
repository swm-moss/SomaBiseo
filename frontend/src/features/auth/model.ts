"use client";

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { create } from "zustand";
import { persist } from "zustand/middleware";

import { getCurrentSession, type AuthSession } from "@/features/auth/api";
import { ApiResponseError } from "@/shared/api/client";

type AuthState = {
  sessionId: string | null;
  setSessionId: (sessionId: string) => void;
  clearSessionId: () => void;
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
      setSessionId: (sessionId) => set({ sessionId }),
      clearSessionId: () => set({ sessionId: null }),
    }),
    {
      name: "somabiseo-auth",
      partialize: (state) => ({ sessionId: state.sessionId }),
    },
  ),
);

export function useAuthSessionQuery() {
  const sessionId = useAuthStore((state) => state.sessionId);
  const clearSessionId = useAuthStore((state) => state.clearSessionId);
  const query = useQuery({
    queryKey: authKeys.me(sessionId),
    queryFn: () => getCurrentSession(sessionId!),
    enabled: Boolean(sessionId),
    retry: false,
    staleTime: 5 * 60_000,
  });

  useEffect(() => {
    if (query.data && isAuthSessionExpired(query.data)) {
      clearSessionId();
    }

    if (query.error instanceof ApiResponseError && query.error.status === 401) {
      clearSessionId();
    }
  }, [clearSessionId, query.data, query.error]);

  return {
    ...query,
    sessionId,
    session: query.data ?? null,
    isAuthenticated: Boolean(sessionId && query.data && !isAuthSessionExpired(query.data)),
  };
}
