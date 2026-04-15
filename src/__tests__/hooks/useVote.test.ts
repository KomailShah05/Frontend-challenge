import {act, renderHook, waitFor} from '@testing-library/react-native';
import {useVote} from '../../hooks/useVote';
import {addVote, deleteVote} from '../../api/votes';
import {createTestQueryClient, createWrapper} from '../utils/testUtils';
import {QUERY_KEYS} from '../../api/queryKeys';
import type {ApiCreatedResponse, Vote} from '../../types/api.types';

jest.mock('../../api/votes');

const mockAddVote = addVote as jest.MockedFunction<typeof addVote>;
const mockDeleteVote = deleteVote as jest.MockedFunction<typeof deleteVote>;

const SUB_ID = 'test_sub_123'; // matches the mock in setup.ts
const IMAGE_ID = 'img_001';

const makeVote = (value: 1 | 0, id = 99): Vote => ({
  id,
  image_id: IMAGE_ID,
  value,
  sub_id: SUB_ID,
  created_at: '2024-01-01T00:00:00Z',
});

// ── tests ─────────────────────────────────────────────────────────────────────

describe('useVote — optimistic updates', () => {
  beforeEach(() => jest.clearAllMocks());

  it('calls addVote when there is no existing vote', async () => {
    mockAddVote.mockResolvedValue({id: 1, message: 'SUCCESS'});

    const client = createTestQueryClient();
    client.setQueryData(QUERY_KEYS.votes(SUB_ID), []);

    const {result} = renderHook(() => useVote(IMAGE_ID, null), {
      wrapper: createWrapper(client),
    });

    act(() => result.current.voteUp());

    await waitFor(() => expect(mockAddVote).toHaveBeenCalledTimes(1));
    expect(mockAddVote).toHaveBeenCalledWith({
      image_id: IMAGE_ID,
      value: 1,
      sub_id: SUB_ID,
    });
    expect(mockDeleteVote).not.toHaveBeenCalled();
  });

  it('writes an optimistic vote to the cache before the API resolves', async () => {
    // Hold the mutation pending so we can inspect optimistic state
    let resolveMutation!: (value: ApiCreatedResponse) => void;
    mockAddVote.mockReturnValue(
      new Promise<ApiCreatedResponse>(res => {
        resolveMutation = res;
      }),
    );

    const client = createTestQueryClient();
    client.setQueryData(QUERY_KEYS.votes(SUB_ID), []);

    const {result} = renderHook(() => useVote(IMAGE_ID, null), {
      wrapper: createWrapper(client),
    });

    act(() => result.current.voteUp());

    // onMutate is async (cancelQueries → setQueryData), so wait for the
    // optimistic entry to appear rather than checking synchronously
    await waitFor(() => {
      const cached = client.getQueryData<Vote[]>(QUERY_KEYS.votes(SUB_ID));
      expect(cached).toEqual(
        expect.arrayContaining([
          expect.objectContaining({image_id: IMAGE_ID, value: 1}),
        ]),
      );
    });

    // Resolve so TanStack Query can clean up
    act(() => resolveMutation({id: 1, message: 'SUCCESS'}));
    await waitFor(() => expect(result.current.isPending).toBe(false));
  });

  it('deletes existing vote then adds new one when switching from down to up', async () => {
    const existingDown = makeVote(0, 55);
    // deleteVote returns Promise<void>
    mockDeleteVote.mockResolvedValue(undefined);
    mockAddVote.mockResolvedValue({id: 2, message: 'SUCCESS'});

    const client = createTestQueryClient();
    client.setQueryData(QUERY_KEYS.votes(SUB_ID), [existingDown]);

    const {result} = renderHook(() => useVote(IMAGE_ID, existingDown), {
      wrapper: createWrapper(client),
    });

    act(() => result.current.voteUp());

    await waitFor(() => expect(mockDeleteVote).toHaveBeenCalledWith(55));
    await waitFor(() =>
      expect(mockAddVote).toHaveBeenCalledWith({
        image_id: IMAGE_ID,
        value: 1,
        sub_id: SUB_ID,
      }),
    );
  });

  it('only deletes when tapping the active vote (toggle off)', async () => {
    const existingUp = makeVote(1, 77);
    // deleteVote returns Promise<void>
    mockDeleteVote.mockResolvedValue(undefined);

    const client = createTestQueryClient();
    client.setQueryData(QUERY_KEYS.votes(SUB_ID), [existingUp]);

    const {result} = renderHook(() => useVote(IMAGE_ID, existingUp), {
      wrapper: createWrapper(client),
    });

    // Tap up again → should toggle OFF (delete only, no re-add)
    act(() => result.current.voteUp());

    await waitFor(() => expect(mockDeleteVote).toHaveBeenCalledWith(77));
    expect(mockAddVote).not.toHaveBeenCalled();
  });

  it('rolls back the optimistic entry when the mutation fails', async () => {
    mockAddVote.mockRejectedValue(new Error('Server error'));

    const client = createTestQueryClient();
    client.setQueryData(QUERY_KEYS.votes(SUB_ID), []);

    const {result} = renderHook(() => useVote(IMAGE_ID, null), {
      wrapper: createWrapper(client),
    });

    act(() => result.current.voteUp());

    await waitFor(() => expect(result.current.isPending).toBe(false));

    // onError restores the snapshot; onSettled then invalidates (GC may clear it).
    // Either way the optimistic placeholder (id: -1) must not remain.
    const afterError = client.getQueryData<Vote[]>(QUERY_KEYS.votes(SUB_ID));
    expect(afterError ?? []).not.toEqual(
      expect.arrayContaining([expect.objectContaining({id: -1})]),
    );
  });
});
