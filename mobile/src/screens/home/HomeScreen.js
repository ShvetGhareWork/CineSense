import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

import HeroCarousel from '../../components/home/HeroCarousel';
import ContinueWatchingSection from '../../components/home/ContinueWatchingSection';
import MediaCard from '../../components/media/MediaCard';
import useWatchlistStore from '../../store/watchlistStore';
import api from '../../api/client';
import { colors, gradients, typography, spacing } from '../../constants/theme';

export default function HomeScreen({ navigation }) {
  const [trending, setTrending] = useState([]);
  const [popular, setPopular] = useState([]);
  const [popularTV, setPopularTV] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const { items, fetchWatchlist } = useWatchlistStore();

  // Filter continue watching (in progress items)
  const continueWatching = items.filter(item => item.status === 'in_progress');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🔄 Loading home screen data...');
      await Promise.all([
        fetchTrending(),
        fetchPopular(),
        fetchPopularTV(),
        fetchWatchlist(),
      ]);
      console.log('✅ Home screen data loaded successfully');
    } catch (error) {
      console.error('❌ Failed to load home data:', error);
      setError(error.userMessage || 'Failed to load content. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchTrending = async () => {
    try {
      console.log('🔍 Fetching trending media...');
      const response = await api.get('/media/trending?mediaType=all&timeWindow=week');
      console.log('📦 Trending response:', {
        success: response.data?.success,
        hasData: !!response.data?.data,
        resultsCount: response.data?.data?.results?.length || 0
      });
      
      const results = response.data?.data?.results || [];
      console.log(`✅ Trending: ${results.length} items`);
      setTrending(results);
    } catch (error) {
      console.error('❌ Failed to fetch trending:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        isNetworkError: error.isNetworkError,
        userMessage: error.userMessage
      });
      setTrending([]);
    }
  };

  const fetchPopular = async () => {
    try {
      console.log('🔍 Fetching popular movies...');
      const response = await api.get('/media/trending?mediaType=movie&timeWindow=week');
      console.log('📦 Popular movies response:', {
        success: response.data?.success,
        hasData: !!response.data?.data,
        resultsCount: response.data?.data?.results?.length || 0
      });
      
      const results = response.data?.data?.results || [];
      console.log(`✅ Popular movies: ${results.length} items`);
      setPopular(results);
    } catch (error) {
      console.error('❌ Failed to fetch popular movies:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        isNetworkError: error.isNetworkError,
        userMessage: error.userMessage
      });
      setPopular([]);
    }
  };
  
  const fetchPopularTV = async () => {
    try {
      console.log('🔍 Fetching popular TV shows...');
      const response = await api.get('/media/trending?mediaType=tv&timeWindow=week');
      console.log('📦 Popular TV response:', {
        success: response.data?.success,
        hasData: !!response.data?.data,
        resultsCount: response.data?.data?.results?.length || 0
      });
      
      const results = response.data?.data?.results || [];
      console.log(`✅ Popular TV: ${results.length} items`);
      setPopularTV(results);
    } catch (error) {
      console.error('❌ Failed to fetch popular TV:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        isNetworkError: error.isNetworkError,
        userMessage: error.userMessage
      });
      setPopularTV([]);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  }, []);

  const renderHorizontalList = (data, title, icon) => {
    if (!data || !Array.isArray(data) || data.length === 0) return null;

    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionHeaderLeft}>
            <Ionicons name={icon} size={24} color={colors.purple} />
            <Text style={styles.sectionTitle}>{title}</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('Discover')}>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalList}
          decelerationRate="fast"
          snapToInterval={170}
        >
          {data.slice(0, 10).map((item) => (
            <MediaCard
              key={item.id}
              media={{
                ...item,
                tmdbId: item.id?.toString(),
                type: item.media_type || 'movie',
                title: item.title || item.name,
                posterPath: item.poster_path,
                voteAverage: item.vote_average,
              }}
              showStatus={false}
              showRating={true}
              width={150}
              height={225}
            />
          ))}
        </ScrollView>
      </View>
    );
  };

  const renderGenreQuickPicks = () => {
    const genres = [
      { id: 28, name: 'Action', icon: 'flash', gradient: gradients.amber },
      { id: 35, name: 'Comedy', icon: 'happy', gradient: gradients.gold },
      { id: 18, name: 'Drama', icon: 'heart', gradient: gradients.purple },
      { id: 27, name: 'Horror', icon: 'skull', gradient: gradients.blue },
      { id: 878, name: 'Sci-Fi', icon: 'planet', gradient: gradients.purpleReverse },
      { id: 10749, name: 'Romance', icon: 'rose', gradient: gradients.gold },
    ];

    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionHeaderLeft}>
            <Ionicons name="grid" size={24} color={colors.cyan} />
            <Text style={styles.sectionTitle}>Browse by Genre</Text>
          </View>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.genreList}
        >
          {genres?.map((genre) => (
            <TouchableOpacity
              key={genre.id}
              style={styles.genreChip}
              onPress={() => navigation.navigate('Discover', { genreId: genre.id })}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={genre.gradient}
                style={styles.genreGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Ionicons name={genre.icon} size={20} color="#fff" />
                <Text style={styles.genreText}>{genre.name}</Text>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.purple} />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  // Show error banner if there's an error
  const renderErrorBanner = () => {
    if (!error) return null;
    
    return (
      <View style={styles.errorBanner}>
        <Ionicons name="warning" size={24} color="#ff6b6b" />
        <View style={styles.errorTextContainer}>
          <Text style={styles.errorTitle}>Connection Error</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <Text style={styles.errorHint}>
            API: {__DEV__ ? 'Development' : 'Production'} mode
          </Text>
        </View>
      </View>
    );
  };

  // Show empty state if no content loaded
  const renderEmptyState = () => {
    if (trending.length > 0 || popular.length > 0 || popularTV.length > 0) return null;
    
    return (
      <View style={styles.emptyState}>
        <Ionicons name="film-outline" size={64} color={colors.textSecondary} />
        <Text style={styles.emptyTitle}>No Content Available</Text>
        <Text style={styles.emptyMessage}>
          Unable to load movies and TV shows.{'\n'}
          Please check your internet connection.
        </Text>
        <TouchableOpacity style={styles.retryButton} onPress={onRefresh}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={colors.purple}
          colors={[colors.purple]}
        />
      }
    >
      {/* Error Banner */}
      {renderErrorBanner()}

      {/* Empty State */}
      {renderEmptyState()}

      {/* Hero Carousel */}
      <HeroCarousel items={trending && Array.isArray(trending) ? trending.slice(0, 5) : []} />

      {/* Continue Watching */}
      {continueWatching.length > 0 && (
        <ContinueWatchingSection items={continueWatching} />
      )}

      {/* Genre Quick Picks */}
      {renderGenreQuickPicks()}

      {/* Trending This Week */}
      {renderHorizontalList(trending, 'Trending This Week', 'flame')}

      {/* Popular Movies */}
      {renderHorizontalList(popular, 'Popular Movies', 'star')}

      {/* Popular TV Shows */}
      {renderHorizontalList(popularTV, 'Popular TV Shows', 'tv')}

      {/* Bottom Spacing */}
      <View style={{ height: spacing.massive }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.midnight,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.midnight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: typography.body,
    color: colors.textSecondary,
  },
  section: {
    marginBottom: spacing.xxxl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.lg,
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  sectionTitle: {
    fontSize: typography.h3,
    fontWeight: typography.bold,
    color: colors.textPrimary,
  },
  seeAllText: {
    fontSize: typography.body,
    fontWeight: typography.semibold,
    color: colors.purple,
  },
  horizontalList: {
    paddingHorizontal: spacing.xl,
  },
  genreList: {
    paddingHorizontal: spacing.xl,
  },
  genreChip: {
    marginRight: spacing.md,
    borderRadius: 24,
    overflow: 'hidden',
  },
  genreGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  genreText: {
    fontSize: typography.body,
    fontWeight: typography.bold,
    color: colors.textPrimary,
  },
  errorBanner: {
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    borderLeftWidth: 4,
    borderLeftColor: '#ff6b6b',
    padding: spacing.lg,
    marginHorizontal: spacing.xl,
    marginTop: spacing.lg,
    marginBottom: spacing.md,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  errorTextContainer: {
    flex: 1,
  },
  errorTitle: {
    fontSize: typography.h4,
    fontWeight: typography.bold,
    color: '#ff6b6b',
    marginBottom: spacing.xs,
  },
  errorMessage: {
    fontSize: typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  errorHint: {
    fontSize: typography.small,
    color: colors.textTertiary,
    fontStyle: 'italic',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.massive,
    paddingHorizontal: spacing.xl,
  },
  emptyTitle: {
    fontSize: typography.h2,
    fontWeight: typography.bold,
    color: colors.textPrimary,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  emptyMessage: {
    fontSize: typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 24,
  },
  retryButton: {
    backgroundColor: colors.purple,
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.md,
    borderRadius: 24,
  },
  retryButtonText: {
    fontSize: typography.body,
    fontWeight: typography.bold,
    color: colors.textPrimary,
  },
});
