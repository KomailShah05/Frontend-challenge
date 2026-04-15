import {useEffect, useRef} from 'react';
import {Animated} from 'react-native';
import {useReduceMotion} from './useReduceMotion';

/**
 * Returns an Animated.Value that bounces (scale up → spring back) whenever
 * `active` transitions from false → true.  No animation on de-activation
 * so unfavouriting feels instant and intentional.
 *
 * When "Reduce Motion" is enabled the scale stays at 1 — no bounce plays,
 * only the icon colour changes to communicate state.
 *
 * Cleanup: stops any in-flight animation on unmount to prevent the
 * "Can't perform a React state update on an unmounted component" warning.
 */
export const useBounceAnimation = (active: boolean): Animated.Value => {
  const reduceMotion = useReduceMotion();
  const scale = useRef(new Animated.Value(1)).current;
  const prevActive = useRef(active);
  const animRef = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    if (active && !prevActive.current && !reduceMotion) {
      animRef.current?.stop();
      animRef.current = Animated.sequence([
        Animated.spring(scale, {
          toValue: 1.35,
          speed: 60,
          bounciness: 0,
          useNativeDriver: true,
        }),
        Animated.spring(scale, {
          toValue: 1,
          speed: 18,
          bounciness: 10,
          useNativeDriver: true,
        }),
      ]);
      animRef.current.start();
    }
    prevActive.current = active;
  }, [active, reduceMotion, scale]);

  useEffect(() => {
    return () => animRef.current?.stop();
  }, []);

  return scale;
};
