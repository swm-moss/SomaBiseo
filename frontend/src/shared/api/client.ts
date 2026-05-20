import ky from "ky";

export type ApiResponse<T> = {
  success: boolean;
  data: T;
  message: string | null;
};

export class ApiResponseError extends Error {
  constructor(
    message: string,
    readonly status?: number,
  ) {
    super(message);
    this.name = "ApiResponseError";
  }
}

export const apiClient = ky.create({
  prefix: process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080/api",
  credentials: "include",
  throwHttpErrors: false,
  timeout: 10_000,
  hooks: {
    beforeRequest: [
      ({ request }) => {
        if (request.headers.has("Authorization")) {
          return;
        }

        const sessionId = readStoredSessionId();

        if (sessionId) {
          request.headers.set("Authorization", `Bearer ${sessionId}`);
        }
      },
    ],
  },
});

export async function unwrapApiResponse<T>(responsePromise: Promise<ApiResponse<T>>) {
  const response = await responsePromise;

  if (!response.success) {
    throw new ApiResponseError(response.message ?? "요청을 처리하지 못했습니다.");
  }

  return response.data;
}

function readStoredSessionId() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.localStorage.getItem("somabiseo-auth");

    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as { state?: { sessionId?: unknown } };
    const sessionId = parsed.state?.sessionId;

    return typeof sessionId === "string" && sessionId.trim() ? sessionId : null;
  } catch {
    return null;
  }
}
