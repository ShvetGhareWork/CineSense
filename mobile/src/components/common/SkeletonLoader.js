import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
  interpolate,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../constants/theme';

const { width } = Dimensions.get('window');

export default function SkeletonLoader({ 
  width: customWidth = '100%', 
  height = 20, 
  borderRadius = 8,
  style 
}) {
  const shimmerX = useSharedValue(-1);

  useEffect(() => {
    shimmerX.value = withRepeat(
      withTiming(1, { duration: 1500, easing: Easing.linear }),
      -1,
      false
    );
  }, []);

  const shimmerStyle = useAnimatedStyle(() => {
    const translateX = interpolate(
      shimmerX.value,
      [-1, 1],
      [-width, width]
    );
    return {
      transform: [{ translateX }],
    };
  });

  return (
    <View 
      style={[
        styles.container, 
        { width: customWidth, height, borderRadius },
        style
      ]}
    >
      <Animated.View style={[styles.shimmerContainer, shimmerStyle]}>
        <LinearGradient
          colors={[
            'rgba(255,255,255,0)',
            'rgba(255,255,255,0.1)',
            'rgba(255,255,255,0)',
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.shimmer}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.cardDark,
    overflow: 'hidden',
  },
  shimmerContainer: {
    width: '100%',
    height: '100%',
  },
  shimmer: {
    width: '100%',
    height: '100%',
  },
});

// Preset skeleton components
export const SkeletonCard = () => (
  <View style={{ marginRight: 16 }}>
    <SkeletonLoader width={150} height={225} borderRadius={12} />
    <SkeletonLoader width={150} height={16} borderRadius={4} style={{ marginTop: 8 }} />
    <SkeletonLoader width={100} height={14} borderRadius={4} style={{ marginTop: 4 }} />
  </View>
);

export const SkeletonListItem = () => (
  <View style={{ flexDirection: 'row', padding: 16, gap: 12 }}>
    <SkeletonLoader width={80} height={120} borderRadius={8} />
    <View style={{ flex: 1, gap: 8 }}>
      <SkeletonLoader width="80%" height={20} />
      <SkeletonLoader width="60%" height={16} />
      <SkeletonLoader width="40%" height={14} />
    </View>
  </View>
);

