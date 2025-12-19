import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

import useAuthStore from '../../store/authStore';
import { colors, gradients, typography, spacing, borderRadius } from '../../constants/theme';

export default function EditProfileScreen({ navigation }) {
  const { user, updateProfile } = useAuthStore();
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!displayName.trim()) {
      Alert.alert('Error', 'Display name cannot be empty');
      return;
    }

    setLoading(true);
    const result = await updateProfile({ displayName: displayName.trim() });
    setLoading(false);

    if (result?.success) {
      Alert.alert('Success', 'Profile updated successfully');
      navigation.goBack();
    } else {
      Alert.alert('Error', result?.error || 'Failed to update profile');
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <TouchableOpacity onPress={handleSave} disabled={loading}>
          <Text style={[styles.saveText, loading && styles.saveTextDisabled]}>Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Photo */}
        <View style={styles.photoSection}>
          <View style={styles.photoContainer}>
            <LinearGradient colors={gradients.purple} style={styles.photoBorder}>
              <View style={styles.photo}>
                <Text style={styles.photoInitial}>
                  {displayName?.charAt(0).toUpperCase() || 'U'}
                </Text>
              </View>
            </LinearGradient>
          </View>
          <TouchableOpacity style={styles.changePhotoButton}>
            <Text style={styles.changePhotoText}>Change Photo</Text>
          </TouchableOpacity>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Display Name</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="person-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={displayName}
                onChangeText={setDisplayName}
                placeholder="Enter your name"
                placeholderTextColor={colors.textTertiary}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <View style={[styles.inputContainer, styles.inputDisabled]}>
              <Ionicons name="mail-outline" size={20} color={colors.textTertiary} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, styles.inputTextDisabled]}
                value={email}
                editable={false}
                placeholderTextColor={colors.textTertiary}
              />
            </View>
            <Text style={styles.helperText}>Email cannot be changed</Text>
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
  saveText: {
    fontSize: typography.body.fontSize,
    fontWeight: typography.bold,
    color: colors.purple,
  },
  saveTextDisabled: {
    opacity: 0.5,
  },
  content: {
    flex: 1,
  },
  photoSection: {
    alignItems: 'center',
    paddingVertical: spacing.xxxl,
  },
  photoContainer: {
    marginBottom: spacing.md,
  },
  photoBorder: {
    width: 124,
    height: 124,
    borderRadius: 62,
    padding: 2,
  },
  photo: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.cardDark,
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoInitial: {
    fontSize: 48,
    fontWeight: typography.black,
    color: colors.purple,
  },
  changePhotoButton: {
    paddingVertical: spacing.sm,
  },
  changePhotoText: {
    fontSize: typography.body.fontSize,
    fontWeight: typography.semibold,
    color: colors.purple,
  },
  form: {
    paddingHorizontal: spacing.xl,
  },
  inputGroup: {
    marginBottom: spacing.xl,
  },
  label: {
    fontSize: typography.body.fontSize,
    fontWeight: typography.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardDark,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  inputDisabled: {
    opacity: 0.6,
  },
  inputIcon: {
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    height: 50,
    color: colors.textPrimary,
    fontSize: typography.body.fontSize,
  },
  inputTextDisabled: {
    color: colors.textTertiary,
  },
  helperText: {
    fontSize: typography.caption.fontSize,
    color: colors.textTertiary,
    marginTop: spacing.xs,
    marginLeft: spacing.sm,
  },
});

