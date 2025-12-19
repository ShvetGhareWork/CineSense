import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

import useAuthStore from '../../store/authStore';
import useWatchlistStore from '../../store/watchlistStore';
import { colors, gradients, typography, spacing, borderRadius } from '../../constants/theme';
import AppText from '../../components/common/AppText';

export default function ProfileScreen({ navigation }) {
  const { user, logout } = useAuthStore();
  const { items } = useWatchlistStore();

  // Calculate user stats
  const stats = useMemo(() => {
    const finished = items.filter(item => item.status === 'finished');
    const inProgress = items.filter(item => item.status === 'in_progress');
    const movies = items.filter(item => item.mediaId?.type === 'movie');
    const tvShows = items.filter(item => item.mediaId?.type === 'tv');
    
    // Estimate watch time
    const avgMovieTime = 120; // 2 hours
    const avgTVEpisodeTime = 45; // 45 minutes
    const estimatedHours = (finished.filter(i => i.mediaId?.type === 'movie').length * avgMovieTime / 60) +
                          (finished.filter(i => i.mediaId?.type === 'tv').length * avgTVEpisodeTime / 60);

    return {
      totalItems: items.length,
      finished: finished.length,
      inProgress: inProgress.length,
      movies: movies.length,
      tvShows: tvShows.length,
      estimatedHours: Math.round(estimatedHours),
    };
  }, [items]);

  const renderHeader = () => (
    <View style={styles.header}>
      {/* Profile Photo */}
      <View style={styles.profilePhotoContainer}>
        <LinearGradient
          colors={gradients.purple}
          style={styles.profilePhotoBorder}
        >
          <View style={styles.profilePhoto}>
            <AppText variant="hero" style={styles.profileInitial}>
              {user?.displayName?.charAt(0).toUpperCase() || 'U'}
            </AppText>
          </View>
        </LinearGradient>
      </View>

      {/* User Info */}
      <AppText variant="h2" style={styles.displayName}>{user?.displayName || 'User'}</AppText>
      <AppText variant="body" style={styles.email}>{user?.email}</AppText>
      
      {/* Member Since */}
      <View style={styles.memberBadge}>
        <Ionicons name="calendar-outline" size={14} color={colors.purple} />
        <AppText variant="caption" style={styles.memberText}>
          Member since {new Date(user?.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
        </AppText>
      </View>
    </View>
  );

  const renderQuickStats = () => (
    <View style={styles.section}>
      <AppText variant="h3" style={styles.sectionTitle}>Quick Stats</AppText>
      
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <LinearGradient 
            colors={['#6C63FF25', '#6C63FF10']} 
            style={styles.statCardBg}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.statIconContainer}>
              <Ionicons name="film" size={36} color={colors.purple} />
            </View>
            <View style={styles.statContent}>
              <AppText variant="h1" style={styles.statNumber}>{stats.movies}</AppText>
              <AppText variant="caption" style={styles.statLabel}>Movies</AppText>
            </View>
          </LinearGradient>
        </View>

        <View style={styles.statCard}>
          <LinearGradient 
            colors={['#3ABEFF25', '#3ABEFF10']} 
            style={styles.statCardBg}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.statIconContainer}>
              <Ionicons name="tv" size={36} color={colors.cyan} />
            </View>
            <View style={styles.statContent}>
              <AppText variant="h1" style={styles.statNumber}>{stats.tvShows}</AppText>
              <AppText variant="caption" style={styles.statLabel}>TV Shows</AppText>
            </View>
          </LinearGradient>
        </View>

        <View style={styles.statCard}>
          <LinearGradient 
            colors={['#27AE6025', '#27AE6010']} 
            style={styles.statCardBg}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.statIconContainer}>
              <Ionicons name="checkmark-circle" size={36} color={colors.green} />
            </View>
            <View style={styles.statContent}>
              <AppText variant="h1" style={styles.statNumber}>{stats.finished}</AppText>
              <AppText variant="caption" style={styles.statLabel}>Completed</AppText>
            </View>
          </LinearGradient>
        </View>

        <View style={styles.statCard}>
          <LinearGradient 
            colors={['#F39C1225', '#F39C1210']} 
            style={styles.statCardBg}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <View style={styles.statIconContainer}>
              <Ionicons name="time" size={36} color={colors.amber} />
            </View>
            <View style={styles.statContent}>
              <AppText variant="h1" style={styles.statNumber}>{stats.estimatedHours}h</AppText>
              <AppText variant="caption" style={styles.statLabel}>Watch Time</AppText>
            </View>
          </LinearGradient>
        </View>
      </View>
    </View>
  );

  const renderRecentActivity = () => {
    const recentItems = items
      .filter(item => item.status === 'finished' || item.status === 'in_progress')
      .slice(0, 5);

    if (recentItems.length === 0) {
      return null;
    }

    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <AppText variant="h3" style={styles.sectionTitle}>Recent Activity</AppText>
          <TouchableOpacity onPress={() => navigation.navigate('Watchlist')}>
            <AppText variant="body" style={styles.seeAllText}>See All</AppText>
          </TouchableOpacity>
        </View>

        {recentItems.map((item, index) => (
          <View key={item._id || index} style={styles.activityItem}>
            <View style={styles.activityIcon}>
              <Ionicons 
                name={item.status === 'finished' ? 'checkmark-circle' : 'play-circle'} 
                size={20} 
                color={item.status === 'finished' ? colors.green : colors.blue} 
              />
            </View>
            <View style={styles.activityContent}>
              <AppText variant="body" style={styles.activityTitle} numberOfLines={1}>
                {item.mediaId?.title}
              </AppText>
              <AppText variant="caption" style={styles.activityMeta}>
                {item.status === 'finished' ? 'Completed' : 'Watching'} • {item.mediaId?.type === 'tv' ? 'TV Show' : 'Movie'}
              </AppText>
            </View>
          </View>
        ))}
      </View>
    );
  };

  const renderSettings = () => (
    <View style={styles.section}>
      <AppText variant="h3" style={styles.sectionTitle}>Settings</AppText>

      <TouchableOpacity style={styles.settingItem} onPress={() => navigation.navigate('EditProfile')}>
        <View style={styles.settingLeft}>
          <View style={styles.settingIcon}>
            <Ionicons name="person-outline" size={20} color={colors.purple} />
          </View>
          <AppText variant="body" style={styles.settingText}>Edit Profile</AppText>
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
      </TouchableOpacity>

      <TouchableOpacity style={styles.settingItem} onPress={() => navigation.navigate('Notifications')}>
        <View style={styles.settingLeft}>
          <View style={styles.settingIcon}>
            <Ionicons name="notifications-outline" size={20} color={colors.cyan} />
          </View>
          <AppText variant="body" style={styles.settingText}>Notifications</AppText>
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
      </TouchableOpacity>

      <TouchableOpacity style={styles.settingItem} onPress={() => navigation.navigate('Appearance')}>
        <View style={styles.settingLeft}>
          <View style={styles.settingIcon}>
            <Ionicons name="color-palette-outline" size={20} color={colors.amber} />
          </View>
          <AppText variant="body" style={styles.settingText}>Appearance</AppText>
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
      </TouchableOpacity>

      <TouchableOpacity style={styles.settingItem}>
        <View style={styles.settingLeft}>
          <View style={styles.settingIcon}>
            <Ionicons name="shield-checkmark-outline" size={20} color={colors.green} />
          </View>
          <AppText variant="body" style={styles.settingText}>Privacy & Security</AppText>
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
      </TouchableOpacity>

      <TouchableOpacity style={styles.settingItem} onPress={() => navigation.navigate('Help')}>
        <View style={styles.settingLeft}>
          <View style={styles.settingIcon}>
            <Ionicons name="help-circle-outline" size={20} color={colors.blue} />
          </View>
          <AppText variant="body" style={styles.settingText}>Help & Support</AppText>
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
      </TouchableOpacity>
    </View>
  );

  const renderLogout = () => (
    <View style={styles.section}>
      <TouchableOpacity style={styles.logoutButton} onPress={logout}>
        <LinearGradient
          colors={[colors.red, colors.redDark]}
          style={styles.logoutGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <Ionicons name="log-out-outline" size={20} color="#fff" />
          <AppText variant="h5" style={styles.logoutText}>Logout</AppText>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {renderHeader()}
      {renderQuickStats()}
      {renderRecentActivity()}
      {renderSettings()}
      {renderLogout()}
      <View style={{ height: spacing.massive }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.midnight,
  },
  header: {
    alignItems: 'center',
    paddingTop: spacing.xxxl,
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.xl,
  },
  profilePhotoContainer: {
    marginBottom: spacing.lg,
  },
  profilePhotoBorder: {
    width: 124,
    height: 124,
    borderRadius: 62,
    padding: 2,
    shadowColor: colors.purple,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  profilePhoto: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.cardDark,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInitial: {
    fontSize: 48,
    fontWeight: typography.black,
    color: colors.purple,
  },
  displayName: {
    fontSize: typography.h2.fontSize,
    fontWeight: typography.bold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  email: {
    fontSize: typography.body.fontSize,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  memberBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.purple + '15',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
  },
  memberText: {
    fontSize: typography.caption.fontSize,
    color: colors.purple,
    fontWeight: typography.semibold,
  },
  section: {
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.xxxl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.h3.fontSize,
    fontWeight: typography.bold,
    color: colors.textPrimary,
    marginBottom: spacing.lg,
  },
  seeAllText: {
    fontSize: typography.body.fontSize,
    fontWeight: typography.semibold,
    color: colors.purple,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  statCard: {
    width: '48%',
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  statCardBg: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    borderRadius: borderRadius.xl,
    gap: spacing.md,
  },
  statIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statContent: {
    flex: 1,
  },
  statNumber: {
    fontSize: 32,
    fontWeight: typography.black,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  statLabel: {
    fontSize: typography.caption.fontSize,
    color: colors.textSecondary,
    fontWeight: typography.semibold,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardDark,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(108,99,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: typography.body.fontSize,
    fontWeight: typography.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  activityMeta: {
    fontSize: typography.caption.fontSize,
    color: colors.textSecondary,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.cardDark,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(108,99,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  settingText: {
    fontSize: typography.body.fontSize,
    fontWeight: typography.semibold,
    color: colors.textPrimary,
  },
  logoutButton: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  logoutGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
    gap: spacing.sm,
  },
  logoutText: {
    fontSize: typography.h5.fontSize,
    fontWeight: typography.bold,
    color: '#fff',
  },
});

