import {useEffect, useRef} from 'react';
import {Animated} from 'react-native';

/**
 * Drives a card entrance animation: fade in + slide up from 16 px below.
 * Starts automatically on mount. Uses native driver — runs on the UI thread.
 *
 * Returns stable Animated.Value refs so the consumer can pass them to
 * Animated.View style without triggering re-renders.
 */
export const useCardAnimation = () => {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(16)).current;

  useEffect(() => {
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
  }, [opacity, translateY]);

  return {opacity, translateY};
};
