import React, {useEffect, useRef} from 'react';
import {Animated, StyleSheet, Text} from 'react-native';
import {useIsOnline} from '../../hooks/useIsOnline';
import {useReduceMotion} from '../../hooks/useReduceMotion';
import {useTheme} from '../../hooks/useTheme';

/**
 * Appears at the top of the screen whenever the app loses its network
 * connection (detected via TanStack Query's onlineManager + AppState).
 *
 * Slides in from above when offline, slides back out when connectivity
 * returns. Reduce Motion is respected — the banner appears/disappears
 * instantly instead of animating.
 *
 * Accessibility: role="alert" causes VoiceOver / TalkBack to announce
 * the message immediately when the view becomes visible.
 */
export const OfflineBanner = () => {
  const isOnline = useIsOnline();
  const theme = useTheme();
  const reduceMotion = useReduceMotion();

  const translateY = useRef(new Animated.Value(-60)).current;

  useEffect(() => {
    const toValue = isOnline ? -60 : 0;

    if (reduceMotion) {
      translateY.setValue(toValue);
      return;
    }

    const anim = Animated.spring(translateY, {
      toValue,
      speed: 20,
      bounciness: 0,
      useNativeDriver: true,
    });
    anim.start();
    return () => anim.stop();
  }, [isOnline, reduceMotion, translateY]);

  // Keep the view in the tree (just translated off-screen) so the animation
  // can slide it back in without remounting.
  return (
    <Animated.View
      style={[
        styles.banner,
        {
          backgroundColor: theme.errorBorder,
          transform: [{translateY}],
        },
      ]}
      accessible
      accessibilityRole="alert"
      accessibilityLabel="No internet connection. Some features may be unavailable."
      // Hide from accessibility tree when online so it doesn't clutter navigation
      accessibilityElementsHidden={isOnline}
      importantForAccessibility={isOnline ? 'no-hide-descendants' : 'yes'}>
      <Text style={styles.text}>No internet connection</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  banner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
  },
  text: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
});
