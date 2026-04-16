import React, { useCallback, useLayoutEffect, useMemo } from 'react';
import {
  ActivityIndicator,
  FlatList,
  ListRenderItem,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useCatGallery } from '../../hooks/useCatGallery';
import { useTheme } from '../../hooks/useTheme';
import { CatCard } from '../../components/CatCard';
import { SkeletonCard } from '../../components/SkeletonCard';
import { EmptyState } from '../../components/EmptyState';
import type { GalleryNavigationProp } from '../../navigation/types';
import type { CatCardData } from '../../types/api.types';

interface Props {
  navigation: GalleryNavigationProp;
}

const GAP = 10;
const PADDING = 12;

export const GalleryScreen = ({ navigation }: Props) => {
  const theme = useTheme();
  const {
    catCards,
    isLoading,
    isError,
    error,
    isRefetching,
    isFetchingNextPage,
    refetchAll,
    fetchNextPage,
    hasNextPage,
  } = useCatGallery();
  const { width: screenWidth } = useWindowDimensions();

  // Refetch when returning from the Upload screen.
  // refetchAll is stable (queryClient + subId deps) so this won't re-run on
  // every render — only when the screen gains focus.
  useFocusEffect(
    useCallback(() => {
      refetchAll();
    }, [refetchAll]),
  );

  const { numColumns, cardWidth } = useMemo(() => {
    const cols = screenWidth >= 768 ? 4 : screenWidth >= 540 ? 3 : 2;
    const totalGap = GAP * (cols - 1);
    const totalPadding = PADDING * 2;
    return {
      numColumns: cols,
      cardWidth: (screenWidth - totalPadding - totalGap) / cols,
    };
  }, [screenWidth]);

  // Upload button + theme-aware header colours
  useLayoutEffect(() => {
    navigation.setOptions({
      headerStyle: { backgroundColor: theme.headerBg },
      headerTitleStyle: {
        fontWeight: '700',
        fontSize: 18,
        color: theme.headerText,
      },
      headerTintColor: theme.headerTint,
      headerRight: () => (
        <TouchableOpacity
          onPress={() => navigation.navigate('Upload')}
          style={styles.headerBtn}
          accessibilityRole="button"
          accessibilityLabel="Upload a new cat image"
        >
          <Text style={[styles.headerBtnText, { color: theme.headerTint }]}>
            Upload
          </Text>
        </TouchableOpacity>
      ),
    });
  }, [navigation, theme]);

  const renderItem = useCallback<ListRenderItem<CatCardData>>(
    ({ item }) => <CatCard data={item} width={cardWidth} />,
    [cardWidth],
  );

  const keyExtractor = useCallback((item: CatCardData) => item.image.id, []);

  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const ListFooter = useMemo(
    () =>
      isFetchingNextPage ? (
        <ActivityIndicator
          style={styles.footer}
          color={theme.textSecondary}
          accessibilityLabel="Loading more cats"
        />
      ) : null,
    [isFetchingNextPage, theme.textSecondary],
  );

  if (isLoading) {
    return (
      <View style={[styles.skeletonGrid, { backgroundColor: theme.bg }]}>
        {Array.from({ length: numColumns * 2 }, (_, i) => (
          <SkeletonCard key={i} width={cardWidth} />
        ))}
      </View>
    );
  }

  if (isError) {
    return (
      <View
        style={[styles.center, { backgroundColor: theme.bg }]}
        accessible
        accessibilityRole="alert"
        accessibilityLabel={`Error: ${error?.message ?? 'Failed to load cats'}`}
      >
        <Text style={[styles.errorText, { color: theme.textSecondary }]}>
          {error?.message ?? 'Failed to load cats'}
        </Text>
        <TouchableOpacity
          onPress={refetchAll}
          style={[styles.retryBtn, { backgroundColor: theme.btnPrimary }]}
          accessibilityRole="button"
          accessibilityLabel="Retry loading cats"
        >
          <Text style={[styles.retryText, { color: theme.btnPrimaryText }]}>
            Retry
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  const list = (
    <FlatList
      style={{ backgroundColor: theme.bg }}
      // key forces re-mount when column count changes — RN FlatList requirement
      key={numColumns.toString()}
      data={catCards}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      numColumns={numColumns}
      contentContainerStyle={[styles.list, { backgroundColor: theme.bg }]}
      columnWrapperStyle={numColumns > 1 ? { gap: GAP } : undefined}
      ListEmptyComponent={
        <EmptyState onUpload={() => navigation.navigate('Upload')} />
      }
      ListFooterComponent={ListFooter}
      refreshing={isRefetching}
      onRefresh={refetchAll}
      onEndReached={handleEndReached}
      onEndReachedThreshold={0.4}
      removeClippedSubviews
      showsVerticalScrollIndicator={false}
      // Performance tuning: render enough rows to fill the visible area on
      // mount without over-rendering off-screen content.
      initialNumToRender={numColumns * 4}
      maxToRenderPerBatch={numColumns * 2}
      updateCellsBatchingPeriod={50}
      windowSize={5}
    />
  );

  if (__DEV__) {
    return (
      <React.Profiler
        id="GalleryFlatList"
        onRender={(_id, _phase, actualDuration) => {
          if (actualDuration > 16) {
            console.warn(
              `[Perf] GalleryFlatList render took ${actualDuration.toFixed(
                1,
              )}ms`,
            );
          }
        }}
      >
        {list}
      </React.Profiler>
    );
  }

  return list;
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
    textAlign: 'center',
    marginBottom: 20,
  },
  retryBtn: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 10,
  },
  retryText: { fontWeight: '600', fontSize: 14 },
  headerBtn: { marginRight: 16 },
  headerBtnText: { fontSize: 15, fontWeight: '600' },
  footer: { paddingVertical: 20 },
});
