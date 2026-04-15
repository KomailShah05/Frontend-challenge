import React from 'react';
import {AppState} from 'react-native';
import {onlineManager, QueryClient, QueryClientProvider} from '@tanstack/react-query';

/**
 * Wire TanStack Query's onlineManager to React Native's AppState.
 *
 * By default, TanStack Query uses navigator.onLine which is always true in
 * React Native.  Replacing the event listener with AppState means:
 *   • Queries pause when the app moves to the background (no wasted retries)
 *   • Queries auto-resume / retry when the app returns to the foreground
 *
 * Note: this detects foreground/background, not true network connectivity.
 * For real connectivity detection, @react-native-community/netinfo would be
 * needed — but pausing on background already covers the most common offline
 * scenario (device in pocket / screen off).
 */
onlineManager.setEventListener(setOnline => {
  const subscription = AppState.addEventListener('change', state => {
    setOnline(state === 'active');
  });
  return subscription.remove;
});

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
        // Don't refetch on window focus — handled by useFocusEffect in screens
        refetchOnWindowFocus: false,
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
