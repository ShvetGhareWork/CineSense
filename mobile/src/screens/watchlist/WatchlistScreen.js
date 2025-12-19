import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  RefreshControl,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

import useWatchlistStore from '../../store/watchlistStore';
import { colors, gradients, typography, spacing, borderRadius } from '../../constants/theme';

const TABS = [
  { id: 'all', label: 'All', icon: 'list' },
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

export default function WatchlistScreen() {
  const navigation = useNavigation();
  const { items, fetchWatchlist, removeFromWatchlist, updateWatchlistStatus, loading } = useWatchlistStore();
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
    : items.filter(item => item.status === activeTab);

  const handlePress = (item) => {
    navigation.navigate('MediaDetail', {
      mediaId: item.mediaId?.tmdbId || item.mediaId?.id?.toString(),
      mediaType: item.mediaId?.type || 'movie',
    });
  };

  const handleRemove = (item) => {
    Alert.alert(
      'Remove from Watchlist',
      `Remove "${item.mediaId?.title}" from your watchlist?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => removeFromWatchlist(item._id),
        },
      ]
    );
  };

  const handleStatusChange = async (item, newStatus) => {
    await updateWatchlistStatus(item._id, newStatus);
  };

  const renderItem = ({ item }) => {
    const posterUrl = item.mediaId?.posterPath
      ? `https://image.tmdb.org/t/p/w500${item.mediaId.posterPath}`
      : null;

    const statusColor = STATUS_COLORS[item.status] || colors.textSecondary;
    const progress = item.progress || 0;

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => handlePress(item)}
        activeOpacity={0.9}
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
            <Text style={styles.title} numberOfLines={2}>
              {item.mediaId?.title}
            </Text>

            {/* Meta Info */}
            <View style={styles.metaRow}>
              <View style={styles.metaItem}>
                <Ionicons 
                  name={item.mediaId?.type === 'tv' ? 'tv' : 'film'} 
                  size={14} 
                  color={colors.textSecondary} 
                />
                <Text style={styles.metaText}>
                  {item.mediaId?.type === 'tv' ? 'TV Show' : 'Movie'}
                </Text>
              </View>
              {item.mediaId?.year && (
                <View style={styles.metaItem}>
                  <Ionicons name="calendar-outline" size={14} color={colors.textSecondary} />
                  <Text style={styles.metaText}>{item.mediaId.year}</Text>
                </View>
              )}
            </View>

            {/* Status Badge */}
            <View style={[styles.statusBadge, { backgroundColor: statusColor + '20', borderColor: statusColor }]}>
              <Text style={[styles.statusText, { color: statusColor }]}>
                {STATUS_LABELS[item.status]}
              </Text>
            </View>

            {/* Progress Bar (for in_progress) */}
            {item.status === 'in_progress' && progress > 0 && (
              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <LinearGradient
                    colors={gradients.blue}
                    style={[styles.progressFill, { width: `${progress}%` }]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  />
                </View>
                <Text style={styles.progressText}>{Math.round(progress)}%</Text>
              </View>
            )}

            {/* Rating (for finished) */}
            {item.status === 'finished' && item.mediaId?.voteAverage && (
              <View style={styles.ratingContainer}>
                <Ionicons name="star" size={14} color={colors.gold} />
                <Text style={styles.ratingText}>{item.mediaId.voteAverage.toFixed(1)}</Text>
              </View>
            )}

            {/* Quick Actions */}
            <View style={styles.actions}>
              {item.status !== 'finished' && (
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => handleStatusChange(item, 'finished')}
                >
                  <Ionicons name="checkmark-circle-outline" size={20} color={colors.green} />
                  <Text style={styles.actionText}>Mark Watched</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => handleRemove(item)}
              >
                <Ionicons name="trash-outline" size={20} color={colors.red} />
                <Text style={[styles.actionText, { color: colors.red }]}>Remove</Text>
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  const renderEmpty = () => {
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
        <LinearGradient
          colors={gradients.purple}
          style={styles.emptyIconCircle}
        >
          <Ionicons name={message.icon} size={60} color="#fff" />
        </LinearGradient>
        <Text style={styles.emptyTitle}>{message.title}</Text>
        <Text style={styles.emptySubtitle}>{message.subtitle}</Text>
        <TouchableOpacity
          style={styles.ctaButton}
          onPress={() => navigation.navigate('Discover')}
        >
          <LinearGradient
            colors={gradients.purple}
            style={styles.ctaGradient}
          >
            <Ionicons name="search" size={20} color="#fff" />
            <Text style={styles.ctaText}>Discover Something New</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Segmented Tabs */}
      <View style={styles.tabsContainer}>
        <View style={styles.tabsWrapper}>
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
                  <Text style={styles.tabTextActive}>{item.label}</Text>
                </LinearGradient>
              ) : (
                <View style={styles.tabInactive}>
                  <Ionicons name={item.icon} size={16} color={colors.textSecondary} />
                  <Text style={styles.tabText}>{item.label}</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
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
    paddingHorizontal: spacing.xl,
    backgroundColor: colors.midnight,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  tabsWrapper: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  tab: {
    borderRadius: borderRadius.full,
    overflow: 'hidden',
  },
  tabGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.xs,
  },
  tabInactive: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.xs,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  tabActive: {
    // Gradient handles the background
  },
  tabText: {
    fontSize: typography.caption,
    fontWeight: typography.semibold,
    color: colors.textSecondary,
  },
  tabTextActive: {
    fontSize: typography.caption,
    fontWeight: typography.bold,
    color: colors.textPrimary,
  },
  listContent: {
    padding: spacing.xl,
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
  poster: {
    width: 80,
    height: 120,
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
    fontSize: typography.h4,
    fontWeight: typography.bold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
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
    fontSize: typography.caption,
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
    fontSize: typography.caption,
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
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
  },
  progressText: {
    fontSize: typography.small,
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
    fontSize: typography.body,
    fontWeight: typography.bold,
    color: colors.gold,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  actionText: {
    fontSize: typography.caption,
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
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  emptyTitle: {
    fontSize: typography.h2,
    fontWeight: typography.bold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  emptySubtitle: {
    fontSize: typography.body,
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
    fontSize: typography.h5,
    fontWeight: typography.bold,
    color: colors.textPrimary,
  },
});
