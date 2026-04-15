import React from 'react';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';

/**
 * Creates an isolated QueryClient per test.
 * - retry: false  → no automatic retries; errors surface immediately
 * - gcTime: 0     → no caching between tests
 */
export const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      // gcTime: 0 causes TanStack Query's GC timer to fire between setQueryData
      // and the optimistic onMutate write, clearing seeded test data. Use 5 min
      // instead — data isolation is guaranteed because each test gets a fresh client.
      queries: {retry: false, gcTime: 5 * 60_000},
      mutations: {retry: false},
    },
  });

/**
 * React wrapper that provides a fresh QueryClient to each test.
 * Pass to renderHook's `wrapper` option or wrap render() calls.
 */
export const createWrapper = (queryClient?: QueryClient) => {
  const client = queryClient ?? createTestQueryClient();
  return ({children}: {children: React.ReactNode}) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
};
