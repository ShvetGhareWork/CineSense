import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors, gradients, typography, spacing, borderRadius } from '../../constants/theme';

export default function ContinueWatchingSection({ items = [] }) {
  const navigation = useNavigation();

  const handlePress = (item) => {
    navigation.navigate('MediaDetail', {
      mediaId: item.mediaId?.tmdbId || item.mediaId?.id?.toString(),
      mediaType: item.mediaId?.type || 'movie',
    });
  };

  const renderItem = ({ item }) => {
    const posterUrl = item.mediaId?.posterPath
      ? `https://image.tmdb.org/t/p/w500${item.mediaId.posterPath}`
      : null;

    // Calculate progress percentage
    const progress = item.progress || 0;

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => handlePress(item)}
        activeOpacity={0.9}
      >
        {/* Poster */}
        <View style={styles.posterContainer}>
          {posterUrl ? (
            <Image source={{ uri: posterUrl }} style={styles.poster} />
          ) : (
            <View style={[styles.poster, styles.posterPlaceholder]}>
              <Ionicons name="film-outline" size={40} color={colors.textTertiary} />
            </View>
          )}

          {/* Progress Overlay */}
          <View style={styles.progressOverlay}>
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.9)']}
              style={styles.progressGradient}
            />
            <View style={styles.progressInfo}>
              <View style={styles.progressBarContainer}>
                <View style={styles.progressBarBg}>
                  <LinearGradient
                    colors={gradients.purple}
                    style={[styles.progressBarFill, { width: `${progress}%` }]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                  />
                </View>
              </View>
              <Text style={styles.progressText}>{Math.round(progress)}%</Text>
            </View>
          </View>

          {/* Resume Button */}
          <TouchableOpacity style={styles.resumeButton} onPress={() => handlePress(item)}>
            <LinearGradient
              colors={['rgba(108,99,255,0.9)', 'rgba(58,190,255,0.9)']}
              style={styles.resumeGradient}
            >
              <Ionicons name="play" size={16} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Title */}
        <Text style={styles.title} numberOfLines={2}>
          {item.mediaId?.title}
        </Text>

        {/* Episode Info (for TV shows) */}
        {item.mediaId?.type === 'tv' && item.currentEpisode && (
          <Text style={styles.episodeInfo}>
            S{item.currentSeason || 1} E{item.currentEpisode}
          </Text>
        )}

        {/* Time Left */}
        {item.timeLeft && (
          <Text style={styles.timeLeft}>{item.timeLeft}m left</Text>
        )}
      </TouchableOpacity>
    );
  };

  if (items.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="play-circle" size={24} color={colors.cyan} />
          <Text style={styles.headerTitle}>Continue Watching</Text>
        </View>
      </View>

      <FlatList
        data={items}
        renderItem={renderItem}
        keyExtractor={(item, index) => `continue-${item.mediaId?.tmdbId || index}`}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        decelerationRate="fast"
        snapToInterval={170}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.xxxl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.lg,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  headerTitle: {
    fontSize: typography.h3.fontSize,
    fontWeight: typography.bold,
    color: colors.textPrimary,
  },
  listContent: {
    paddingHorizontal: spacing.xl,
  },
  card: {
    width: 160,
    marginRight: spacing.lg,
  },
  posterContainer: {
    position: 'relative',
    marginBottom: spacing.sm,
  },
  poster: {
    width: 160,
    height: 240,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.cardDark,
  },
  posterPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderBottomLeftRadius: borderRadius.lg,
    borderBottomRightRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  progressGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  progressInfo: {
    padding: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  progressBarContainer: {
    flex: 1,
  },
  progressBarBg: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    fontSize: typography.small.fontSize,
    fontWeight: typography.bold,
    color: colors.textPrimary,
  },
  resumeButton: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: colors.purple,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 4,
  },
  resumeGradient: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: typography.body.fontSize,
    fontWeight: typography.bold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  episodeInfo: {
    fontSize: typography.caption.fontSize,
    fontWeight: typography.medium,
    color: colors.cyan,
    marginBottom: spacing.xs,
  },
  timeLeft: {
    fontSize: typography.caption.fontSize,
    color: colors.textSecondary,
  },
});

