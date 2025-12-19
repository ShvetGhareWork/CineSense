import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { colors, typography, spacing, borderRadius } from '../../constants/theme';

const MediaCard = ({
  media,
  status,
  rating,
  onPress,
  onLongPress,
  showStatus = true,
  showRating = true,
  width = 150,
  height = 225,
}) => {
  const navigation = useNavigation();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

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
    <Pressable
      style={[styles.container, { width, height }]}
      onPress={handlePress}
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
            <Text style={styles.placeholderText} numberOfLines={2}>
              {media.title}
            </Text>
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
            <Text style={styles.ratingText}>{rating.toFixed(1)}</Text>
          </View>
        )}

        {/* Title Overlay */}
        <View style={styles.titleContainer}>
          <Text style={styles.title} numberOfLines={2}>
            {media.title}
          </Text>
          {media.releaseDate && (
            <Text style={styles.year}>
              {new Date(media.releaseDate).getFullYear()}
            </Text>
          )}
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    marginRight: spacing.md,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  imageContainer: {
    flex: 1,
    position: 'relative',
    backgroundColor: colors.cardDark,
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
    fontSize: typography.caption,
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
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  ratingText: {
    color: '#fff',
    fontSize: typography.small,
    fontWeight: typography.semibold,
    marginLeft: 4,
  },
  titleContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.sm,
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  title: {
    color: '#fff',
    fontSize: typography.caption,
    fontWeight: typography.semibold,
    marginBottom: 2,
  },
  year: {
    color: colors.softGrey,
    fontSize: typography.small,
  },
});

export default MediaCard;
