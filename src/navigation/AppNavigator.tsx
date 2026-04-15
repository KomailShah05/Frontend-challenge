import React from 'react';
import {useColorScheme} from 'react-native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {GalleryScreen} from '../screens/GalleryScreen';
import {UploadScreen} from '../screens/UploadScreen';
import {darkTheme, lightTheme} from '../theme';
import type {RootStackParamList} from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

/**
 * Stack navigator with theme-aware header colours.
 * GalleryScreen overrides headerRight via useLayoutEffect to inject the Upload
 * button while keeping header colours in sync with the current theme.
 */
export const AppNavigator = () => {
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? darkTheme : lightTheme;

  return (
    <Stack.Navigator
      initialRouteName="Gallery"
      screenOptions={{
        // WCAG AA: VoiceOver reads headerBackTitle as the back button label on iOS
        headerBackTitle: 'Back',
        animation: 'slide_from_right',
        headerStyle: {backgroundColor: theme.headerBg},
        headerTitleStyle: {
          fontWeight: '700',
          fontSize: 18,
          color: theme.headerText,
        },
        headerTintColor: theme.headerTint,
        headerShadowVisible: false,
      }}>
      <Stack.Screen
        name="Gallery"
        component={GalleryScreen}
        options={{title: 'My Cats'}}
      />
      <Stack.Screen
        name="Upload"
        component={UploadScreen}
        options={{title: 'Upload a Cat'}}
      />
    </Stack.Navigator>
  );
};
