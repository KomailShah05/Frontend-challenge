import {useEffect, useRef} from 'react';
import {Animated} from 'react-native';
import {useReduceMotion} from './useReduceMotion';

/**
 * Drives a card entrance animation: fade in + slide up from 16 px below.
 * Starts automatically on mount. Uses native driver — runs on the UI thread.
 *
 * When the user has enabled "Reduce Motion" the hook snaps directly to the
 * final visible state (opacity 1, translateY 0) with no animation, satisfying
 * WCAG 2.3.3 and platform accessibility guidelines.
 *
 * Returns stable Animated.Value refs so the consumer can pass them to
 * Animated.View style without triggering re-renders.
 */
export const useCardAnimation = () => {
  const reduceMotion = useReduceMotion();
  const opacity = useRef(new Animated.Value(reduceMotion ? 1 : 0)).current;
  const translateY = useRef(new Animated.Value(reduceMotion ? 0 : 16)).current;

  useEffect(() => {
    if (reduceMotion) {
      // Snap to final state — no animation
      opacity.setValue(1);
      translateY.setValue(0);
      return;
    }

    const anim = Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 280,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 280,
        useNativeDriver: true,
      }),
    ]);
    anim.start();
    return () => anim.stop();
  }, [reduceMotion, opacity, translateY]);

  return {opacity, translateY};
};
