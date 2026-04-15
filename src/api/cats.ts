import {apiClient} from './client';
import {ENDPOINTS} from './endpoints';
import type {CatImage, UploadFile, UploadResponse} from '../types/api.types';

/**
 * TanStack Query v5 automatically passes { signal } into query functions.
 * Forwarding it to axios means in-flight requests are cancelled when a
 * component unmounts — preventing memory leaks and stale state updates.
 */
export const fetchMyImages = (
  subId: string,
  signal?: AbortSignal,
): Promise<CatImage[]> =>
  apiClient
    .get<CatImage[]>(ENDPOINTS.IMAGES, {
      params: {sub_id: subId, limit: 100, order: 'DESC'},
      signal,
    })
    .then(r => r.data);

/**
 * Uploads a cat image with progress reporting.
 * @param onProgress - called with 0–100 as bytes are sent
 */
export const uploadImage = (
  file: UploadFile,
  subId: string,
  onProgress?: (percent: number) => void,
  signal?: AbortSignal,
): Promise<UploadResponse> => {
  const form = new FormData();
  form.append('file', {
    uri: file.uri,
    name: file.name,
    type: file.type,
  } as unknown as Blob);
  form.append('sub_id', subId);

  return apiClient
    .post<UploadResponse>(ENDPOINTS.IMAGES_UPLOAD, form, {
      headers: {'Content-Type': 'multipart/form-data'},
      signal,
      onUploadProgress: event => {
        if (onProgress && event.total) {
          onProgress(Math.round((event.loaded / event.total) * 100));
        }
      },
    })
    .then(r => r.data);
};
