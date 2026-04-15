import React, {memo} from 'react';
import {Animated, StyleSheet, Text, TouchableOpacity} from 'react-native';
import {useBounceAnimation} from '../../hooks/useBounceAnimation';
import {useHaptic} from '../../hooks/useHaptic';
import {useTheme} from '../../hooks/useTheme';

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
 * Haptic feedback fires on every press for tactile confirmation.
 * Colours come from useTheme() so dark mode is automatic.
 */
export const FavouriteButton = memo(({isFavourited, onToggle, disabled}: Props) => {
  const theme = useTheme();
  const scale = useBounceAnimation(isFavourited);
  const {selectionFeedback} = useHaptic();

  const handlePress = () => {
    selectionFeedback();
    onToggle();
  };

  return (
    <Animated.View
      style={[
        styles.button,
        {backgroundColor: theme.heartBadgeBg, transform: [{scale}]},
      ]}>
      <TouchableOpacity
        onPress={handlePress}
        disabled={disabled}
        style={styles.inner}
        hitSlop={{top: 8, bottom: 8, left: 8, right: 8}}
        accessibilityRole="button"
        accessibilityLabel={isFavourited ? 'Remove from favourites' : 'Add to favourites'}
        accessibilityState={{disabled}}>
        <Text
          style={[
            styles.heart,
            {color: isFavourited ? theme.heartFilled : theme.heartEmpty},
          ]}>
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
  },
  inner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
  },
  heart: {
    fontSize: 17,
  },
});
