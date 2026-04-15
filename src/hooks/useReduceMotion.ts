import {useEffect, useState} from 'react';
import {AccessibilityInfo} from 'react-native';

/**
 * Returns true when the user has enabled "Reduce Motion" in system settings.
 *
 * iOS:  Settings → Accessibility → Motion → Reduce Motion
 * Android: Settings → Accessibility → Remove animations
 *
 * When true, animation hooks skip their Animated sequences and snap to the
 * final value immediately, satisfying WCAG 2.3.3 (AAA) and the more commonly
 * required iOS / Android platform accessibility guidelines.
 *
 * Subscribes to system changes so toggling the setting takes effect without
 * an app restart. Subscription is removed on unmount to prevent memory leaks.
 */
export const useReduceMotion = (): boolean => {
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    // Read the current value once on mount
    AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion);

    // Keep in sync if the user toggles the setting while the app is open
    const subscription = AccessibilityInfo.addEventListener(
      'reduceMotionChanged',
      setReduceMotion,
    );
    return () => subscription.remove();
  }, []);

  return reduceMotion;
};
