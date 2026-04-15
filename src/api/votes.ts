import {apiClient} from './client';
import {ENDPOINTS} from './endpoints';
import type {Vote, VotePayload, ApiCreatedResponse} from '../types/api.types';

export const fetchVotes = (
  subId: string,
  signal?: AbortSignal,
): Promise<Vote[]> =>
  apiClient
    .get<Vote[]>(ENDPOINTS.VOTES, {
      params: {sub_id: subId, limit: 100},
      signal,
    })
    .then(r => r.data);

export const addVote = (payload: VotePayload): Promise<ApiCreatedResponse> =>
  apiClient
    .post<ApiCreatedResponse>(ENDPOINTS.VOTES, payload)
    .then(r => r.data);

/**
 * Used internally when a user changes their vote (e.g. up → down).
 * The Cat API does not support updating a vote — you delete the old one
 * and post a new one. Not exposed as a user-facing "remove vote" action.
 */
export const deleteVote = (voteId: number): Promise<void> =>
  apiClient.delete(`${ENDPOINTS.VOTES}/${voteId}`).then(() => undefined);
