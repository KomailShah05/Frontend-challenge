import React, {useCallback, useLayoutEffect, useMemo} from 'react';
import {
  FlatList,
  ListRenderItem,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import {useCatGallery} from '../../hooks/useCatGallery';
import {CatCard} from '../../components/CatCard';
import {SkeletonCard} from '../../components/SkeletonCard';
import {EmptyState} from '../../components/EmptyState';
import type {GalleryNavigationProp} from '../../navigation/types';
import type {CatCardData} from '../../types/api.types';

interface Props {
  navigation: GalleryNavigationProp;
}

const GAP = 10;
const PADDING = 12;

export const GalleryScreen = ({navigation}: Props) => {
  const {catCards, isLoading, isError, error, isRefetching, refetchAll} =
    useCatGallery();
  const {width: screenWidth} = useWindowDimensions();

  // Refetch when returning from the Upload screen
  useFocusEffect(
    useCallback(() => {
      refetchAll();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []),
  );

  const {numColumns, cardWidth} = useMemo(() => {
    // Scale: 2 cols on phones, 3 on large phones/small tablets, 4 on tablets
    const cols =
      screenWidth >= 768 ? 4 : screenWidth >= 540 ? 3 : 2;
    const totalGap = GAP * (cols - 1);
    const totalPadding = PADDING * 2;
    return {
      numColumns: cols,
      cardWidth: (screenWidth - totalPadding - totalGap) / cols,
    };
  }, [screenWidth]);

  // Upload button in the nav header
  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          onPress={() => navigation.navigate('Upload')}
          style={styles.headerBtn}
          accessibilityRole="button"
          accessibilityLabel="Upload a new cat image">
          <Text style={styles.headerBtnText}>Upload</Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  const renderItem = useCallback<ListRenderItem<CatCardData>>(
    ({item}) => <CatCard data={item} width={cardWidth} />,
    [cardWidth],
  );

  const keyExtractor = useCallback(
    (item: CatCardData) => item.image.id,
    [],
  );

  if (isLoading) {
    return (
      <View style={styles.skeletonGrid}>
        {Array.from({length: numColumns * 2}, (_, i) => (
          <SkeletonCard key={i} width={cardWidth} />
        ))}
      </View>
    );
  }

  if (isError) {
    return (
      <View
        style={styles.center}
        accessible
        accessibilityRole="alert"
        accessibilityLabel={`Error: ${error?.message ?? 'Failed to load cats'}`}>
        <Text style={styles.errorText}>
          {error?.message ?? 'Failed to load cats'}
        </Text>
        <TouchableOpacity
          onPress={refetchAll}
          style={styles.retryBtn}
          accessibilityRole="button"
          accessibilityLabel="Retry loading cats">
          <Text style={styles.retryText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <FlatList
      // key forces re-mount when column count changes — RN FlatList requirement
      key={numColumns.toString()}
      data={catCards}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      numColumns={numColumns}
      contentContainerStyle={styles.list}
      columnWrapperStyle={numColumns > 1 ? {gap: GAP} : undefined}
      ListEmptyComponent={
        <EmptyState onUpload={() => navigation.navigate('Upload')} />
      }
      refreshing={isRefetching}
      onRefresh={refetchAll}
      removeClippedSubviews
      showsVerticalScrollIndicator={false}
    />
  );
};

const styles = StyleSheet.create({
  list: {
    padding: PADDING,
    gap: GAP,
    flexGrow: 1,
  },
  skeletonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: PADDING,
    gap: GAP,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  errorText: {
    fontSize: 15,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryBtn: {
    backgroundColor: '#111827',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },
  retryText: {color: '#fff', fontWeight: '600', fontSize: 14},
  headerBtn: {marginRight: 16},
  headerBtnText: {fontSize: 15, fontWeight: '600', color: '#111827'},
});
