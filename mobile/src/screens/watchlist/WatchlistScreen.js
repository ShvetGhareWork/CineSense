import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
  RefreshControl,
  ScrollView,
} from 'react-native';
import Animated, {
  FadeOut,
  Layout,
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withSpring,
  withTiming,
  interpolate,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import useWatchlistStore from '../../store/watchlistStore';
import { colors, gradients, typography, spacing, borderRadius } from '../../constants/theme';

const TABS = [
  { id: 'all', label: 'All', icon: 'list' },
  { id: 'favorites', label: 'Favorites', icon: 'heart' }, // NEW: Favorites tab
  { id: 'in_progress', label: 'Watching', icon: 'play-circle' },
  { id: 'to_watch', label: 'Planned', icon: 'bookmark' },
  { id: 'finished', label: 'Completed', icon: 'checkmark-circle' },
  { id: 'dropped', label: 'Dropped', icon: 'close-circle' },
];

const STATUS_COLORS = {
  to_watch: colors.amber,
  in_progress: colors.blue,
  finished: colors.green,
  dropped: colors.red,
};

const STATUS_LABELS = {
  to_watch: 'Plan to Watch',
  in_progress: 'Watching',
  finished: 'Completed',
  dropped: 'Dropped',
};

import { getStaggerDelay, useProgressAnimation, useFloatingAnimation } from '../../utils/animations';
import AppText from '../../components/common/AppText';

const WatchlistItem = ({ item, handlePress, handleRemove, handleStatusChange }) => {
  const posterUrl = item.mediaId?.posterPath
    ? `https://image.tmdb.org/t/p/w500${item.mediaId.posterPath}`
    : null;

  const statusColor = STATUS_COLORS[item.status] || colors.textSecondary;
  const progress = item.progress || 0;
  
  // Animated progress bar
  const { animatedStyle: progressStyle, setProgress } = useProgressAnimation(0);
  
  useEffect(() => {
    if (item.status === 'in_progress') {
      // Small delay to ensure the progress bar animation is visible after mount
      setTimeout(() => {
        setProgress(progress / 100);
      }, 500);
    }
  }, [progress, item.status]);

  return (
    <Animated.View
      layout={Layout.springify().damping(18)}
      exiting={FadeOut.duration(250)}
    >
      <View style={styles.cardContainer}>
        <TouchableOpacity
          style={styles.card}
          onPress={() => handlePress(item)}
          activeOpacity={0.7}
        >
          <LinearGradient
            colors={['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.02)']}
            style={styles.cardGradient}
          >
            {/* Poster */}
            <View style={styles.posterContainer}>
              {posterUrl ? (
                <Image source={{ uri: posterUrl }} style={styles.poster} />
              ) : (
                <View style={[styles.poster, styles.posterPlaceholder]}>
                  <Ionicons name="film-outline" size={30} color={colors.textTertiary} />
                </View>
              )}
            </View>

            {/* Content */}
            <View style={styles.content}>
              {/* Title */}
              <AppText variant="cardTitle" style={styles.title} numberOfLines={2}>
                {item.mediaId?.title}
              </AppText>

              {/* Meta Info */}
              <View style={styles.metaRow}>
                <View style={styles.metaItem}>
                  <Ionicons 
                    name={item.mediaId?.type === 'tv' ? 'tv' : 'film'} 
                    size={14} 
                    color={colors.textSecondary} 
                  />
                  <AppText variant="metadata" style={styles.metaText}>
                    {item.mediaId?.type === 'tv' ? 'TV Show' : 'Movie'}
                  </AppText>
                </View>
                {item.mediaId?.year && (
                  <View style={styles.metaItem}>
                    <Ionicons name="calendar-outline" size={14} color={colors.textSecondary} />
                    <AppText variant="metadata" style={styles.metaText}>{item.mediaId.year}</AppText>
                  </View>
                )}
              </View>

              {/* Status Badge - Only show for watchlist items, not favorites */}
              {item.status && (
                <View style={[styles.statusBadge, { backgroundColor: statusColor + '20', borderColor: statusColor }]}>
                  <AppText variant="caption" style={[styles.statusText, { color: statusColor }]}>
                    {STATUS_LABELS[item.status]}
                  </AppText>
                </View>
              )}

              {/* Progress Bar */}
              {item.status === 'in_progress' && progress > 0 && (
                <View style={styles.progressContainer}>
                  <View style={styles.progressBar}>
                    <Animated.View
                      style={[
                        styles.progressFill,
                        { backgroundColor: colors.blue }, // Fallback color
                        progressStyle,
                        { width: '100%', transformOrigin: 'left' }
                      ]}
                    >
                      <LinearGradient
                        colors={gradients.blue}
                        style={StyleSheet.absoluteFill}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                      />
                    </Animated.View>
                  </View>
                  <AppText variant="metadata" style={styles.progressText}>{Math.round(progress)}%</AppText>
                </View>
              )}

              {/* Rating - Show for finished items or favorites */}
              {(item.status === 'finished' || !item.status) && item.mediaId?.voteAverage && (
                <View style={styles.ratingContainer}>
                  <Ionicons name="star" size={14} color={colors.gold} />
                  <AppText variant="metadata" style={styles.ratingText}>{item.mediaId.voteAverage.toFixed(1)}</AppText>
                </View>
              )}

              {/* Quick Actions */}
              <View style={styles.actions}>
                {item.status && item.status !== 'finished' && (
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleStatusChange(item, 'finished')}
                  >
                    <Ionicons name="checkmark-circle-outline" size={20} color={colors.green} />
                    <AppText variant="caption" style={styles.actionText}>Mark Watched</AppText>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleRemove(item)}
                >
                  <Ionicons name="trash-outline" size={20} color={colors.red} />
                  <AppText variant="caption" style={[styles.actionText, { color: colors.red }]}>Remove</AppText>
                </TouchableOpacity>
              </View>
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

export default function WatchlistScreen() {
  const navigation = useNavigation();
  const { items, favorites, fetchWatchlist, removeFromWatchlist, removeFavorite, updateStatus, loading } = useWatchlistStore();
  const [activeTab, setActiveTab] = useState('all');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchWatchlist();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchWatchlist();
    setRefreshing(false);
  }, []);

  const filteredItems = activeTab === 'all' 
    ? items 
    : activeTab === 'favorites'
    ? favorites
    : items.filter(item => item.status === activeTab);

  const handlePress = (item) => {
    navigation.navigate('MediaDetail', {
      mediaId: item.mediaId?.tmdbId || item.mediaId?.id?.toString(),
      mediaType: item.mediaId?.type || 'movie',
    });
  };

  const handleRemove = (item) => {
    const isFavoriteItem = activeTab === 'favorites';
    Alert.alert(
      isFavoriteItem ? 'Remove from Favorites' : 'Remove from Watchlist',
      `Remove "${item.mediaId?.title}" from your ${isFavoriteItem ? 'favorites' : 'watchlist'}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => isFavoriteItem ? removeFavorite(item._id) : removeFromWatchlist(item._id),
        },
      ]
    );
  };

  const handleStatusChange = async (item, newStatus) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await updateStatus(item._id, newStatus);
  };

  const renderItem = ({ item }) => (
    <WatchlistItem 
      item={item}
      handlePress={handlePress}
      handleRemove={handleRemove}
      handleStatusChange={handleStatusChange}
    />
  );

  const renderEmpty = () => {
    const floatingStyle = useFloatingAnimation(15, 3000);
    const emptyMessages = {
      all: {
        icon: 'list-outline',
        title: 'Your watchlist is empty',
        subtitle: 'Start adding movies and TV shows to track what you want to watch',
      },
      in_progress: {
        icon: 'play-circle-outline',
        title: 'Nothing in progress',
        subtitle: 'Start watching something from your watchlist',
      },
      to_watch: {
        icon: 'bookmark-outline',
        title: 'No planned content',
        subtitle: 'Add movies and shows you want to watch later',
      },
      finished: {
        icon: 'checkmark-circle-outline',
        title: 'No completed items',
        subtitle: 'Mark items as watched to see them here',
      },
      dropped: {
        icon: 'close-circle-outline',
        title: 'No dropped items',
        subtitle: "Items you've stopped watching will appear here",
      },
    };

    const message = emptyMessages[activeTab] || emptyMessages.all;

    return (
      <View style={styles.emptyState}>
        <Animated.View style={[styles.emptyIconCircle, floatingStyle]}>
          <LinearGradient
            colors={gradients.purple}
            style={styles.emptyIconGradient}
          >
            <Ionicons name={message.icon} size={60} color="#fff" />
          </LinearGradient>
        </Animated.View>
        <AppText variant="h2" style={styles.emptyTitle}>{message.title}</AppText>
        <AppText variant="body" style={styles.emptySubtitle}>{message.subtitle}</AppText>
        <TouchableOpacity
          style={styles.ctaButton}
          onPress={() => navigation.navigate('Discover')}
        >
          <LinearGradient
            colors={gradients.purple}
            style={styles.ctaGradient}
          >
            <Ionicons name="search" size={20} color="#fff" />
            <AppText variant="cardTitle" style={styles.ctaText}>Discover Something New</AppText>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Segmented Tabs */}
      <View style={styles.tabsContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsWrapper}
        >
          {TABS.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[styles.tab, activeTab === item.id && styles.tabActive]}
              onPress={() => setActiveTab(item.id)}
              activeOpacity={0.7}
            >
              {activeTab === item.id ? (
                <LinearGradient
                  colors={gradients.purple}
                  style={styles.tabGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Ionicons name={item.icon} size={16} color="#fff" />
                  <AppText variant="caption" style={styles.tabTextActive}>{item.label}</AppText>
                </LinearGradient>
              ) : (
                <View style={styles.tabInactive}>
                   <Ionicons name={item.icon} size={16} color={colors.textSecondary} />
                  <AppText variant="caption" style={styles.tabText}>{item.label}</AppText>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Watchlist Items */}
      <FlatList
        data={filteredItems}
        renderItem={renderItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.purple}
            colors={[colors.purple]}
          />
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.midnight,
  },
  tabsContainer: {
    paddingVertical: spacing.lg,
    backgroundColor: colors.midnight,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  tabsWrapper: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingHorizontal: spacing.xl,
  },
  tab: {
    borderRadius: borderRadius.full,
    overflow: 'hidden',
    shadowColor: colors.purple,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  tabGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md + 2,
    gap: spacing.sm,
  },
  tabInactive: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md + 2,
    gap: spacing.sm,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  tabActive: {
    // Gradient handles the background
  },
  tabText: {
    fontSize: typography.body.fontSize,
    fontWeight: typography.semibold,
    color: colors.textSecondary,
  },
  tabTextActive: {
    fontSize: typography.body.fontSize,
    fontWeight: typography.bold,
    color: colors.textPrimary,
  },
  listContent: {
    padding: spacing.lg,
  },
  card: {
    marginBottom: spacing.lg,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  cardGradient: {
    flexDirection: 'row',
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
  },
  posterContainer: {
    marginRight: spacing.md,
  },
  cardContainer: {
    backgroundColor: colors.midnight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
    marginBottom: spacing.lg,
    borderRadius: borderRadius.lg,
  },
  poster: {
    width: 70,
    height: 105,
    borderRadius: borderRadius.md,
    backgroundColor: colors.cardDark,
  },
  posterPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
  },
  title: {
    fontSize: typography.body.fontSize,
    fontWeight: typography.bold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  metaRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  metaText: {
    fontSize: typography.caption.fontSize,
    color: colors.textSecondary,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    marginBottom: spacing.sm,
  },
  statusText: {
    fontSize: typography.caption.fontSize,
    fontWeight: typography.bold,
    letterSpacing: 0.5,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  progressBar: {
    flex: 1,
    height: 5,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
  },
  progressText: {
    fontSize: typography.small.fontSize,
    fontWeight: typography.bold,
    color: colors.blue,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  ratingText: {
    fontSize: typography.body.fontSize,
    fontWeight: typography.bold,
    color: colors.gold,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.lg,
    marginTop: spacing.xs,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  actionText: {
    fontSize: typography.body.fontSize,
    fontWeight: typography.semibold,
    color: colors.green,
  },
  emptyState: {
    paddingVertical: spacing.massive * 2,
    alignItems: 'center',
  },
  emptyIconCircle: {
    width: 120,
    height: 120,
    marginBottom: spacing.xl,
  },
  emptyIconGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.purple,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  emptyTitle: {
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  emptySubtitle: {
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xxl,
    paddingHorizontal: spacing.xxxl,
  },
  ctaButton: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  ctaGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.lg,
    gap: spacing.sm,
  },
  ctaText: {
    color: colors.textPrimary,
  },
});

