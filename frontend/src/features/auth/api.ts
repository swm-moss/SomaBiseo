import { apiClient, type ApiResponse, unwrapApiResponse } from "@/shared/api/client";

export type PortalLoginResponse = {
  sessionId: string;
  username: string;
  email?: string;
  expiresAt: string;
};

type GoogleConnectUrlResponse = {
  url: string;
};

export async function getGoogleLoginUrl(returnTo: string) {
  return unwrapApiResponse(
    apiClient
      .get("auth/google/connect-url", {
        searchParams: {
          returnTo,
        },
      })
      .json<ApiResponse<GoogleConnectUrlResponse>>(),
  );
}

export async function logoutSomaPortal(sessionId: string): Promise<void> {
  void sessionId;

  return Promise.resolve();
}
