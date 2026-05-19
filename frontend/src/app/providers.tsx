"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { useState } from "react";
import { Toaster } from "sonner";

import { createAppQueryClient } from "@/shared/api/query-client";

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => createAppQueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster richColors position="top-center" />
    </QueryClientProvider>
  );
}
