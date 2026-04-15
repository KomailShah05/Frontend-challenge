/**
 * Centralised query key factory.
 * Using typed tuple keys ensures cache invalidation is never a typo.
 */
export const QUERY_KEYS = {
  images: (subId: string) => ['images', subId] as const,
  votes: (subId: string) => ['votes', subId] as const,
  favourites: (subId: string) => ['favourites', subId] as const,
} as const;
