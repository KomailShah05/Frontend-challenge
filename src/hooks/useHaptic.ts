import {useCallback} from 'react';
import {Platform, Vibration} from 'react-native';

/**
 * Lightweight haptic feedback using React Native's built-in Vibration API.
 *
 * Android: honours the pattern fully (short pulse = selection feedback).
 * iOS: Vibration.vibrate() fires a brief system buzz on supported devices.
 *
 * For richer iOS haptics (UIImpactFeedbackGenerator / UISelectionFeedbackGenerator)
 * a native module like `react-native-haptic-feedback` would be required.
 * This implementation intentionally avoids that dependency while still giving
 * Android users tactile confirmation.
 */
export const useHaptic = () => {
  const selectionFeedback = useCallback(() => {
    if (Platform.OS === 'android') {
      Vibration.vibrate(30);
    }
    // iOS: no-op — UIKit provides implicit tap feedback via TouchableOpacity
  }, []);

  const successFeedback = useCallback(() => {
    if (Platform.OS === 'android') {
      Vibration.vibrate([0, 40, 60, 40]);
    }
  }, []);

  return {selectionFeedback, successFeedback};
};
