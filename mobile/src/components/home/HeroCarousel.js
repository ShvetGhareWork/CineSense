import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Image,
  TouchableOpacity,
  FlatList,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors, gradients, typography, spacing, borderRadius, layout } from '../../constants/theme';
import AppText from '../common/AppText';

const { width, height } = Dimensions.get('window');
const HERO_HEIGHT = 550; // Increased for better image prominence
const AUTO_SCROLL_INTERVAL = 5000;

export default function HeroCarousel({ items = [] }) {
  const navigation = useNavigation();
  const flatListRef = useRef(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-scroll
  useEffect(() => {
    if (items.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % items.length;
        flatListRef.current?.scrollToIndex({
          index: nextIndex,
          animated: true,
        });
        return nextIndex;
      });
    }, AUTO_SCROLL_INTERVAL);

    return () => clearInterval(interval);
  }, [items.length]);

  const handlePress = (item) => {
    navigation.navigate('MediaDetail', {
      mediaId: item.id?.toString() || item.tmdbId?.toString(),
      mediaType: item.media_type || item.type || 'movie',
    });
  };

  const renderItem = ({ item, index }) => {
    const inputRange = [
      (index - 1) * width,
      index * width,
      (index + 1) * width,
    ];

    const scale = scrollX.interpolate({
      inputRange,
      outputRange: [0.9, 1, 0.9],
      extrapolate: 'clamp',
    });

    const opacity = scrollX.interpolate({
      inputRange,
      outputRange: [0.5, 1, 0.5],
      extrapolate: 'clamp',
    });

    // Parallax effect for backdrop
    const translateX = scrollX.interpolate({
      inputRange,
      outputRange: [width * 0.4, 0, -width * 0.4],
      extrapolate: 'clamp',
    });

    const backdropUrl = item.backdrop_path
      ? `https://image.tmdb.org/t/p/original${item.backdrop_path}`
      : null;

    return (
      <TouchableOpacity
        activeOpacity={0.95}
        onPress={() => handlePress(item)}
        style={styles.heroItem}
      >
        <Animated.View style={[styles.heroContent, { transform: [{ scale }], opacity }]}>
          {/* Backdrop Image with Parallax */}
          {backdropUrl && (
            <Animated.Image
              source={{ uri: backdropUrl }}
              style={[
                styles.backdrop,
                { transform: [{ translateX }] }
              ]}
              resizeMode="cover"
            />
          )}

          {/* Gradient Overlay - Optimized for better image visibility */}
          <LinearGradient
            colors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.4)', 'rgba(0,0,0,0.95)']}
            locations={[0, 0.4, 1]}
            style={styles.gradient}
          />

          {/* Content Overlay */}
          <View style={styles.overlay}>
            {/* Title */}
            <AppText variant="hero" style={styles.title} numberOfLines={2}>
              {item.title || item.name}
            </AppText>

            {/* Meta Info */}
            <View style={styles.metaRow}>
              {/* Rating Badge */}
              <LinearGradient
                colors={gradients.gold}
                style={styles.ratingBadge}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Ionicons name="star" size={16} color="#000" />
                <AppText variant="metadata" style={styles.ratingText}>{item.vote_average?.toFixed(1)}</AppText>
              </LinearGradient>

              {/* Year */}
              {(item.release_date || item.first_air_date) && (
                <AppText variant="metadata" style={styles.year}>
                  {(item.release_date || item.first_air_date).split('-')[0]}
                </AppText>
              )}

              {/* Type */}
              <View style={styles.typeBadge}>
                <AppText variant="caption" style={styles.typeText}>
                  {item.media_type === 'tv' ? 'TV SHOW' : 'MOVIE'}
                </AppText>
              </View>
            </View>

            {/* Genres */}
            {item.genre_ids && Array.isArray(item.genre_ids) && item.genre_ids.length > 0 && (
              <View style={styles.genresRow}>
                {item.genre_ids.slice(0, 3).map((genreId, idx) => (
                  <View key={genreId} style={styles.genreChip}>
                    <AppText variant="metadata" style={styles.genreText}>{getGenreName(genreId)}</AppText>
                  </View>
                ))}
              </View>
            )}

            {/* CTA Button */}
            <TouchableOpacity
              style={styles.ctaButton}
              onPress={() => handlePress(item)}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={gradients.purple}
                style={styles.ctaGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Ionicons name="play" size={20} color="#fff" />
                <AppText variant="cardTitle" style={styles.ctaText}>Watch Now</AppText>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </TouchableOpacity>
    );
  };

  if (items.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Animated.FlatList
        ref={flatListRef}
        data={items}
        renderItem={renderItem}
        keyExtractor={(item, index) => `hero-${item.id || index}`}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
        decelerationRate="fast"
        snapToInterval={width}
        onMomentumScrollEnd={(event) => {
          const index = Math.round(event.nativeEvent.contentOffset.x / width);
          setCurrentIndex(index);
        }}
      />

      {/* Pagination Dots */}
      <View style={styles.pagination}>
        {items.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              index === currentIndex && styles.dotActive,
            ]}
          />
        ))}
      </View>
    </View>
  );
}

// Genre mapping (simplified)
const genreMap = {
  28: 'Action',
  12: 'Adventure',
  16: 'Animation',
  35: 'Comedy',
  80: 'Crime',
  99: 'Documentary',
  18: 'Drama',
  10751: 'Family',
  14: 'Fantasy',
  36: 'History',
  27: 'Horror',
  10402: 'Music',
  9648: 'Mystery',
  10749: 'Romance',
  878: 'Sci-Fi',
  10770: 'TV Movie',
  53: 'Thriller',
  10752: 'War',
  37: 'Western',
};

const getGenreName = (id) => genreMap[id] || 'Unknown';

const styles = StyleSheet.create({
  container: {
    height: HERO_HEIGHT,
    marginBottom: spacing.xl,
  },
  heroItem: {
    width,
    height: HERO_HEIGHT,
  },
  heroContent: {
    flex: 1,
  },
  backdrop: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  gradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  overlay: {
    position: 'absolute',
    bottom: spacing.xxxl + spacing.lg,
    left: spacing.xl,
    right: spacing.xl,
  },
  title: {
    marginBottom: spacing.lg,
    textShadowColor: 'rgba(0,0,0,0.9)',
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 12,
    fontSize: 32,
    fontWeight: '800',
    lineHeight: 38,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.full,
    gap: spacing.sm,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  ratingText: {
    color: '#000',
    fontWeight: '700',
    fontSize: 15,
  },
  year: {
    color: colors.textSecondary,
  },
  typeBadge: {
    backgroundColor: colors.purple + '30',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.purple,
  },
  typeText: {
    color: colors.purple,
  },
  genresRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  genreChip: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  genreText: {
    color: colors.textPrimary,
  },
  ctaButton: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    alignSelf: 'flex-start',
    shadowColor: colors.purple,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  ctaGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xxxl,
    paddingVertical: spacing.lg + 2,
    gap: spacing.md,
  },
  ctaText: {
    color: colors.textPrimary,
    fontWeight: '700',
    fontSize: 16,
  },
  pagination: {
    position: 'absolute',
    bottom: spacing.md,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  dotActive: {
    backgroundColor: colors.purple,
    width: 24,
  },
});

