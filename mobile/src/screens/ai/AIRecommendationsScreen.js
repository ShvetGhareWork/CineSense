import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { colors, gradients, typography, spacing, borderRadius } from '../../constants/theme';
import AppText from '../../components/common/AppText';

export default function AIRecommendationsScreen() {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <AppText variant="h1" style={styles.headerTitle}>AI Recommendations</AppText>
        <AppText variant="caption" style={styles.headerSubtitle}>Powered by Gemini</AppText>
      </View>

      {/* Coming Soon Content */}
      <ScrollView contentContainerStyle={styles.content}>
        <LinearGradient
          colors={gradients.purple}
          style={styles.comingSoonCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <Ionicons name="sparkles" size={80} color="#fff" />
          <AppText variant="h2" style={styles.comingSoonTitle}>Coming Soon!</AppText>
          <AppText variant="body" style={styles.comingSoonText}>
            AI-powered recommendations are being fine-tuned to provide you with the best personalized suggestions.
          </AppText>
        </LinearGradient>

        {/* Features Preview */}
        <View style={styles.featuresContainer}>
          <AppText variant="h4" style={styles.featuresTitle}>What's Coming:</AppText>
          
          <View style={styles.featureItem}>
            <View style={styles.featureIconContainer}>
              <Ionicons name="sparkles-outline" size={24} color={colors.purple} />
            </View>
            <View style={styles.featureText}>
              <AppText variant="body" style={styles.featureName}>Personalized Picks</AppText>
              <AppText variant="caption" style={styles.featureDesc}>AI recommendations based on your watch history</AppText>
            </View>
          </View>

          <View style={styles.featureItem}>
            <View style={styles.featureIconContainer}>
              <Ionicons name="happy-outline" size={24} color={colors.cyan} />
            </View>
            <View style={styles.featureText}>
              <AppText variant="body" style={styles.featureName}>Mood-Based Discovery</AppText>
              <AppText variant="caption" style={styles.featureDesc}>Find content that matches how you're feeling</AppText>
            </View>
          </View>

          <View style={styles.featureItem}>
            <View style={styles.featureIconContainer}>
              <Ionicons name="compass-outline" size={24} color={colors.amber} />
            </View>
            <View style={styles.featureText}>
              <AppText variant="body" style={styles.featureName}>Guided Journeys</AppText>
              <AppText variant="caption" style={styles.featureDesc}>Curated watch lists around specific themes</AppText>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.midnight,
  },
  header: {
    padding: spacing.xl,
    paddingTop: spacing.xxl,
  },
  headerTitle: {
    fontSize: typography.h1.fontSize,
    fontWeight: typography.bold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    fontSize: typography.caption.fontSize,
    color: colors.purple,
    fontWeight: typography.semibold,
  },
  content: {
    padding: spacing.xl,
  },
  comingSoonCard: {
    borderRadius: borderRadius.xl,
    padding: spacing.xxl,
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  comingSoonTitle: {
    fontSize: typography.h2.fontSize,
    fontWeight: typography.bold,
    color: '#fff',
    marginTop: spacing.lg,
    marginBottom: spacing.md,
  },
  comingSoonText: {
    fontSize: typography.body.fontSize,
    color: '#fff',
    opacity: 0.9,
    textAlign: 'center',
    lineHeight: 24,
  },
  featuresContainer: {
    backgroundColor: colors.cardDark,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  featuresTitle: {
    fontSize: typography.h4.fontSize,
    fontWeight: typography.bold,
    color: colors.textPrimary,
    marginBottom: spacing.lg,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.lg,
  },
  featureIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(108,99,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureText: {
    flex: 1,
    marginLeft: spacing.md,
  },
  featureName: {
    fontSize: typography.body.fontSize,
    fontWeight: typography.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  featureDesc: {
    fontSize: typography.caption.fontSize,
    color: colors.textSecondary,
    lineHeight: 20,
  },
});


