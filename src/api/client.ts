import axios, {
  AxiosError,
  InternalAxiosRequestConfig,
  AxiosResponse,
} from 'axios';
import {ENV} from '../config/env';

export const apiClient = axios.create({
  baseURL: ENV.API_BASE_URL,
  timeout: 30_000,
  headers: {
    'x-api-key': ENV.API_KEY,
    'Content-Type': 'application/json',
  },
});

// ─── Dev request logger ───────────────────────────────────────────────────────
if (__DEV__) {
  apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    console.log(
      `[API →] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`,
    );
    return config;
  });

  apiClient.interceptors.response.use((response: AxiosResponse) => {
    console.log(`[API ←] ${response.status} ${response.config.url}`);
    return response;
  });
}

// ─── Normalise errors to a plain Error with a readable message ────────────────
apiClient.interceptors.response.use(
  response => response,
  (error: AxiosError<{message?: string}>) => {
    const serverMessage = error.response?.data?.message;
    const message = serverMessage ?? error.message ?? 'An unexpected error occurred';
    return Promise.reject(new Error(message));
  },
);
