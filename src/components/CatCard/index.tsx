import React, {memo, useEffect, useRef, useState} from 'react';
import {Animated, Image, StyleSheet, View} from 'react-native';
import {useFavouriteToggle} from '../../hooks/useFavouriteToggle';
import {useVote} from '../../hooks/useVote';
import {useCardAnimation} from '../../hooks/useCardAnimation';
import {useReduceMotion} from '../../hooks/useReduceMotion';
import {useTheme} from '../../hooks/useTheme';
import {FavouriteButton} from '../FavouriteButton';
import {VoteButtons} from '../VoteButtons';
import type {CatCardData} from '../../types/api.types';

interface Props {
  data: CatCardData;
  width: number;
}

/**
 * CatCard orchestrates interactions for a single cat.
 * Each child component (FavouriteButton, VoteButtons) is a pure display component.
 * All async logic lives in the custom hooks — this component stays thin.
 *
 * memo prevents re-renders from parent FlatList when other cards' state changes.
 * Entrance animation: fade + slide-up via useCardAnimation (native driver).
 * Image loading: a skeleton overlay fades out once the remote image is decoded,
 * preventing the jarring pop-in of an empty white box.
 * Card background adapts to light/dark theme automatically.
 */
export const CatCard = memo(({data, width}: Props) => {
  const theme = useTheme();
  const reduceMotion = useReduceMotion();
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const skeletonOpacity = useRef(new Animated.Value(1)).current;

  const {isFavourited, isPending: favPending, toggle} = useFavouriteToggle(
    data.image.id,
    data.favouriteId,
  );

  const {voteUp, voteDown, isPending: votePending} = useVote(
    data.image.id,
    data.myVote,
  );

  const {opacity, translateY} = useCardAnimation();

  // Fade out the skeleton overlay once the image has decoded
  useEffect(() => {
    if (!isImageLoaded) return;
    if (reduceMotion) {
      skeletonOpacity.setValue(0);
      return;
    }
    const anim = Animated.timing(skeletonOpacity, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    });
    anim.start();
    return () => anim.stop();
  }, [isImageLoaded, reduceMotion, skeletonOpacity]);

  return (
    <Animated.View
      style={[
        styles.card,
        {width, opacity, transform: [{translateY}], backgroundColor: theme.cardBg},
      ]}>
      <View>
        <Image
          source={{uri: data.image.url}}
          style={[styles.image, {width, height: width}]}
          resizeMode="cover"
          accessibilityLabel="Cat image"
          accessibilityRole="image"
          onLoadEnd={() => setIsImageLoaded(true)}
        />
        {/* Skeleton overlay — covers the image until it's decoded */}
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            styles.imageSkeleton,
            {opacity: skeletonOpacity, backgroundColor: theme.skeletonBg},
          ]}
          // Hidden from accessibility tree once loaded
          accessibilityElementsHidden={isImageLoaded}
          importantForAccessibility={isImageLoaded ? 'no-hide-descendants' : 'yes'}
        />
        <FavouriteButton
          isFavourited={isFavourited}
          onToggle={toggle}
          disabled={favPending}
        />
      </View>

      <VoteButtons
        score={data.score}
        currentVote={data.myVote?.value ?? null}
        onVoteUp={voteUp}
        onVoteDown={voteDown}
        disabled={votePending}
      />
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
    backfaceVisibility: 'hidden',
  },
  image: {},
  imageSkeleton: {
    borderRadius: 0,
  },
});
