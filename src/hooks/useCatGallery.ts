import {useCallback, useMemo} from 'react';
import {useInfiniteQuery, useQuery} from '@tanstack/react-query';
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

  // Flatten pages then merge with votes + favourites.
  // Recomputes only when underlying query data changes — not on every render.
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

      return {
        image,
        score,
        favouriteId: favourite?.id ?? null,
        myVote: imageVotes[0] ?? null,
      };
    });
  }, [imagesQuery.data, votesQuery.data, favouritesQuery.data]);

  const refetchAll = useCallback(() => {
    imagesQuery.refetch();
    votesQuery.refetch();
    favouritesQuery.refetch();
  }, [imagesQuery, votesQuery, favouritesQuery]);

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
