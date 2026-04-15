import React, {memo} from 'react';
import {Animated, StyleSheet, Text, TouchableOpacity} from 'react-native';
import {useBounceAnimation} from '../../hooks/useBounceAnimation';

interface Props {
  isFavourited: boolean;
  onToggle: () => void;
  disabled: boolean;
}

/**
 * Single responsibility: render the favourite heart and handle one tap.
 * State and mutation live in useFavouriteToggle — this component is pure UI.
 *
 * Bounce animation plays when isFavourited becomes true (spring scale up → back).
 * No animation on de-activation so the removal feels instant and intentional.
 *
 * Accessibility: role=button, descriptive label, disabled state announced
 * to screen readers (WCAG 4.1.2).
 */
export const FavouriteButton = memo(({isFavourited, onToggle, disabled}: Props) => {
  const scale = useBounceAnimation(isFavourited);

  return (
    <Animated.View style={[styles.button, {transform: [{scale}]}]}>
      <TouchableOpacity
        onPress={onToggle}
        disabled={disabled}
        style={styles.inner}
        hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}
        accessibilityRole="button"
        accessibilityLabel={isFavourited ? 'Remove from favourites' : 'Add to favourites'}
        accessibilityState={{disabled}}>
        <Text style={[styles.heart, isFavourited && styles.filled]}>
          {isFavourited ? '♥' : '♡'}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.92)',
  },
  inner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
  },
  heart: {
    fontSize: 17,
    color: '#ccc',
  },
  filled: {
    color: '#ef4444',
  },
});
