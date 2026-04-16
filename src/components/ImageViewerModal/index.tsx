import React from 'react';
import {
  Image,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

interface Props {
  uri: string | null;
  onClose: () => void;
}

/**
 * Full-screen image viewer rendered inside a Modal.
 *
 * iOS:  ScrollView with maximumZoomScale enables native pinch-to-zoom.
 * Android: pinch-to-zoom requires a native gesture library; this falls back to
 *          a plain full-screen image.  Tap anywhere to dismiss.
 *
 * Accessibility:
 *   - Hardware back button (Android) + swipe-down (iOS modal) both call onClose.
 *   - Close button labelled for screen readers.
 *   - StatusBar switches to light (white) content against the black backdrop.
 */
export const ImageViewerModal = ({uri, onClose}: Props) => {
  if (!uri) return null;

  return (
    <Modal
      visible
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />

      {/* Backdrop — tap outside the image to close */}
      <Pressable style={styles.backdrop} onPress={onClose} accessibilityRole="button" accessibilityLabel="Close image viewer">
        {/* Intercept touches on the image itself so they don't dismiss the modal */}
        <Pressable
          onPress={() => {}} // swallow tap so backdrop doesn't close from image taps
          style={styles.imageContainer}>
          {Platform.OS === 'ios' ? (
            /* iOS: ScrollView gives us free pinch-to-zoom */
            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={styles.scrollContent}
              maximumZoomScale={4}
              minimumZoomScale={1}
              showsHorizontalScrollIndicator={false}
              showsVerticalScrollIndicator={false}
              centerContent>
              <Image
                source={{uri}}
                style={styles.image}
                resizeMode="contain"
                accessibilityLabel="Full size cat image"
              />
            </ScrollView>
          ) : (
            <Image
              source={{uri}}
              style={styles.image}
              resizeMode="contain"
              accessibilityLabel="Full size cat image"
            />
          )}
        </Pressable>
      </Pressable>

      {/* Close button */}
      <TouchableOpacity
        style={styles.closeBtn}
        onPress={onClose}
        accessibilityRole="button"
        accessibilityLabel="Close"
        hitSlop={{top: 12, left: 12, bottom: 12, right: 12}}>
        <View style={styles.closeBtnBg}>
          <Text style={styles.closeBtnText}>✕</Text>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    width: '100%',
    height: '100%',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  closeBtn: {
    position: 'absolute',
    top: 52,
    right: 20,
  },
  closeBtnBg: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.18)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 20,
  },
});
