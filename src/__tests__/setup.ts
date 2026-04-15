/**
 * Global jest setup — mocks for native modules that don't run in Node.
 * Runs before every test file (setupFiles in jest.config.js).
 *
 * Rule: mock the boundary (native module), not the JS wrapper.
 */

// TanStack Query's notifyManager batches updates via setTimeout by default.
// In tests that causes two problems:
//   1. State updates fire outside act() → console.error warnings
//   2. The open setTimeout/setImmediate handle prevents Jest from exiting
// Switching to synchronous dispatch eliminates both issues. Batching is still
// preserved because notifyManager wraps the callback in its own batch boundary.
import {notifyManager} from '@tanstack/query-core';
notifyManager.setScheduler(cb => cb());

// ── react-native-keychain ────────────────────────────────────────────────────
jest.mock('react-native-keychain', () => ({
  setGenericPassword: jest.fn().mockResolvedValue(true),
  getGenericPassword: jest.fn().mockResolvedValue(false),
  resetGenericPassword: jest.fn().mockResolvedValue(true),
  ACCESSIBLE: {AFTER_FIRST_UNLOCK: 'AfterFirstUnlock'},
}));

// ── react-native-image-picker ────────────────────────────────────────────────
jest.mock('react-native-image-picker', () => ({
  launchImageLibrary: jest.fn(),
}));

// ── react-native-config ──────────────────────────────────────────────────────
jest.mock('react-native-config', () => ({
  CAT_API_BASE_URL: 'https://api.thecatapi.com/v1',
  CAT_API_KEY: 'test_api_key',
}));

// ── SubIdProvider ────────────────────────────────────────────────────────────
// Tests that use hooks depending on useSubId get a stable, predictable sub_id.
jest.mock('../providers/SubIdProvider', () => ({
  useSubId: jest.fn(() => 'test_sub_123'),
  SubIdProvider: ({children}: {children: React.ReactNode}) => children,
}));
