import React from 'react';
import {StatusBar, StyleSheet, useColorScheme, View} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {AppProviders} from './src/providers';
import {AppNavigator} from './src/navigation/AppNavigator';
import {ErrorBoundary} from './src/components/ErrorBoundary';
import {OfflineBanner} from './src/components/OfflineBanner';
import {darkTheme, lightTheme} from './src/theme';

export default function App() {
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? darkTheme : lightTheme;

  return (
    <SafeAreaProvider>
      <StatusBar
        barStyle={theme.statusBarStyle}
        backgroundColor={theme.headerBg}
      />
      <ErrorBoundary>
        <AppProviders>
          {/* OfflineBanner sits outside NavigationContainer so it overlays every screen */}
          <View style={styles.root}>
            <NavigationContainer>
              <AppNavigator />
            </NavigationContainer>
            <OfflineBanner />
          </View>
        </AppProviders>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: {flex: 1},
});
