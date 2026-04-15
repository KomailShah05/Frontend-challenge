import React, {memo} from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';

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
 */
export const VoteButtons = memo(
  ({score, currentVote, onVoteUp, onVoteDown, disabled}: Props) => (
    <View style={styles.row}>
      <TouchableOpacity
        onPress={onVoteUp}
        disabled={disabled}
        style={[styles.button, currentVote === 1 && styles.upActive]}
        hitSlop={{top: 6, bottom: 6, left: 6, right: 6}}
        accessibilityRole="button"
        accessibilityLabel={currentVote === 1 ? 'Remove upvote' : 'Vote up'}
        accessibilityState={{disabled, selected: currentVote === 1}}>
        <Text style={[styles.arrow, currentVote === 1 && styles.upText]}>▲</Text>
      </TouchableOpacity>

      <Text
        style={[
          styles.score,
          score > 0 && styles.positive,
          score < 0 && styles.negative,
        ]}
        accessibilityLabel={`Score: ${score}`}>
        {score}
      </Text>

      <TouchableOpacity
        onPress={onVoteDown}
        disabled={disabled}
        style={[styles.button, currentVote === 0 && styles.downActive]}
        hitSlop={{top: 6, bottom: 6, left: 6, right: 6}}
        accessibilityRole="button"
        accessibilityLabel={currentVote === 0 ? 'Remove downvote' : 'Vote down'}
        accessibilityState={{disabled, selected: currentVote === 0}}>
        <Text style={[styles.arrow, currentVote === 0 && styles.downText]}>▼</Text>
      </TouchableOpacity>
    </View>
  ),
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
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  upActive: {backgroundColor: '#dcfce7'},
  downActive: {backgroundColor: '#fee2e2'},
  arrow: {fontSize: 12, color: '#9ca3af'},
  upText: {color: '#16a34a'},
  downText: {color: '#dc2626'},
  score: {
    fontSize: 14,
    fontWeight: '700',
    color: '#374151',
    minWidth: 24,
    textAlign: 'center',
  },
  positive: {color: '#16a34a'},
  negative: {color: '#dc2626'},
});
