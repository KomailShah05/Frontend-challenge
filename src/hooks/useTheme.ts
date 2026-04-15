import {useColorScheme} from 'react-native';
import {darkTheme, lightTheme} from '../theme';
import type {ThemeColors} from '../theme';

/**
 * Returns the correct colour palette for the current system appearance.
 *
 * No context or provider needed — useColorScheme() is a built-in React Native
 * hook that re-renders the component when the user switches light ↔ dark.
 * memo() on the consuming component handles unnecessary re-renders for
 * unrelated prop changes.
 */
export const useTheme = (): ThemeColors => {
  const scheme = useColorScheme();
  return scheme === 'dark' ? darkTheme : lightTheme;
};
