import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  StatusBar,
  Platform,
  Image,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  interpolate,
  useAnimatedScrollHandler,
  Extrapolate,
  ZoomIn,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

import useWatchlistStore from '../../store/watchlistStore';
import usePreferencesStore from '../../store/preferencesStore';
import api from '../../api/client';
import { colors, typography, spacing, borderRadius } from '../../constants/theme';
import AppText from '../../components/common/AppText';
import ProgressiveImage from '../../components/common/ProgressiveImage';
import VideoPlayer from '../../components/VideoPlayer';
import ReviewCard from '../../components/ReviewCard';
import WatchProvidersList from '../../components/WatchProvidersList';
import { useStarShimmerAnimation, useSparkleAnimation } from '../../utils/animations';
import { toast } from '../../utils/toast';

const { width, height } = Dimensions.get('window');
const HEADER_HEIGHT = 400;

export default function MediaDetailScreen({ route, navigation }) {
  const { mediaId, mediaType } = route.params;
  const [media, setMedia] = useState(null);
  const [credits, setCredits] = useState(null);
  const [watchProviders, setWatchProviders] = useState(null);
  const [episodes, setEpisodes] = useState([]);
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [loadingEpisodes, setLoadingEpisodes] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  
  // New state for advanced features
  const [videos, setVideos] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [reviewsPage, setReviewsPage] = useState(1);
  const [hasMoreReviews, setHasMoreReviews] = useState(true);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [similar, setSimilar] = useState([]);
  
  const { region } = usePreferencesStore();
  
  const scrollY = useSharedValue(0);
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  // Animation values for Add to Watchlist button
  const buttonScale = useSharedValue(1);
  const buttonGlow = useSharedValue(0);
  
  const { addToWatchlist, toggleFavorite, isFavorite: checkIsFavorite, items } = useWatchlistStore();
  const watchlistItem = useMemo(
    () => items.find(item => item.tmdbId === mediaId?.toString()),
    [items, mediaId]
  );

  useEffect(() => {
    StatusBar.setBarStyle('light-content');
    fetchMediaDetails();
    // Check if item is favorited
    setIsFavorite(checkIsFavorite(mediaId));
    return () => StatusBar.setBarStyle('default');
  }, [mediaId, mediaType]);

  const fetchMediaDetails = async () => {
    try {
      setLoading(true);
      const [detailsRes, creditsRes, providersRes, videosRes, reviewsRes, recommendationsRes, similarRes] = await Promise.all([
        api.get(`/media/${mediaType}/${mediaId}`),
        api.get(`/media/${mediaType}/${mediaId}/credits`).catch(() => ({ data: { data: null } })),
        api.get(`/media/${mediaType}/${mediaId}/providers?region=${region}`).catch(() => ({ data: { data: null } })),
        api.get(`/media/${mediaType}/${mediaId}/videos`).catch(() => ({ data: { data: { results: [] } } })),
        api.get(`/media/${mediaType}/${mediaId}/reviews?page=1`).catch(() => ({ data: { data: { results: [] } } })),
        api.get(`/media/${mediaType}/${mediaId}/recommendations?page=1`).catch(() => ({ data: { data: { results: [] } } })),
        api.get(`/media/${mediaType}/${mediaId}/similar?page=1`).catch(() => ({ data: { data: { results: [] } } }))
      ]);

      setMedia(detailsRes.data.data);
      setCredits(creditsRes.data.data);
      setWatchProviders(providersRes.data.data);
      setVideos(videosRes.data.data?.results || []);
      setReviews(reviewsRes.data.data?.results || []);
      setHasMoreReviews(reviewsRes.data.data?.page < reviewsRes.data.data?.total_pages);
      setRecommendations(recommendationsRes.data.data?.results || []);
      setSimilar(similarRes.data.data?.results || []);
      
      // Fetch episodes for TV shows
      if (mediaType === 'tv' && detailsRes.data.data) {
        fetchEpisodes(1);
      }
    } catch (error) {
      console.error('Failed to fetch media details:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEpisodes = async (seasonNumber) => {
    try {
      setLoadingEpisodes(true);
      const response = await api.get(`/media/tv/${mediaId}/season/${seasonNumber}`);
      setEpisodes(response.data.data.episodes || []);
      setSelectedSeason(seasonNumber);
    } catch (error) {
      console.error('Failed to fetch episodes:', error);
      setEpisodes([]);
    } finally {
      setLoadingEpisodes(false);
    }
  };

  const loadMoreReviews = async () => {
    if (!hasMoreReviews || loadingReviews) return;

    try {
      setLoadingReviews(true);
      const nextPage = reviewsPage + 1;
      const response = await api.get(`/media/${mediaType}/${mediaId}/reviews?page=${nextPage}`);
      
      if (response.data.success) {
        setReviews([...reviews, ...(response.data.data.results || [])]);
        setReviewsPage(nextPage);
        setHasMoreReviews(response.data.data.page < response.data.data.total_pages);
      }
    } catch (error) {
      console.error('Failed to load more reviews:', error);
    } finally {
      setLoadingReviews(false);
    }
  };

  const handlePersonPress = useCallback((personId) => {
    navigation.navigate('PersonProfile', { personId });
  }, [navigation]);

  const handleAddToWatchlist = useCallback(async (status) => {
    // Trigger success animation
    buttonScale.value = withSequence(
      withSpring(1.1, { damping: 12 }),
      withSpring(1, { damping: 12 })
    );
    
    buttonGlow.value = withSequence(
      withTiming(1, { duration: 100 }),
      withTiming(0, { duration: 400 })
    );

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const mediaData = {
      title: media?.title || media?.name || 'Unknown',
      posterPath: media?.poster_path || null,
      status
    };
    await addToWatchlist(mediaId, mediaType, mediaData);
    
    toast.success('Added to your watchlist!');
  }, [mediaId, mediaType, media, addToWatchlist, buttonScale, buttonGlow]);

  // Favorite Sparkle Animation
  const { sparkleStyle, trigger: triggerSparkle } = useSparkleAnimation();
  const favoriteScale = useSharedValue(1);

  const handleToggleFavorite = useCallback(async () => {
    const nextState = !isFavorite;
    setIsFavorite(nextState);
    
    // Save to store
    const mediaData = {
      title: media?.title || media?.name || 'Unknown',
      posterPath: media?.poster_path || null,
      voteAverage: media?.vote_average || null,
    };
    await toggleFavorite(mediaId, mediaType, mediaData);
    
    if (nextState) {
      triggerSparkle();
      favoriteScale.value = withSequence(
        withSpring(1.4, { damping: 10 }),
        withSpring(1, { damping: 12 })
      );
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      toast.success('Added to favorites!');
    } else {
      favoriteScale.value = withSpring(1, { damping: 12 });
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      toast.info('Removed from favorites');
    }
  }, [isFavorite, triggerSparkle, favoriteScale, toggleFavorite, mediaId, mediaType, media]);

  const favoriteHeartStyle = useAnimatedStyle(() => ({
    transform: [{ scale: favoriteScale.value }],
    opacity: withTiming(1), // Force update
  }));

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
    shadowColor: '#4CAF50',
    shadowOpacity: buttonGlow.value * 0.8,
    shadowRadius: 16,
    elevation: buttonGlow.value * 8,
  }));

  const headerStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [0, HEADER_HEIGHT - 100, HEADER_HEIGHT],
      [0, 0, 1],
      Extrapolate.CLAMP
    );
    return { opacity };
  });

  const imageStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [0, HEADER_HEIGHT / 2, HEADER_HEIGHT],
      [1, 0.5, 0],
      Extrapolate.CLAMP
    );
    const scale = interpolate(
      scrollY.value,
      [-100, 0, HEADER_HEIGHT],
      [1.2, 1, 0.8],
      Extrapolate.CLAMP
    );
    return {
      opacity,
      transform: [{ scale }],
    };
  });

  const starStyle = useStarShimmerAnimation(1000);

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={colors.purple} />
      </View>
    );
  }

  if (!media) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={80} color={colors.error} />
        <AppText variant="body" style={styles.errorText}>Failed to load details</AppText>
        <TouchableOpacity style={styles.retryButton} onPress={() => navigation.goBack()}>
          <AppText variant="cardTitle" style={styles.retryText}>Go Back</AppText>
        </TouchableOpacity>
      </View>
    );
  }

  const posterUrl = media.poster_path 
    ? `https://image.tmdb.org/t/p/w500${media.poster_path}`
    : null;

  const backdropUrl = media.backdrop_path
    ? `https://image.tmdb.org/t/p/original${media.backdrop_path}`
    : null;

  return (
    <View style={styles.container}>
      {/* Animated Header */}
      <Animated.View style={[styles.animatedHeader, headerStyle]}>
        <BlurView intensity={95} tint="dark" style={styles.headerBlur}>
          <AppText variant="cardTitle" style={styles.headerTitle} numberOfLines={1}>
            {media.title || media.name}
          </AppText>
        </BlurView>
      </Animated.View>

      {/* Back Button */}
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <BlurView intensity={80} tint="dark" style={styles.backButtonBlur}>
          <Ionicons name="arrow-back" size={26} color="#fff" />
        </BlurView>
      </TouchableOpacity>

      {/* Favorite Button */}
      <TouchableOpacity onPress={handleToggleFavorite} style={styles.favoriteButton}>
        <BlurView intensity={80} tint="dark" style={styles.favoriteButtonBlur}>
          <Animated.View style={sparkleStyle}>
            <Ionicons name="sparkles" size={40} color="rgba(46, 204, 113, 0.4)" style={styles.sparkleIcon} />
          </Animated.View>
          <Animated.View style={favoriteHeartStyle}>
             <Ionicons 
               name={isFavorite ? "heart" : "heart-outline"} 
               size={26} 
               color={isFavorite ? "#2ECC71" : "#fff"} 
             />
          </Animated.View>
        </BlurView>
      </TouchableOpacity>

      <Animated.ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={scrollHandler}
      >
        {/* Hero Backdrop */}
        <Animated.View style={[styles.backdropContainer, imageStyle]}>
          <ProgressiveImage
            source={{ uri: backdropUrl }}
            style={styles.backdrop}
            resizeMode="cover"
          />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.3)', 'rgba(0,0,0,0.8)', '#000']}
            locations={[0, 0.4, 0.7, 1]}
            style={styles.backdropGradient}
          />
        </Animated.View>

        {/* Content */}
        <View style={styles.content}>
          {/* Title & Poster Section */}
          <View style={styles.titleSection}>
            {posterUrl && (
              <View style={styles.posterWrapper}>
                <ProgressiveImage source={{ uri: posterUrl }} style={styles.poster} />
                <View style={styles.posterShadow} />
              </View>
            )}
            
            <View style={styles.titleInfo}>
              <AppText variant="hero" style={styles.title}>{media.title || media.name}</AppText>
              
              {/* Meta Info */}
              <View style={styles.metaRow}>
                {(mediaType === 'movie' ? media.release_date : media.first_air_date) && (
                  <View style={styles.metaChip}>
                    <Ionicons name="calendar-outline" size={14} color="#3ABEFF" />
                    <AppText variant="metadata" style={styles.metaText}>
                      {(mediaType === 'movie' ? media.release_date : media.first_air_date)?.split('-')[0]}
                    </AppText>
                  </View>
                )}
                {mediaType === 'tv' && media.number_of_seasons && (
                  <View style={styles.metaChip}>
                    <Ionicons name="tv-outline" size={14} color="#6C63FF" />
                    <AppText variant="metadata" style={styles.metaText}>{media.number_of_seasons} Season{media.number_of_seasons > 1 ? 's' : ''}</AppText>
                  </View>
                )}
                {mediaType === 'movie' && media.runtime && (
                  <View style={styles.metaChip}>
                    <Ionicons name="time-outline" size={14} color="#27AE60" />
                    <AppText variant="metadata" style={styles.metaText}>{media.runtime}m</AppText>
                  </View>
                )}
              </View>

              {/* ⭐ RATING - THE HERO */}
              <View style={styles.ratingSection}>
                <LinearGradient
                  colors={['#FFD700', '#FFA500', '#FF8C00']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.ratingBadge}
                >
                  <Animated.View style={starStyle}>
                    <Ionicons name="star" size={24} color="#000" />
                  </Animated.View>
                  <AppText variant="h2" style={styles.ratingNumber}>{media.vote_average?.toFixed(1)}</AppText>
                </LinearGradient>
                <AppText variant="metadata" style={styles.voteCount}>{media.vote_count?.toLocaleString()} votes</AppText>
              </View>
            </View>
          </View>

          {/* 🎯 ACTION BUTTONS */}
          {!watchlistItem ? (
            <View style={styles.actionSection}>
              <Animated.View style={buttonAnimatedStyle}>
                <TouchableOpacity 
                   style={styles.primaryActionButton}
                   onPress={() => handleAddToWatchlist('to_watch')}
                   activeOpacity={0.85}
                >
                  <LinearGradient
                    colors={['#F39C12', '#E67E22']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.actionButtonGradient}
                  >
                    <Ionicons name="bookmark" size={24} color="#fff" />
                    <AppText variant="cardTitle" style={styles.actionButtonText}>Add to Watchlist</AppText>
                  </LinearGradient>
                </TouchableOpacity>
              </Animated.View>

              <View style={styles.secondaryActions}>
                <TouchableOpacity 
                  style={styles.secondaryActionButton}
                  onPress={() => handleAddToWatchlist('finished')}
                  activeOpacity={0.85}
                >
                  <LinearGradient
                    colors={['#3498DB', '#2980B9']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.secondaryButtonGradient}
                  >
                    <Ionicons name="checkmark-circle" size={22} color="#fff" />
                    <AppText variant="caption" style={styles.secondaryButtonText}>Mark Watched</AppText>
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.secondaryActionButton}
                  onPress={() => handleAddToWatchlist('in_progress')}
                  activeOpacity={0.85}
                >
                  <LinearGradient
                    colors={['#27AE60', '#229954']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.secondaryButtonGradient}
                  >
                    <Ionicons name="play-circle" size={22} color="#fff" />
                    <AppText variant="caption" style={styles.secondaryButtonText}>Watching</AppText>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.inWatchlistContainer}>
              <LinearGradient
                colors={['rgba(39,174,96,0.2)', 'rgba(39,174,96,0.05)']}
                style={styles.inWatchlistBanner}
              >
                <Ionicons name="checkmark-circle" size={32} color="#27AE60" />
                <AppText variant="cardTitle" style={styles.inWatchlistText}>✓ In Your Watchlist</AppText>
              </LinearGradient>
            </View>
          )}

          {/* Genres */}
          {media.genres && media.genres.length > 0 && (
            <View style={styles.genresContainer}>
              {media.genres.map((genre) => (
                <View key={genre.id} style={styles.genreChip}>
                  <LinearGradient
                    colors={['rgba(108,99,255,0.25)', 'rgba(58,190,255,0.25)']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.genreGradient}
                  >
                    <AppText variant="caption" style={styles.genreText}>{genre.name}</AppText>
                  </LinearGradient>
                </View>
              ))}
            </View>
          )}

          {/* Overview */}
          {media.overview && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionIconCircle}>
                  <Ionicons name="document-text" size={22} color="#6C63FF" />
                </View>
                <AppText variant="h2" style={styles.sectionTitle}>Overview</AppText>
              </View>
              <AppText variant="body" style={styles.overview}>{media.overview}</AppText>
            </View>
          )}

          {/* 🎬 VIDEOS / TRAILERS */}
          {videos && videos.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionIconCircle}>
                  <Ionicons name="play-circle" size={22} color="#e50914" />
                </View>
                <AppText variant="h2" style={styles.sectionTitle}>Trailers & Videos</AppText>
              </View>
              
              <TouchableOpacity
                style={styles.trailerButton}
                onPress={() => setSelectedVideo(videos[0])}
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={['#e50914', '#b20710']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.trailerButtonGradient}
                >
                  <Ionicons name="play" size={28} color="#fff" />
                  <AppText variant="cardTitle" style={styles.trailerButtonText}>
                    Watch Trailer
                  </AppText>
                </LinearGradient>
              </TouchableOpacity>

              {videos.length > 1 && (
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  style={styles.videosList}
                >
                  {videos.slice(1, 5).map((video, index) => (
                    <TouchableOpacity
                      key={video.id}
                      style={styles.videoCard}
                      onPress={() => setSelectedVideo(video)}
                    >
                      <View style={styles.videoThumbnail}>
                        <Ionicons name="play-circle" size={40} color="rgba(255,255,255,0.9)" />
                      </View>
                      <AppText variant="caption" style={styles.videoTitle} numberOfLines={2}>
                        {video.name}
                      </AppText>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}
            </View>
          )}

          {/* 📽️ INFO GRID */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionIconCircle}>
                <Ionicons name={mediaType === 'tv' ? 'tv' : 'film'} size={22} color="#3ABEFF" />
              </View>
              <AppText variant="h2" style={styles.sectionTitle}>{mediaType === 'tv' ? 'Series' : 'Movie'} Info</AppText>
            </View>
            <View style={styles.infoGrid}>
              {mediaType === 'tv' ? (
                <>
                  <View style={styles.infoCard}>
                    <LinearGradient colors={['#6C63FF15', '#6C63FF05']} style={styles.infoCardBg}>
                      <AppText variant="h2" style={styles.infoNumber}>{media.number_of_seasons}</AppText>
                      <AppText variant="caption" style={styles.infoLabel}>SEASONS</AppText>
                    </LinearGradient>
                  </View>
                  <View style={styles.infoCard}>
                    <LinearGradient colors={['#3ABEFF15', '#3ABEFF05']} style={styles.infoCardBg}>
                      <AppText variant="h2" style={styles.infoNumber}>{media.number_of_episodes}</AppText>
                      <AppText variant="caption" style={styles.infoLabel}>EPISODES</AppText>
                    </LinearGradient>
                  </View>
                </>
              ) : (
                <>
                  <View style={styles.infoCard}>
                    <LinearGradient colors={['#6C63FF15', '#6C63FF05']} style={styles.infoCardBg}>
                      <AppText variant="h2" style={styles.infoNumber}>{media.runtime}</AppText>
                      <AppText variant="caption" style={styles.infoLabel}>MINUTES</AppText>
                    </LinearGradient>
                  </View>
                  <View style={styles.infoCard}>
                    <LinearGradient colors={['#3ABEFF15', '#3ABEFF05']} style={styles.infoCardBg}>
                      <AppText variant="h2" style={styles.infoNumber}>
                        {media.budget ? `$${(media.budget / 1000000).toFixed(0)}M` : 'N/A'}
                      </AppText>
                      <AppText variant="caption" style={styles.infoLabel}>BUDGET</AppText>
                    </LinearGradient>
                  </View>
                </>
              )}
            </View>
          </View>

          {/* 👥 CAST */}
          {credits?.cast && credits.cast.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionIconCircle}>
                  <Ionicons name="people" size={22} color="#27AE60" />
                </View>
                <AppText variant="h2" style={styles.sectionTitle}>Cast</AppText>
              </View>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.castScrollContent}
              >
                {credits.cast.slice(0, 15).map((person, index) => (
                  <TouchableOpacity
                    key={person.id}
                    onPress={() => handlePersonPress(person.id)}
                    activeOpacity={0.8}
                  >
                    <Animated.View 
                      style={styles.castCard}
                      entering={ZoomIn.duration(400).delay(index * 60).springify().damping(12)}
                    >
                      <View style={styles.castImageWrapper}>
                        {person.profile_path ? (
                          <Image
                            source={{ uri: `https://image.tmdb.org/t/p/w185${person.profile_path}` }}
                            style={styles.castImage}
                          />
                        ) : (
                          <View style={[styles.castImage, styles.castPlaceholder]}>
                            <Ionicons name="person" size={50} color="#444" />
                          </View>
                        )}
                        <LinearGradient
                          colors={['transparent', 'rgba(0,0,0,0.7)']}
                          style={styles.castGradient}
                        />
                      </View>
                      <AppText variant="cardTitle" style={styles.castName} numberOfLines={1}>{person.name}</AppText>
                      <AppText variant="metadata" style={styles.castCharacter} numberOfLines={1}>{person.character}</AppText>
                    </Animated.View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {/* 📺 EPISODES */}
          {mediaType === 'tv' && media.number_of_seasons > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionIconCircle}>
                  <Ionicons name="list" size={22} color="#F39C12" />
                </View>
                <AppText variant="h2" style={styles.sectionTitle}>Episodes</AppText>
              </View>
              
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.seasonSelector}>
                {Array.from({ length: media.number_of_seasons }, (_, i) => i + 1).map((seasonNum) => (
                  <TouchableOpacity
                    key={seasonNum}
                    style={[styles.seasonButton, selectedSeason === seasonNum && styles.seasonButtonActive]}
                    onPress={() => fetchEpisodes(seasonNum)}
                  >
                    <AppText variant="body" style={[styles.seasonButtonText, selectedSeason === seasonNum && styles.seasonButtonTextActive]}>
                      Season {seasonNum}
                    </AppText>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {loadingEpisodes ? (
                <ActivityIndicator color={colors.purple} />
              ) : (
                <View style={styles.episodesList}>
                  {episodes.map((episode) => (
                    <View key={episode.id} style={styles.episodeCard}>
                      <ProgressiveImage
                        source={{ uri: `https://image.tmdb.org/t/p/w300${episode.still_path}` }}
                        style={styles.episodeImage}
                      />
                      <View style={styles.episodeInfo}>
                        <AppText variant="cardTitle" style={styles.episodeNumber}>{episode.episode_number}. {episode.name}</AppText>
                        <AppText variant="body" style={styles.episodeOverview} numberOfLines={2}>{episode.overview}</AppText>
                        <View style={styles.episodeMeta}>
                          <AppText variant="metadata" style={styles.episodeAirDate}>{episode.air_date}</AppText>
                          {episode.vote_average > 0 && (
                            <View style={styles.episodeRating}>
                              <Ionicons name="star" size={12} color={colors.gold} />
                              <AppText variant="metadata" style={styles.episodeRatingText}>{episode.vote_average.toFixed(1)}</AppText>
                            </View>
                          )}
                        </View>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </View>
          )}

          {/* 📝 REVIEWS */}
          {reviews && reviews.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionIconCircle}>
                  <Ionicons name="chatbubbles" size={22} color="#F39C12" />
                </View>
                <AppText variant="h2" style={styles.sectionTitle}>Reviews</AppText>
              </View>

              {reviews.map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))}

              {hasMoreReviews && (
                <TouchableOpacity
                  style={styles.loadMoreButton}
                  onPress={loadMoreReviews}
                  disabled={loadingReviews}
                >
                  {loadingReviews ? (
                    <ActivityIndicator color="#e50914" />
                  ) : (
                    <AppText variant="cardTitle" style={styles.loadMoreText}>
                      Load More Reviews
                    </AppText>
                  )}
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* 🎬 WATCH PROVIDERS */}
          <WatchProvidersList providers={watchProviders} region={region} />

          {/* 💡 RECOMMENDATIONS */}
          {recommendations && recommendations.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionIconCircle}>
                  <Ionicons name="bulb" size={22} color="#FFD700" />
                </View>
                <AppText variant="h2" style={styles.sectionTitle}>Recommended for You</AppText>
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.recommendationsScroll}
              >
                {recommendations.slice(0, 10).map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.recommendationCard}
                    onPress={() => {
                      navigation.push('MediaDetail', {
                        mediaId: item.id,
                        mediaType: item.media_type || mediaType,
                      });
                    }}
                  >
                    <Image
                      source={{
                        uri: `https://image.tmdb.org/t/p/w342${item.poster_path}`,
                      }}
                      style={styles.recommendationPoster}
                    />
                    <AppText variant="caption" style={styles.recommendationTitle} numberOfLines={2}>
                      {item.title || item.name}
                    </AppText>
                    <View style={styles.recommendationRating}>
                      <Ionicons name="star" size={12} color="#FFD700" />
                      <AppText variant="metadata" style={styles.recommendationRatingText}>
                        {item.vote_average?.toFixed(1)}
                      </AppText>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          {/* 🔄 SIMILAR CONTENT */}
          {similar && similar.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionIconCircle}>
                  <Ionicons name="copy" size={22} color="#3ABEFF" />
                </View>
                <AppText variant="h2" style={styles.sectionTitle}>Similar {mediaType === 'tv' ? 'Shows' : 'Movies'}</AppText>
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.recommendationsScroll}
              >
                {similar.slice(0, 10).map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.recommendationCard}
                    onPress={() => {
                      navigation.push('MediaDetail', {
                        mediaId: item.id,
                        mediaType: item.media_type || mediaType,
                      });
                    }}
                  >
                    <Image
                      source={{
                        uri: `https://image.tmdb.org/t/p/w342${item.poster_path}`,
                      }}
                      style={styles.recommendationPoster}
                    />
                    <AppText variant="caption" style={styles.recommendationTitle} numberOfLines={2}>
                      {item.title || item.name}
                    </AppText>
                    <View style={styles.recommendationRating}>
                      <Ionicons name="star" size={12} color="#FFD700" />
                      <AppText variant="metadata" style={styles.recommendationRatingText}>
                        {item.vote_average?.toFixed(1)}
                      </AppText>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
          
          <View style={{ height: 60 }} />
        </View>
      </Animated.ScrollView>

      {/* Video Player Modal */}
      {selectedVideo && (
        <VideoPlayer
          videoKey={selectedVideo.key}
          title={selectedVideo.name}
          onClose={() => setSelectedVideo(null)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  scrollView: {
    flex: 1,
  },
  errorContainer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    marginTop: 16,
    color: '#888',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: colors.purple,
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 25,
  },
  retryText: {
    color: '#fff',
  },
  animatedHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  },
  headerBlur: {
    paddingTop: Platform.OS === 'ios' ? 60 : 30,
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  headerTitle: {
    color: '#fff',
    textAlign: 'center',
  },
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 30,
    left: 16,
    zIndex: 101,
    borderRadius: 12,
    overflow: 'hidden',
  },
  backButtonBlur: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  favoriteButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 30,
    right: 16,
    zIndex: 101,
    borderRadius: 12,
    overflow: 'hidden',
  },
  favoriteButtonBlur: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sparkleIcon: {
    position: 'absolute',
    left: -7,
    top: -8,
  },
  backdropContainer: {
    height: HEADER_HEIGHT,
    width: '100%',
  },
  backdrop: {
    width: '100%',
    height: '100%',
  },
  backdropGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '100%',
  },
  content: {
    marginTop: -100,
    paddingHorizontal: 20,
  },
  titleSection: {
    flexDirection: 'row',
    marginBottom: 32,
  },
  posterWrapper: {
    elevation: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
  },
  poster: {
    width: 120,
    height: 180,
    borderRadius: 12,
  },
  posterShadow: {
    // Handled by wrapper
  },
  titleInfo: {
    flex: 1,
    marginLeft: 20,
    justifyContent: 'flex-end',
  },
  title: {
    color: '#fff',
    marginBottom: 12,
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  metaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 6,
  },
  metaText: {
    color: '#eee',
  },
  ratingSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 8,
  },
  ratingNumber: {
    color: '#000',
  },
  voteCount: {
    color: '#888',
  },
  actionSection: {
    marginBottom: 32,
  },
  primaryActionButton: {
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 12,
  },
  actionButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 10,
  },
  actionButtonText: {
    color: '#fff',
  },
  secondaryActions: {
    flexDirection: 'row',
    gap: 12,
  },
  secondaryActionButton: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  secondaryButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 8,
  },
  secondaryButtonText: {
    color: '#fff',
  },
  inWatchlistContainer: {
    marginBottom: 32,
  },
  inWatchlistBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 14,
    gap: 10,
    borderWidth: 1,
    borderColor: 'rgba(39,174,96,0.3)',
  },
  inWatchlistText: {
    color: '#27AE60',
  },
  genresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 32,
  },
  genreChip: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  genreGradient: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  genreText: {
    color: '#ddd',
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  sectionIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    color: '#fff',
  },
  overview: {
    color: '#bbb',
    lineHeight: 24,
  },
  infoGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  infoCard: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  infoCardBg: {
    padding: 16,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  infoNumber: {
    color: colors.purple,
    marginBottom: 4,
  },
  infoLabel: {
    color: '#888',
    letterSpacing: 1,
  },
  castScrollContent: {
    gap: 16,
  },
  castCard: {
    width: 100,
  },
  castImageWrapper: {
    width: 100,
    height: 140,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 8,
  },
  castImage: {
    width: '100%',
    height: '100%',
  },
  castPlaceholder: {
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  castGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
  },
  castName: {
    color: '#fff',
    textAlign: 'center',
  },
  castCharacter: {
    color: '#888',
    textAlign: 'center',
  },
  seasonSelector: {
    marginBottom: 20,
  },
  seasonButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
    marginRight: 10,
  },
  seasonButtonActive: {
    backgroundColor: colors.purple,
  },
  seasonButtonText: {
    color: '#888',
  },
  seasonButtonTextActive: {
    color: '#fff',
  },
  episodesList: {
    gap: 16,
  },
  episodeCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 12,
    overflow: 'hidden',
    height: 120,
  },
  episodeImage: {
    width: 160,
    height: 120,
  },
  episodeInfo: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  episodeNumber: {
    color: '#fff',
  },
  episodeOverview: {
    color: '#888',
    fontSize: 12,
  },
  episodeMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  episodeAirDate: {
    color: '#555',
  },
  episodeRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  episodeRatingText: {
    color: colors.gold,
  },
  providerSection: {
    gap: 12,
  },
  providerType: {
    color: '#888',
    letterSpacing: 1,
  },
  providerCard: {
    width: 60,
    marginRight: 12,
    alignItems: 'center',
  },
  providerLogo: {
    width: 60,
    height: 60,
    borderRadius: 12,
    marginBottom: 8,
  },
  providerName: {
    color: '#888',
    fontSize: 10,
    textAlign: 'center',
  },
  // Trailer/Video styles
  trailerButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  trailerButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 12,
  },
  trailerButtonText: {
    color: '#fff',
  },
  videosList: {
    marginTop: 8,
  },
  videoCard: {
    width: 140,
    marginRight: 12,
  },
  videoThumbnail: {
    width: 140,
    height: 80,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  videoTitle: {
    color: '#ccc',
    fontSize: 12,
  },
  // Reviews styles
  loadMoreButton: {
    marginTop: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(229,9,20,0.1)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e50914',
    alignItems: 'center',
  },
  loadMoreText: {
    color: '#e50914',
  },
  // Recommendations/Similar styles
  recommendationsScroll: {
    paddingRight: 20,
  },
  recommendationCard: {
    width: 120,
    marginRight: 12,
  },
  recommendationPoster: {
    width: 120,
    height: 180,
    borderRadius: 8,
    backgroundColor: '#1a1a1a',
    marginBottom: 8,
  },
  recommendationTitle: {
    color: '#fff',
    fontSize: 12,
    marginBottom: 4,
  },
  recommendationRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  recommendationRatingText: {
    color: '#FFD700',
    fontSize: 11,
  },
});

