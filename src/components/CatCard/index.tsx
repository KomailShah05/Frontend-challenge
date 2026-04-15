import React, {memo} from 'react';
import {Animated, Image, StyleSheet, View} from 'react-native';
import {useFavouriteToggle} from '../../hooks/useFavouriteToggle';
import {useVote} from '../../hooks/useVote';
import {useCardAnimation} from '../../hooks/useCardAnimation';
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
 * The data prop (CatCardData) uses readonly fields so mutations go through hooks.
 * Entrance animation: fade + slide-up via useCardAnimation (native driver).
 */
export const CatCard = memo(({data, width}: Props) => {
  const {isFavourited, isPending: favPending, toggle} = useFavouriteToggle(
    data.image.id,
    data.favouriteId,
  );

  const {voteUp, voteDown, isPending: votePending} = useVote(
    data.image.id,
    data.myVote,
  );

  const {opacity, translateY} = useCardAnimation();

  return (
    <Animated.View
      style={[styles.card, {width, opacity, transform: [{translateY}]}]}>
      <View>
        <Image
          source={{uri: data.image.url}}
          style={[styles.image, {width, height: width}]}
          resizeMode="cover"
          accessibilityLabel="Cat image"
          accessibilityRole="image"
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
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
    // Animated.View needs explicit backfaceVisibility for Android shadow
    backfaceVisibility: 'hidden',
  },
  image: {
    backgroundColor: '#f3f4f6',
  },
});
