import type {NativeStackNavigationProp} from '@react-navigation/native-stack';
import type {RouteProp} from '@react-navigation/native';

export type RootStackParamList = {
  Gallery: undefined;
  Upload: undefined;
};

export type GalleryNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Gallery'
>;

export type UploadNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Upload'
>;

export type GalleryRouteProp = RouteProp<RootStackParamList, 'Gallery'>;
export type UploadRouteProp = RouteProp<RootStackParamList, 'Upload'>;
