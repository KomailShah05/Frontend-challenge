import {useEffect, useState} from 'react';
import {AccessibilityInfo} from 'react-native';

/**
 * Returns true when VoiceOver (iOS) or TalkBack (Android) is active.
 *
 * Used to adjust FlatList behaviour (disable removeClippedSubviews, increase
 * windowSize) so screen readers can reach every element in the list.
 */
export const useIsScreenReaderEnabled = (): boolean => {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    AccessibilityInfo.isScreenReaderEnabled().then(setEnabled);
    const sub = AccessibilityInfo.addEventListener(
      'screenReaderChanged',
      setEnabled,
    );
    return () => sub.remove();
  }, []);

  return enabled;
};
