import {useCallback, useMemo, useRef} from 'react';
import {useInfiniteQuery, useQuery, useQueryClient} from '@tanstack/react-query';
import {fetchMyImages, PAGE_SIZE} from '../api/cats';
import {fetchVotes} from '../api/votes';
import {fetchFavourites} from '../api/favourites';
import {QUERY_KEYS} from '../api/queryKeys';
import {useSubId} from '../providers/SubIdProvider';
import type {CatCardData} from '../types/api.types';

/**
 * Fetches images (paginated), votes, and favourites in parallel then merges
 * them into a single CatCardData[] ready for rendering.
 *
 * Images use useInfiniteQuery so the gallery can load more on scroll.
 * Votes and favourites are fetched in bulk (limit 1 000) — both collections
 * are small and the Cat API doesn't page them by default.
 *
 * Separation of concerns: this hook owns data only.
 * Navigation-aware refetch (useFocusEffect) lives in GalleryScreen.
 * Pagination UI (onEndReached, footer spinner) lives in GalleryScreen.
 */
export const useCatGallery = () => {
  const subId = useSubId();
  const queryClient = useQueryClient();

  const imagesQuery = useInfiniteQuery({
    queryKey: QUERY_KEYS.images(subId),
    queryFn: ({signal, pageParam}) =>
      fetchMyImages(subId, pageParam as number, signal),
    initialPageParam: 0,
    // No more pages when the last page returned fewer items than PAGE_SIZE
    getNextPageParam: (lastPage, allPages) =>
      lastPage.length < PAGE_SIZE ? undefined : allPages.length,
    enabled: !!subId,
  });

  const votesQuery = useQuery({
    queryKey: QUERY_KEYS.votes(subId),
    queryFn: ({signal}) => fetchVotes(subId, signal),
    enabled: !!subId,
  });

  const favouritesQuery = useQuery({
    queryKey: QUERY_KEYS.favourites(subId),
    queryFn: ({signal}) => fetchFavourites(subId, signal),
    enabled: !!subId,
  });

  // Stable identity cache: only create a new CatCardData object when the
  // computed values for that image actually changed. This prevents CatCard
  // (wrapped in memo) from re-rendering every card when a single vote/favourite
  // action refetches the votes or favourites list.
  const cardCache = useRef<Map<string, CatCardData>>(new Map());

  const catCards = useMemo<CatCardData[]>(() => {
    if (!imagesQuery.data) return [];

    const images = imagesQuery.data.pages.flat();
    const votes = votesQuery.data ?? [];
    const favourites = favouritesQuery.data ?? [];

    return images.map(image => {
      const imageVotes = votes.filter(v => v.image_id === image.id);
      const score = imageVotes.reduce(
        (acc, v) => acc + (v.value === 1 ? 1 : -1),
        0,
      );
      const favourite = favourites.find(f => f.image_id === image.id);
      const favouriteId = favourite?.id ?? null;
      const myVote = imageVotes[0] ?? null;

      const prev = cardCache.current.get(image.id);
      if (
        prev &&
        prev.score === score &&
        prev.favouriteId === favouriteId &&
        prev.myVote?.id === myVote?.id &&
        prev.myVote?.value === myVote?.value
      ) {
        return prev; // same reference → memo skips re-render
      }

      const next: CatCardData = {image, score, favouriteId, myVote};
      cardCache.current.set(image.id, next);
      return next;
    });
  }, [imagesQuery.data, votesQuery.data, favouritesQuery.data]);

  // queryClient is a stable singleton — safe as a useCallback dep.
  // Using refetchQueries avoids capturing the query result objects (which are
  // new references on every render), which previously caused an infinite loop
  // when useFocusEffect depended on this function.
  const refetchAll = useCallback(() => {
    queryClient.refetchQueries({queryKey: QUERY_KEYS.images(subId)});
    queryClient.refetchQueries({queryKey: QUERY_KEYS.votes(subId)});
    queryClient.refetchQueries({queryKey: QUERY_KEYS.favourites(subId)});
  }, [queryClient, subId]);

  return {
    catCards,
    isLoading: imagesQuery.isLoading,
    isError: imagesQuery.isError,
    error: imagesQuery.error,
    isRefetching: imagesQuery.isRefetching,
    isFetchingNextPage: imagesQuery.isFetchingNextPage,
    hasNextPage: imagesQuery.hasNextPage,
    fetchNextPage: imagesQuery.fetchNextPage,
    refetchAll,
  };
};
