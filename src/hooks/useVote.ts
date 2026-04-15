import {useCallback} from 'react';
import {useMutation, useQueryClient} from '@tanstack/react-query';
import {addVote, deleteVote} from '../api/votes';
import {QUERY_KEYS} from '../api/queryKeys';
import {useSubId} from '../providers/SubIdProvider';
import type {Vote} from '../types/api.types';

type VoteVariables = {value: 1 | 0; existingVote: Vote | null};
type VoteContext = {previousVotes: Vote[]};

/**
 * Manages up/down voting with TanStack Query optimistic updates.
 *
 * onMutate writes directly to the query cache so the score in useCatGallery
 * recomputes immediately — no separate optimistic state needed.
 * onError rolls back to the snapshot taken in onMutate.
 * onSettled invalidates to sync with the server.
 *
 * Passing existingVote as mutation variables (not from closure) ensures
 * we always act on the value at the moment the user tapped.
 */
export const useVote = (imageId: string, currentVote: Vote | null) => {
  const subId = useSubId();
  const queryClient = useQueryClient();

  const vote = useMutation<unknown, Error, VoteVariables, VoteContext>({
    mutationFn: async ({value, existingVote}) => {
      if (existingVote) {
        await deleteVote(existingVote.id);
      }
      // Same value = toggle off — just delete, don't re-add
      if (existingVote?.value === value) return null;
      return addVote({image_id: imageId, value, sub_id: subId});
    },

    onMutate: async ({value, existingVote}) => {
      await queryClient.cancelQueries({queryKey: QUERY_KEYS.votes(subId)});

      const previousVotes =
        queryClient.getQueryData<Vote[]>(QUERY_KEYS.votes(subId)) ?? [];

      queryClient.setQueryData<Vote[]>(QUERY_KEYS.votes(subId), old => {
        const votes = old ?? [];
        const filtered = votes.filter(v => v.image_id !== imageId);
        // Toggle off — return without adding
        if (existingVote?.value === value) return filtered;
        const optimistic: Vote = {
          id: -1,
          image_id: imageId,
          value,
          sub_id: subId,
          created_at: new Date().toISOString(),
        };
        return [...filtered, optimistic];
      });

      return {previousVotes};
    },

    onError: (_err, _vars, context) => {
      if (context?.previousVotes !== undefined) {
        queryClient.setQueryData(QUERY_KEYS.votes(subId), context.previousVotes);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({queryKey: QUERY_KEYS.votes(subId)});
    },
  });

  const voteUp = useCallback(
    () => vote.mutate({value: 1, existingVote: currentVote}),
    [vote, currentVote],
  );

  const voteDown = useCallback(
    () => vote.mutate({value: 0, existingVote: currentVote}),
    [vote, currentVote],
  );

  return {voteUp, voteDown, isPending: vote.isPending};
};
