import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors, typography, spacing, borderRadius } from '../../constants/theme';

export default function NotificationsScreen({ navigation }) {
  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [newReleases, setNewReleases] = useState(true);
  const [recommendations, setRecommendations] = useState(false);

  const renderToggle = (value) => (
    <View style={styles.toggle}>
      <View style={[styles.toggleTrack, value && styles.toggleActive]}>
        <View style={[styles.toggleThumb, value && styles.toggleThumbActive]} />
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Notification Channels</Text>

        <TouchableOpacity 
          style={styles.settingItem}
          onPress={() => setPushEnabled(!pushEnabled)}
        >
          <View style={styles.settingLeft}>
            <Ionicons name="notifications-outline" size={20} color={colors.purple} />
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingText}>Push Notifications</Text>
              <Text style={styles.settingDescription}>Receive notifications on your device</Text>
            </View>
          </View>
          {renderToggle(pushEnabled)}
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.settingItem}
          onPress={() => setEmailEnabled(!emailEnabled)}
        >
          <View style={styles.settingLeft}>
            <Ionicons name="mail-outline" size={20} color={colors.cyan} />
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingText}>Email Notifications</Text>
              <Text style={styles.settingDescription}>Receive updates via email</Text>
            </View>
          </View>
          {renderToggle(emailEnabled)}
        </TouchableOpacity>

        <Text style={[styles.sectionTitle, { marginTop: spacing.xxxl }]}>Content Updates</Text>

        <TouchableOpacity 
          style={styles.settingItem}
          onPress={() => setNewReleases(!newReleases)}
        >
          <View style={styles.settingLeft}>
            <Ionicons name="sparkles-outline" size={20} color={colors.amber} />
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingText}>New Releases</Text>
              <Text style={styles.settingDescription}>Get notified about new movies & shows</Text>
            </View>
          </View>
          {renderToggle(newReleases)}
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.settingItem}
          onPress={() => setRecommendations(!recommendations)}
        >
          <View style={styles.settingLeft}>
            <Ionicons name="bulb-outline" size={20} color={colors.green} />
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingText}>AI Recommendations</Text>
              <Text style={styles.settingDescription}>Personalized content suggestions</Text>
            </View>
          </View>
          {renderToggle(recommendations)}
        </TouchableOpacity>

        <View style={{ height: spacing.massive }} />
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.lg,
  },
  backButton: {
    padding: spacing.sm,
  },
  headerTitle: {
    fontSize: typography.h3,
    fontWeight: typography.bold,
    color: colors.textPrimary,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.h4,
    fontWeight: typography.bold,
    color: colors.textPrimary,
    marginBottom: spacing.lg,
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
    flex: 1,
    gap: spacing.md,
  },
  settingTextContainer: {
    flex: 1,
  },
  settingText: {
    fontSize: typography.body,
    fontWeight: typography.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  settingDescription: {
    fontSize: typography.caption,
    color: colors.textSecondary,
  },
  toggle: {
    width: 50,
    height: 30,
  },
  toggleTrack: {
    flex: 1,
    borderRadius: 15,
    backgroundColor: colors.textTertiary,
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  toggleActive: {
    backgroundColor: colors.purple,
  },
  toggleThumb: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#fff',
    alignSelf: 'flex-start',
  },
  toggleThumbActive: {
    alignSelf: 'flex-end',
  },
});
