import {act, renderHook, waitFor} from '@testing-library/react-native';
import {useCatGallery} from '../../hooks/useCatGallery';
import {fetchMyImages, PAGE_SIZE} from '../../api/cats';
import {fetchVotes} from '../../api/votes';
import {fetchFavourites} from '../../api/favourites';
import {createWrapper} from '../utils/testUtils';
import type {CatImage, Vote, Favourite} from '../../types/api.types';

// Partial mock: keep PAGE_SIZE from the real module, only mock the async function.
jest.mock('../../api/cats', () => ({
  ...jest.requireActual('../../api/cats'),
  fetchMyImages: jest.fn(),
}));
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

    await waitFor(() => expect(result.current.catCards).toHaveLength(1));

    const card = result.current.catCards[0];
    expect(card.image.id).toBe('abc');
    // score = +1 (up) + -1 (down) = 0
    expect(card.score).toBe(0);
    expect(card.favouriteId).toBe(10);
    expect(card.myVote?.value).toBe(1);
  });

  it('calculates positive score correctly', async () => {
    mockFetchImages.mockResolvedValue([image('pos')]);
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
    mockFetchImages.mockResolvedValue([image('neg')]);
    mockFetchVotes.mockResolvedValue([downVote('neg', 1), downVote('neg', 2)]);
    mockFetchFavourites.mockResolvedValue([]);

    const {result} = renderHook(() => useCatGallery(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.catCards).toHaveLength(1));
    expect(result.current.catCards[0].score).toBe(-2);
  });

  it('sets favouriteId to null when image is not in favourites', async () => {
    mockFetchImages.mockResolvedValue([image('xyz')]);
    mockFetchVotes.mockResolvedValue([]);
    mockFetchFavourites.mockResolvedValue([]);

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

describe('useCatGallery — pagination', () => {
  beforeEach(() => jest.clearAllMocks());

  it('hasNextPage is false when the first page has fewer items than PAGE_SIZE', async () => {
    // 1 item < PAGE_SIZE → no more pages
    mockFetchImages.mockResolvedValue([image('only')]);
    mockFetchVotes.mockResolvedValue([]);
    mockFetchFavourites.mockResolvedValue([]);

    const {result} = renderHook(() => useCatGallery(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.hasNextPage).toBe(false);
  });

  it('hasNextPage is true when the first page is a full PAGE_SIZE', async () => {
    // Exactly PAGE_SIZE items → server may have more
    const fullPage = Array.from({length: PAGE_SIZE}, (_, i) =>
      image(`img_${i}`),
    );
    mockFetchImages.mockResolvedValue(fullPage);
    mockFetchVotes.mockResolvedValue([]);
    mockFetchFavourites.mockResolvedValue([]);

    const {result} = renderHook(() => useCatGallery(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.hasNextPage).toBe(true);
  });

  it('flattens multiple pages into catCards', async () => {
    const page0 = Array.from({length: PAGE_SIZE}, (_, i) => image(`p0_${i}`));
    const page1 = [image('p1_0'), image('p1_1')];

    // First call → page 0 (full page), second call → page 1 (partial)
    mockFetchImages
      .mockResolvedValueOnce(page0)
      .mockResolvedValueOnce(page1);
    mockFetchVotes.mockResolvedValue([]);
    mockFetchFavourites.mockResolvedValue([]);

    const {result} = renderHook(() => useCatGallery(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.hasNextPage).toBe(true);

    // Fetch next page
    await act(() => result.current.fetchNextPage());

    await waitFor(() =>
      expect(result.current.catCards).toHaveLength(PAGE_SIZE + 2),
    );
    expect(result.current.hasNextPage).toBe(false);
  });
});
