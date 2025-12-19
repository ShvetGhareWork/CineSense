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

const { width, height } = Dimensions.get('window');
const HERO_HEIGHT = 500;
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
          {/* Backdrop Image */}
          {backdropUrl && (
            <Image
              source={{ uri: backdropUrl }}
              style={styles.backdrop}
              resizeMode="cover"
            />
          )}

          {/* Gradient Overlay */}
          <LinearGradient
            colors={gradients.darkOverlay}
            style={styles.gradient}
          />

          {/* Content Overlay */}
          <View style={styles.overlay}>
            {/* Title */}
            <Text style={styles.title} numberOfLines={2}>
              {item.title || item.name}
            </Text>

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
                <Text style={styles.ratingText}>{item.vote_average?.toFixed(1)}</Text>
              </LinearGradient>

              {/* Year */}
              {(item.release_date || item.first_air_date) && (
                <Text style={styles.year}>
                  {(item.release_date || item.first_air_date).split('-')[0]}
                </Text>
              )}

              {/* Type */}
              <View style={styles.typeBadge}>
                <Text style={styles.typeText}>
                  {item.media_type === 'tv' ? 'TV SHOW' : 'MOVIE'}
                </Text>
              </View>
            </View>

            {/* Genres */}
            {item.genre_ids && Array.isArray(item.genre_ids) && item.genre_ids.length > 0 && (
              <View style={styles.genresRow}>
                {item.genre_ids.slice(0, 3).map((genreId, idx) => (
                  <View key={genreId} style={styles.genreChip}>
                    <Text style={styles.genreText}>{getGenreName(genreId)}</Text>
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
                <Text style={styles.ctaText}>Watch Now</Text>
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
    bottom: spacing.xxxl,
    left: spacing.xl,
    right: spacing.xl,
  },
  title: {
    fontSize: typography.hero,
    fontWeight: typography.black,
    color: colors.textPrimary,
    marginBottom: spacing.md,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
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
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    gap: spacing.xs,
  },
  ratingText: {
    fontSize: typography.body,
    fontWeight: typography.black,
    color: '#000',
  },
  year: {
    fontSize: typography.body,
    fontWeight: typography.semibold,
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
    fontSize: typography.caption,
    fontWeight: typography.bold,
    color: colors.purple,
    letterSpacing: 1,
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
    fontSize: typography.caption,
    fontWeight: typography.semibold,
    color: colors.textPrimary,
  },
  ctaButton: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    alignSelf: 'flex-start',
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
