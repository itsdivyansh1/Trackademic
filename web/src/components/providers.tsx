"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useState } from "react";

export function ReactQueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5, // 5 minutes - data is fresh for 5 minutes
            gcTime: 1000 * 60 * 30, // 30 minutes - cache persists for 30 minutes (formerly cacheTime)
            refetchOnWindowFocus: false, // Don't refetch on window focus
            refetchOnReconnect: false, // Don't refetch on reconnect
            retry: 1, // Only retry once on failure
          },
        },
      })
  );
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
