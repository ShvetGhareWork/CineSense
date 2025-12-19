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
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import MediaCard from '../../components/media/MediaCard';
import api from '../../api/client';
import { colors, gradients, typography, spacing, borderRadius } from '../../constants/theme';

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
  return (
    <View style={styles.header}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <BlurView intensity={80} tint="dark" style={styles.searchBlur}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color={colors.textSecondary} />
            <TextInput
              key="search-input-field"
              style={styles.searchInput}
              placeholder="Search movies & TV shows..."
              placeholderTextColor={colors.textSecondary}
              value={localQuery}
              onChangeText={setLocalQuery}
              onSubmitEditing={handleSearchTrigger}
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
          </View>
        </BlurView>
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
              <Text style={styles.filterButtonText}>Filters</Text>
              {selectedGenres.length > 0 && (
                <View style={styles.filterBadge}>
                  <Text style={styles.filterBadgeText}>{selectedGenres.length}</Text>
                </View>
              )}
            </LinearGradient>
          </TouchableOpacity>

          {/* Media Type Toggle */}
          <View style={styles.mediaTypeToggle}>
            {['all', 'movie', 'tv'].map((type) => (
              <TouchableOpacity
                key={type}
                style={[styles.mediaTypeButton, mediaType === type && styles.mediaTypeButtonActive]}
                onPress={() => setMediaType(type)}
              >
                <Text style={[styles.mediaTypeText, mediaType === type && styles.mediaTypeTextActive]}>
                  {type === 'all' ? 'All' : type === 'movie' ? 'Movies' : 'TV Shows'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
    </View>
  );
});

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
      const typeParam = mediaType !== 'all' ? mediaType : 'movie';
      
      const response = await api.get(
        `/media/trending?mediaType=${typeParam}&timeWindow=week&page=${currentPage}${genreParam}${sortParam}`
      );
      
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
    <View style={[styles.gridItem, index % 2 === 0 ? styles.gridItemLeft : styles.gridItemRight]}>
      <MediaCard
        media={item}
        showStatus={false}
        showRating={true}
        width={165}
        height={248}
      />
    </View>
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
      <Text style={styles.emptyTitle}>No results found</Text>
      <Text style={styles.emptySubtitle}>
        {searchQuery ? 'Try a different search term' : 'Try adjusting your filters'}
      </Text>
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

      {/* Filter Modal */}
      <Modal
        visible={filterModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={closeFilters}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Filters</Text>
                <View style={styles.modalHeaderActions}>
                  <TouchableOpacity onPress={clearFilters} style={styles.clearButton}>
                    <Text style={styles.clearText}>Clear All</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={closeFilters} style={styles.closeButton}>
                    <Ionicons name="close" size={28} color={colors.textPrimary} />
                  </TouchableOpacity>
                </View>
              </View>

          {/* Genres */}
          <View style={styles.filterSection}>
            <Text style={styles.filterSectionTitle}>Genres</Text>
            <View style={styles.genreGrid}>
              {GENRES.map((genre) => (
                <TouchableOpacity
                  key={genre.id}
                  style={[
                    styles.genreChip,
                    selectedGenres.includes(genre.id) && styles.genreChipActive
                  ]}
                  onPress={() => toggleGenre(genre.id)}
                >
                  <Text style={[
                    styles.genreChipText,
                    selectedGenres.includes(genre.id) && styles.genreChipTextActive
                  ]}>
                    {genre.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Sort By */}
          <View style={styles.filterSection}>
            <Text style={styles.filterSectionTitle}>Sort By</Text>
            {SORT_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={styles.sortOption}
                onPress={() => setSelectedSort(option.id)}
              >
                <Text style={[
                  styles.sortOptionText,
                  selectedSort === option.id && styles.sortOptionTextActive
                ]}>
                  {option.name}
                </Text>
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
    marginBottom: spacing.md,
  },
  searchBlur: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: typography.body,
    color: colors.textPrimary,
  },
  filterChips: {
    flexDirection: 'row',
    paddingHorizontal: spacing.xl,
    gap: spacing.sm,
  },
  filterButton: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  filterButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  filterButtonText: {
    fontSize: typography.body,
    fontWeight: typography.semibold,
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
    fontSize: typography.tiny,
    fontWeight: typography.bold,
    color: '#000',
  },
  mediaTypeToggle: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: borderRadius.lg,
    padding: spacing.xs,
  },
  mediaTypeButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderRadius: borderRadius.md,
  },
  mediaTypeButtonActive: {
    backgroundColor: colors.purple,
  },
  mediaTypeText: {
    fontSize: typography.caption,
    fontWeight: typography.semibold,
    color: colors.textSecondary,
  },
  mediaTypeTextActive: {
    color: colors.textPrimary,
  },
  listContent: {
    paddingHorizontal: spacing.md,
  },
  gridItem: {
    width: '50%',
    marginBottom: spacing.md,
  },
  gridItemLeft: {
    paddingRight: spacing.xs,
  },
  gridItemRight: {
    paddingLeft: spacing.xs,
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
    fontSize: typography.h3,
    fontWeight: typography.bold,
    color: colors.textPrimary,
    marginTop: spacing.lg,
  },
  emptySubtitle: {
    fontSize: typography.body,
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
    fontSize: typography.h2,
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
    fontSize: typography.body,
    fontWeight: typography.semibold,
    color: colors.purple,
  },
  filterSection: {
    marginBottom: spacing.xxl,
  },
  filterSectionTitle: {
    fontSize: typography.h4,
    fontWeight: typography.bold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  genreGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  genreChip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  genreChipActive: {
    backgroundColor: colors.purple + '30',
    borderColor: colors.purple,
  },
  genreChipText: {
    fontSize: typography.body,
    fontWeight: typography.semibold,
    color: colors.textSecondary,
  },
  genreChipTextActive: {
    color: colors.purple,
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
    fontSize: typography.body,
    color: colors.textSecondary,
  },
  sortOptionTextActive: {
    color: colors.textPrimary,
    fontWeight: typography.semibold,
  },
});
