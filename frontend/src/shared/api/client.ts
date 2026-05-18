import ky from "ky";

export const apiClient = ky.create({
  prefix: process.env.NEXT_PUBLIC_API_BASE_URL ?? "/api",
  credentials: "include",
  timeout: 10_000,
});
