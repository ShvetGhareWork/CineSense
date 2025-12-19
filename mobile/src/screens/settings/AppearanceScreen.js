import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

import useThemeStore, { THEMES } from '../../store/themeStore';
import { colors, gradients, typography, spacing, borderRadius } from '../../constants/theme';

export default function AppearanceScreen({ navigation }) {
  const { currentTheme, setTheme } = useThemeStore();
  const [selectedTheme, setSelectedTheme] = useState(currentTheme.id);
  const [isChanging, setIsChanging] = useState(false);

  const handleThemeSelect = async (themeId) => {
    if (isChanging || selectedTheme === themeId) return;
    
    setIsChanging(true);
    setSelectedTheme(themeId);
    
    // Small delay for smooth transition
    setTimeout(async () => {
      await setTheme(themeId);
      setIsChanging(false);
      
      // Force navigation to refresh
      navigation.goBack();
      setTimeout(() => {
        navigation.navigate('Appearance');
      }, 100);
    }, 300);
  };

  const renderThemeOption = (theme) => {
    const isSelected = selectedTheme === theme.id;
    const themeColors = theme.colors;

    return (
      <TouchableOpacity
        key={theme.id}
        style={[styles.themeCard, isSelected && styles.themeCardSelected]}
        onPress={() => handleThemeSelect(theme.id)}
        activeOpacity={0.8}
      >
        <View style={styles.themePreview}>
          {/* Color Preview */}
          <View style={styles.colorPreview}>
            <View style={[styles.colorBlock, { backgroundColor: themeColors.midnight }]} />
            <View style={[styles.colorBlock, { backgroundColor: themeColors.primary }]} />
            <View style={[styles.colorBlock, { backgroundColor: themeColors.accent }]} />
            <View style={[styles.colorBlock, { backgroundColor: themeColors.gold }]} />
          </View>

          {/* Theme Info */}
          <View style={styles.themeInfo}>
            <Text style={styles.themeName}>{theme.name}</Text>
            <Text style={styles.themeDescription}>{theme.description}</Text>
          </View>

          {/* Selected Indicator */}
          {isSelected && (
            <View style={styles.selectedBadge}>
              <LinearGradient
                colors={theme.gradients.primary}
                style={styles.selectedGradient}
              >
                <Ionicons name="checkmark-circle" size={24} color="#fff" />
              </LinearGradient>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Appearance</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Choose Your Theme</Text>
        <Text style={styles.sectionSubtitle}>
          Select a theme that matches your style. Changes apply instantly.
        </Text>

        {/* Theme Options */}
        <View style={styles.themesContainer}>
          {renderThemeOption(THEMES.MIDNIGHT)}
          {renderThemeOption(THEMES.OCEAN)}
          {renderThemeOption(THEMES.SUNSET)}
        </View>

        {/* Additional Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Display</Text>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons name="contrast-outline" size={20} color={colors.purple} />
              <Text style={styles.settingText}>AMOLED Mode</Text>
            </View>
            <View style={styles.toggle}>
              <View style={[styles.toggleTrack, styles.toggleActive]}>
                <View style={styles.toggleThumb} />
              </View>
            </View>
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons name="text-outline" size={20} color={colors.cyan} />
              <Text style={styles.settingText}>Large Text</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textTertiary} />
          </View>
        </View>

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
    fontSize: typography.h3.fontSize,
    fontWeight: typography.bold,
    color: colors.textPrimary,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.h4.fontSize,
    fontWeight: typography.bold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  sectionSubtitle: {
    fontSize: typography.body.fontSize,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
    lineHeight: 22,
  },
  themesContainer: {
    marginBottom: spacing.xxxl,
  },
  themeCard: {
    backgroundColor: colors.cardDark,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 2,
    borderColor: colors.border,
  },
  themeCardSelected: {
    borderColor: colors.purple,
  },
  themePreview: {
    position: 'relative',
  },
  colorPreview: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  colorBlock: {
    flex: 1,
    height: 60,
    borderRadius: borderRadius.md,
  },
  themeInfo: {
    marginBottom: spacing.sm,
  },
  themeName: {
    fontSize: typography.h5.fontSize,
    fontWeight: typography.bold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  themeDescription: {
    fontSize: typography.caption.fontSize,
    color: colors.textSecondary,
  },
  selectedBadge: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    borderRadius: 12,
    overflow: 'hidden',
  },
  selectedGradient: {
    padding: spacing.xs,
  },
  section: {
    marginBottom: spacing.xl,
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
    gap: spacing.md,
  },
  settingText: {
    fontSize: typography.body.fontSize,
    fontWeight: typography.semibold,
    color: colors.textPrimary,
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
    alignSelf: 'flex-end',
  },
});

