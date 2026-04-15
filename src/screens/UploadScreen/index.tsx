import React, {useCallback, useEffect, useRef} from 'react';
import {
  AccessibilityInfo,
  ActivityIndicator,
  Animated,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useUpload} from '../../hooks/useUpload';
import type {UploadNavigationProp} from '../../navigation/types';

interface Props {
  navigation: UploadNavigationProp;
}

export const UploadScreen = ({navigation}: Props) => {
  const goToGallery = useCallback(
    () => navigation.navigate('Gallery'),
    [navigation],
  );

  const {
    selectedFile,
    uploadProgress,
    validationError,
    pickImage,
    upload,
    isUploading,
    uploadError,
    canUpload,
  } = useUpload(goToGallery);

  // Fade-in whenever a new image is picked
  const previewOpacity = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!selectedFile) return;
    previewOpacity.setValue(0);
    const anim = Animated.timing(previewOpacity, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    });
    anim.start();
    return () => anim.stop();
  }, [selectedFile, previewOpacity]);

  const handleUpload = useCallback(() => {
    AccessibilityInfo.announceForAccessibility('Uploading cat image…');
    upload();
  }, [upload]);

  const activeError = validationError ?? uploadError;

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}>

      {/* Pick / preview area */}
      <TouchableOpacity
        style={styles.pickArea}
        onPress={pickImage}
        disabled={isUploading}
        accessibilityRole="button"
        accessibilityLabel={
          selectedFile ? 'Change selected image' : 'Select a cat image from your photo library'
        }
        accessibilityHint="Opens your photo library">
        {selectedFile ? (
          <Animated.View style={{opacity: previewOpacity}}>
            <Image
              source={{uri: selectedFile.uri}}
              style={styles.preview}
              resizeMode="cover"
              accessibilityLabel="Preview of the selected cat image"
            />
          </Animated.View>
        ) : (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderIcon}>📷</Text>
            <Text style={styles.placeholderTitle}>Tap to select a photo</Text>
            <Text style={styles.placeholderSub}>
              JPG · PNG · GIF · WEBP — max 10 MB
            </Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Validation / API error */}
      {!!activeError && (
        <View
          style={styles.errorBanner}
          accessible
          accessibilityRole="alert"
          accessibilityLabel={activeError}>
          <Text style={styles.errorText}>{activeError}</Text>
        </View>
      )}

      {/* Upload progress */}
      {isUploading && (
        <View
          style={styles.progressWrapper}
          accessibilityRole="progressbar"
          accessibilityValue={{min: 0, max: 100, now: uploadProgress}}
          accessibilityLabel={`Uploading: ${uploadProgress}%`}>
          <View style={styles.progressTrack}>
            <View
              style={[styles.progressFill, {width: `${uploadProgress}%`}]}
            />
          </View>
          <Text style={styles.progressText}>{uploadProgress}%</Text>
        </View>
      )}

      {/* Upload button */}
      <TouchableOpacity
        style={[styles.uploadBtn, !canUpload && styles.uploadBtnDisabled]}
        onPress={handleUpload}
        disabled={!canUpload}
        accessibilityRole="button"
        accessibilityLabel="Upload selected cat image"
        accessibilityState={{disabled: !canUpload, busy: isUploading}}>
        {isUploading ? (
          <ActivityIndicator color="#fff" size="small" />
        ) : (
          <Text style={styles.uploadBtnText}>Upload Cat</Text>
        )}
      </TouchableOpacity>

      {selectedFile && !isUploading && (
        <TouchableOpacity
          onPress={pickImage}
          style={styles.changeBtn}
          accessibilityRole="button"
          accessibilityLabel="Choose a different image">
          <Text style={styles.changeBtnText}>Choose a different image</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: 'stretch',
    gap: 16,
  },
  pickArea: {
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderStyle: 'dashed',
    overflow: 'hidden',
    minHeight: 260,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f9fafb',
  },
  preview: {
    width: '100%',
    height: 320,
  },
  placeholder: {
    alignItems: 'center',
    padding: 32,
    gap: 8,
  },
  placeholderIcon: {fontSize: 48},
  placeholderTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  placeholderSub: {
    fontSize: 13,
    color: '#9ca3af',
    textAlign: 'center',
  },
  errorBanner: {
    backgroundColor: '#fef2f2',
    borderRadius: 10,
    padding: 14,
    borderLeftWidth: 4,
    borderLeftColor: '#ef4444',
  },
  errorText: {fontSize: 14, color: '#dc2626', lineHeight: 20},
  progressWrapper: {
    gap: 6,
    alignItems: 'center',
  },
  progressTrack: {
    width: '100%',
    height: 6,
    borderRadius: 3,
    backgroundColor: '#e5e7eb',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#111827',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 13,
    color: '#6b7280',
    fontWeight: '500',
  },
  uploadBtn: {
    backgroundColor: '#111827',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  uploadBtnDisabled: {
    backgroundColor: '#d1d5db',
  },
  uploadBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  changeBtn: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  changeBtnText: {
    fontSize: 14,
    color: '#6b7280',
    textDecorationLine: 'underline',
  },
});
