import { QueryClient } from "@tanstack/react-query";

export const SERVER_STATE_STALE_TIME = 60_000;
export const SERVER_STATE_GC_TIME = 5 * 60_000;

export function createAppQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: SERVER_STATE_STALE_TIME,
        gcTime: SERVER_STATE_GC_TIME,
        refetchOnWindowFocus: false,
        retry: 1,
      },
      mutations: {
        retry: 0,
      },
    },
  });
}
