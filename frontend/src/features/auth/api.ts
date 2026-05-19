export type PortalLoginRequest = {
  email: string;
  name: string;
};

export type PortalLoginResponse = {
  sessionId: string;
  username: string;
  expiresAt: string;
};

export async function loginSomaPortal(request: PortalLoginRequest): Promise<PortalLoginResponse> {
  const sessionId =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString();

  return {
    sessionId,
    username: request.name.trim() || request.email,
    expiresAt,
  };
}

export async function logoutSomaPortal(sessionId: string): Promise<void> {
  void sessionId;

  return Promise.resolve();
}
