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
            <Text style={styles.profileInitial}>
              {user?.displayName?.charAt(0).toUpperCase() || 'U'}
            </Text>
          </View>
        </LinearGradient>
      </View>

      {/* User Info */}
      <Text style={styles.displayName}>{user?.displayName || 'User'}</Text>
      <Text style={styles.email}>{user?.email}</Text>
      
      {/* Member Since */}
      <View style={styles.memberBadge}>
        <Ionicons name="calendar-outline" size={14} color={colors.purple} />
        <Text style={styles.memberText}>
          Member since {new Date(user?.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
        </Text>
      </View>
    </View>
  );

  const renderQuickStats = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Quick Stats</Text>
      
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <LinearGradient colors={['#6C63FF15', '#6C63FF05']} style={styles.statCardBg}>
            <Ionicons name="film" size={28} color={colors.purple} />
            <Text style={styles.statNumber}>{stats.movies}</Text>
            <Text style={styles.statLabel}>Movies</Text>
          </LinearGradient>
        </View>

        <View style={styles.statCard}>
          <LinearGradient colors={['#3ABEFF15', '#3ABEFF05']} style={styles.statCardBg}>
            <Ionicons name="tv" size={28} color={colors.cyan} />
            <Text style={styles.statNumber}>{stats.tvShows}</Text>
            <Text style={styles.statLabel}>TV Shows</Text>
          </LinearGradient>
        </View>

        <View style={styles.statCard}>
          <LinearGradient colors={['#27AE6015', '#27AE6005']} style={styles.statCardBg}>
            <Ionicons name="checkmark-circle" size={28} color={colors.green} />
            <Text style={styles.statNumber}>{stats.finished}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </LinearGradient>
        </View>

        <View style={styles.statCard}>
          <LinearGradient colors={['#F39C1215', '#F39C1205']} style={styles.statCardBg}>
            <Ionicons name="time" size={28} color={colors.amber} />
            <Text style={styles.statNumber}>{stats.estimatedHours}h</Text>
            <Text style={styles.statLabel}>Watch Time</Text>
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
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Watchlist')}>
            <Text style={styles.seeAllText}>See All</Text>
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
              <Text style={styles.activityTitle} numberOfLines={1}>
                {item.mediaId?.title}
              </Text>
              <Text style={styles.activityMeta}>
                {item.status === 'finished' ? 'Completed' : 'Watching'} • {item.mediaId?.type === 'tv' ? 'TV Show' : 'Movie'}
              </Text>
            </View>
          </View>
        ))}
      </View>
    );
  };

  const renderSettings = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Settings</Text>

      <TouchableOpacity style={styles.settingItem} onPress={() => navigation.navigate('EditProfile')}>
        <View style={styles.settingLeft}>
          <View style={styles.settingIcon}>
            <Ionicons name="person-outline" size={20} color={colors.purple} />
          </View>
          <Text style={styles.settingText}>Edit Profile</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
      </TouchableOpacity>

      <TouchableOpacity style={styles.settingItem} onPress={() => navigation.navigate('Notifications')}>
        <View style={styles.settingLeft}>
          <View style={styles.settingIcon}>
            <Ionicons name="notifications-outline" size={20} color={colors.cyan} />
          </View>
          <Text style={styles.settingText}>Notifications</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
      </TouchableOpacity>

      <TouchableOpacity style={styles.settingItem} onPress={() => navigation.navigate('Appearance')}>
        <View style={styles.settingLeft}>
          <View style={styles.settingIcon}>
            <Ionicons name="color-palette-outline" size={20} color={colors.amber} />
          </View>
          <Text style={styles.settingText}>Appearance</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
      </TouchableOpacity>

      <TouchableOpacity style={styles.settingItem}>
        <View style={styles.settingLeft}>
          <View style={styles.settingIcon}>
            <Ionicons name="shield-checkmark-outline" size={20} color={colors.green} />
          </View>
          <Text style={styles.settingText}>Privacy & Security</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
      </TouchableOpacity>

      <TouchableOpacity style={styles.settingItem} onPress={() => navigation.navigate('Help')}>
        <View style={styles.settingLeft}>
          <View style={styles.settingIcon}>
            <Ionicons name="help-circle-outline" size={20} color={colors.blue} />
          </View>
          <Text style={styles.settingText}>Help & Support</Text>
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
          <Text style={styles.logoutText}>Logout</Text>
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
    fontSize: typography.h2,
    fontWeight: typography.bold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  email: {
    fontSize: typography.body,
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
    fontSize: typography.caption,
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
    fontSize: typography.h3,
    fontWeight: typography.bold,
    color: colors.textPrimary,
    marginBottom: spacing.lg,
  },
  seeAllText: {
    fontSize: typography.body,
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
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  statCardBg: {
    padding: spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
  },
  statNumber: {
    fontSize: typography.hero,
    fontWeight: typography.black,
    color: colors.textPrimary,
    marginVertical: spacing.sm,
  },
  statLabel: {
    fontSize: typography.caption,
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
    fontSize: typography.body,
    fontWeight: typography.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  activityMeta: {
    fontSize: typography.caption,
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
    fontSize: typography.body,
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
    fontSize: typography.h5,
    fontWeight: typography.bold,
    color: '#fff',
  },
});
