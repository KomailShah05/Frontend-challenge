/**
 * React Native's tsconfig excludes the DOM lib to prevent browser types
 * leaking into the RN environment. We declare only what Hermes/JSC actually
 * expose at runtime so TypeScript stays accurate without wholesale DOM inclusion.
 *
 * NOTE: Hermes exposes Web Crypto via `globalThis.crypto`, NOT as a bare
 * `crypto` global. Always access it through globalThis to avoid ReferenceError.
 */
declare namespace globalThis {
  // May be undefined on older Hermes / JSC builds — always guard with ?.
  var crypto: Crypto | undefined;
}
