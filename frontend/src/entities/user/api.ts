import type { User } from "@/entities/user/model";
import { apiClient, type ApiResponse, unwrapApiResponse } from "@/shared/api/client";

type AuthMeResponse = {
  sessionId: string;
  username: string;
  email: string;
  profileImageUrl?: string | null;
  provider: "GOOGLE";
  expiresAt: string;
};

export async function getCurrentUser(sessionId: string) {
  const session = await unwrapApiResponse(
    apiClient
      .get("me", {
        headers: {
          Authorization: `Bearer ${sessionId}`,
        },
      })
      .json<ApiResponse<AuthMeResponse>>(),
  );

  return {
    id: session.sessionId,
    email: session.email,
    name: session.username,
    profileImageUrl: session.profileImageUrl ?? undefined,
    provider: session.provider,
  } satisfies User;
}
