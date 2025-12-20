import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  Dimensions,
  Image,
} from 'react-native';
import Animated, {
  FadeInUp,
  FadeInDown,
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
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');

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

// Hero Featured Section Component
const HeroSection = ({ media, onPress }) => {
  if (!media) return null;

  const backdropUrl = media.backdrop_path
    ? `https://image.tmdb.org/t/p/original${media.backdrop_path}`
    : null;

  return (
    <Animated.View entering={FadeInDown.duration(600)} style={styles.heroContainer}>
      <TouchableOpacity activeOpacity={0.9} onPress={onPress}>
        <View style={styles.heroImageContainer}>
          {backdropUrl && (
            <Image
              source={{ uri: backdropUrl }}
              style={styles.heroImage}
              resizeMode="cover"
            />
          )}
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.4)', 'rgba(0,0,0,0.9)']}
            locations={[0, 0.5, 1]}
            style={styles.heroGradient}
          />
          <View style={styles.heroContent}>
            <View style={styles.featuredBadge}>
              <Ionicons name="star" size={16} color={colors.gold} />
              <AppText variant="caption" style={styles.featuredText}>FEATURED</AppText>
            </View>
            <AppText variant="hero" style={styles.heroTitle} numberOfLines={2}>
              {media.title || media.name}
            </AppText>
            <View style={styles.heroMeta}>
              <View style={styles.heroRating}>
                <Ionicons name="star" size={14} color={colors.gold} />
                <AppText variant="body" style={styles.heroRatingText}>
                  {media.vote_average?.toFixed(1)}
                </AppText>
              </View>
              {media.release_date && (
                <AppText variant="body" style={styles.heroYear}>
                  {media.release_date.split('-')[0]}
                </AppText>
              )}
            </View>
            <AppText variant="body" style={styles.heroOverview} numberOfLines={3}>
              {media.overview}
            </AppText>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

// Horizontal Section Component
const HorizontalSection = ({ title, icon, iconColor, data, onItemPress, loading }) => {
  if (loading) {
    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={[styles.sectionIconCircle, { backgroundColor: iconColor + '20' }]}>
            <Ionicons name={icon} size={20} color={iconColor} />
          </View>
          <AppText variant="h3" style={styles.sectionTitle}>{title}</AppText>
        </View>
        <ActivityIndicator size="small" color={colors.purple} style={{ marginTop: spacing.lg }} />
      </View>
    );
  }

  if (!data || data.length === 0) return null;

  return (
    <Animated.View entering={FadeInUp.duration(400)} style={styles.section}>
      <View style={styles.sectionHeader}>
        <View style={[styles.sectionIconCircle, { backgroundColor: iconColor + '20' }]}>
          <Ionicons name={icon} size={20} color={iconColor} />
        </View>
        <AppText variant="h3" style={styles.sectionTitle}>{title}</AppText>
      </View>
      <FlatList
        horizontal
        data={data}
        renderItem={({ item, index }) => (
          <View style={styles.horizontalCard}>
            <MediaCard
              media={item}
              showStatus={false}
              showRating={true}
              showTitle={true}
              width={140}
              height={210}
              onPress={() => onItemPress(item)}
            />
          </View>
        )}
        keyExtractor={(item, index) => `${title}-${item.tmdbId || item.id || index}`}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.horizontalList}
      />
    </Animated.View>
  );
};

// Search Header Component
const SearchHeader = ({ 
  localQuery, 
  setLocalQuery, 
  handleSearchTrigger, 
  openFilters, 
  selectedGenres 
}) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={styles.searchHeader}>
      <View style={styles.searchContainer}>
        <BlurView intensity={80} tint="dark" style={styles.searchBlur}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color={colors.textSecondary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search movies & TV shows..."
              placeholderTextColor={colors.textSecondary}
              value={localQuery}
              onChangeText={setLocalQuery}
              onSubmitEditing={handleSearchTrigger}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              returnKeyType="search"
              autoCorrect={false}
              autoCapitalize="none"
            />
            {localQuery.length > 0 && (
              <TouchableOpacity onPress={() => setLocalQuery('')}>
                <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            )}
          </View>
        </BlurView>
      </View>

      <TouchableOpacity style={styles.filterIconButton} onPress={openFilters}>
        <LinearGradient
          colors={selectedGenres.length > 0 ? gradients.purple : ['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
          style={styles.filterIconGradient}
        >
          <Ionicons name="options" size={20} color="#fff" />
          {selectedGenres.length > 0 && (
            <View style={styles.filterBadge}>
              <AppText variant="tiny" style={styles.filterBadgeText}>{selectedGenres.length}</AppText>
            </View>
          )}
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};

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

// Filter Modal Component
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
  const navigation = useNavigation();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [localQuery, setLocalQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Content sections
  const [featuredMedia, setFeaturedMedia] = useState(null);
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [trendingTV, setTrendingTV] = useState([]);
  const [popularMovies, setPopularMovies] = useState([]);
  const [topRated, setTopRated] = useState([]);
  
  // Filters
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [selectedSort, setSelectedSort] = useState('popularity.desc');
  const [filterModalVisible, setFilterModalVisible] = useState(false);

  useEffect(() => {
    loadDiscoverContent();
  }, [selectedGenres, selectedSort]); // Reload when filters change

  const loadDiscoverContent = async () => {
    try {
      setLoading(true);
      
      // Build filter parameters
      const genreParam = selectedGenres.length > 0 ? `&with_genres=${selectedGenres.join(',')}` : '';
      const sortParam = selectedSort ? `&sort_by=${selectedSort}` : '';
      
      // Fetch multiple sections in parallel
      const [trendingMoviesRes, trendingTVRes, popularRes, topRatedRes] = await Promise.all([
        api.get(`/media/trending?mediaType=movie&timeWindow=week&page=1${genreParam}${sortParam}`),
        api.get(`/media/trending?mediaType=tv&timeWindow=week&page=1${genreParam}${sortParam}`),
        api.get(`/media/trending?mediaType=movie&timeWindow=day&page=1${genreParam}${sortParam}`),
        api.get(`/media/trending?mediaType=movie&timeWindow=week&page=1${genreParam}&sort_by=vote_average.desc`),
      ]);

      const mapResults = (results, type) => results.map(item => ({
        ...item,
        tmdbId: item.id?.toString(),
        type: type || item.media_type,
        title: item.title || item.name,
        posterPath: item.poster_path,
        voteAverage: item.vote_average,
      }));

      const trendingMoviesData = mapResults(trendingMoviesRes.data.data.results, 'movie');
      const trendingTVData = mapResults(trendingTVRes.data.data.results, 'tv');
      const popularData = mapResults(popularRes.data.data.results, 'movie');
      const topRatedData = mapResults(topRatedRes.data.data.results, 'movie');

      setTrendingMovies(trendingMoviesData);
      setTrendingTV(trendingTVData);
      setPopularMovies(popularData);
      setTopRated(topRatedData);
      
      // Set featured media (highest rated from trending)
      const allTrending = [...trendingMoviesData, ...trendingTVData];
      const featured = allTrending.sort((a, b) => b.vote_average - a.vote_average)[0];
      setFeaturedMedia(featured);
      
    } catch (error) {
      console.error('Failed to load discover content:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchTrigger = useCallback(() => {
    if (localQuery.trim()) {
      setSearchQuery(localQuery);
      handleSearch(localQuery);
    }
  }, [localQuery]);

  const handleSearch = async (query) => {
    try {
      setLoading(true);
      const response = await api.get(`/media/search?query=${encodeURIComponent(query)}`);
      
      const results = response.data.data.results
        .filter(item => item.media_type === 'movie' || item.media_type === 'tv')
        .map(item => ({
          ...item,
          tmdbId: item.id?.toString(),
          type: item.media_type,
          title: item.title || item.name,
          posterPath: item.poster_path,
          voteAverage: item.vote_average,
        }));
      
      setSearchResults(results);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMediaPress = useCallback((media) => {
    if (media?.tmdbId || media?.id) {
      navigation.navigate('MediaDetail', {
        mediaId: (media.tmdbId || media.id)?.toString(),
        mediaType: media.type || media.media_type || 'movie'
      });
    }
  }, [navigation]);

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
  };

  const openFilters = useCallback(() => {
    Keyboard.dismiss();
    setFilterModalVisible(true);
  }, []);

  const closeFilters = () => {
    setFilterModalVisible(false);
  };

  const clearSearch = () => {
    setLocalQuery('');
    setSearchQuery('');
    setSearchResults([]);
  };

  // Show search results if searching
  if (searchQuery && searchResults.length > 0) {
    return (
      <View style={styles.container}>
        <SearchHeader
          localQuery={localQuery}
          setLocalQuery={setLocalQuery}
          handleSearchTrigger={handleSearchTrigger}
          openFilters={openFilters}
          selectedGenres={selectedGenres}
        />
        
        <View style={styles.searchResultsHeader}>
          <AppText variant="h3" style={styles.searchResultsTitle}>
            Search Results for "{searchQuery}"
          </AppText>
          <TouchableOpacity onPress={clearSearch}>
            <AppText variant="body" style={styles.clearSearchText}>Clear</AppText>
          </TouchableOpacity>
        </View>

        <FlatList
          data={searchResults}
          renderItem={({ item, index }) => (
            <View style={[styles.gridItem, index % 2 === 0 ? styles.gridItemLeft : styles.gridItemRight]}>
              <MediaCard
                media={item}
                showStatus={false}
                showRating={true}
                showTitle={false}
                width={155}
                height={233}
              />
            </View>
          )}
          keyExtractor={(item, index) => `search-${item.tmdbId || index}`}
          numColumns={2}
          contentContainerStyle={styles.searchGrid}
          showsVerticalScrollIndicator={false}
        />

        <FilterModalContent
          isVisible={filterModalVisible}
          closeFilters={closeFilters}
          clearFilters={clearFilters}
          selectedGenres={selectedGenres}
          toggleGenre={toggleGenre}
          selectedSort={selectedSort}
          setSelectedSort={setSelectedSort}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SearchHeader
        localQuery={localQuery}
        setLocalQuery={setLocalQuery}
        handleSearchTrigger={handleSearchTrigger}
        openFilters={openFilters}
        selectedGenres={selectedGenres}
      />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Hero Featured Section */}
        <HeroSection
          media={featuredMedia}
          onPress={() => featuredMedia && handleMediaPress(featuredMedia)}
        />

        {/* Trending Movies */}
        <HorizontalSection
          title="Trending Movies"
          icon="flame"
          iconColor="#FF6B6B"
          data={trendingMovies}
          onItemPress={handleMediaPress}
          loading={loading && trendingMovies.length === 0}
        />

        {/* Trending TV Shows */}
        <HorizontalSection
          title="Trending TV Shows"
          icon="tv"
          iconColor="#4ECDC4"
          data={trendingTV}
          onItemPress={handleMediaPress}
          loading={loading && trendingTV.length === 0}
        />

        {/* Popular Now */}
        <HorizontalSection
          title="Popular Now"
          icon="trending-up"
          iconColor="#FFD93D"
          data={popularMovies}
          onItemPress={handleMediaPress}
          loading={loading && popularMovies.length === 0}
        />

        {/* Top Rated */}
        <HorizontalSection
          title="Top Rated"
          icon="star"
          iconColor={colors.gold}
          data={topRated}
          onItemPress={handleMediaPress}
          loading={loading && topRated.length === 0}
        />

        <View style={{ height: spacing.xxxl }} />
      </ScrollView>

      <FilterModalContent
        isVisible={filterModalVisible}
        closeFilters={closeFilters}
        clearFilters={clearFilters}
        selectedGenres={selectedGenres}
        toggleGenre={toggleGenre}
        selectedSort={selectedSort}
        setSelectedSort={setSelectedSort}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.midnight,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xl,
  },
  
  // Search Header
  searchHeader: {
    flexDirection: 'row',
    paddingTop: spacing.xl,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    gap: spacing.md,
    alignItems: 'center',
  },
  searchContainer: {
    flex: 1,
  },
  searchBlur: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  searchInput: {
    flex: 1,
    fontSize: typography.body.fontSize,
    color: colors.textPrimary,
  },
  filterIconButton: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  filterIconGradient: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: colors.gold,
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterBadgeText: {
    fontSize: typography.tiny.fontSize,
    fontWeight: typography.bold,
    color: '#000',
  },

  // Hero Section
  heroContainer: {
    marginBottom: spacing.xl,
  },
  heroImageContainer: {
    width: width,
    height: 400,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '100%',
  },
  heroContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.xl,
  },
  featuredBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  featuredText: {
    color: colors.gold,
    fontWeight: typography.bold,
    letterSpacing: 1,
  },
  heroTitle: {
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  heroMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    marginBottom: spacing.md,
  },
  heroRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  heroRatingText: {
    color: colors.textPrimary,
    fontWeight: typography.bold,
  },
  heroYear: {
    color: colors.textSecondary,
  },
  heroOverview: {
    color: colors.textSecondary,
    lineHeight: 20,
  },

  // Horizontal Sections
  section: {
    marginBottom: spacing.xxl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.lg,
    gap: spacing.md,
  },
  sectionIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontWeight: typography.bold,
  },
  horizontalList: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  horizontalCard: {
    marginRight: spacing.md,
  },

  // Search Results
  searchResultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
  },
  searchResultsTitle: {
    color: colors.textPrimary,
    flex: 1,
  },
  clearSearchText: {
    color: colors.purple,
    fontWeight: typography.semibold,
  },
  searchGrid: {
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

  // Filter Modal
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
