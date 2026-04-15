import {useMemo} from 'react';
import {useQuery} from '@tanstack/react-query';
import {fetchMyImages} from '../api/cats';
import {fetchVotes} from '../api/votes';
import {fetchFavourites} from '../api/favourites';
import {QUERY_KEYS} from '../api/queryKeys';
import {useSubId} from '../providers/SubIdProvider';
import type {CatCardData} from '../types/api.types';

/**
 * Fetches images, votes, and favourites in parallel then merges them
 * into a single CatCardData[] ready for rendering.
 *
 * Separation of concerns: this hook owns data only.
 * Navigation-aware refetch (useFocusEffect) lives in GalleryScreen.
 */
export const useCatGallery = () => {
  const subId = useSubId();

  const imagesQuery = useQuery({
    queryKey: QUERY_KEYS.images(subId),
    queryFn: ({signal}) => fetchMyImages(subId, signal),
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

  // Recomputes only when underlying query data changes — not on every render
  const catCards = useMemo<CatCardData[]>(() => {
    if (!imagesQuery.data) return [];

    const votes = votesQuery.data ?? [];
    const favourites = favouritesQuery.data ?? [];

    return imagesQuery.data.map(image => {
      const imageVotes = votes.filter(v => v.image_id === image.id);
      // score = ups (value 1) minus downs (value 0)
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

  const refetchAll = () => {
    imagesQuery.refetch();
    votesQuery.refetch();
    favouritesQuery.refetch();
  };

  return {
    catCards,
    isLoading: imagesQuery.isLoading,
    isError: imagesQuery.isError,
    error: imagesQuery.error,
    isRefetching: imagesQuery.isRefetching,
    refetchAll,
  };
};
