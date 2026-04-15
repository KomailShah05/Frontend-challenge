import React, {memo, useCallback} from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {useHaptic} from '../../hooks/useHaptic';
import {useTheme} from '../../hooks/useTheme';

interface Props {
  score: number;
  currentVote: 1 | 0 | null;
  onVoteUp: () => void;
  onVoteDown: () => void;
  disabled: boolean;
}

/**
 * Single responsibility: render the score + up/down vote buttons.
 * Tapping the active vote button again toggles it off (handled in useVote).
 * Colours come from useTheme() so dark mode is automatic.
 * Haptic feedback fires on every vote tap for tactile confirmation.
 */
export const VoteButtons = memo(
  ({score, currentVote, onVoteUp, onVoteDown, disabled}: Props) => {
    const theme = useTheme();
    const {selectionFeedback} = useHaptic();

    const handleUp = useCallback(() => {
      selectionFeedback();
      onVoteUp();
    }, [selectionFeedback, onVoteUp]);

    const handleDown = useCallback(() => {
      selectionFeedback();
      onVoteDown();
    }, [selectionFeedback, onVoteDown]);

    const upActive = currentVote === 1;
    const downActive = currentVote === 0;

    return (
      <View style={styles.row}>
        <TouchableOpacity
          onPress={handleUp}
          disabled={disabled}
          style={[
            styles.button,
            {backgroundColor: upActive ? theme.voteUpBg : theme.voteDefault},
          ]}
          hitSlop={{top: 6, bottom: 6, left: 6, right: 6}}
          accessibilityRole="button"
          accessibilityLabel={upActive ? 'Remove upvote' : 'Vote up'}
          accessibilityState={{disabled, selected: upActive}}>
          <Text
            style={[
              styles.arrow,
              {color: upActive ? theme.voteUpText : theme.voteArrowDefault},
            ]}>
            ▲
          </Text>
        </TouchableOpacity>

        <Text
          style={[
            styles.score,
            {
              color:
                score > 0
                  ? theme.scorePositive
                  : score < 0
                    ? theme.scoreNegative
                    : theme.scoreNeutral,
            },
          ]}
          accessibilityLabel={`Score: ${score}`}>
          {score}
        </Text>

        <TouchableOpacity
          onPress={handleDown}
          disabled={disabled}
          style={[
            styles.button,
            {backgroundColor: downActive ? theme.voteDownBg : theme.voteDefault},
          ]}
          hitSlop={{top: 6, bottom: 6, left: 6, right: 6}}
          accessibilityRole="button"
          accessibilityLabel={downActive ? 'Remove downvote' : 'Vote down'}
          accessibilityState={{disabled, selected: downActive}}>
          <Text
            style={[
              styles.arrow,
              {color: downActive ? theme.voteDownText : theme.voteArrowDefault},
            ]}>
            ▼
          </Text>
        </TouchableOpacity>
      </View>
    );
  },
);

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    gap: 12,
  },
  button: {
    width: 28,
    height: 28,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrow: {fontSize: 12},
  score: {
    fontSize: 14,
    fontWeight: '700',
    minWidth: 24,
    textAlign: 'center',
  },
});
