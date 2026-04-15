import {startTransition, useCallback, useOptimistic} from 'react';
import {useMutation, useQueryClient} from '@tanstack/react-query';
import {addFavourite, removeFavourite} from '../api/favourites';
import {QUERY_KEYS} from '../api/queryKeys';
import {useSubId} from '../providers/SubIdProvider';

/**
 * Manages favourite toggle with React 19 useOptimistic.
 *
 * useOptimistic provides instant UI feedback — the heart flips immediately
 * while the API call is in flight. On error, React automatically reverts
 * the optimistic state when the transition ends, giving a free rollback.
 *
 * We await the refetch inside startTransition so the optimistic state
 * stays active until real server data is in the cache.
 */
export const useFavouriteToggle = (
  imageId: string,
  favouriteId: number | null,
) => {
  const subId = useSubId();
  const queryClient = useQueryClient();

  const [optimisticFavId, addOptimistic] = useOptimistic(
    favouriteId,
    (_: number | null, next: number | null) => next,
  );

  const {mutateAsync: addFav, isPending: isAdding} = useMutation({
    mutationFn: () => addFavourite({image_id: imageId, sub_id: subId}),
  });

  const {mutateAsync: removeFav, isPending: isRemoving} = useMutation({
    mutationFn: (favId: number) => removeFavourite(favId),
  });

  const toggle = useCallback(() => {
    startTransition(async () => {
      try {
        if (optimisticFavId !== null) {
          addOptimistic(null);
          await removeFav(optimisticFavId);
        } else {
          addOptimistic(-1); // placeholder while the real ID is being saved
          await addFav();
        }
        // Await the refetch so the transition stays pending until real data
        // arrives — prevents a flash back to the old state
        await queryClient.refetchQueries({
          queryKey: QUERY_KEYS.favourites(subId),
        });
      } catch {
        // useOptimistic reverts automatically when the transition ends with an error
      }
    });
  }, [optimisticFavId, addOptimistic, addFav, removeFav, queryClient, subId]);

  return {
    isFavourited: optimisticFavId !== null,
    isPending: isAdding || isRemoving,
    toggle,
  };
};
