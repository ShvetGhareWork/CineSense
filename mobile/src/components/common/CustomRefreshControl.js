import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { 
  useAnimatedStyle, 
  interpolate, 
  withRepeat, 
  withTiming, 
  Easing, 
  useSharedValue,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../constants/theme';

const CustomRefreshControl = ({ refreshing, scrollY }) => {
  const rotation = useSharedValue(0);

  useEffect(() => {
    if (refreshing) {
      rotation.value = withRepeat(
        withTiming(360, { duration: 1000, easing: Easing.linear }),
        -1,
        false
      );
    } else {
      rotation.value = 0;
    }
  }, [refreshing]);

  const animatedStyle = useAnimatedStyle(() => {
    // Rotate based on scroll when pulling, or use the continuous rotation when refreshing
    const pullRotation = interpolate(
      scrollY.value,
      [-100, 0],
      [360, 0],
      'clamp'
    );
    
    const scale = interpolate(
      scrollY.value,
      [-60, -20],
      [1, 0],
      'clamp'
    );

    const opacity = interpolate(
      scrollY.value,
      [-60, -20],
      [1, 0],
      'clamp'
    );

    return {
      transform: [
        { rotate: refreshing ? `${rotation.value}deg` : `${pullRotation}deg` },
        { scale: refreshing ? 1 : scale }
      ],
      opacity: refreshing ? 1 : opacity,
    };
  });

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.spinner, animatedStyle]}>
        <Ionicons name="refresh-circle" size={40} color={colors.purple} />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: -60,
    left: 0,
    right: 0,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  spinner: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default CustomRefreshControl;

