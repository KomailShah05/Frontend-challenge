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
import {useTheme} from '../../hooks/useTheme';
import type {UploadNavigationProp} from '../../navigation/types';

interface Props {
  navigation: UploadNavigationProp;
}

export const UploadScreen = ({navigation}: Props) => {
  const theme = useTheme();
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
      style={{backgroundColor: theme.bg}}
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}>

      {/* Pick / preview area */}
      <TouchableOpacity
        style={[
          styles.pickArea,
          {
            borderColor: theme.borderDashed,
            backgroundColor: theme.inputBg,
          },
        ]}
        onPress={pickImage}
        disabled={isUploading}
        accessibilityRole="button"
        accessibilityLabel={
          selectedFile
            ? 'Change selected image'
            : 'Select a cat image from your photo library'
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
            <Text style={[styles.placeholderTitle, {color: theme.textPrimary}]}>
              Tap to select a photo
            </Text>
            <Text style={[styles.placeholderSub, {color: theme.textTertiary}]}>
              JPG · PNG · GIF · WEBP — max 10 MB
            </Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Validation / API error */}
      {!!activeError && (
        <View
          style={[
            styles.errorBanner,
            {
              backgroundColor: theme.errorBg,
              borderLeftColor: theme.errorBorder,
            },
          ]}
          accessible
          accessibilityRole="alert"
          accessibilityLabel={activeError}>
          <Text style={[styles.errorText, {color: theme.errorText}]}>
            {activeError}
          </Text>
        </View>
      )}

      {/* Upload progress */}
      {isUploading && (
        <View
          style={styles.progressWrapper}
          accessibilityRole="progressbar"
          accessibilityValue={{min: 0, max: 100, now: uploadProgress}}
          accessibilityLabel={`Uploading: ${uploadProgress}%`}>
          <View
            style={[styles.progressTrack, {backgroundColor: theme.border}]}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${uploadProgress}%`,
                  backgroundColor: theme.btnPrimary,
                },
              ]}
            />
          </View>
          <Text style={[styles.progressText, {color: theme.textSecondary}]}>
            {uploadProgress}%
          </Text>
        </View>
      )}

      {/* Upload button */}
      <TouchableOpacity
        style={[
          styles.uploadBtn,
          {
            backgroundColor: canUpload
              ? theme.btnPrimary
              : theme.btnDisabled,
          },
        ]}
        onPress={handleUpload}
        disabled={!canUpload}
        accessibilityRole="button"
        accessibilityLabel="Upload selected cat image"
        accessibilityState={{disabled: !canUpload, busy: isUploading}}>
        {isUploading ? (
          <ActivityIndicator color={theme.btnPrimaryText} size="small" />
        ) : (
          <Text
            style={[
              styles.uploadBtnText,
              {
                color: canUpload
                  ? theme.btnPrimaryText
                  : theme.btnDisabledText,
              },
            ]}>
            Upload Cat
          </Text>
        )}
      </TouchableOpacity>

      {selectedFile && !isUploading && (
        <TouchableOpacity
          onPress={pickImage}
          style={styles.changeBtn}
          accessibilityRole="button"
          accessibilityLabel="Choose a different image">
          <Text style={[styles.changeBtnText, {color: theme.textSecondary}]}>
            Choose a different image
          </Text>
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
    borderStyle: 'dashed',
    overflow: 'hidden',
    minHeight: 260,
    alignItems: 'center',
    justifyContent: 'center',
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
  },
  placeholderSub: {
    fontSize: 13,
    textAlign: 'center',
  },
  errorBanner: {
    borderRadius: 10,
    padding: 14,
    borderLeftWidth: 4,
  },
  errorText: {fontSize: 14, lineHeight: 20},
  progressWrapper: {
    gap: 6,
    alignItems: 'center',
  },
  progressTrack: {
    width: '100%',
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 13,
    fontWeight: '500',
  },
  uploadBtn: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
  },
  uploadBtnText: {
    fontSize: 16,
    fontWeight: '700',
  },
  changeBtn: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  changeBtnText: {
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});
