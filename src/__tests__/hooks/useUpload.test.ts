import {act, renderHook} from '@testing-library/react-native';
import {launchImageLibrary} from 'react-native-image-picker';
import {PermissionsAndroid} from 'react-native';
import {useUpload} from '../../hooks/useUpload';
import {createWrapper} from '../utils/testUtils';

// ── helpers ───────────────────────────────────────────────────────────────────

const mockLaunch = launchImageLibrary as jest.MockedFunction<typeof launchImageLibrary>;

const makeAsset = (overrides: Partial<{
  uri: string; type: string; fileSize: number; fileName: string;
}> = {}) => ({
  uri: 'file:///tmp/cat.jpg',
  type: 'image/jpeg',
  fileSize: 1_000_000, // 1 MB — well under the 10 MB limit
  fileName: 'cat.jpg',
  ...overrides,
});

const pickResult = (asset: ReturnType<typeof makeAsset>) => ({
  didCancel: false,
  assets: [asset],
  errorCode: undefined,
  errorMessage: undefined,
});

// ── setup ─────────────────────────────────────────────────────────────────────

beforeEach(() => {
  jest.clearAllMocks();
  // Grant Android permission by default so most tests don't need to worry about it
  jest.spyOn(PermissionsAndroid, 'check').mockResolvedValue(true);
});

// ── tests ─────────────────────────────────────────────────────────────────────

describe('useUpload — pickImage', () => {
  it('sets selectedFile when a valid image is picked', async () => {
    mockLaunch.mockResolvedValueOnce(pickResult(makeAsset()));

    const {result} = renderHook(() => useUpload(jest.fn()), {
      wrapper: createWrapper(),
    });

    await act(() => result.current.pickImage());

    expect(result.current.selectedFile).toEqual({
      uri: 'file:///tmp/cat.jpg',
      name: 'cat.jpg',
      type: 'image/jpeg',
    });
    expect(result.current.validationError).toBeNull();
    expect(result.current.canUpload).toBe(true);
  });

  it('does nothing when the picker is cancelled', async () => {
    mockLaunch.mockResolvedValueOnce({didCancel: true, assets: []});

    const {result} = renderHook(() => useUpload(jest.fn()), {
      wrapper: createWrapper(),
    });

    await act(() => result.current.pickImage());

    expect(result.current.selectedFile).toBeNull();
    expect(result.current.canUpload).toBe(false);
  });

  it('sets validationError for unsupported file type', async () => {
    mockLaunch.mockResolvedValueOnce(
      pickResult(makeAsset({type: 'image/tiff'})),
    );

    const {result} = renderHook(() => useUpload(jest.fn()), {
      wrapper: createWrapper(),
    });

    await act(() => result.current.pickImage());

    expect(result.current.selectedFile).toBeNull();
    expect(result.current.validationError).toMatch(/unsupported file type/i);
    expect(result.current.canUpload).toBe(false);
  });

  it('sets validationError when file exceeds 10 MB', async () => {
    const elevenMB = 11 * 1024 * 1024;
    mockLaunch.mockResolvedValueOnce(
      pickResult(makeAsset({fileSize: elevenMB})),
    );

    const {result} = renderHook(() => useUpload(jest.fn()), {
      wrapper: createWrapper(),
    });

    await act(() => result.current.pickImage());

    expect(result.current.selectedFile).toBeNull();
    expect(result.current.validationError).toMatch(/file too large/i);
  });

  it('sets validationError when Android permission is denied', async () => {
    // Force the Android code path (jest runs on the 'ios' platform by default)
    const Platform = require('react-native').Platform;
    const origOS = Platform.OS;
    Platform.OS = 'android';

    jest.spyOn(PermissionsAndroid, 'check').mockResolvedValue(false);
    jest
      .spyOn(PermissionsAndroid, 'request')
      .mockResolvedValue(PermissionsAndroid.RESULTS.DENIED);

    const {result} = renderHook(() => useUpload(jest.fn()), {
      wrapper: createWrapper(),
    });

    await act(() => result.current.pickImage());

    Platform.OS = origOS; // restore after test

    expect(result.current.validationError).toMatch(/photo library access was denied/i);
    expect(mockLaunch).not.toHaveBeenCalled();
  });

  it('clears a previous validationError on the next pick attempt', async () => {
    // First pick: unsupported type → validation error
    mockLaunch.mockResolvedValueOnce(
      pickResult(makeAsset({type: 'image/tiff'})),
    );

    const {result} = renderHook(() => useUpload(jest.fn()), {
      wrapper: createWrapper(),
    });

    await act(() => result.current.pickImage());
    expect(result.current.validationError).not.toBeNull();

    // Second pick: valid image → error should clear
    mockLaunch.mockResolvedValueOnce(pickResult(makeAsset()));
    await act(() => result.current.pickImage());

    expect(result.current.validationError).toBeNull();
    expect(result.current.selectedFile).not.toBeNull();
  });

  it('uses a fallback filename when asset.fileName is undefined', async () => {
    mockLaunch.mockResolvedValueOnce(
      pickResult(makeAsset({fileName: undefined as unknown as string})),
    );

    const {result} = renderHook(() => useUpload(jest.fn()), {
      wrapper: createWrapper(),
    });

    await act(() => result.current.pickImage());

    expect(result.current.selectedFile?.name).toMatch(/^cat_\d+\.jpg$/);
  });
});
