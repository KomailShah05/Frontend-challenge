import React, {Component} from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  AccessibilityInfo,
} from 'react-native';
import {useTheme} from '../hooks/useTheme';

interface Props {
  children: React.ReactNode;
  /** Optional fallback to render instead of the default error UI */
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
  message: string;
}

interface ErrorContentProps {
  message: string;
  onRetry: () => void;
}

/**
 * Functional inner component so we can call useTheme() — hooks aren't
 * available in class components. ErrorBoundary renders this when an error
 * is caught and no custom fallback is provided.
 */
const ErrorContent = ({message, onRetry}: ErrorContentProps) => {
  const theme = useTheme();

  return (
    <View
      style={[styles.container, {backgroundColor: theme.bg}]}
      accessible
      accessibilityRole="alert"
      accessibilityLabel="An error occurred. Double tap to retry.">
      <Text style={[styles.title, {color: theme.textPrimary}]}>
        Something went wrong
      </Text>
      {__DEV__ && (
        <Text style={[styles.detail, {color: theme.textSecondary}]}>
          {message}
        </Text>
      )}
      <TouchableOpacity
        style={[styles.button, {backgroundColor: theme.btnPrimary}]}
        onPress={onRetry}
        accessibilityRole="button"
        accessibilityLabel="Retry"
        accessibilityHint="Reloads the screen">
        <Text style={[styles.buttonText, {color: theme.btnPrimaryText}]}>
          Try again
        </Text>
      </TouchableOpacity>
    </View>
  );
};

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
        <ErrorContent
          message={this.state.message}
          onRetry={this.handleRetry}
        />
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
    marginBottom: 8,
  },
  detail: {
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 24,
  },
  button: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    fontWeight: '600',
    fontSize: 15,
  },
});
