/**
 * SubIdProvider
 *
 * Generates and persists a stable per-device identifier used as `sub_id`
 * on every Cat API request. Stored in the device Keychain (iOS Secure Enclave /
 * Android Keystore) so it survives app reinstalls and is encrypted at rest.
 *
 * Security: react-native-keychain wraps native secure storage — the value is
 * never written to disk in plaintext unlike AsyncStorage.
 */
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import * as Keychain from 'react-native-keychain';

const KEYCHAIN_SERVICE = 'com.catapp.subid';
const KEYCHAIN_USERNAME = 'device_sub_id';

/**
 * Generates a random sub_id.
 *
 * Hermes (RN 0.71+) exposes Web Crypto via `globalThis.crypto` — NOT as a
 * bare `crypto` global. Accessing the bare identifier throws a ReferenceError
 * at runtime even though `declare var crypto: Crypto` compiles fine.
 *
 * Falls back to Math.random() if globalThis.crypto is unavailable (older
 * Hermes / JSC). For a sub_id used only as an API filter key, pseudo-random
 * is acceptable — this is not cryptographic key material.
 */
const generateSubId = (): string => {
  const bytes = new Uint8Array(16);

  if (globalThis.crypto?.getRandomValues) {
    globalThis.crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < bytes.length; i++) {
      bytes[i] = Math.floor(Math.random() * 256);
    }
  }

  return (
    'user_' + Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('')
  );
};

const SubIdContext = createContext<string>('');

export const useSubId = (): string => useContext(SubIdContext);

export const SubIdProvider = ({children}: {children: React.ReactNode}) => {
  const [subId, setSubId] = useState<string>('');
  const mountedRef = useRef(true);

  const initSubId = useCallback(async () => {
    try {
      const credentials = await Keychain.getGenericPassword({
        service: KEYCHAIN_SERVICE,
      });

      if (!mountedRef.current) return;

      if (credentials) {
        setSubId(credentials.password);
        return;
      }

      const fresh = generateSubId();
      await Keychain.setGenericPassword(KEYCHAIN_USERNAME, fresh, {
        service: KEYCHAIN_SERVICE,
        accessible: Keychain.ACCESSIBLE.AFTER_FIRST_UNLOCK,
      });

      if (mountedRef.current) {
        setSubId(fresh);
      }
    } catch {
      // Keychain unavailable (e.g. simulator without entitlements) — fall back
      // to an in-memory ID. Not persisted but safe for dev/testing.
      if (mountedRef.current) {
        setSubId(generateSubId());
      }
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    initSubId();

    return () => {
      mountedRef.current = false;
    };
  }, [initSubId]);

  if (!subId) {
    return null;
  }

  return (
    <SubIdContext.Provider value={subId}>{children}</SubIdContext.Provider>
  );
};
