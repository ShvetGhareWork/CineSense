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
import { useNavigation } from '@react-navigation/native';
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
  const navigation = useNavigation();
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



  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
      </View>


      {/* Weekly Activity - Real Data */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <AppText variant="h2" style={styles.sectionTitle}>Weekly Activity</AppText>
          <Ionicons name="calendar-outline" size={20} color={colors.textSecondary} />
        </View>
        <View style={styles.chartCard}>
          <BarChart data={(() => {
            // Calculate real activity for last 7 days
            const today = new Date();
            const last7Days = Array.from({ length: 7 }, (_, i) => {
              const date = new Date(today);
              date.setDate(date.getDate() - (6 - i));
              return date;
            });

            const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            const colors = ['#6C63FF', '#3ABEFF', '#27AE60', '#F39C12', '#E74C3C', '#9B59B6', '#1ABC9C'];

            return last7Days.map((date, index) => {
              // Count items finished on this day
              const count = items.filter(item => {
                if (!item.addedAt || item.status !== 'finished') return false;
                const itemDate = new Date(item.addedAt);
                return itemDate.toDateString() === date.toDateString();
              }).length;

              return {
                label: dayNames[date.getDay()],
                value: count,
                color: colors[index]
              };
            });
          })()} />
        </View>
      </View>

      {/* Viewing Insights - Premium Stats */}
      <View style={styles.section}>
        <AppText variant="h2" style={styles.sectionTitle}>Viewing Insights</AppText>
        <View style={styles.insightsGrid}>
          {/* Completion Rate */}
          <View style={styles.insightCard}>
            <LinearGradient 
              colors={['rgba(108, 99, 255, 0.15)', 'rgba(108, 99, 255, 0.05)']} 
              style={styles.insightCardBg}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.insightHeader}>
                <View style={[styles.insightIconCircle, { backgroundColor: 'rgba(108, 99, 255, 0.2)' }]}>
                  <Ionicons name="checkmark-done" size={20} color="#6C63FF" />
                </View>
                <AppText variant="caption" style={styles.insightLabel}>Completion</AppText>
              </View>
              <AppText variant="hero" style={styles.insightValue}>
                {Math.round(stats.completionRate)}%
              </AppText>
              <AppText variant="tiny" style={styles.insightSubtext}>
                {stats.finished} of {stats.totalItems} finished
              </AppText>
            </LinearGradient>
          </View>

          {/* Total Watch Time */}
          <View style={styles.insightCard}>
            <LinearGradient 
              colors={['rgba(58, 190, 255, 0.15)', 'rgba(58, 190, 255, 0.05)']} 
              style={styles.insightCardBg}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.insightHeader}>
                <View style={[styles.insightIconCircle, { backgroundColor: 'rgba(58, 190, 255, 0.2)' }]}>
                  <Ionicons name="time" size={20} color="#3ABEFF" />
                </View>
                <AppText variant="caption" style={styles.insightLabel}>Watch Time</AppText>
              </View>
              <AppText variant="hero" style={styles.insightValue}>
                {stats.estimatedHours}h
              </AppText>
              <AppText variant="tiny" style={styles.insightSubtext}>
                Total hours watched
              </AppText>
            </LinearGradient>
          </View>

          {/* Movies vs TV Shows */}
          <View style={styles.insightCard}>
            <LinearGradient 
              colors={['rgba(39, 174, 96, 0.15)', 'rgba(39, 174, 96, 0.05)']} 
              style={styles.insightCardBg}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.insightHeader}>
                <View style={[styles.insightIconCircle, { backgroundColor: 'rgba(39, 174, 96, 0.2)' }]}>
                  <Ionicons name="film" size={20} color="#27AE60" />
                </View>
                <AppText variant="caption" style={styles.insightLabel}>Movies</AppText>
              </View>
              <AppText variant="hero" style={styles.insightValue}>
                {stats.movies}
              </AppText>
              <AppText variant="tiny" style={styles.insightSubtext}>
                In your library
              </AppText>
            </LinearGradient>
          </View>

          {/* TV Shows */}
          <View style={styles.insightCard}>
            <LinearGradient 
              colors={['rgba(243, 156, 18, 0.15)', 'rgba(243, 156, 18, 0.05)']} 
              style={styles.insightCardBg}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.insightHeader}>
                <View style={[styles.insightIconCircle, { backgroundColor: 'rgba(243, 156, 18, 0.2)' }]}>
                  <Ionicons name="tv" size={20} color="#F39C12" />
                </View>
                <AppText variant="caption" style={styles.insightLabel}>TV Shows</AppText>
              </View>
              <AppText variant="hero" style={styles.insightValue}>
                {stats.tvShows}
              </AppText>
              <AppText variant="tiny" style={styles.insightSubtext}>
                In your library
              </AppText>
            </LinearGradient>
          </View>
        </View>
      </View>

      {/* Achievements */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View>
            <AppText variant="h2" style={styles.sectionTitle}>Achievements</AppText>
            <AppText variant="caption" style={styles.sectionSubtitle}>
              Track your progress and unlock rewards
            </AppText>
          </View>
          <TouchableOpacity 
            style={styles.viewAllButton}
            onPress={() => navigation.navigate('Achievements')}
          >
            <AppText variant="caption" style={styles.viewAllText}>View All</AppText>
            <Ionicons name="arrow-forward" size={16} color={colors.purple} />
          </TouchableOpacity>
        </View>
        <View style={styles.achievementsGrid}>
          {ACHIEVEMENTS.map((achievement) => {
            // Real achievement logic
            let progress = 0;
            let unlocked = false;
            let current = 0;
            let target = 0;
            
            switch (achievement.id) {
              case 'first_watch':
                current = stats.finished;
                target = 1;
                progress = Math.min((current / target) * 100, 100);
                unlocked = current >= target;
                break;
              case 'binge_master':
                // Mock: Would need daily tracking
                current = 0;
                target = 5;
                progress = 0;
                unlocked = false;
                break;
              case '10_movies':
                current = items.filter(i => i.mediaId?.type === 'movie' && i.status === 'finished').length;
                target = 10;
                progress = Math.min((current / target) * 100, 100);
                unlocked = current >= target;
                break;
              case '100_hours':
                current = stats.estimatedHours;
                target = 100;
                progress = Math.min((current / target) * 100, 100);
                unlocked = current >= target;
                break;
              case 'horror_lover':
                // Mock: Would need genre tracking
                current = 0;
                target = 10;
                progress = 0;
                unlocked = false;
                break;
              case 'completionist':
                current = stats.finished;
                target = 20;
                progress = Math.min((current / target) * 100, 100);
                unlocked = current >= target;
                break;
            }
            
            return (
              <View key={achievement.id} style={styles.achievementCard}>
                <LinearGradient
                  colors={unlocked ? achievement.color : ['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.02)']}
                  style={[styles.achievementContent, !unlocked && styles.achievementLocked]}
                >
                  {/* Icon and Badge */}
                  <View style={styles.achievementHeader}>
                    <View style={[styles.achievementIconContainer, !unlocked && { opacity: 0.4 }]}>
                      <Ionicons name={achievement.icon} size={32} color={unlocked ? '#fff' : '#666'} />
                    </View>
                    {unlocked && (
                      <View style={styles.checkBadge}>
                        <Ionicons name="checkmark" size={12} color="#fff" />
                      </View>
                    )}
                  </View>
                  
                  {/* Title and Description */}
                  <View style={styles.achievementInfo}>
                    <AppText variant="cardTitle" style={[styles.achievementName, !unlocked && { color: '#666' }]}>
                      {achievement.title}
                    </AppText>
                    <AppText variant="tiny" style={[styles.achievementDesc, !unlocked && { color: '#444' }]}>
                      {achievement.description}
                    </AppText>
                  </View>
                  
                  {/* Progress Bar */}
                  {!unlocked && (
                    <View style={styles.achievementProgress}>
                      <View style={styles.progressBarSmall}>
                        <View style={[styles.progressFillSmall, { width: `${progress}%` }]}>
                          <LinearGradient
                            colors={['rgba(108, 99, 255, 0.6)', 'rgba(108, 99, 255, 0.3)']}
                            style={StyleSheet.absoluteFill}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 0 }}
                          />
                        </View>
                      </View>
                      <AppText variant="tiny" style={styles.progressText}>
                        {current}/{target}
                      </AppText>
                    </View>
                  )}
                  
                  {unlocked && (
                    <View style={styles.unlockedBadge}>
                      <AppText variant="tiny" style={styles.unlockedText}>UNLOCKED</AppText>
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
  sectionSubtitle: {
    color: '#888',
    marginTop: spacing.xs,
    marginBottom: spacing.lg,
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
  insightsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  insightCard: {
    width: (width - spacing.xl * 2 - spacing.md) / 2,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  insightCardBg: {
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    minHeight: 140,
    justifyContent: 'space-between',
  },
  insightHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  insightIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  insightLabel: {
    color: '#888',
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  insightValue: {
    color: '#fff',
    fontSize: 36,
    fontWeight: 'bold',
    marginVertical: spacing.xs,
  },
  insightSubtext: {
    color: '#666',
    fontSize: 11,
  },
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  achievementCard: {
    width: (width - spacing.xl * 2 - spacing.md) / 2,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  achievementContent: {
    padding: spacing.lg,
    minHeight: 180,
    justifyContent: 'space-between',
  },
  achievementLocked: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  achievementHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  achievementIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  achievementInfo: {
    marginTop: spacing.md,
  },
  achievementName: {
    fontSize: 13,
    color: '#fff',
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  achievementDesc: {
    fontSize: 10,
    color: '#aaa',
    lineHeight: 14,
  },
  achievementProgress: {
    marginTop: spacing.md,
  },
  progressBarSmall: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: spacing.xs,
  },
  progressFillSmall: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    color: '#888',
    fontSize: 10,
    fontWeight: '600',
  },
  unlockedBadge: {
    marginTop: spacing.sm,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: borderRadius.sm,
    alignSelf: 'flex-start',
  },
  unlockedText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: 'bold',
    letterSpacing: 0.8,
  },
  checkBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#27AE60',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#27AE60',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 3,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: 'rgba(108, 99, 255, 0.1)',
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(108, 99, 255, 0.3)',
  },
  viewAllText: {
    color: colors.purple,
    fontWeight: '600',
  },
});

