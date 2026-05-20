import {
  ApiResponseError,
  apiClient,
  type ApiResponse,
  unwrapApiResponse,
} from "@/shared/api/client";

export type AuthSession = {
  sessionId: string;
  username: string;
  email: string;
  profileImageUrl?: string | null;
  provider: "GOOGLE";
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

export async function getCurrentSession(sessionId: string) {
  const response = await apiClient.get("auth/me", {
    headers: {
      Authorization: `Bearer ${sessionId}`,
    },
  });
  const payload = await response.json<ApiResponse<AuthSession>>();

  if (!response.ok || !payload.success) {
    throw new ApiResponseError(
      payload.message ?? "로그인 상태를 확인하지 못했어요.",
      response.status,
    );
  }

  return payload.data;
}

export async function logoutGoogleSession(sessionId: string): Promise<void> {
  const response = await apiClient.delete("auth/logout", {
    headers: {
      Authorization: `Bearer ${sessionId}`,
    },
  });
  const payload = await response.json<ApiResponse<null>>();

  if (!response.ok || !payload.success) {
    throw new ApiResponseError(payload.message ?? "로그아웃하지 못했어요.", response.status);
  }
}
