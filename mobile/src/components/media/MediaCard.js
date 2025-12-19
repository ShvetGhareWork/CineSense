import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ActivityIndicator,
  Pressable,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors, typography, spacing, borderRadius } from '../../constants/theme';
import AppText from '../common/AppText';

const MediaCard = ({
  media,
  status,
  rating,
  onPress,
  onLongPress,
  showStatus = true,
  showRating = true,
  showTitle = true,
  width = 150,
  height = 225,
}) => {
  const navigation = useNavigation();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Animation values
  const scale = useSharedValue(1);
  const shadowOpacity = useSharedValue(0.15);

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else if (media?.tmdbId || media?.id) {
      navigation.navigate('MediaDetail', {
        mediaId: (media.tmdbId || media.id)?.toString(),
        mediaType: media.type || media.media_type || 'movie'
      });
    }
  };

  const handlePressIn = () => {
    scale.value = withSpring(0.96, { damping: 15, stiffness: 300 });
    shadowOpacity.value = withTiming(0.08, { duration: 150 });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
    shadowOpacity.value = withTiming(0.15, { duration: 200 });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    shadowOpacity: shadowOpacity.value,
  }));

  // Status badge configuration
  const getStatusConfig = (status) => {
    switch (status) {
      case 'to_watch':
        return { color: colors.toWatch, label: 'To Watch', icon: 'bookmark-outline' };
      case 'in_progress':
        return { color: colors.inProgress, label: 'Watching', icon: 'play-circle-outline' };
      case 'finished':
        return { color: colors.finished, label: 'Finished', icon: 'checkmark-circle-outline' };
      default:
        return null;
    }
  };

  const statusConfig = status ? getStatusConfig(status) : null;

  // Image URL
  const posterURL = media.posterPath
    ? `https://image.tmdb.org/t/p/w500${media.posterPath}`
    : null;

  return (
    <Animated.View
      style={[styles.container, { width, height }, animatedStyle]}
    >
      <Pressable
        style={styles.pressable}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onLongPress={onLongPress}
      >
      {/* Poster Image */}
      <View style={styles.imageContainer}>
        {!imageLoaded && !imageError && (
          <View style={[styles.skeleton, { width, height }]}>
            <ActivityIndicator size="small" color={colors.electricPurple} />
          </View>
        )}

        {imageError || !posterURL ? (
          <View style={[styles.placeholder, { width, height }]}>
            <Ionicons name="film-outline" size={48} color={colors.softGrey} />
            <AppText variant="caption" style={styles.placeholderText} numberOfLines={2}>
              {media.title}
            </AppText>
          </View>
        ) : (
          <Image
            source={{ uri: posterURL }}
            style={[styles.image, { width, height }]}
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
            resizeMode="cover"
          />
        )}

        {/* Status Badge */}
        {showStatus && statusConfig && (
          <View style={[styles.statusBadge, { backgroundColor: statusConfig.color }]}>
            <Ionicons name={statusConfig.icon} size={12} color="#fff" />
          </View>
        )}

        {/* Rating */}
        {showRating && rating && (
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={14} color={colors.toWatch} />
            <AppText variant="metadata" style={styles.ratingText}>{rating.toFixed(1)}</AppText>
          </View>
        )}
      </View>

      {/* Title Below Image */}
      {showTitle && (
        <View style={styles.titleContainer}>
          <AppText variant="cardTitle" style={styles.title} numberOfLines={2}>
            {media.title}
          </AppText>
          {media.releaseDate && (
            <AppText variant="metadata" style={styles.year}>
              {new Date(media.releaseDate).getFullYear()}
            </AppText>
          )}
        </View>
      )}
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginRight: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  pressable: {
    flex: 1,
  },
  imageContainer: {
    width: '100%',
    position: 'relative',
    backgroundColor: colors.cardDark,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  image: {
    borderRadius: borderRadius.md,
  },
  skeleton: {
    backgroundColor: colors.cardDark,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: borderRadius.md,
  },
  placeholder: {
    backgroundColor: colors.cardDark,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: borderRadius.md,
    padding: spacing.md,
  },
  placeholderText: {
    color: colors.softGrey,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  statusBadge: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    width: 24,
    height: 24,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  ratingContainer: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.8)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  ratingText: {
    color: '#fff',
    marginLeft: 4,
  },
  titleContainer: {
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
  },
  title: {
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  year: {
    color: colors.textSecondary,
  },
});

export default MediaCard;

