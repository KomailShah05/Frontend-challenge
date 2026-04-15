import Config from 'react-native-config';

/**
 * Validates that a required env var exists at startup — crashes loudly in dev
 * rather than silently failing with undefined at runtime.
 */
const required = (key: string, value: string | undefined): string => {
  if (!value) {
    throw new Error(
      `[Config] Missing required environment variable: "${key}". ` +
        'Copy .env.example to .env and fill in your values.',
    );
  }
  return value;
};

export const ENV = {
  API_BASE_URL: required('CAT_API_BASE_URL', Config.CAT_API_BASE_URL),
  API_KEY: required('CAT_API_KEY', Config.CAT_API_KEY),
} as const;
