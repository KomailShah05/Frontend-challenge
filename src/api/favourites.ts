import {apiClient} from './client';
import {ENDPOINTS} from './endpoints';
import type {
  Favourite,
  FavouritePayload,
  ApiCreatedResponse,
} from '../types/api.types';

export const fetchFavourites = (
  subId: string,
  signal?: AbortSignal,
): Promise<Favourite[]> =>
  apiClient
    .get<Favourite[]>(ENDPOINTS.FAVOURITES, {
      params: {sub_id: subId},
      signal,
    })
    .then(r => r.data);

export const addFavourite = (
  payload: FavouritePayload,
): Promise<ApiCreatedResponse> =>
  apiClient
    .post<ApiCreatedResponse>(ENDPOINTS.FAVOURITES, payload)
    .then(r => r.data);

export const removeFavourite = (favouriteId: number): Promise<void> =>
  apiClient
    .delete(`${ENDPOINTS.FAVOURITES}/${favouriteId}`)
    .then(() => undefined);
