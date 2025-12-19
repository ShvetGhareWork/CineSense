import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors, typography, spacing, borderRadius } from '../../constants/theme';

export default function HelpScreen({ navigation }) {
  const handleOpenLink = (url) => {
    Linking.openURL(url);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help & Support</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Get Help</Text>

        <TouchableOpacity style={styles.helpItem}>
          <View style={styles.helpIcon}>
            <Ionicons name="book-outline" size={20} color={colors.purple} />
          </View>
          <View style={styles.helpContent}>
            <Text style={styles.helpTitle}>User Guide</Text>
            <Text style={styles.helpDescription}>Learn how to use the app</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.helpItem}>
          <View style={styles.helpIcon}>
            <Ionicons name="chatbubble-outline" size={20} color={colors.cyan} />
          </View>
          <View style={styles.helpContent}>
            <Text style={styles.helpTitle}>Contact Support</Text>
            <Text style={styles.helpDescription}>Get help from our team</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.helpItem}>
          <View style={styles.helpIcon}>
            <Ionicons name="bug-outline" size={20} color={colors.amber} />
          </View>
          <View style={styles.helpContent}>
            <Text style={styles.helpTitle}>Report a Bug</Text>
            <Text style={styles.helpDescription}>Help us improve the app</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
        </TouchableOpacity>

        <Text style={[styles.sectionTitle, { marginTop: spacing.xxxl }]}>About</Text>

        <View style={styles.infoCard}>
          <Text style={styles.infoLabel}>Version</Text>
          <Text style={styles.infoValue}>1.0.0</Text>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoLabel}>Build</Text>
          <Text style={styles.infoValue}>2024.12.19</Text>
        </View>

        <TouchableOpacity style={styles.helpItem}>
          <View style={styles.helpIcon}>
            <Ionicons name="document-text-outline" size={20} color={colors.green} />
          </View>
          <View style={styles.helpContent}>
            <Text style={styles.helpTitle}>Terms of Service</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.helpItem}>
          <View style={styles.helpIcon}>
            <Ionicons name="shield-checkmark-outline" size={20} color={colors.blue} />
          </View>
          <View style={styles.helpContent}>
            <Text style={styles.helpTitle}>Privacy Policy</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
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
  helpItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardDark,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  helpIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(108,99,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  helpContent: {
    flex: 1,
  },
  helpTitle: {
    fontSize: typography.body,
    fontWeight: typography.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  helpDescription: {
    fontSize: typography.caption,
    color: colors.textSecondary,
  },
  infoCard: {
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
  infoLabel: {
    fontSize: typography.body,
    fontWeight: typography.semibold,
    color: colors.textSecondary,
  },
  infoValue: {
    fontSize: typography.body,
    fontWeight: typography.bold,
    color: colors.textPrimary,
  },
});
