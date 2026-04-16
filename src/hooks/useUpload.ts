import { useCallback, useState } from 'react';
import { AccessibilityInfo, Alert, PermissionsAndroid, Platform } from 'react-native';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { launchImageLibrary } from 'react-native-image-picker';
import { uploadImage } from '../api/cats';
import { QUERY_KEYS } from '../api/queryKeys';
import { useSubId } from '../providers/SubIdProvider';
import type { UploadFile } from '../types/api.types';

const ALLOWED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/jpg',
];
const MAX_BYTES = 10 * 1024 * 1024; // 10 MB — Cat API hard limit

/**
 * On Android 13+ READ_MEDIA_IMAGES is a runtime permission. On older Android
 * READ_EXTERNAL_STORAGE covers the same need. We request before opening the
 * picker so the denial is surfaced as a validation error rather than a silent
 * didCancel return.
 */
async function requestAndroidPermission(): Promise<boolean> {
  if (Platform.OS !== 'android') return true;

  const permission =
    (Platform.Version as number) >= 33
      ? PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES
      : PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE;

  const already = await PermissionsAndroid.check(permission);
  if (already) return true;

  const result = await PermissionsAndroid.request(permission, {
    title: 'Photo Library Access',
    message: 'Cat App needs access to your photos to select a cat image.',
    buttonPositive: 'Allow',
    buttonNegative: 'Deny',
  });
  return result === PermissionsAndroid.RESULTS.GRANTED;
}

/**
 * Encapsulates the full upload flow:
 *   1. Pick image from library (with validation + permission handling)
 *   2. Upload with real-time progress reporting
 *   3. Invalidate image cache on success → gallery refreshes automatically
 *
 * @param onSuccess - called after the image cache is invalidated (navigate away)
 */
export const useUpload = (onSuccess: () => void) => {
  const subId = useSubId();
  const queryClient = useQueryClient();
  const [selectedFile, setSelectedFile] = useState<UploadFile | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [validationError, setValidationError] = useState<string | null>(null);

  const pickImage = useCallback(async () => {
    setValidationError(null);

    // Android: request runtime permission before opening the picker
    const granted = await requestAndroidPermission();
    if (!granted) {
      setValidationError(
        'Photo library access was denied. Please enable it in Settings.',
      );
      return;
    }

    const result = await launchImageLibrary({
      mediaType: 'photo',
      quality: 0.9,
    });

    // Permission denied by OS (iOS) or other picker-level error
    if (result.errorCode) {
      if (result.errorCode === 'permission') {
        Alert.alert(
          'Photo Access Required',
          'Please allow photo library access in Settings to select a cat image.',
          [{ text: 'OK' }],
        );
      } else {
        setValidationError(
          result.errorMessage ?? 'Could not open photo library.',
        );
      }
      return;
    }

    if (result.didCancel || !result.assets?.[0]) return;

    const asset = result.assets[0];
    if (asset.type && !ALLOWED_TYPES.includes(asset.type)) {
      setValidationError('Unsupported file type. Use JPG, PNG, GIF, or WEBP.');
      return;
    }

    if (asset.fileSize && asset.fileSize > MAX_BYTES) {
      const mb = (asset.fileSize / 1024 / 1024).toFixed(1);
      setValidationError(`File too large (${mb} MB). Maximum is 10 MB.`);
      return;
    }

    setSelectedFile({
      uri: asset.uri!,
      name: asset.fileName ?? `cat_${Date.now()}.jpg`,
      type: asset.type ?? 'image/jpeg',
    });
  }, []);

  const upload = useMutation({
    mutationFn: () => {
      if (!selectedFile) throw new Error('No file selected.');
      setUploadProgress(0);
      return uploadImage(selectedFile, subId, setUploadProgress);
    },
    onSuccess: async () => {
      // Invalidate so the gallery refetches the newly uploaded image
      await queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.images(subId),
      });
      setSelectedFile(null);
      setUploadProgress(0);
      // Announce to VoiceOver / TalkBack before navigating away so the user
      // hears confirmation on the screen they're leaving (WCAG 4.1.3)
      AccessibilityInfo.announceForAccessibility(
        'Image uploaded successfully. Going back to home screen.',
      );
      onSuccess();
    },
    onError: () => {
      setUploadProgress(0);
    },
  });

  return {
    selectedFile,
    uploadProgress,
    validationError,
    pickImage,
    upload: upload.mutate,
    isUploading: upload.isPending,
    uploadError: upload.error?.message ?? null,
    canUpload: !!selectedFile && !upload.isPending,
  };
};
