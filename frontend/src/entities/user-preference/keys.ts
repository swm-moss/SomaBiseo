export const userPreferenceKeys = {
  all: ["user-preferences"] as const,
  me: (sessionId: string | null) =>
    [...userPreferenceKeys.all, sessionId ?? "guest"] as const,
};
