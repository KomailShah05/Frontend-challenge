import React from 'react';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';

/**
 * Factory function so each test environment gets a fresh QueryClient,
 * preventing state leaking between test cases.
 */
export const createQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        // Keep unused data in cache for 2 minutes before GC
        gcTime: 2 * 60_000,
        retry: 2,
        // Exponential back-off: 1s → 2s → 4s … capped at 30s
        retryDelay: attempt => Math.min(1_000 * 2 ** attempt, 30_000),
      },
      mutations: {
        // Never auto-retry mutations — surface errors to the user immediately
        retry: 0,
      },
    },
  });

// Singleton for production use
const queryClient = createQueryClient();

export const QueryProvider = ({children}: {children: React.ReactNode}) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);
