import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

import useWatchlistStore from '../../store/watchlistStore';
import { colors, gradients, typography, spacing, borderRadius } from '../../constants/theme';

const { width } = Dimensions.get('window');

const ACHIEVEMENTS = [
  { id: 'first_watch', title: 'First Watch', icon: 'play-circle', description: 'Watched your first item', color: gradients.purple },
  { id: 'binge_master', title: 'Binge Master', icon: 'flame', description: 'Watched 5+ episodes in a day', color: gradients.amber },
  { id: '10_movies', title: 'Movie Buff', icon: 'film', description: 'Watched 10 movies', color: gradients.gold },
  { id: '100_hours', title: '100 Hours', icon: 'time', description: 'Total watch time: 100+ hours', color: gradients.blue },
  { id: 'horror_lover', title: 'Horror Lover', icon: 'skull', description: 'Watched 10+ horror titles', color: gradients.purple },
  { id: 'completionist', title: 'Completionist', icon: 'checkmark-circle', description: 'Finished 20+ items', color: gradients.green },
];

export default function StatsScreen() {
  const { items } = useWatchlistStore();
  const [timeRange, setTimeRange] = useState('all'); // all, week, month

  // Calculate stats
  const stats = useMemo(() => {
    const finished = items.filter(item => item.status === 'finished');
    const inProgress = items.filter(item => item.status === 'in_progress');
    const planned = items.filter(item => item.status === 'to_watch');
    
    const movies = items.filter(item => item.mediaId?.type === 'movie');
    const tvShows = items.filter(item => item.mediaId?.type === 'tv');
    
    const totalItems = items.length;
    const completionRate = totalItems > 0 ? (finished.length / totalItems) * 100 : 0;
    
    // Estimate watch time (rough calculation)
    const avgMovieTime = 120; // 2 hours
    const avgTVEpisodeTime = 45; // 45 minutes
    const estimatedHours = (finished.filter(i => i.mediaId?.type === 'movie').length * avgMovieTime / 60) +
                          (finished.filter(i => i.mediaId?.type === 'tv').length * avgTVEpisodeTime / 60);

    return {
      totalItems,
      finished: finished.length,
      inProgress: inProgress.length,
      planned: planned.length,
      movies: movies.length,
      tvShows: tvShows.length,
      completionRate,
      estimatedHours: Math.round(estimatedHours),
    };
  }, [items]);

  const renderTimeToggle = () => (
    <View style={styles.timeToggle}>
      {['all', 'week', 'month'].map((range) => (
        <TouchableOpacity
          key={range}
          style={[styles.timeButton, timeRange === range && styles.timeButtonActive]}
          onPress={() => setTimeRange(range)}
        >
          <Text style={[styles.timeButtonText, timeRange === range && styles.timeButtonTextActive]}>
            {range === 'all' ? 'All Time' : range === 'week' ? 'This Week' : 'This Month'}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderWatchTimeSummary = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Watch Time</Text>
      
      <LinearGradient
        colors={gradients.purple}
        style={styles.watchTimeCard}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.watchTimeContent}>
          <Text style={styles.watchTimeNumber}>{stats.estimatedHours}</Text>
          <Text style={styles.watchTimeLabel}>Hours Watched</Text>
        </View>
        
        <View style={styles.watchTimeSplit}>
          <View style={styles.splitItem}>
            <Ionicons name="film" size={24} color="#fff" />
            <Text style={styles.splitNumber}>{stats.movies}</Text>
            <Text style={styles.splitLabel}>Movies</Text>
          </View>
          <View style={styles.splitDivider} />
          <View style={styles.splitItem}>
            <Ionicons name="tv" size={24} color="#fff" />
            <Text style={styles.splitNumber}>{stats.tvShows}</Text>
            <Text style={styles.splitLabel}>TV Shows</Text>
          </View>
        </View>
      </LinearGradient>
    </View>
  );

  const renderStats = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Your Stats</Text>
      
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <LinearGradient colors={['#6C63FF15', '#6C63FF05']} style={styles.statCardBg}>
            <Ionicons name="list" size={32} color={colors.purple} />
            <Text style={styles.statNumber}>{stats.totalItems}</Text>
            <Text style={styles.statLabel}>Total Items</Text>
          </LinearGradient>
        </View>

        <View style={styles.statCard}>
          <LinearGradient colors={['#27AE6015', '#27AE6005']} style={styles.statCardBg}>
            <Ionicons name="checkmark-circle" size={32} color={colors.green} />
            <Text style={styles.statNumber}>{stats.finished}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </LinearGradient>
        </View>

        <View style={styles.statCard}>
          <LinearGradient colors={['#3498DB15', '#3498DB05']} style={styles.statCardBg}>
            <Ionicons name="play-circle" size={32} color={colors.blue} />
            <Text style={styles.statNumber}>{stats.inProgress}</Text>
            <Text style={styles.statLabel}>Watching</Text>
          </LinearGradient>
        </View>

        <View style={styles.statCard}>
          <LinearGradient colors={['#F39C1215', '#F39C1205']} style={styles.statCardBg}>
            <Ionicons name="bookmark" size={32} color={colors.amber} />
            <Text style={styles.statNumber}>{stats.planned}</Text>
            <Text style={styles.statLabel}>Planned</Text>
          </LinearGradient>
        </View>
      </View>
    </View>
  );

  const renderCompletionRate = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Completion Rate</Text>
      
      <View style={styles.completionCard}>
        <View style={styles.completionCircle}>
          <LinearGradient
            colors={gradients.green}
            style={styles.completionGradient}
          >
            <Text style={styles.completionNumber}>{Math.round(stats.completionRate)}%</Text>
          </LinearGradient>
        </View>
        <View style={styles.completionInfo}>
          <Text style={styles.completionText}>
            You've completed {stats.finished} out of {stats.totalItems} items
          </Text>
          <Text style={styles.completionSubtext}>
            Keep watching to increase your completion rate!
          </Text>
        </View>
      </View>
    </View>
  );

  const renderAchievements = () => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Achievements</Text>
      
      <View style={styles.achievementsGrid}>
        {ACHIEVEMENTS.map((achievement) => {
          // Simple unlock logic based on stats
          const unlocked = 
            (achievement.id === 'first_watch' && stats.finished > 0) ||
            (achievement.id === '10_movies' && stats.movies >= 10) ||
            (achievement.id === 'completionist' && stats.finished >= 20) ||
            (achievement.id === '100_hours' && stats.estimatedHours >= 100);

          return (
            <View key={achievement.id} style={styles.achievementCard}>
              <LinearGradient
                colors={unlocked ? achievement.color : ['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.02)']}
                style={styles.achievementGradient}
              >
                <View style={[styles.achievementIcon, !unlocked && styles.achievementLocked]}>
                  <Ionicons 
                    name={achievement.icon} 
                    size={32} 
                    color={unlocked ? '#fff' : colors.textTertiary} 
                  />
                </View>
                <Text style={[styles.achievementTitle, !unlocked && styles.achievementTitleLocked]}>
                  {achievement.title}
                </Text>
                <Text style={styles.achievementDescription}>
                  {achievement.description}
                </Text>
                {unlocked && (
                  <View style={styles.unlockedBadge}>
                    <Ionicons name="checkmark-circle" size={16} color={colors.green} />
                    <Text style={styles.unlockedText}>Unlocked</Text>
                  </View>
                )}
              </LinearGradient>
            </View>
          );
        })}
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Time Range Toggle */}
      {renderTimeToggle()}

      {/* Watch Time Summary */}
      {renderWatchTimeSummary()}

      {/* Stats Grid */}
      {renderStats()}

      {/* Completion Rate */}
      {renderCompletionRate()}

      {/* Achievements */}
      {renderAchievements()}

      <View style={{ height: spacing.massive }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.midnight,
  },
  timeToggle: {
    flexDirection: 'row',
    padding: spacing.xl,
    gap: spacing.sm,
  },
  timeButton: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: borderRadius.md,
  },
  timeButtonActive: {
    backgroundColor: colors.purple,
  },
  timeButtonText: {
    fontSize: typography.caption,
    fontWeight: typography.semibold,
    color: colors.textSecondary,
  },
  timeButtonTextActive: {
    color: colors.textPrimary,
    fontWeight: typography.bold,
  },
  section: {
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.xxxl,
  },
  sectionTitle: {
    fontSize: typography.h3,
    fontWeight: typography.bold,
    color: colors.textPrimary,
    marginBottom: spacing.lg,
  },
  watchTimeCard: {
    borderRadius: borderRadius.xl,
    padding: spacing.xxl,
  },
  watchTimeContent: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  watchTimeNumber: {
    fontSize: 64,
    fontWeight: typography.black,
    color: '#fff',
  },
  watchTimeLabel: {
    fontSize: typography.h4,
    fontWeight: typography.semibold,
    color: '#fff',
    opacity: 0.9,
  },
  watchTimeSplit: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  splitItem: {
    alignItems: 'center',
  },
  splitNumber: {
    fontSize: typography.h2,
    fontWeight: typography.bold,
    color: '#fff',
    marginTop: spacing.sm,
  },
  splitLabel: {
    fontSize: typography.caption,
    color: '#fff',
    opacity: 0.8,
    marginTop: spacing.xs,
  },
  splitDivider: {
    width: 1,
    backgroundColor: 'rgba(255,255,255,0.3)',
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
  completionCard: {
    flexDirection: 'row',
    backgroundColor: colors.cardDark,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    gap: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  completionCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    overflow: 'hidden',
  },
  completionGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  completionNumber: {
    fontSize: typography.hero,
    fontWeight: typography.black,
    color: '#fff',
  },
  completionInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  completionText: {
    fontSize: typography.body,
    color: colors.textPrimary,
    fontWeight: typography.semibold,
    marginBottom: spacing.sm,
  },
  completionSubtext: {
    fontSize: typography.caption,
    color: colors.textSecondary,
  },
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  achievementCard: {
    width: '48%',
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  achievementGradient: {
    padding: spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    minHeight: 160,
  },
  achievementIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  achievementLocked: {
    opacity: 0.3,
  },
  achievementTitle: {
    fontSize: typography.body,
    fontWeight: typography.bold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  achievementTitleLocked: {
    color: colors.textSecondary,
  },
  achievementDescription: {
    fontSize: typography.small,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  unlockedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  unlockedText: {
    fontSize: typography.small,
    fontWeight: typography.bold,
    color: colors.green,
  },
});
