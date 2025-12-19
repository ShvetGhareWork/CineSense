import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import AppText from '../../components/common/AppText';

import useAuthStore from '../../store/authStore';
import { colors, gradients, typography, spacing, borderRadius } from '../../constants/theme';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const { login, loading, error, clearError } = useAuthStore();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    const result = await login(email.trim().toLowerCase(), password);
    
    if (!result.success) {
      Alert.alert('Login Failed', result.error);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <LinearGradient
        colors={[colors.midnight, colors.charcoal]}
        style={styles.gradient}
      >
        <View style={styles.content}>
          {/* Logo/Title */}
          <View style={styles.header}>
            <Ionicons name="film" size={64} color={colors.purple} />
            <AppText variant="h1" style={styles.title}>CineSense</AppText>
            <AppText variant="body" style={styles.subtitle}>Intelligent movie & TV show tracking</AppText>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {/* Email Input */}
            <View style={styles.inputContainer}>
              <Ionicons name="mail-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor={colors.textSecondary}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            {/* Password Input */}
            <View style={styles.inputContainer}>
              <Ionicons name="lock-closed-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor={colors.textSecondary}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeIcon}
              >
                <Ionicons
                  name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                  size={20}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
            </View>

            {/* Login Button */}
            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleLogin}
              disabled={loading}
            >
              <LinearGradient
                colors={gradients.purple}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.buttonGradient}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <AppText variant="h5" style={styles.buttonText}>Login</AppText>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* Register Link */}
            <View style={styles.footer}>
              <AppText variant="body" style={styles.footerText}>Don't have an account? </AppText>
              <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <AppText variant="body" style={styles.linkText}>Sign Up</AppText>
              </TouchableOpacity>
            </View>

            {/* Skip Button */}
            <TouchableOpacity
              style={styles.skipButton}
              onPress={() => navigation.replace('Main')}
            >
              <AppText variant="small" style={styles.skipText}>Continue without account</AppText>
              <Ionicons name="arrow-forward" size={16} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  title: {
    fontSize: typography.h1.fontSize,
    fontWeight: typography.bold,
    color: colors.textPrimary,
    marginTop: spacing.md,
  },
  subtitle: {
    fontSize: typography.body.fontSize,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardDark,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.md,
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
  eyeIcon: {
    padding: spacing.sm,
  },
  button: {
    marginTop: spacing.md,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonGradient: {
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: typography.h5.fontSize,
    fontWeight: typography.semibold,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.lg,
  },
  footerText: {
    color: colors.textSecondary,
    fontSize: typography.body.fontSize,
  },
  linkText: {
    color: colors.purple,
    fontSize: typography.body.fontSize,
    fontWeight: typography.semibold,
  },
  skipButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
    marginTop: spacing.lg,
  },
  skipText: {
    fontSize: typography.small.fontSize,
    color: colors.textSecondary,
  },
});

