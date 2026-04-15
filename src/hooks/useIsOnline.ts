import {useEffect, useState} from 'react';
import {onlineManager} from '@tanstack/react-query';

/**
 * Subscribes to TanStack Query's onlineManager so components can react to
 * online / offline transitions.
 *
 * The onlineManager is configured in QueryProvider to track AppState changes
 * (foreground ↔ background).  When the app returns to the foreground, TanStack
 * Query automatically retries paused queries — this hook just surfaces the
 * current status for UI feedback (e.g. the OfflineBanner component).
 */
export const useIsOnline = (): boolean => {
  const [isOnline, setIsOnline] = useState(() => onlineManager.isOnline());

  useEffect(() => {
    const unsubscribe = onlineManager.subscribe(online => {
      setIsOnline(online);
    });
    return unsubscribe;
  }, []);

  return isOnline;
};
