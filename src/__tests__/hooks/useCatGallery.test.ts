import {renderHook, waitFor} from '@testing-library/react-native';
import {useCatGallery} from '../../hooks/useCatGallery';
import {fetchMyImages} from '../../api/cats';
import {fetchVotes} from '../../api/votes';
import {fetchFavourites} from '../../api/favourites';
import {createWrapper} from '../utils/testUtils';
import type {CatImage, Vote, Favourite} from '../../types/api.types';

jest.mock('../../api/cats');
jest.mock('../../api/votes');
jest.mock('../../api/favourites');

const mockFetchImages = fetchMyImages as jest.MockedFunction<typeof fetchMyImages>;
const mockFetchVotes = fetchVotes as jest.MockedFunction<typeof fetchVotes>;
const mockFetchFavourites = fetchFavourites as jest.MockedFunction<typeof fetchFavourites>;

// ── fixtures ──────────────────────────────────────────────────────────────────

const image = (id: string): CatImage => ({
  id,
  url: `https://cdn2.thecatapi.com/images/${id}.jpg`,
  width: 800,
  height: 600,
});

const upVote = (imageId: string, id = 1): Vote => ({
  id,
  image_id: imageId,
  value: 1,
  sub_id: 'test_sub_123',
  created_at: '2024-01-01T00:00:00Z',
});

const downVote = (imageId: string, id = 2): Vote => ({
  id,
  image_id: imageId,
  value: 0,
  sub_id: 'test_sub_123',
  created_at: '2024-01-01T00:00:00Z',
});

const favourite = (imageId: string, id = 10): Favourite => ({
  id,
  image_id: imageId,
  sub_id: 'test_sub_123',
  created_at: '2024-01-01T00:00:00Z',
});

// ── tests ─────────────────────────────────────────────────────────────────────

describe('useCatGallery — data merging', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns empty array while images are loading', () => {
    mockFetchImages.mockReturnValue(new Promise(() => {})); // pending forever
    mockFetchVotes.mockResolvedValue([]);
    mockFetchFavourites.mockResolvedValue([]);

    const {result} = renderHook(() => useCatGallery(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);
    expect(result.current.catCards).toEqual([]);
  });

  it('returns merged CatCardData when all queries resolve', async () => {
    const img = image('abc');
    mockFetchImages.mockResolvedValue([img]);
    mockFetchVotes.mockResolvedValue([upVote('abc'), downVote('abc', 2)]);
    mockFetchFavourites.mockResolvedValue([favourite('abc')]);

    const {result} = renderHook(() => useCatGallery(), {
      wrapper: createWrapper(),
    });

    await waitFor(() =>
      expect(result.current.catCards).toHaveLength(1),
    );

    const card = result.current.catCards[0];
    expect(card.image.id).toBe('abc');
    // score = +1 (up) + -1 (down) = 0
    expect(card.score).toBe(0);
    expect(card.favouriteId).toBe(10);
    expect(card.myVote?.value).toBe(1); // first vote in array
  });

  it('calculates positive score correctly', async () => {
    const img = image('pos');
    mockFetchImages.mockResolvedValue([img]);
    mockFetchVotes.mockResolvedValue([
      upVote('pos', 1),
      upVote('pos', 2),
      upVote('pos', 3),
    ]);
    mockFetchFavourites.mockResolvedValue([]);

    const {result} = renderHook(() => useCatGallery(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.catCards).toHaveLength(1));
    expect(result.current.catCards[0].score).toBe(3);
  });

  it('calculates negative score correctly', async () => {
    const img = image('neg');
    mockFetchImages.mockResolvedValue([img]);
    mockFetchVotes.mockResolvedValue([
      downVote('neg', 1),
      downVote('neg', 2),
    ]);
    mockFetchFavourites.mockResolvedValue([]);

    const {result} = renderHook(() => useCatGallery(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.catCards).toHaveLength(1));
    expect(result.current.catCards[0].score).toBe(-2);
  });

  it('sets favouriteId to null when image is not favourited', async () => {
    mockFetchImages.mockResolvedValue([image('xyz')]);
    mockFetchVotes.mockResolvedValue([]);
    mockFetchFavourites.mockResolvedValue([]); // no favourites

    const {result} = renderHook(() => useCatGallery(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.catCards).toHaveLength(1));
    expect(result.current.catCards[0].favouriteId).toBeNull();
    expect(result.current.catCards[0].myVote).toBeNull();
  });

  it('handles empty images list without errors', async () => {
    mockFetchImages.mockResolvedValue([]);
    mockFetchVotes.mockResolvedValue([]);
    mockFetchFavourites.mockResolvedValue([]);

    const {result} = renderHook(() => useCatGallery(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.catCards).toEqual([]);
  });

  it('exposes isError when images fetch fails', async () => {
    mockFetchImages.mockRejectedValue(new Error('Network error'));
    mockFetchVotes.mockResolvedValue([]);
    mockFetchFavourites.mockResolvedValue([]);

    const {result} = renderHook(() => useCatGallery(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error?.message).toBe('Network error');
  });
});
