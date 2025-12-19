import React, { useState, useMemo } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, { 
  useAnimatedProps, 
  interpolate,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';

import useWatchlistStore from '../../store/watchlistStore';
import { colors, gradients, spacing, borderRadius } from '../../constants/theme';
import AppText from '../../components/common/AppText';
import { useDonutSweepAnimation, useBarStaggerAnimation } from '../../utils/animations';

const { width } = Dimensions.get('window');
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const ACHIEVEMENTS = [
  { id: 'first_watch', title: 'First Watch', icon: 'play-circle', description: 'Watched your first item', color: gradients.purple },
  { id: 'binge_master', title: 'Binge Master', icon: 'flame', description: 'Watched 5+ episodes in a day', color: gradients.amber },
  { id: '10_movies', title: 'Movie Buff', icon: 'film', description: 'Watched 10 movies', color: gradients.gold },
  { id: '100_hours', title: '100 Hours', icon: 'time', description: 'Total watch time: 100+ hours', color: gradients.blue },
  { id: 'horror_lover', title: 'Horror Lover', icon: 'skull', description: 'Watched 10+ horror titles', color: gradients.purple },
  { id: 'completionist', title: 'Completionist', icon: 'checkmark-circle', description: 'Finished 20+ items', color: gradients.green },
];

const DonutChart = ({ percentage, color = colors.purple }) => {
  const size = 160;
  const strokeWidth = 16;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  
  const progress = useDonutSweepAnimation(1500);
  
  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - progress.value * (percentage / 100)),
  }));

  return (
    <View style={styles.donutContainer}>
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255,255,255,0.1)"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={`${circumference} ${circumference}`}
          animatedProps={animatedProps}
          strokeLinecap="round"
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
      <View style={styles.donutContent}>
        <AppText variant="h2" style={styles.donutPercentage}>{Math.round(percentage)}%</AppText>
      </View>
    </View>
  );
};

const BarChart = ({ data }) => {
  const maxVal = Math.max(...data.map(d => d.value), 1);
  
  return (
    <View style={styles.barChartContainer}>
      {data.map((item, index) => {
        const animatedStyle = useBarStaggerAnimation(index, data.length);
        const barHeight = (item.value / maxVal) * 140;
        
        return (
          <View key={item.label} style={styles.barColumn}>
            <View style={styles.barTrack}>
              <Animated.View style={[
                styles.barFill, 
                { height: barHeight, backgroundColor: item.color || colors.purple },
                animatedStyle
              ]}>
                <LinearGradient
                  colors={['rgba(255,255,255,0.3)', 'transparent']}
                  style={StyleSheet.absoluteFill}
                />
              </Animated.View>
            </View>
            <AppText variant="tiny" style={styles.barLabel}>{item.label}</AppText>
            <AppText variant="tiny" style={styles.barValue}>{item.value}</AppText>
          </View>
        );
      })}
    </View>
  );
};

export default function StatsScreen() {
  const { items } = useWatchlistStore();
  const [timeRange, setTimeRange] = useState('all'); 

  const stats = useMemo(() => {
    const finished = items.filter(item => item.status === 'finished');
    const totalItems = items.length;
    const completionRate = totalItems > 0 ? (finished.length / totalItems) * 100 : 0;
    
    const movies = items.filter(item => item.mediaId?.type === 'movie').length;
    const tvShows = items.filter(item => item.mediaId?.type === 'tv').length;
    
    const avgMovieTime = 120; 
    const avgTVEpisodeTime = 45; 
    const estimatedHours = (finished.filter(i => i.mediaId?.type === 'movie').length * avgMovieTime / 60) +
                          (finished.filter(i => i.mediaId?.type === 'tv').length * avgTVEpisodeTime / 60);

    return {
      totalItems,
      finished: finished.length,
      movies,
      tvShows,
      completionRate,
      estimatedHours: Math.round(estimatedHours),
    };
  }, [items]);

  const barData = [
    { label: 'Mon', value: 3, color: '#6C63FF' },
    { label: 'Tue', value: 5, color: '#3ABEFF' },
    { label: 'Wed', value: 2, color: '#27AE60' },
    { label: 'Thu', value: 8, color: '#F39C12' },
    { label: 'Fri', value: 4, color: '#E74C3C' },
    { label: 'Sat', value: 10, color: '#9B59B6' },
    { label: 'Sun', value: 6, color: '#1ABC9C' },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <AppText variant="h1" style={styles.headerTitle}>Analytics</AppText>
        <View style={styles.timeToggle}>
          {['all', 'week', 'month'].map((range) => (
            <TouchableOpacity
              key={range}
              style={[styles.timeButton, timeRange === range && styles.timeButtonActive]}
              onPress={() => setTimeRange(range)}
            >
              <AppText variant="caption" style={[styles.timeButtonText, timeRange === range && styles.timeButtonTextActive]}>
                {range === 'all' ? 'All Time' : range === 'week' ? 'Week' : 'Month'}
              </AppText>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Main Stats Card */}
      <View style={styles.section}>
        <LinearGradient
          colors={gradients.purple}
          style={styles.heroCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.heroLeft}>
            <AppText variant="hero" style={styles.heroNumber}>{stats.estimatedHours}</AppText>
            <AppText variant="body" style={styles.heroLabel}>Hours Watched</AppText>
          </View>
          <View style={styles.heroRight}>
             <DonutChart percentage={stats.completionRate} color="#fff" />
             <AppText variant="tiny" style={styles.completionLabel}>Completion</AppText>
          </View>
        </LinearGradient>
      </View>

      {/* Activity Bar Chart */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <AppText variant="h2" style={styles.sectionTitle}>Weekly Activity</AppText>
          <Ionicons name="stats-chart" size={20} color={colors.textSecondary} />
        </View>
        <View style={styles.chartCard}>
          <BarChart data={barData} />
        </View>
      </View>

      {/* Grid Stats */}
      <View style={styles.section}>
        <AppText variant="h2" style={styles.sectionTitle}>Library Overview</AppText>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <LinearGradient colors={['#6C63FF15', '#6C63FF05']} style={styles.statCardBg}>
              <Ionicons name="film" size={32} color="#6C63FF" />
              <AppText variant="h2" style={styles.statNumber}>{stats.movies}</AppText>
              <AppText variant="caption" style={styles.statLabel}>MOVIES</AppText>
            </LinearGradient>
          </View>
          <View style={styles.statCard}>
            <LinearGradient colors={['#3ABEFF15', '#3ABEFF05']} style={styles.statCardBg}>
              <Ionicons name="tv" size={32} color="#3ABEFF" />
              <AppText variant="h2" style={styles.statNumber}>{stats.tvShows}</AppText>
              <AppText variant="caption" style={styles.statLabel}>TV SHOWS</AppText>
            </LinearGradient>
          </View>
        </View>
      </View>

      {/* Achievements */}
      <View style={styles.section}>
        <AppText variant="h2" style={styles.sectionTitle}>Achievements</AppText>
        <View style={styles.achievementsGrid}>
          {ACHIEVEMENTS.map((achievement) => {
            const unlocked = stats.totalItems > 0 && Math.random() > 0.4; // Mock logic for demo
            return (
              <View key={achievement.id} style={styles.achievementCard}>
                <LinearGradient
                  colors={unlocked ? achievement.color : ['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.02)']}
                  style={[styles.achievementContent, !unlocked && styles.achievementLocked]}
                >
                  <Ionicons name={achievement.icon} size={36} color={unlocked ? '#fff' : '#444'} />
                  <AppText variant="cardTitle" style={[styles.achievementName, !unlocked && { color: '#666' }]}>{achievement.title}</AppText>
                  {unlocked && (
                    <View style={styles.checkBadge}>
                      <Ionicons name="checkmark" size={14} color="#fff" />
                    </View>
                  )}
                </LinearGradient>
              </View>
            );
          })}
        </View>
      </View>

      <View style={{ height: 100 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: 50,
    paddingBottom: spacing.md,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
  },
  timeToggle: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: borderRadius.xl,
    padding: spacing.xs,
    gap: spacing.xs,
  },
  timeButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
  },
  timeButtonActive: {
    backgroundColor: colors.purple,
    shadowColor: colors.purple,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 3,
  },
  timeButtonText: {
    color: '#888',
    fontWeight: '600',
  },
  timeButtonTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  section: {
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.xxxl,
  },
  heroCard: {
    flexDirection: 'row',
    borderRadius: borderRadius.xl,
    padding: spacing.xxxl,
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: colors.purple,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  heroNumber: {
    color: '#fff',
    fontSize: 56,
    fontWeight: 'bold',
  },
  heroLabel: {
    color: '#fff',
    opacity: 0.9,
  },
  donutContainer: {
    width: 160,
    height: 160,
    justifyContent: 'center',
    alignItems: 'center',
  },
  donutContent: {
    position: 'absolute',
  },
  donutPercentage: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
  },
  completionLabel: {
    color: '#fff',
    marginTop: spacing.md,
    textAlign: 'center',
    opacity: 0.9,
    fontSize: 14,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
  },
  chartCard: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  barChartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 180,
    paddingTop: spacing.md,
  },
  barColumn: {
    alignItems: 'center',
    width: 36,
  },
  barTrack: {
    height: 140,
    width: 10,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: borderRadius.sm,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    borderRadius: borderRadius.sm,
  },
  barLabel: {
    marginTop: spacing.sm,
    color: '#888',
    fontWeight: '600',
  },
  barValue: {
    marginTop: spacing.xs,
    color: colors.purple,
    fontWeight: 'bold',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  statCard: {
    flex: 1,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  statCardBg: {
    padding: spacing.xl,
    alignItems: 'center',
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  statNumber: {
    color: '#fff',
    marginVertical: spacing.sm,
  },
  statLabel: {
    color: '#888',
    letterSpacing: 1.2,
  },
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  achievementCard: {
    width: (width - spacing.xl * 2 - spacing.md) / 2,
    aspectRatio: 1.1,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  achievementContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.md,
  },
  achievementLocked: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  achievementName: {
    fontSize: 11,
    marginTop: spacing.md,
    textAlign: 'center',
    color: '#fff',
    fontWeight: '600',
  },
  checkBadge: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#27AE60',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#27AE60',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 3,
  },
});

