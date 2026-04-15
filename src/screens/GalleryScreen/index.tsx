import React from 'react';
import {StyleSheet, Text, View} from 'react-native';

// Phase 2: replace with real cat grid + CatCard components
export const GalleryScreen = () => (
  <View style={styles.container}>
    <Text style={styles.text}>Gallery — Phase 2</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {flex: 1, alignItems: 'center', justifyContent: 'center'},
  text: {fontSize: 16, color: '#666'},
});
