import React from 'react';
import {QueryProvider} from './QueryProvider';
import {SubIdProvider} from './SubIdProvider';

/**
 * Composes all app-level providers in a single wrapper.
 * Order matters: QueryProvider wraps SubIdProvider so that
 * SubIdProvider can use React Query internally if needed later.
 */
export const AppProviders = ({children}: {children: React.ReactNode}) => (
  <QueryProvider>
    <SubIdProvider>{children}</SubIdProvider>
  </QueryProvider>
);
