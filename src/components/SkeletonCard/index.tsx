import React, {memo, useEffect, useRef} from 'react';
import {Animated, StyleSheet, View} from 'react-native';

interface Props {
  width: number;
}

/**
 * Pulsing skeleton placeholder shown while gallery data loads.
 * Uses Animated (no reanimated dependency) with proper cleanup
 * to prevent memory leaks on unmount.
 */
export const SkeletonCard = memo(({width}: Props) => {
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
    // Cleanup on unmount — prevents setState on unmounted animation
    return () => pulse.stop();
  }, [opacity]);

  const imageSize = width;

  return (
    <Animated.View style={[styles.card, {width, opacity}]}>
      <View style={[styles.image, {width: imageSize, height: imageSize}]} />
      <View style={styles.footer}>
        <View style={styles.btn} />
        <View style={styles.score} />
        <View style={styles.btn} />
      </View>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
  },
  image: {
    backgroundColor: '#e5e7eb',
  },
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
    backgroundColor: '#e5e7eb',
  },
  score: {
    width: 24,
    height: 14,
    borderRadius: 4,
    backgroundColor: '#e5e7eb',
  },
});
