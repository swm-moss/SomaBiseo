import ky from "ky";

export type ApiResponse<T> = {
  success: boolean;
  data: T;
  message: string | null;
};

export class ApiResponseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ApiResponseError";
  }
}

export const apiClient = ky.create({
  prefix: process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080/api",
  credentials: "include",
  throwHttpErrors: false,
  timeout: 10_000,
});

export async function unwrapApiResponse<T>(responsePromise: Promise<ApiResponse<T>>) {
  const response = await responsePromise;

  if (!response.success) {
    throw new ApiResponseError(response.message ?? "요청을 처리하지 못했습니다.");
  }

  return response.data;
}
