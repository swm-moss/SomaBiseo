import { apiClient, type ApiResponse, unwrapApiResponse } from "@/shared/api/client";

export type PortalLoginRequest = {
  username: string;
  password: string;
};

export type PortalLoginResponse = {
  sessionId: string;
  username: string;
  expiresAt: string;
};

export async function loginSomaPortal(request: PortalLoginRequest) {
  return unwrapApiResponse(
    apiClient
      .post("soma/login", {
        json: request,
      })
      .json<ApiResponse<PortalLoginResponse>>(),
  );
}

export async function logoutSomaPortal(sessionId: string) {
  await unwrapApiResponse(
    apiClient
      .delete("soma/logout", {
        searchParams: {
          sessionId,
        },
      })
      .json<ApiResponse<null>>(),
  );
}
