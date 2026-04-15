import React from 'react';
import {StatusBar} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {AppProviders} from './src/providers';
import {AppNavigator} from './src/navigation/AppNavigator';
import {ErrorBoundary} from './src/components/ErrorBoundary';

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <ErrorBoundary>
        <AppProviders>
          <NavigationContainer>
            <AppNavigator />
          </NavigationContainer>
        </AppProviders>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
