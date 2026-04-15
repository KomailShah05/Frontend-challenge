import React, {memo, useEffect, useRef} from 'react';
import {Animated, StyleSheet, View} from 'react-native';
import {useTheme} from '../../hooks/useTheme';

interface Props {
  width: number;
}

/**
 * Pulsing skeleton placeholder shown while gallery data loads.
 * Uses Animated (no reanimated dependency) with proper cleanup
 * to prevent memory leaks on unmount.
 * Skeleton colour adapts to light/dark theme automatically.
 */
export const SkeletonCard = memo(({width}: Props) => {
  const theme = useTheme();
  const opacity = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 750,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.4,
          duration: 750,
          useNativeDriver: true,
        }),
      ]),
    );
    pulse.start();
    return () => pulse.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[styles.card, {width, opacity, backgroundColor: theme.cardBg}]}>
      <View
        style={[
          styles.image,
          {width, height: width, backgroundColor: theme.skeletonBg},
        ]}
      />
      <View style={styles.footer}>
        <View style={[styles.btn, {backgroundColor: theme.skeletonBg}]} />
        <View style={[styles.score, {backgroundColor: theme.skeletonBg}]} />
        <View style={[styles.btn, {backgroundColor: theme.skeletonBg}]} />
      </View>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
  },
  image: {},
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    gap: 12,
  },
  btn: {
    width: 28,
    height: 28,
    borderRadius: 6,
  },
  score: {
    width: 24,
    height: 14,
    borderRadius: 4,
  },
});
