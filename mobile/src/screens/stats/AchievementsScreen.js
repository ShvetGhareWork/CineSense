import React, { useMemo } from 'react';
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

import useWatchlistStore from '../../store/watchlistStore';
import { colors, gradients, spacing, borderRadius } from '../../constants/theme';
import AppText from '../../components/common/AppText';

const { width } = Dimensions.get('window');

const ACHIEVEMENTS = [
  // Beginner Achievements
  { 
    id: 'first_watch', 
    title: 'First Steps', 
    icon: 'play-circle', 
    description: 'Complete your first watch', 
    color: gradients.purple,
    category: 'Beginner',
    requirement: { type: 'finished', count: 1 }
  },
  { 
    id: 'first_favorite', 
    title: 'Favorited', 
    icon: 'heart', 
    description: 'Add your first favorite', 
    color: gradients.pink,
    category: 'Beginner',
    requirement: { type: 'favorites', count: 1 }
  },
  { 
    id: '5_items', 
    title: 'Getting Started', 
    icon: 'list', 
    description: 'Add 5 items to watchlist', 
    color: gradients.blue,
    category: 'Beginner',
    requirement: { type: 'total', count: 5 }
  },
  { 
    id: 'first_movie', 
    title: 'Movie Night', 
    icon: 'film', 
    description: 'Watch your first movie', 
    color: gradients.amber,
    category: 'Beginner',
    requirement: { type: 'movies_finished', count: 1 }
  },
  { 
    id: 'first_tv', 
    title: 'Binge Beginner', 
    icon: 'tv', 
    description: 'Watch your first TV show', 
    color: gradients.green,
    category: 'Beginner',
    requirement: { type: 'tv_finished', count: 1 }
  },

  // Intermediate Achievements
  { 
    id: '10_movies', 
    title: 'Movie Buff', 
    icon: 'film-outline', 
    description: 'Watch 10 movies', 
    color: gradients.gold,
    category: 'Intermediate',
    requirement: { type: 'movies_finished', count: 10 }
  },
  { 
    id: '10_tv', 
    title: 'Series Addict', 
    icon: 'tv-outline', 
    description: 'Watch 10 TV shows', 
    color: gradients.teal,
    category: 'Intermediate',
    requirement: { type: 'tv_finished', count: 10 }
  },
  { 
    id: '50_hours', 
    title: 'Half Century', 
    icon: 'time-outline', 
    description: 'Watch 50+ hours', 
    color: gradients.purple,
    category: 'Intermediate',
    requirement: { type: 'hours', count: 50 }
  },
  { 
    id: '10_favorites', 
    title: 'Curator', 
    icon: 'heart-outline', 
    description: 'Add 10 favorites', 
    color: gradients.pink,
    category: 'Intermediate',
    requirement: { type: 'favorites', count: 10 }
  },
  { 
    id: '20_completed', 
    title: 'Completionist', 
    icon: 'checkmark-circle', 
    description: 'Finish 20 items', 
    color: gradients.green,
    category: 'Intermediate',
    requirement: { type: 'finished', count: 20 }
  },

  // Expert Achievements
  { 
    id: '100_hours', 
    title: 'Century Club', 
    icon: 'time', 
    description: 'Watch 100+ hours', 
    color: gradients.blue,
    category: 'Expert',
    requirement: { type: 'hours', count: 100 }
  },
  { 
    id: '50_movies', 
    title: 'Cinema Master', 
    icon: 'film', 
    description: 'Watch 50 movies', 
    color: gradients.gold,
    category: 'Expert',
    requirement: { type: 'movies_finished', count: 50 }
  },
  { 
    id: '50_tv', 
    title: 'Binge Legend', 
    icon: 'tv', 
    description: 'Watch 50 TV shows', 
    color: gradients.teal,
    category: 'Expert',
    requirement: { type: 'tv_finished', count: 50 }
  },
  { 
    id: '100_completed', 
    title: 'Dedicated Viewer', 
    icon: 'trophy', 
    description: 'Finish 100 items', 
    color: gradients.amber,
    category: 'Expert',
    requirement: { type: 'finished', count: 100 }
  },
  { 
    id: '500_hours', 
    title: 'Time Traveler', 
    icon: 'infinite', 
    description: 'Watch 500+ hours', 
    color: gradients.purple,
    category: 'Expert',
    requirement: { type: 'hours', count: 500 }
  },
];

const calculateProgress = (achievement, items, favorites) => {
  const { type, count } = achievement.requirement;
  let current = 0;

  switch (type) {
    case 'finished':
      current = items.filter(i => i.status === 'finished').length;
      break;
    case 'total':
      current = items.length;
      break;
    case 'movies_finished':
      current = items.filter(i => i.mediaId?.type === 'movie' && i.status === 'finished').length;
      break;
    case 'tv_finished':
      current = items.filter(i => i.mediaId?.type === 'tv' && i.status === 'finished').length;
      break;
    case 'favorites':
      current = favorites ? favorites.length : 0;
      break;
    case 'hours':
      const finished = items.filter(i => i.status === 'finished');
      const avgMovieTime = 120;
      const avgTVEpisodeTime = 45;
      current = Math.round(
        (finished.filter(i => i.mediaId?.type === 'movie').length * avgMovieTime / 60) +
        (finished.filter(i => i.mediaId?.type === 'tv').length * avgTVEpisodeTime / 60)
      );
      break;
  }

  const progress = Math.min((current / count) * 100, 100);
  const unlocked = current >= count;

  return { current, target: count, progress, unlocked };
};

export default function AchievementsScreen() {
  const navigation = useNavigation();
  const { items, favorites } = useWatchlistStore();

  const achievementsByCategory = useMemo(() => {
    const categories = ['Beginner', 'Intermediate', 'Expert'];
    return categories.map(category => ({
      name: category,
      achievements: ACHIEVEMENTS.filter(a => a.category === category).map(achievement => ({
        ...achievement,
        ...calculateProgress(achievement, items, favorites)
      }))
    }));
  }, [items, favorites]);

  const totalUnlocked = useMemo(() => {
    return ACHIEVEMENTS.filter(a => calculateProgress(a, items, favorites).unlocked).length;
  }, [items, favorites]);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <AppText variant="h1" style={styles.headerTitle}>Achievements</AppText>
          <AppText variant="caption" style={styles.headerSubtitle}>
            {totalUnlocked} of {ACHIEVEMENTS.length} unlocked
          </AppText>
        </View>
        <View style={styles.trophyBadge}>
          <Ionicons name="trophy" size={24} color={colors.gold} />
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {achievementsByCategory.map((category, categoryIndex) => (
          <View key={category.name} style={styles.categorySection}>
            <View style={styles.categoryHeader}>
              <AppText variant="h2" style={styles.categoryTitle}>{category.name}</AppText>
              <AppText variant="caption" style={styles.categoryCount}>
                {category.achievements.filter(a => a.unlocked).length}/{category.achievements.length}
              </AppText>
            </View>

            <View style={styles.achievementsGrid}>
              {category.achievements && category.achievements.map((achievement) => (
                <View key={achievement.id} style={styles.achievementCard}>
                  <LinearGradient
                    colors={achievement.unlocked ? achievement.color : ['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.02)']}
                    style={[styles.achievementContent, !achievement.unlocked && styles.achievementLocked]}
                  >
                    {/* Icon and Badge */}
                    <View style={styles.achievementHeader}>
                      <View style={[styles.achievementIconContainer, !achievement.unlocked && { opacity: 0.4 }]}>
                        <Ionicons name={achievement.icon} size={28} color={achievement.unlocked ? '#fff' : '#666'} />
                      </View>
                      {achievement.unlocked && (
                        <View style={styles.checkBadge}>
                          <Ionicons name="checkmark" size={10} color="#fff" />
                        </View>
                      )}
                    </View>
                    
                    {/* Title and Description */}
                    <View style={styles.achievementInfo}>
                      <AppText variant="cardTitle" style={[styles.achievementName, !achievement.unlocked && { color: '#666' }]}>
                        {achievement.title}
                      </AppText>
                      <AppText variant="tiny" style={[styles.achievementDesc, !achievement.unlocked && { color: '#444' }]}>
                        {achievement.description}
                      </AppText>
                    </View>
                    
                    {/* Progress Bar or Unlocked Badge */}
                    {!achievement.unlocked ? (
                      <View style={styles.achievementProgress}>
                        <View style={styles.progressBarSmall}>
                          <View style={[styles.progressFillSmall, { width: `${achievement.progress}%` }]}>
                            <LinearGradient
                              colors={['rgba(108, 99, 255, 0.6)', 'rgba(108, 99, 255, 0.3)']}
                              style={StyleSheet.absoluteFill}
                              start={{ x: 0, y: 0 }}
                              end={{ x: 1, y: 0 }}
                            />
                          </View>
                        </View>
                        <AppText variant="tiny" style={styles.progressText}>
                          {achievement.current}/{achievement.target}
                        </AppText>
                      </View>
                    ) : (
                      <View style={styles.unlockedBadge}>
                        <AppText variant="tiny" style={styles.unlockedText}>UNLOCKED</AppText>
                      </View>
                    )}
                  </LinearGradient>
                </View>
              ))}
            </View>
          </View>
        ))}

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingTop: 50,
    paddingBottom: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContent: {
    flex: 1,
    marginLeft: spacing.lg,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: '#888',
    marginTop: spacing.xs,
  },
  trophyBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,215,0,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  categorySection: {
    paddingHorizontal: spacing.xl,
    marginTop: spacing.xxxl,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  categoryTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  categoryCount: {
    color: colors.purple,
    fontWeight: '600',
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
    minHeight: 170,
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
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  achievementInfo: {
    marginTop: spacing.md,
  },
  achievementName: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  achievementDesc: {
    fontSize: 10,
    color: '#aaa',
    lineHeight: 13,
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
    marginTop: spacing.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: 'rgba(39, 174, 96, 0.15)',
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: 'rgba(39, 174, 96, 0.3)',
    alignItems: 'center',
  },
  unlockedText: {
    color: '#27AE60',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  checkBadge: {
    width: 18,
    height: 18,
    borderRadius: 9,
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
