import React, {Component} from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  AccessibilityInfo,
} from 'react-native';

interface Props {
  children: React.ReactNode;
  /** Optional fallback to render instead of the default error UI */
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
  message: string;
}

/**
 * ErrorBoundary catches unhandled render errors in the component tree.
 * Must be a class component — React has no hooks equivalent for componentDidCatch.
 *
 * Accessibility: error state is announced to screen readers via
 * AccessibilityInfo.announceForAccessibility so VoiceOver/TalkBack users
 * are immediately informed something went wrong.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = {hasError: false, message: ''};

  static getDerivedStateFromError(error: Error): State {
    return {hasError: true, message: error.message};
  }

  componentDidCatch(error: Error): void {
    if (__DEV__) {
      console.error('[ErrorBoundary]', error);
    }
    // Announce to screen readers (WCAG 4.1.3 — Status Messages)
    AccessibilityInfo.announceForAccessibility(
      'Something went wrong. Please try again.',
    );
  }

  private handleRetry = () => {
    this.setState({hasError: false, message: ''});
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <View
          style={styles.container}
          accessible
          accessibilityRole="alert"
          accessibilityLabel="An error occurred. Double tap to retry.">
          <Text style={styles.title}>Something went wrong</Text>
          {__DEV__ && (
            <Text style={styles.detail}>{this.state.message}</Text>
          )}
          <TouchableOpacity
            style={styles.button}
            onPress={this.handleRetry}
            accessibilityRole="button"
            accessibilityLabel="Retry"
            accessibilityHint="Reloads the screen">
            <Text style={styles.buttonText}>Try again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111',
    marginBottom: 8,
  },
  detail: {
    fontSize: 13,
    color: '#888',
    textAlign: 'center',
    marginBottom: 24,
  },
  button: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#000',
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
});
