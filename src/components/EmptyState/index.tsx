import React, {memo} from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';

interface Props {
  onUpload: () => void;
}

export const EmptyState = memo(({onUpload}: Props) => (
  <View
    style={styles.container}
    accessible
    accessibilityRole="text"
    accessibilityLabel="No cats yet. Tap the button to upload your first cat.">
    <Text style={styles.emoji}>🐱</Text>
    <Text style={styles.title}>No cats yet!</Text>
    <Text style={styles.subtitle}>Upload your first cat to get started.</Text>
    <TouchableOpacity
      onPress={onUpload}
      style={styles.button}
      accessibilityRole="button"
      accessibilityLabel="Upload your first cat">
      <Text style={styles.buttonText}>Upload a Cat</Text>
    </TouchableOpacity>
  </View>
));

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    paddingHorizontal: 32,
  },
  emoji: {fontSize: 56, marginBottom: 16},
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  button: {
    backgroundColor: '#111827',
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 12,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
});
