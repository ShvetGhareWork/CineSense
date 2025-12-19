import React, { useEffect, forwardRef, useImperativeHandle, useState } from 'react';
import { StyleSheet, View, Dimensions, Platform } from 'react-native';
import Animated from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { colors, spacing, borderRadius } from '../../constants/theme';
import AppText from './AppText';
import { useToastAnimation } from '../../utils/animations';

const { width } = Dimensions.get('window');

const Toast = forwardRef((props, ref) => {
  const [message, setMessage] = useState('');
  const [type, setType] = useState('success'); // success, error, info
  const [visible, setVisible] = useState(false);

  const { animatedStyle, show, hide } = useToastAnimation(() => setVisible(false));

  useImperativeHandle(ref, () => ({
    show: (msg, toastType = 'success') => {
      setMessage(msg);
      setType(toastType);
      setVisible(true);
      show();
    }
  }));

  if (!visible) return null;

  const getIcon = () => {
    switch (type) {
      case 'success': return 'checkmark-circle';
      case 'error': return 'alert-circle';
      case 'info': return 'information-circle';
      default: return 'notifications';
    }
  };

  const getColor = () => {
    switch (type) {
      case 'success': return '#2ECC71';
      case 'error': return colors.error;
      case 'info': return colors.blue;
      default: return colors.purple;
    }
  };

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <BlurView intensity={90} tint="dark" style={styles.blur}>
        <LinearGradient
          colors={['rgba(255,255,255,0.1)', 'transparent']}
          style={styles.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={[styles.content, { borderLeftColor: getColor() }]}>
            <Ionicons name={getIcon()} size={24} color={getColor()} />
            <AppText variant="body" style={styles.message}>{message}</AppText>
          </View>
        </LinearGradient>
      </BlurView>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 30,
    left: 20,
    right: 20,
    zIndex: 9999,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  blur: {
    borderRadius: 16,
  },
  gradient: {
    borderRadius: 16,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
    borderLeftWidth: 4,
    borderRadius: 16,
  },
  message: {
    color: '#fff',
    flex: 1,
  },
});

export default Toast;

