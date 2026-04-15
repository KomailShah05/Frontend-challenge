import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {GalleryScreen} from '../screens/GalleryScreen';
import {UploadScreen} from '../screens/UploadScreen';
import type {RootStackParamList} from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const AppNavigator = () => (
  <Stack.Navigator
    initialRouteName="Gallery"
    screenOptions={{
      // WCAG AA: VoiceOver reads headerBackTitle as the back button label on iOS
      headerBackTitle: 'Back',
      animation: 'slide_from_right',
      headerStyle: {backgroundColor: '#fff'},
      headerTitleStyle: {fontWeight: '700', fontSize: 18},
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
