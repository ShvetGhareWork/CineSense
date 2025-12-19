import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Keyboard,
  Modal,
  ScrollView,
} from 'react-native';
import Animated, {
  FadeInUp,
  SlideInDown,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  interpolate,
  Layout,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import MediaCard from '../../components/media/MediaCard';
import api from '../../api/client';
import { colors, gradients, typography, spacing, borderRadius } from '../../constants/theme';
import AppText from '../../components/common/AppText';

const GENRES = [
  { id: 28, name: 'Action' },
  { id: 12, name: 'Adventure' },
  { id: 16, name: 'Animation' },
  { id: 35, name: 'Comedy' },
  { id: 80, name: 'Crime' },
  { id: 99, name: 'Documentary' },
  { id: 18, name: 'Drama' },
  { id: 10751, name: 'Family' },
  { id: 14, name: 'Fantasy' },
  { id: 27, name: 'Horror' },
  { id: 10749, name: 'Romance' },
  { id: 878, name: 'Sci-Fi' },
  { id: 53, name: 'Thriller' },
];

const SORT_OPTIONS = [
  { id: 'popularity.desc', name: 'Popularity ↓' },
  { id: 'vote_average.desc', name: 'Rating ↓' },
  { id: 'release_date.desc', name: 'Newest First' },
  { id: 'release_date.asc', name: 'Oldest First' },
];

// Memoized Header Component to prevent keyboard flickering/unmounting during typing
const DiscoverHeader = React.memo(({ 
  localQuery, 
  setLocalQuery, 
  searchQuery, 
  setSearchQuery, 
  handleSearchTrigger, 
  selectedGenres, 
  openFilters, 
  mediaType, 
  setMediaType 
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const searchWidth = useSharedValue(0);
  const searchBgOpacity = useSharedValue(0.8);

  const searchAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: interpolate(searchWidth.value, [0, 1], [1, 1.02]) }],
  }));

  const searchBlurStyle = useAnimatedStyle(() => ({
    opacity: interpolate(searchBgOpacity.value, [0.8, 1], [0.8, 1]),
  }));

  const handleFocus = () => {
    setIsFocused(true);
    searchWidth.value = withSpring(1, { damping: 15 });
    searchBgOpacity.value = withSpring(1, { damping: 15 });
  };

  const handleBlur = () => {
    setIsFocused(false);
    searchWidth.value = withSpring(0, { damping: 15 });
    searchBgOpacity.value = withSpring(0.8, { damping: 15 });
  };

  return (
    <View style={styles.header}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Animated.View style={searchAnimatedStyle}>
          <BlurView intensity={80} tint="dark" style={styles.searchBlur}>
            <Animated.View style={[styles.searchBar, searchBlurStyle]}>
              <Ionicons name="search" size={20} color={colors.textSecondary} />
              <TextInput
                key="search-input-field"
                style={styles.searchInput}
                placeholder="Search movies & TV shows..."
                placeholderTextColor={colors.textSecondary}
                value={localQuery}
                onChangeText={setLocalQuery}
                onSubmitEditing={handleSearchTrigger}
                onFocus={handleFocus}
                onBlur={handleBlur}
                returnKeyType="search"
                autoCorrect={false}
                autoCapitalize="none"
              />
              {localQuery.length > 0 && (
                <TouchableOpacity onPress={() => {
                  setLocalQuery('');
                  setSearchQuery('');
                }}>
                  <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
                </TouchableOpacity>
              )}
            </Animated.View>
          </BlurView>
        </Animated.View>
      </View>

      {/* Filter Chips */}
      {!searchQuery && (
        <View style={styles.filterChips}>
          <TouchableOpacity style={styles.filterButton} onPress={openFilters}>
            <LinearGradient
              colors={selectedGenres.length > 0 ? gradients.purple : ['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
              style={styles.filterButtonGradient}
            >
              <Ionicons name="options" size={18} color="#fff" />
              <AppText variant="body" style={styles.filterButtonText}>Filters</AppText>
              {selectedGenres.length > 0 && (
                <View style={styles.filterBadge}>
                  <AppText variant="tiny" style={styles.filterBadgeText}>{selectedGenres.length}</AppText>
                </View>
              )}
            </LinearGradient>
          </TouchableOpacity>

          {/* Media Type Toggle */}
          <View style={styles.mediaTypeToggle}>
            {['all', 'movie', 'tv'].map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.mediaTypeButton,
                  mediaType === type && styles.mediaTypeButtonActive
                ]}
                onPress={() => setMediaType(type)}
              >
                <AppText variant="body" style={[
                  styles.mediaTypeText,
                  mediaType === type && styles.mediaTypeTextActive
                ]}>
                  {type === 'all' ? 'All' : type === 'movie' ? 'Movies' : 'TV Shows'}
                </AppText>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
    </View>
  );
});

// Animated Genre Chip Component
const GenreChip = ({ genre, isSelected, onPress }) => {
  const scale = useSharedValue(1);

  const handlePress = () => {
    scale.value = withSequence(
      withSpring(1.1, { damping: 12 }),
      withSpring(1, { damping: 12 })
    );
    onPress();
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <TouchableOpacity
        style={[
          styles.genreChip,
          isSelected && styles.genreChipActive
        ]}
        onPress={handlePress}
      >
        <AppText variant="body" style={[
          styles.genreChipText,
          isSelected && styles.genreChipTextActive
        ]}>
          {genre.name}
        </AppText>
      </TouchableOpacity>
    </Animated.View>
  );
};

// Custom Filter Modal Content Component
const FilterModalContent = ({
  isVisible,
  closeFilters,
  clearFilters,
  selectedGenres,
  toggleGenre,
  selectedSort,
  setSelectedSort,
}) => {
  if (!isVisible) return null;

  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="slide"
      onRequestClose={closeFilters}
    >
      <View style={styles.modalOverlay}>
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          onPress={closeFilters}
          activeOpacity={1}
        />
        <View style={styles.modalContent}>
          <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
            <View style={styles.modalHeader}>
              <AppText variant="h2" style={styles.modalTitle}>Filters</AppText>
              <View style={styles.modalHeaderActions}>
                <TouchableOpacity onPress={clearFilters} style={styles.clearButton}>
                  <AppText variant="body" style={styles.clearText}>Clear All</AppText>
                </TouchableOpacity>
                <TouchableOpacity onPress={closeFilters} style={styles.closeButton}>
                  <Ionicons name="close" size={28} color={colors.textPrimary} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Genres */}
            <View style={styles.filterSection}>
              <AppText variant="h4" style={styles.filterSectionTitle}>Genres</AppText>
              <View style={styles.genreGrid}>
                {GENRES.map((genre) => (
                  <GenreChip
                    key={genre.id}
                    genre={genre}
                    isSelected={selectedGenres.includes(genre.id)}
                    onPress={() => toggleGenre(genre.id)}
                  />
                ))}
              </View>
            </View>

            {/* Sort By */}
            <View style={styles.filterSection}>
              <AppText variant="h4" style={styles.filterSectionTitle}>Sort By</AppText>
              {SORT_OPTIONS.map((option) => (
                <TouchableOpacity
                  key={option.id}
                  style={styles.sortOption}
                  onPress={() => setSelectedSort(option.id)}
                >
                  <AppText variant="body" style={[
                    styles.sortOptionText,
                    selectedSort === option.id && styles.sortOptionTextActive
                  ]}>
                    {option.name}
                  </AppText>
                  {selectedSort === option.id && (
                    <Ionicons name="checkmark-circle" size={20} color={colors.purple} />
                  )}
                </TouchableOpacity>
              ))}
            </View>

            <View style={{ height: spacing.massive }} />
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};


export default function DiscoverScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [localQuery, setLocalQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  
  // Filters
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [selectedSort, setSelectedSort] = useState('popularity.desc');
  const [mediaType, setMediaType] = useState('all'); // all, movie, tv
  
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  
  useEffect(() => {
    loadDiscoverContent();
  }, [selectedGenres, selectedSort, mediaType]);

  const handleSearchTrigger = useCallback(() => {
    if (localQuery.trim()) {
      setSearchQuery(localQuery);
    }
  }, [localQuery]);

  useEffect(() => {
    if (searchQuery.trim()) {
      handleSearch();
    } else {
      loadDiscoverContent();
    }
  }, [searchQuery]);

  const handleSearch = async () => {
    try {
      setLoading(true);
      setPage(1);
      const response = await api.get(`/media/search?query=${encodeURIComponent(searchQuery)}`);
      
      const searchResults = response.data.data.results
        .filter(item => item.media_type === 'movie' || item.media_type === 'tv')
        .map(item => ({
          ...item,
          tmdbId: item.id?.toString(),
          type: item.media_type,
          title: item.title || item.name,
          posterPath: item.poster_path,
          voteAverage: item.vote_average,
        }));
      
      setResults(searchResults);
      setHasMore(searchResults.length >= 20);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadDiscoverContent = async (loadMore = false) => {
    try {
      setLoading(true);
      const currentPage = loadMore ? page + 1 : 1;
      
      const genreParam = selectedGenres.length > 0 ? `&with_genres=${selectedGenres.join(',')}` : '';
      const sortParam = selectedSort ? `&sort_by=${selectedSort}` : '';
      
      let response;
      
      if (mediaType === 'all') {
        // Fetch both movies and TV shows
        const [moviesRes, tvRes] = await Promise.all([
          api.get(`/media/trending?mediaType=movie&timeWindow=week&page=${currentPage}${genreParam}${sortParam}`),
          api.get(`/media/trending?mediaType=tv&timeWindow=week&page=${currentPage}${genreParam}${sortParam}`)
        ]);
        
        const combinedResults = [
          ...moviesRes.data.data.results.map(item => ({ ...item, media_type: 'movie' })),
          ...tvRes.data.data.results.map(item => ({ ...item, media_type: 'tv' }))
        ].sort((a, b) => b.vote_average - a.vote_average);
        
        response = { data: { data: { results: combinedResults } } };
      } else {
        response = await api.get(
          `/media/trending?mediaType=${mediaType}&timeWindow=week&page=${currentPage}${genreParam}${sortParam}`
        );
      }
      
      const newResults = response.data.data.results.map(item => ({
        ...item,
        tmdbId: item.id?.toString(),
        type: item.media_type || typeParam,
        title: item.title || item.name,
        posterPath: item.poster_path,
        voteAverage: item.vote_average,
      }));
      
      setResults(loadMore ? [...results, ...newResults] : newResults);
      setPage(currentPage);
      setHasMore(newResults.length >= 20);
    } catch (error) {
      console.error('Failed to load discover content:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = () => {
    if (!loading && hasMore && !searchQuery) {
      loadDiscoverContent(true);
    }
  };

  const toggleGenre = (genreId) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedGenres(prev =>
      prev.includes(genreId)
        ? prev.filter(id => id !== genreId)
        : [...prev, genreId]
    );
  };

  const clearFilters = () => {
    setSelectedGenres([]);
    setSelectedSort('popularity.desc');
    setMediaType('all');
  };

  const openFilters = useCallback(() => {
    Keyboard.dismiss();
    setFilterModalVisible(true);
  }, []);

  const closeFilters = () => {
    setFilterModalVisible(false);
  };

  const renderItem = ({ item, index }) => (
    <Animated.View 
      style={[styles.gridItem, index % 2 === 0 ? styles.gridItemLeft : styles.gridItemRight]}
      entering={FadeInUp.duration(300).delay(index * 40)}
      layout={Layout.springify().damping(15)}
    >
      <MediaCard
        media={item}
        showStatus={false}
        showRating={true}
        showTitle={false}
        width={155}
        height={233}
      />
    </Animated.View>
  );

  const renderFooter = () => {
    if (!loading) return null;
    return (
      <View style={styles.footer}>
        <ActivityIndicator size="small" color={colors.purple} />
      </View>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyState}>
      <Ionicons name="search" size={80} color={colors.textTertiary} />
      <AppText variant="h3" style={styles.emptyTitle}>No results found</AppText>
      <AppText variant="body" style={styles.emptySubtitle}>
        {searchQuery ? 'Try a different search term' : 'Try adjusting your filters'}
      </AppText>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={results}
        renderItem={renderItem}
        keyExtractor={(item, index) => `discover-${item.tmdbId || index}`}
        numColumns={2}
        ListHeaderComponent={
          <DiscoverHeader 
            localQuery={localQuery}
            setLocalQuery={setLocalQuery}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            handleSearchTrigger={handleSearchTrigger}
            selectedGenres={selectedGenres}
            openFilters={openFilters}
            mediaType={mediaType}
            setMediaType={setMediaType}
          />
        }
        ListFooterComponent={renderFooter}
        ListEmptyComponent={!loading ? renderEmpty : null}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      />

      {/* Custom Animated Filter Modal */}
      <Modal
        visible={filterModalVisible}
        transparent={true}
        onRequestClose={closeFilters}
        statusBarTranslucent
        animationType="none"
      >
        <FilterModalContent 
          isVisible={filterModalVisible}
          closeFilters={closeFilters}
          clearFilters={clearFilters}
          selectedGenres={selectedGenres}
          toggleGenre={toggleGenre}
          selectedSort={selectedSort}
          setSelectedSort={setSelectedSort}
        />
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.midnight,
  },
  header: {
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
  },
  searchContainer: {
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.lg,
  },
  searchBlur: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    gap: spacing.md,
  },
  searchInput: {
    flex: 1,
    fontSize: typography.body.fontSize,
    color: colors.textPrimary,
  },
  filterChips: {
    flexDirection: 'row',
    paddingHorizontal: spacing.xl,
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  filterButton: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    shadowColor: colors.purple,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  filterButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md + 2,
    gap: spacing.md,
  },
  filterButtonText: {
    fontSize: typography.body.fontSize,
    fontWeight: typography.bold,
    color: colors.textPrimary,
  },
  filterBadge: {
    backgroundColor: colors.gold,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterBadgeText: {
    fontSize: typography.tiny.fontSize,
    fontWeight: typography.bold,
    color: '#000',
  },
  mediaTypeToggle: {
    flex: 1,
    flexDirection: 'row',
    borderWidth: 2,
    borderColor: colors.purple,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
  },
  mediaTypeButton: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  mediaTypeButtonActive: {
    backgroundColor: colors.purple,
  },
  mediaTypeText: {
    fontSize: typography.body.fontSize,
    fontWeight: typography.semibold,
    color: colors.textSecondary,
  },
  mediaTypeTextActive: {
    fontSize: typography.body.fontSize,
    fontWeight: typography.bold,
    color: colors.textPrimary,
  },
  listContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  gridItem: {
    width: '50%',
    marginBottom: spacing.lg,
  },
  gridItemLeft: {
    paddingRight: spacing.sm,
  },
  gridItemRight: {
    paddingLeft: spacing.sm,
  },
  footer: {
    paddingVertical: spacing.xl,
    alignItems: 'center',
  },
  emptyState: {
    paddingVertical: spacing.massive * 2,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: typography.h3.fontSize,
    fontWeight: typography.bold,
    color: colors.textPrimary,
    marginTop: spacing.lg,
  },
  emptySubtitle: {
    fontSize: typography.body.fontSize,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.charcoal,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    maxHeight: '75%',
  },
  modalScroll: {
    paddingHorizontal: spacing.xl,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.xl,
    marginBottom: spacing.xl,
  },
  modalHeaderActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  modalTitle: {
    fontSize: typography.h2.fontSize,
    fontWeight: typography.bold,
    color: colors.textPrimary,
  },
  clearButton: {
    paddingVertical: spacing.sm,
  },
  closeButton: {
    padding: spacing.xs,
  },
  clearText: {
    fontSize: typography.body.fontSize,
    fontWeight: typography.semibold,
    color: colors.purple,
  },
  filterSection: {
    marginBottom: spacing.xxl,
  },
  filterSectionTitle: {
    fontSize: typography.h4.fontSize,
    fontWeight: typography.bold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  genreGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  genreChip: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md + 2,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: borderRadius.full,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  genreChipActive: {
    backgroundColor: colors.purple + '30',
    borderColor: colors.purple,
  },
  genreChipText: {
    fontSize: typography.body.fontSize,
    fontWeight: typography.semibold,
    color: colors.textSecondary,
  },
  genreChipTextActive: {
    color: colors.purple,
    fontWeight: typography.bold,
  },
  sortOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  sortOptionText: {
    fontSize: typography.body.fontSize,
    color: colors.textSecondary,
  },
  sortOptionTextActive: {
    color: colors.textPrimary,
    fontWeight: typography.semibold,
  },
});

