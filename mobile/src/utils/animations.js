import { useEffect } from 'react';
import { useSharedValue, useAnimatedStyle, withSpring, withTiming, withSequence, withRepeat, Easing, interpolate, interpolateColor } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

/**
 * Shared animation configurations for consistent feel across the app
 */
export const SPRING_CONFIGS = {
  gentle: { damping: 20, stiffness: 200 },
  bouncy: { damping: 12, stiffness: 300 },
  snappy: { damping: 15, stiffness: 400 },
  smooth: { damping: 18, stiffness: 250 },
};

export const TIMING_CONFIGS = {
  fast: { duration: 150, easing: Easing.out(Easing.ease) },
  normal: { duration: 250, easing: Easing.out(Easing.cubic) },
  slow: { duration: 400, easing: Easing.out(Easing.cubic) },
};

/**
 * Hook for press feedback animation (used in cards, buttons)
 */
export const usePressAnimation = (config = {}) => {
  const {
    scaleFrom = 1,
    scaleTo = 0.96,
    shadowFrom = 0.15,
    shadowTo = 0.08,
    haptic = true,
  } = config;

  const scale = useSharedValue(scaleFrom);
  const shadowOpacity = useSharedValue(shadowFrom);

  const onPressIn = () => {
    scale.value = withSpring(scaleTo, SPRING_CONFIGS.bouncy);
    shadowOpacity.value = withTiming(shadowTo, TIMING_CONFIGS.fast);
    if (haptic) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const onPressOut = () => {
    scale.value = withSpring(scaleFrom, SPRING_CONFIGS.bouncy);
    shadowOpacity.value = withTiming(shadowFrom, { duration: 200 });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    shadowOpacity: shadowOpacity.value,
  }));

  return { animatedStyle, onPressIn, onPressOut };
};

/**
 * Hook for success animation (bounce + glow)
 */
export const useSuccessAnimation = () => {
  const scale = useSharedValue(1);
  const glowOpacity = useSharedValue(0);

  const trigger = (callback) => {
    scale.value = withSequence(
      withSpring(1.1, SPRING_CONFIGS.bouncy),
      withSpring(1, SPRING_CONFIGS.bouncy)
    );
    
    glowOpacity.value = withSequence(
      withTiming(1, { duration: 100 }),
      withTiming(0, { duration: 400 })
    );

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    if (callback) {
      setTimeout(callback, 500);
    }
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    shadowColor: '#4CAF50',
    shadowOpacity: glowOpacity.value * 0.8,
    shadowRadius: 16,
    elevation: glowOpacity.value * 8,
  }));

  return { animatedStyle, trigger };
};

/**
 * Hook for error shake animation
 */
export const useShakeAnimation = () => {
  const translateX = useSharedValue(0);

  const trigger = () => {
    translateX.value = withSequence(
      withTiming(-10, { duration: 50 }),
      withTiming(10, { duration: 50 }),
      withTiming(-10, { duration: 50 }),
      withTiming(10, { duration: 50 }),
      withTiming(0, { duration: 50 })
    );

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  return { animatedStyle, trigger };
};

/**
 * Hook for icon morph animation (e.g., add to watchlist)
 */
export const useIconMorphAnimation = () => {
  const rotation = useSharedValue(0);
  const scale = useSharedValue(1);
  const glowOpacity = useSharedValue(0);

  const morph = (isActive) => {
    rotation.value = withSpring(isActive ? 90 : 0, SPRING_CONFIGS.smooth);
    scale.value = withSequence(
      withSpring(1.2, SPRING_CONFIGS.bouncy),
      withSpring(1, SPRING_CONFIGS.bouncy)
    );
    
    glowOpacity.value = withSequence(
      withTiming(1, { duration: 100 }),
      withTiming(isActive ? 0.6 : 0, { duration: 300 })
    );

    Haptics.impactAsync(
      isActive 
        ? Haptics.ImpactFeedbackStyle.Medium 
        : Haptics.ImpactFeedbackStyle.Light
    );
  };

  const iconStyle = useAnimatedStyle(() => ({
    transform: [
      { rotate: `${rotation.value}deg` },
      { scale: scale.value },
    ],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    shadowOpacity: glowOpacity.value,
    shadowRadius: 16,
    shadowColor: '#4CAF50',
    elevation: glowOpacity.value * 8,
  }));

  return { iconStyle, glowStyle, morph };
};

/**
 * Hook for progress bar animation
 */
export const useProgressAnimation = (initialProgress = 0) => {
  const progress = useSharedValue(initialProgress);

  const setProgress = (newProgress) => {
    progress.value = withTiming(newProgress, {
      duration: 400,
      easing: Easing.out(Easing.cubic),
    });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scaleX: progress.value }],
  }));

  return { animatedStyle, setProgress, progress };
};

/**
 * Hook for shimmer loading animation
 */
export const useShimmerAnimation = () => {
  const translateX = useSharedValue(-1);

  useEffect(() => {
    translateX.value = withRepeat(
      withTiming(1, { duration: 1500, easing: Easing.linear }),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value * 400 }], // roughly screen width
  }));

  return animatedStyle;
};


/**
 * Hook for floating animation (used for empty state icons)
 */
export const useFloatingAnimation = (amplitude = 20, duration = 3000) => {
  const translateY = useSharedValue(0);

  useEffect(() => {
    translateY.value = withRepeat(
      withSequence(
        withTiming(-amplitude, { duration: duration / 2, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: duration / 2, easing: Easing.inOut(Easing.sin) })
      ),
      -1,
      false
    );
  }, [amplitude, duration]);

  return useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));
};

/**
 * Hook for image progressive load animation
 */
export const useImageLoadAnimation = () => {
  const opacity = useSharedValue(0);
  const blur = useSharedValue(20);

  const onLoad = () => {
    opacity.value = withTiming(1, { duration: 400 });
    blur.value = withTiming(0, { duration: 400 });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return { animatedStyle, blur, onLoad };
};

/**
 * Hook for star shimmer animation
 */
export const useStarShimmerAnimation = (delay = 0) => {
  const shimmer = useSharedValue(0);

  useEffect(() => {
    const startShimmer = () => {
      shimmer.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 800, easing: Easing.linear }),
          withTiming(0, { duration: 0 }),
          withTiming(0, { duration: 2200 }) // Wait before next shimmer
        ),
        -1,
        false
      );
    };

    if (delay > 0) {
      setTimeout(startShimmer, delay);
    } else {
      startShimmer();
    }
  }, [delay]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(shimmer.value, [0, 0.5, 1], [0.3, 1, 0.3]),
    transform: [{ scale: interpolate(shimmer.value, [0, 0.5, 1], [1, 1.2, 1]) }],
  }));

  return animatedStyle;
};

/**
 * Hook for modal transitions (backdrop + content)
 */
export const useModalTransition = (isVisible) => {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withSpring(isVisible ? 1 : 0, {
      damping: 20,
      stiffness: 200,
    });
  }, [isVisible]);

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
  }));

  const contentStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [
      { scale: interpolate(progress.value, [0, 1], [0.9, 1]) },
      { translateY: interpolate(progress.value, [0, 1], [20, 0]) },
    ],
  }));

  return { backdropStyle, contentStyle };
};

/**
 * Hook for Sparkle Blast animation (Favorite button)
 */
export const useSparkleAnimation = () => {
  const sparkleScale = useSharedValue(0);
  const sparkleOpacity = useSharedValue(0);
  
  const trigger = () => {
    sparkleScale.value = 0;
    sparkleOpacity.value = 1;
    
    sparkleScale.value = withSpring(1, { damping: 10, stiffness: 100 });
    sparkleOpacity.value = withTiming(0, { duration: 600 });
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const sparkleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: sparkleScale.value }],
    opacity: sparkleOpacity.value,
  }));

  return { sparkleStyle, trigger };
};

/**
 * Hook for Toast Notification (Slide + Bounce)
 */
export const useToastAnimation = (onFinished) => {
  const translateY = useSharedValue(-100);
  const opacity = useSharedValue(0);

  const show = () => {
    translateY.value = withSpring(0, { damping: 12, stiffness: 200 });
    opacity.value = withTiming(1, { duration: 300 });

    setTimeout(hide, 3000);
  };

  const hide = () => {
    translateY.value = withTiming(-100, { 
      duration: 300,
    }, (finished) => {
      'worklet';
      if (finished && onFinished) {
        onFinished();
      }
    });
    opacity.value = withTiming(0, { duration: 300 });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  return { animatedStyle, show, hide };
};

/**
 * Hook for Donut Chart (Sweep Reveal)
 */
export const useDonutSweepAnimation = (duration = 1500) => {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(1, { 
      duration, 
      easing: Easing.out(Easing.cubic) 
    });
  }, []);

  return progress;
};

/**
 * Hook for Bar Chart (Stagger)
 */
export const useBarStaggerAnimation = (index, total) => {
  const heightProgress = useSharedValue(0);

  useEffect(() => {
    const delay = index * 100;
    setTimeout(() => {
      heightProgress.value = withSpring(1, { damping: 15, stiffness: 100 });
    }, delay);
  }, [index]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scaleY: heightProgress.value }],
    opacity: interpolate(heightProgress.value, [0, 0.2, 1], [0, 1, 1]),
  }));

  return animatedStyle;
};


/**
 * Stagger delay calculator for list items
 */
export const getStaggerDelay = (index, baseDelay = 50, maxDelay = 500) => {
  return Math.min(index * baseDelay, maxDelay);
};

/**
 * Navigation transition config
 */
export const screenTransitionConfig = {
  cardStyleInterpolator: ({ current, layouts }) => ({
    cardStyle: {
      opacity: current.progress,
      transform: [{
        scale: current.progress.interpolate({
          inputRange: [0, 1],
          outputRange: [0.95, 1],
        }),
      }],
    },
  }),
};

/**
 * Tab bar animation config
 */
export const tabBarAnimationConfig = {
  tabBarStyle: {
    elevation: 0,
    shadowOpacity: 0,
  },
};
