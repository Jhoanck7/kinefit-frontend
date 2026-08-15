"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode } from "react";

import { ApiError } from "@/lib/api/apiClient";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error: unknown) => {
        if (error instanceof ApiError) {
          if (
            error.status >= 400 &&
            error.status < 500 &&
            error.status !== 408
          ) {
            return false;
          }
        }
        return failureCount < 3;
      },
      refetchOnWindowFocus: true,
    },
  },
});

export function ReactQueryProvider({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
