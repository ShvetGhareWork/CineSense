import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Animated,
  StatusBar,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

import useWatchlistStore from '../../store/watchlistStore';
import api from '../../api/client';
import { colors, typography, spacing, borderRadius } from '../../constants/theme';

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
  const scrollY = new Animated.Value(0);
  
  const { addToWatchlist, items } = useWatchlistStore();
  const watchlistItem = useMemo(
    () => items.find(item => item.mediaId?.tmdbId === mediaId),
    [items, mediaId]
  );

  useEffect(() => {
    StatusBar.setBarStyle('light-content');
    fetchMediaDetails();
    return () => StatusBar.setBarStyle('default');
  }, [mediaId, mediaType]);

  const fetchMediaDetails = async () => {
    try {
      setLoading(true);
      const [detailsRes, creditsRes, providersRes] = await Promise.all([
        api.get(`/media/${mediaType}/${mediaId}`),
        api.get(`/media/${mediaType}/${mediaId}/credits`).catch(() => ({ data: { data: null } })),
        api.get(`/discover/where-to-watch/${mediaType}/${mediaId}`).catch(() => ({ data: { data: null } }))
      ]);

      setMedia(detailsRes.data.data);
      setCredits(creditsRes.data.data);
      setWatchProviders(providersRes.data.data);
      
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

  const handleAddToWatchlist = useCallback(async (status) => {
    await addToWatchlist(mediaId, mediaType, status);
    navigation.goBack();
  }, [mediaId, mediaType, addToWatchlist, navigation]);

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, HEADER_HEIGHT - 100, HEADER_HEIGHT],
    outputRange: [0, 0, 1],
    extrapolate: 'clamp',
  });

  const imageOpacity = scrollY.interpolate({
    inputRange: [0, HEADER_HEIGHT / 2, HEADER_HEIGHT],
    outputRange: [1, 0.5, 0],
    extrapolate: 'clamp',
  });

  const imageScale = scrollY.interpolate({
    inputRange: [-100, 0, HEADER_HEIGHT],
    outputRange: [1.2, 1, 0.8],
    extrapolate: 'clamp',
  });

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FFD700" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (!media) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={80} color={colors.error} />
        <Text style={styles.errorText}>Failed to load details</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => navigation.goBack()}>
          <Text style={styles.retryText}>Go Back</Text>
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
      <Animated.View style={[styles.animatedHeader, { opacity: headerOpacity }]}>
        <BlurView intensity={95} tint="dark" style={styles.headerBlur}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {media.title || media.name}
          </Text>
        </BlurView>
      </Animated.View>

      {/* Back Button */}
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
        <BlurView intensity={80} tint="dark" style={styles.backButtonBlur}>
          <Ionicons name="arrow-back" size={26} color="#fff" />
        </BlurView>
      </TouchableOpacity>

      <Animated.ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
      >
        {/* Hero Backdrop */}
        <Animated.View style={[styles.backdropContainer, { opacity: imageOpacity }]}>
          <Animated.Image
            source={{ uri: backdropUrl }}
            style={[styles.backdrop, { transform: [{ scale: imageScale }] }]}
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
                <Image source={{ uri: posterUrl }} style={styles.poster} />
                <View style={styles.posterShadow} />
              </View>
            )}
            
            <View style={styles.titleInfo}>
              <Text style={styles.title}>{media.title || media.name}</Text>
              
              {/* Meta Info */}
              <View style={styles.metaRow}>
                {(mediaType === 'movie' ? media.release_date : media.first_air_date) && (
                  <View style={styles.metaChip}>
                    <Ionicons name="calendar-outline" size={14} color="#3ABEFF" />
                    <Text style={styles.metaText}>
                      {(mediaType === 'movie' ? media.release_date : media.first_air_date)?.split('-')[0]}
                    </Text>
                  </View>
                )}
                {mediaType === 'tv' && media.number_of_seasons && (
                  <View style={styles.metaChip}>
                    <Ionicons name="tv-outline" size={14} color="#6C63FF" />
                    <Text style={styles.metaText}>{media.number_of_seasons} Season{media.number_of_seasons > 1 ? 's' : ''}</Text>
                  </View>
                )}
                {mediaType === 'movie' && media.runtime && (
                  <View style={styles.metaChip}>
                    <Ionicons name="time-outline" size={14} color="#27AE60" />
                    <Text style={styles.metaText}>{media.runtime}m</Text>
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
                  <Ionicons name="star" size={28} color="#000" />
                  <Text style={styles.ratingNumber}>{media.vote_average?.toFixed(1)}</Text>
                </LinearGradient>
                <Text style={styles.voteCount}>{media.vote_count?.toLocaleString()} votes</Text>
              </View>
            </View>
          </View>

          {/* 🎯 ACTION BUTTONS - CLEAR & DISTINCT */}
          {!watchlistItem ? (
            <View style={styles.actionSection}>
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
                  <Text style={styles.actionButtonText}>Add to Watchlist</Text>
                </LinearGradient>
              </TouchableOpacity>

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
                    <Text style={styles.secondaryButtonText}>Mark Watched</Text>
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
                    <Text style={styles.secondaryButtonText}>Watching</Text>
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
                <Text style={styles.inWatchlistText}>✓ In Your Watchlist</Text>
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
                    <Text style={styles.genreText}>{genre.name}</Text>
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
                <Text style={styles.sectionTitle}>Overview</Text>
              </View>
              <Text style={styles.overview}>{media.overview}</Text>
            </View>
          )}

          {/* 📺 SERIES/MOVIE INFO - STRUCTURED & CLEAN */}
          {(mediaType === 'tv' || mediaType === 'movie') && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionIconCircle}>
                  <Ionicons name={mediaType === 'tv' ? 'tv' : 'film'} size={22} color="#3ABEFF" />
                </View>
                <Text style={styles.sectionTitle}>{mediaType === 'tv' ? 'Series' : 'Movie'} Info</Text>
              </View>
              
              <View style={styles.infoGrid}>
                {mediaType === 'tv' ? (
                  <>
                    <View style={styles.infoCard}>
                      <LinearGradient colors={['#6C63FF15', '#6C63FF05']} style={styles.infoCardBg}>
                        <Text style={styles.infoNumber}>{media.number_of_seasons}</Text>
                        <Text style={styles.infoLabel}>SEASONS</Text>
                      </LinearGradient>
                    </View>
                    <View style={styles.infoCard}>
                      <LinearGradient colors={['#3ABEFF15', '#3ABEFF05']} style={styles.infoCardBg}>
                        <Text style={styles.infoNumber}>{media.number_of_episodes}</Text>
                        <Text style={styles.infoLabel}>EPISODES</Text>
                      </LinearGradient>
                    </View>
                    <View style={styles.infoCard}>
                      <LinearGradient colors={['#F39C1215', '#F39C1205']} style={styles.infoCardBg}>
                        <Text style={styles.infoNumber}>{media.episode_run_time?.[0] || 'N/A'}</Text>
                        <Text style={styles.infoLabel}>MIN/EP</Text>
                      </LinearGradient>
                    </View>
                    <View style={styles.infoCard}>
                      <LinearGradient colors={['#27AE6015', '#27AE6005']} style={styles.infoCardBg}>
                        <Text style={styles.infoNumber}>{media.status}</Text>
                        <Text style={styles.infoLabel}>STATUS</Text>
                      </LinearGradient>
                    </View>
                  </>
                ) : (
                  <>
                    <View style={styles.infoCard}>
                      <LinearGradient colors={['#6C63FF15', '#6C63FF05']} style={styles.infoCardBg}>
                        <Text style={styles.infoNumber}>{media.runtime}</Text>
                        <Text style={styles.infoLabel}>MINUTES</Text>
                      </LinearGradient>
                    </View>
                    <View style={styles.infoCard}>
                      <LinearGradient colors={['#3ABEFF15', '#3ABEFF05']} style={styles.infoCardBg}>
                        <Text style={styles.infoNumber}>
                          {media.budget ? `$${(media.budget / 1000000).toFixed(0)}M` : 'N/A'}
                        </Text>
                        <Text style={styles.infoLabel}>BUDGET</Text>
                      </LinearGradient>
                    </View>
                    <View style={styles.infoCard}>
                      <LinearGradient colors={['#F39C1215', '#F39C1205']} style={styles.infoCardBg}>
                        <Text style={styles.infoNumber}>
                          {media.revenue ? `$${(media.revenue / 1000000).toFixed(0)}M` : 'N/A'}
                        </Text>
                        <Text style={styles.infoLabel}>REVENUE</Text>
                      </LinearGradient>
                    </View>
                    <View style={styles.infoCard}>
                      <LinearGradient colors={['#27AE6015', '#27AE6005']} style={styles.infoCardBg}>
                        <Text style={styles.infoNumber}>{media.status}</Text>
                        <Text style={styles.infoLabel}>STATUS</Text>
                      </LinearGradient>
                    </View>
                  </>
                )}
              </View>
            </View>
          )}

          {/* 👥 CAST - HIGHLY VISIBLE & SCROLLABLE */}
          {credits?.cast && credits.cast.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionIconCircle}>
                  <Ionicons name="people" size={22} color="#27AE60" />
                </View>
                <Text style={styles.sectionTitle}>Cast</Text>
              </View>
              
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.castScrollContent}
                decelerationRate="fast"
                snapToInterval={140}
              >
                {credits.cast.slice(0, 15).map((person) => (
                  <View key={person.id} style={styles.castCard}>
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
                    <Text style={styles.castName} numberOfLines={2}>{person.name}</Text>
                    <Text style={styles.castCharacter} numberOfLines={2}>{person.character}</Text>
                  </View>
                ))}
              </ScrollView>
            </View>
          )}

          {/* 📺 EPISODES - TV SHOWS ONLY */}
          {mediaType === 'tv' && media.number_of_seasons > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionIconCircle}>
                  <Ionicons name="list" size={22} color="#F39C12" />
                </View>
                <Text style={styles.sectionTitle}>Episodes</Text>
              </View>

              {/* Season Selector */}
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                style={styles.seasonSelector}
              >
                {Array.from({ length: media.number_of_seasons }, (_, i) => i + 1).map((seasonNum) => (
                  <TouchableOpacity
                    key={seasonNum}
                    style={[
                      styles.seasonButton,
                      selectedSeason === seasonNum && styles.seasonButtonActive
                    ]}
                    onPress={() => fetchEpisodes(seasonNum)}
                  >
                    <Text style={[
                      styles.seasonButtonText,
                      selectedSeason === seasonNum && styles.seasonButtonTextActive
                    ]}>
                      Season {seasonNum}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Episodes List */}
              {loadingEpisodes ? (
                <View style={styles.episodesLoading}>
                  <ActivityIndicator size="small" color="#6C63FF" />
                  <Text style={styles.episodesLoadingText}>Loading episodes...</Text>
                </View>
              ) : episodes.length > 0 ? (
                <View style={styles.episodesList}>
                  {episodes.map((episode) => (
                    <View key={episode.id} style={styles.episodeCard}>
                      <LinearGradient
                        colors={['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.02)']}
                        style={styles.episodeCardBg}
                      >
                        {/* Episode Image */}
                        {episode.still_path && (
                          <Image
                            source={{ uri: `https://image.tmdb.org/t/p/w300${episode.still_path}` }}
                            style={styles.episodeImage}
                          />
                        )}
                        
                        {/* Episode Info */}
                        <View style={styles.episodeInfo}>
                          <View style={styles.episodeHeader}>
                            <Text style={styles.episodeNumber}>
                              {episode.episode_number}. {episode.name}
                            </Text>
                            {episode.runtime && (
                              <View style={styles.episodeRuntime}>
                                <Ionicons name="time-outline" size={14} color="#888" />
                                <Text style={styles.episodeRuntimeText}>{episode.runtime}m</Text>
                              </View>
                            )}
                          </View>
                          
                          {episode.air_date && (
                            <Text style={styles.episodeAirDate}>
                              Aired: {new Date(episode.air_date).toLocaleDateString('en-US', { 
                                year: 'numeric', 
                                month: 'short', 
                                day: 'numeric' 
                              })}
                            </Text>
                          )}
                          
                          {episode.overview && (
                            <Text style={styles.episodeOverview} numberOfLines={3}>
                              {episode.overview}
                            </Text>
                          )}
                          
                          {episode.vote_average > 0 && (
                            <View style={styles.episodeRating}>
                              <Ionicons name="star" size={14} color="#FFD700" />
                              <Text style={styles.episodeRatingText}>{episode.vote_average.toFixed(1)}</Text>
                            </View>
                          )}
                        </View>
                      </LinearGradient>
                    </View>
                  ))}
                </View>
              ) : (
                <View style={styles.noEpisodes}>
                  <Ionicons name="film-outline" size={40} color="#444" />
                  <Text style={styles.noEpisodesText}>No episodes available</Text>
                </View>
              )}
            </View>
          )}

          {/* 🎬 WHERE TO WATCH - HIGHLY PROMINENT */}
          {watchProviders?.results?.US && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionIconCircle}>
                  <Ionicons name="play-circle" size={22} color="#6C63FF" />
                </View>
                <Text style={styles.sectionTitle}>Where to Watch</Text>
              </View>
              
              {watchProviders.results.US.flatrate && (
                <View style={styles.providerSection}>
                  <View style={styles.providerHeader}>
                    <Ionicons name="tv" size={20} color="#3ABEFF" />
                    <Text style={styles.providerType}>STREAMING</Text>
                  </View>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {watchProviders.results.US.flatrate.map((provider) => (
                      <View key={provider.provider_id} style={styles.providerCard}>
                        <View style={styles.providerLogoWrapper}>
                          <Image
                            source={{ uri: `https://image.tmdb.org/t/p/w92${provider.logo_path}` }}
                            style={styles.providerLogo}
                          />
                        </View>
                        <Text style={styles.providerName} numberOfLines={2}>{provider.provider_name}</Text>
                      </View>
                    ))}
                  </ScrollView>
                </View>
              )}
              
              {watchProviders.results.US.rent && (
                <View style={styles.providerSection}>
                  <View style={styles.providerHeader}>
                    <Ionicons name="cash-outline" size={20} color="#F39C12" />
                    <Text style={styles.providerType}>RENT / BUY</Text>
                  </View>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {watchProviders.results.US.rent.slice(0, 8).map((provider) => (
                      <View key={provider.provider_id} style={styles.providerCard}>
                        <View style={styles.providerLogoWrapper}>
                          <Image
                            source={{ uri: `https://image.tmdb.org/t/p/w92${provider.logo_path}` }}
                            style={styles.providerLogo}
                          />
                        </View>
                        <Text style={styles.providerName} numberOfLines={2}>{provider.provider_name}</Text>
                      </View>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>
          )}

          <View style={{ height: 40 }} />
        </View>
      </Animated.ScrollView>
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
  loadingContainer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#888',
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
    fontSize: 18,
    color: '#888',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#6C63FF',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 25,
  },
  retryText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  animatedHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  },
  headerBlur: {
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: 12,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 20,
    left: 16,
    zIndex: 101,
    borderRadius: 25,
    overflow: 'hidden',
  },
  backButtonBlur: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
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
    marginTop: -120,
    paddingHorizontal: 20,
  },
  titleSection: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  posterWrapper: {
    position: 'relative',
  },
  poster: {
    width: 130,
    height: 195,
    borderRadius: 16,
  },
  posterShadow: {
    position: 'absolute',
    bottom: -8,
    left: 8,
    right: 8,
    height: 20,
    backgroundColor: '#000',
    borderRadius: 16,
    opacity: 0.6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 15,
  },
  titleInfo: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'flex-end',
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 12,
    lineHeight: 32,
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
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  metaText: {
    fontSize: 13,
    color: '#fff',
    fontWeight: '600',
  },
  ratingSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 8,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
  ratingNumber: {
    fontSize: 24,
    fontWeight: '900',
    color: '#000',
  },
  voteCount: {
    fontSize: 13,
    color: '#aaa',
    fontWeight: '600',
  },
  actionSection: {
    marginBottom: 24,
  },
  primaryActionButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 12,
    shadowColor: '#F39C12',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  actionButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    gap: 10,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  secondaryActions: {
    flexDirection: 'row',
    gap: 12,
  },
  secondaryActionButton: {
    flex: 1,
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  secondaryButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 6,
  },
  secondaryButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  inWatchlistContainer: {
    marginBottom: 24,
  },
  inWatchlistBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 16,
    gap: 10,
    borderWidth: 2,
    borderColor: '#27AE60',
  },
  inWatchlistText: {
    color: '#27AE60',
    fontSize: 18,
    fontWeight: '700',
  },
  genresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 32,
  },
  genreChip: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  genreGradient: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    borderRadius: 20,
  },
  genreText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
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
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
  },
  overview: {
    fontSize: 15,
    color: '#bbb',
    lineHeight: 24,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  infoCard: {
    width: '48%',
    borderRadius: 16,
    overflow: 'hidden',
  },
  infoCardBg: {
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
  },
  infoNumber: {
    fontSize: 28,
    fontWeight: '900',
    color: '#6C63FF',
    marginBottom: 4,
  },
  infoLabel: {
    fontSize: 11,
    color: '#888',
    fontWeight: '700',
    letterSpacing: 1,
  },
  castScrollContent: {
    paddingRight: 20,
  },
  castCard: {
    width: 120,
    marginRight: 16,
  },
  castImageWrapper: {
    position: 'relative',
    marginBottom: 10,
  },
  castImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
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
    borderBottomLeftRadius: 60,
    borderBottomRightRadius: 60,
  },
  castName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
    textAlign: 'center',
  },
  castCharacter: {
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
  },
  providerSection: {
    marginBottom: 20,
  },
  providerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  providerType: {
    fontSize: 13,
    color: '#fff',
    fontWeight: '700',
    letterSpacing: 1.2,
  },
  providerCard: {
    width: 90,
    marginRight: 16,
    alignItems: 'center',
  },
  providerLogoWrapper: {
    width: 70,
    height: 70,
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  providerLogo: {
    width: '100%',
    height: '100%',
  },
  providerName: {
    fontSize: 12,
    color: '#fff',
    textAlign: 'center',
    fontWeight: '600',
  },
  // Episodes Section
  seasonSelector: {
    marginBottom: 20,
  },
  seasonButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 20,
    marginRight: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  seasonButtonActive: {
    backgroundColor: '#6C63FF',
    borderColor: '#6C63FF',
  },
  seasonButtonText: {
    color: '#aaa',
    fontSize: 14,
    fontWeight: '600',
  },
  seasonButtonTextActive: {
    color: '#fff',
    fontWeight: '700',
  },
  episodesLoading: {
    paddingVertical: 40,
    alignItems: 'center',
    gap: 12,
  },
  episodesLoadingText: {
    color: '#888',
    fontSize: 14,
  },
  episodesList: {
    gap: 16,
  },
  episodeCard: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  episodeCardBg: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: 12,
    overflow: 'hidden',
  },
  episodeImage: {
    width: '100%',
    height: 180,
    backgroundColor: '#1a1a1a',
  },
  episodeInfo: {
    padding: 16,
  },
  episodeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
    gap: 12,
  },
  episodeNumber: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    lineHeight: 22,
  },
  episodeRuntime: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  episodeRuntimeText: {
    fontSize: 12,
    color: '#888',
    fontWeight: '600',
  },
  episodeAirDate: {
    fontSize: 13,
    color: '#888',
    marginBottom: 10,
  },
  episodeOverview: {
    fontSize: 14,
    color: '#aaa',
    lineHeight: 20,
    marginBottom: 10,
  },
  episodeRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  episodeRatingText: {
    fontSize: 13,
    color: '#FFD700',
    fontWeight: '700',
  },
  noEpisodes: {
    paddingVertical: 40,
    alignItems: 'center',
    gap: 12,
  },
  noEpisodesText: {
    color: '#666',
    fontSize: 14,
  },
});
