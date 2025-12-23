import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

/**
 * ReviewCard Component - Enhanced
 * Displays a single review with expand/collapse functionality
 * Premium design with gradients, better typography, and visual hierarchy
 */
const ReviewCard = ({ review }) => {
  const [expanded, setExpanded] = useState(false);

  if (!review) return null;

  const { author, content, author_details, created_at } = review;
  const rating = author_details?.rating;
  const avatarPath = author_details?.avatar_path;

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Get rating color
  const getRatingColor = (rating) => {
    if (!rating) return '#999';
    if (rating >= 8) return '#27AE60';
    if (rating >= 6) return '#F39C12';
    return '#E74C3C';
  };

  // Truncate content to 200 chars for better readability
  const shouldTruncate = content && content.length > 200;
  const displayContent = expanded || !shouldTruncate
    ? content
    : content.substring(0, 200) + '...';

  const ratingColor = getRatingColor(rating);

  return (
    <View style={styles.card}>
      <LinearGradient
        colors={['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.03)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.authorContainer}>
            {/* Avatar with gradient border */}
            <LinearGradient
              colors={['#6C63FF', '#3ABEFF']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.avatarGradient}
            >
              <View style={styles.avatar}>
                {avatarPath ? (
                  <Image
                    source={{ uri: `https://image.tmdb.org/t/p/w185${avatarPath}` }}
                    style={styles.avatarImage}
                  />
                ) : (
                  <Ionicons name="person" size={22} color="#999" />
                )}
              </View>
            </LinearGradient>

            <View style={styles.authorInfo}>
              <Text style={styles.authorName}>{author || 'Anonymous'}</Text>
              <View style={styles.dateContainer}>
                <Ionicons name="time-outline" size={12} color="#666" />
                <Text style={styles.date}>{formatDate(created_at)}</Text>
              </View>
            </View>
          </View>

          {/* Rating Badge */}
          {rating && (
            <LinearGradient
              colors={[ratingColor + '30', ratingColor + '15']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.ratingGradient}
            >
              <View style={styles.ratingContainer}>
                <Ionicons name="star" size={14} color={ratingColor} />
                <Text style={[styles.ratingText, { color: ratingColor }]}>
                  {rating.toFixed(1)}
                </Text>
                <Text style={styles.ratingMax}>/10</Text>
              </View>
            </LinearGradient>
          )}
        </View>

        {/* Content with better typography */}
        <View style={styles.contentContainer}>
          <View style={styles.quoteIcon}>
            <Ionicons name="chatbox-ellipses-outline" size={16} color="#6C63FF" />
          </View>
          <Text style={styles.content}>{displayContent}</Text>
        </View>

        {/* Read More/Less Button */}
        {shouldTruncate && (
          <TouchableOpacity
            onPress={() => setExpanded(!expanded)}
            style={styles.readMoreButton}
            activeOpacity={0.7}
          >
            <LinearGradient
              colors={['rgba(229,9,20,0.15)', 'rgba(229,9,20,0.05)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.readMoreGradient}
            >
              <Text style={styles.readMoreText}>
                {expanded ? 'Show Less' : 'Read Full Review'}
              </Text>
              <Ionicons
                name={expanded ? 'chevron-up' : 'chevron-down'}
                size={16}
                color="#e50914"
              />
            </LinearGradient>
          </TouchableOpacity>
        )}

        {/* Helpful indicator */}
        {author_details?.rating && (
          <View style={styles.footer}>
            <Ionicons name="checkmark-circle" size={12} color="#27AE60" />
            <Text style={styles.footerText}>Verified Review</Text>
          </View>
        )}
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  gradient: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  authorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarGradient: {
    width: 46,
    height: 46,
    borderRadius: 23,
    padding: 2,
    marginRight: 12,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  authorInfo: {
    flex: 1,
  },
  authorName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  date: {
    fontSize: 12,
    color: '#999',
  },
  ratingGradient: {
    borderRadius: 12,
    padding: 1,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 11,
    gap: 4,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '700',
  },
  ratingMax: {
    fontSize: 11,
    color: '#666',
    fontWeight: '600',
  },
  contentContainer: {
    position: 'relative',
    paddingLeft: 8,
  },
  quoteIcon: {
    position: 'absolute',
    top: 0,
    left: -4,
    opacity: 0.3,
  },
  content: {
    fontSize: 14,
    lineHeight: 22,
    color: '#ddd',
    letterSpacing: 0.2,
  },
  readMoreButton: {
    marginTop: 12,
    borderRadius: 10,
    overflow: 'hidden',
  },
  readMoreGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    gap: 6,
  },
  readMoreText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#e50914',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
    gap: 6,
  },
  footerText: {
    fontSize: 11,
    color: '#27AE60',
    fontWeight: '500',
  },
});

export default ReviewCard;
