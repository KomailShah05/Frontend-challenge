# Cat Gallery — React Native Challenge

A React Native app built against [The Cat API](https://thecatapi.com). Upload cat images, browse your gallery, vote and favourite — all with offline awareness, dark mode, and full accessibility support.

## Accessibility walkthrough

Full screen-reader walkthrough demonstrating VoiceOver / TalkBack compatibility across every screen — gallery navigation, image upload, voting, and favouriting.

**[▶ Watch on Loom](https://www.loom.com/share/0c374084eddc416a941511c1c6f5fd0b)**

---

## Setup

**Requirements:** Node 18+, Xcode 15+ (iOS), Android Studio with SDK 33+ (Android).

```sh
# 1. Install dependencies
npm install

# 2. iOS only — install native pods
bundle install && bundle exec pod install
```

### Run

```sh
# Start Metro
npm start

# iOS (new terminal)
npm run ios

# Android (new terminal)
npm run android
```

> If you change any native files (e.g. after pulling changes), re-run pod install for iOS and rebuild for Android.

---

## How it works

### Persistent user identity — `react-native-keychain`

Every user gets a unique `sub_id` (UUID) generated on first launch. It is stored in the **device keychain / keystore** via `react-native-keychain` — the same secure enclave used by banking apps and password managers.

- **iOS**: stored in the iOS Keychain, protected by the Secure Enclave
- **Android**: stored in the Android Keystore, hardware-backed on supported devices
- The ID survives app restarts and identifies the user's images, votes, and favourites across sessions
- It is never stored in AsyncStorage, localStorage, or plain files

### Data layer — TanStack Query v5

- All API calls go through a single `apiClient` with `AbortSignal` on every request — no memory leaks from stale fetches
- Optimistic updates with automatic rollback: votes and favourites flip instantly in the UI; if the server rejects, the UI reverts without any extra code
- Infinite scroll with pagination (20 items/page); query results are cached for 30 seconds and garbage-collected after 2 minutes
- The app pauses all background fetches when backgrounded (via `AppState`) and resumes on foreground

### Offline awareness

A banner slides in from the top when the device loses connectivity. All in-flight queries are paused and automatically retried when the connection returns.

### Accessibility

- Full VoiceOver (iOS) and TalkBack (Android) support — every button, image, and status has a proper label and role
- When a screen reader is active, infinite scroll switches to a "Load more" button (scroll-position events don't fire during element navigation)
- Respects the system **Reduce Motion** setting — all animations snap to their final state instantly
- WCAG AA colour contrast across both light and dark themes

### Performance

- `CatCard` is wrapped in `React.memo` with a stable-identity cache — only the card you interacted with re-renders, not the entire list
- `removeClippedSubviews` is disabled automatically when a screen reader is active so no element is missing from the accessibility tree
- Entrance animations run on the native thread (`useNativeDriver: true`)

---

## Tech stack

| | |
|---|---|
| React Native | 0.85 (New Architecture / Fabric + Hermes) |
| React | 19 (`useOptimistic`, `startTransition`) |
| TanStack Query | v5 |
| Navigation | React Navigation v7 |
| Secure storage | react-native-keychain |
| Testing | Jest + @testing-library/react-native |

---

## Tests

```sh
npm test
```
