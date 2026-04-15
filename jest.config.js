module.exports = {
  preset: '@react-native/jest-preset',
  setupFiles: ['./src/__tests__/setup.ts'],
  // Only treat *.test.ts(x) files as test suites — excludes setup/utils helpers
  testMatch: ['**/*.test.[jt]s?(x)'],
  // Extend the preset's transform ignore list with our native/third-party packages
  transformIgnorePatterns: [
    'node_modules/(?!(' +
      'react-native' +
      '|@react-native' +
      '|@react-navigation' +
      '|react-native-keychain' +
      '|react-native-image-picker' +
      '|react-native-config' +
      '|react-native-safe-area-context' +
      '|react-native-screens' +
      '|@tanstack/react-query' +
    ')/)',
  ],
};
