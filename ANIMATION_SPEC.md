# 🎬 CineSense - Complete Micro-Animation Specification
**React Native + Reanimated v3 Animation System**

---

## 🏠 HOME SCREEN ANIMATIONS

### 1. Hero Carousel - Parallax Effect
**Trigger**: User swipes carousel  
**Animation**: Backdrop image moves at 0.4x scroll speed (parallax)  
**Duration**: Continuous (tied to scroll)  
**Easing**: Linear (no easing for parallax)  
**API**: `useAnimatedScrollHandler`, `interpolate`

```javascript
const scrollX = useSharedValue(0);
const scrollHandler = useAnimatedScrollHandler({
  onScroll: (event) => {
    scrollX.value = event.contentOffset.x;
  },
});

const backdropStyle = useAnimatedStyle(() => {
  const translateX = interpolate(
    scrollX.value,
    [0, width],
    [0, -width * 0.4] // 40% parallax speed
  );
  return { transform: [{ translateX }] };
});
```
**Performance**: GPU-accelerated transform, no re-renders

### 2. Hero Card - Active Scale
**Trigger**: Card becomes centered in viewport  
**Animation**: Scale from 1 → 1.04, fade title from 0 → 1  
**Duration**: 250ms  
**Easing**: `Easing.out(Easing.cubic)`  
**API**: `interpolate`, `withTiming`

```javascript
const cardStyle = useAnimatedStyle(() => {
  const scale = interpolate(
    scrollX.value,
    [(index - 1) * width, index * width, (index + 1) * width],
    [0.92, 1.04, 0.92],
    Extrapolate.CLAMP
  );
  
  const opacity = interpolate(
    scrollX.value,
    [(index - 1) * width, index * width, (index + 1) * width],
    [0.5, 1, 0.5],
    Extrapolate.CLAMP
  );
  
  return {
    transform: [{ scale }],
    opacity,
  };
});
```
**Performance**: Single shared value, no setState

### 3. Poster Card - Press Feedback
**Trigger**: User presses poster  
**Animation**: Scale to 0.96, shadow opacity 0.8 → 0.4  
**Duration**: 150ms press, 200ms release  
**Easing**: `withSpring({ damping: 15, stiffness: 300 })`  
**API**: `useAnimatedGestureHandler`, `withSpring`

```javascript
const scale = useSharedValue(1);
const shadowOpacity = useSharedValue(0.8);

const gestureHandler = useAnimatedGestureHandler({
  onStart: () => {
    scale.value = withSpring(0.96, { damping: 15 });
    shadowOpacity.value = withTiming(0.4, { duration: 150 });
  },
  onEnd: () => {
    scale.value = withSpring(1);
    shadowOpacity.value = withTiming(0.8, { duration: 200 });
  },
});

const animatedStyle = useAnimatedStyle(() => ({
  transform: [{ scale: scale.value }],
  shadowOpacity: shadowOpacity.value,
}));
```
**Performance**: Haptic on press with `ReactNativeHapticFeedback.trigger('impactLight')`

### 4. List Item Mount - Stagger Fade In
**Trigger**: List renders  
**Animation**: Fade + translateY (16px → 0), staggered by 50ms  
**Duration**: 300ms per item  
**Easing**: `Easing.out(Easing.ease)`  
**API**: `Layout.springify()`, `FadeIn`

```javascript
<Animated.View
  entering={FadeIn.duration(300).delay(index * 50)}
  layout={Layout.springify().damping(15)}
>
  {/* Poster content */}
</Animated.View>
```
**Performance**: Use `initialNumToRender={6}` on FlatList

---

## 🔍 DISCOVER SCREEN ANIMATIONS

### 5. Search Bar - Focus Expansion
**Trigger**: User taps search input  
**Animation**: Width expands, border glows (accent color), icon shifts left  
**Duration**: 280ms  
**Easing**: `withSpring({ damping: 18, stiffness: 200 })`  
**API**: `withSpring`, `interpolateColor`

```javascript
const isFocused = useSharedValue(0);

const searchStyle = useAnimatedStyle(() => {
  const width = interpolate(isFocused.value, [0, 1], [280, 360]);
  const borderColor = interpolateColor(
    isFocused.value,
    [0, 1],
    ['rgba(255,255,255,0.2)', '#FF6B6B'] // Accent glow
  );
  
  return {
    width: withSpring(width, { damping: 18 }),
    borderColor,
  };
});

const handleFocus = () => {
  isFocused.value = withSpring(1);
};
```
**Performance**: Border glow via borderColor (no shadow), sub-60fps safe

### 6. Search Results - Stagger List
**Trigger**: Results load  
**Animation**: Each result fades + slides up (12px), 40ms stagger  
**Duration**: 250ms  
**Easing**: `Easing.out(Easing.cubic)`  
**API**: `FadeInUp`, `delay`

```javascript
{results.map((item, index) => (
  <Animated.View
    key={item.id}
    entering={FadeInUp.duration(250).delay(index * 40).springify()}
  >
    <SearchResultCard {...item} />
  </Animated.View>
))}
```
**Performance**: Limit to first 20 items, virtualize rest

### 7. Filter Bottom Sheet - Slide Up
**Trigger**: User taps "Filters" button  
**Animation**: Sheet slides from bottom with spring, backdrop blurs  
**Duration**: 350ms  
**Easing**: `withSpring({ damping: 20, mass: 0.8 })`  
**API**: `SlideInDown`, `FadeIn` for backdrop

```javascript
<Animated.View
  entering={SlideInDown.springify().damping(20)}
  exiting={SlideOutDown.duration(250)}
  style={styles.bottomSheet}
>
  {/* Filter content */}
</Animated.View>

<Animated.View
  entering={FadeIn.duration(200)}
  exiting={FadeOut.duration(150)}
  style={styles.backdrop}
/>
```
**Performance**: Use `@gorhom/bottom-sheet` for optimized sheet

### 8. Genre Chip - Select Pulse
**Trigger**: User taps chip  
**Animation**: Scale pulse (1 → 1.08 → 1), background color fill  
**Duration**: 200ms  
**Easing**: `withSequence`, `withSpring`  
**API**: `withSequence`, `interpolateColor`

```javascript
const isSelected = useSharedValue(0);

const chipStyle = useAnimatedStyle(() => {
  const scale = isSelected.value === 1 
    ? withSequence(
        withSpring(1.08, { damping: 10 }),
        withSpring(1)
      )
    : 1;
  
  const backgroundColor = interpolateColor(
    isSelected.value,
    [0, 1],
    ['rgba(255,255,255,0.1)', '#FF6B6B']
  );
  
  return { transform: [{ scale }], backgroundColor };
});

const handlePress = () => {
  isSelected.value = isSelected.value === 1 ? 0 : 1;
  HapticFeedback.trigger('selection');
};
```
**Performance**: Single shared value toggle, no state

---

## 📌 WATCHLIST SCREEN ANIMATIONS

### 9. Status Change - Card Morph
**Trigger**: User changes status (Plan to Watch → Watching)  
**Animation**: Card height morphs, progress bar fills, glow flash  
**Duration**: 350ms  
**Easing**: `withSpring({ damping: 18 })`  
**API**: `Layout.springify()`, `interpolate`

```javascript
<Animated.View
  layout={Layout.springify().damping(18)}
  style={[styles.card, animatedGlowStyle]}
>
  {/* Card content */}
</Animated.View>

// Glow flash on status change
const glowOpacity = useSharedValue(0);

useEffect(() => {
  if (statusChanged) {
    glowOpacity.value = withSequence(
      withTiming(1, { duration: 100 }),
      withTiming(0, { duration: 300 })
    );
  }
}, [statusChanged]);

const animatedGlowStyle = useAnimatedStyle(() => ({
  shadowColor: getStatusColor(status),
  shadowOpacity: glowOpacity.value * 0.6,
  shadowRadius: 12,
}));
```
**Performance**: Android uses elevation for glow (no shadowRadius)

### 10. Progress Bar - Animated Fill
**Trigger**: User updates episode progress  
**Animation**: Bar fills smoothly from old → new value  
**Duration**: 400ms  
**Easing**: `withTiming(Easing.out(Easing.cubic))`  
**API**: `interpolate`, `withTiming`

```javascript
const progress = useSharedValue(prevProgress);

useEffect(() => {
  progress.value = withTiming(newProgress, {
    duration: 400,
    easing: Easing.out(Easing.cubic),
  });
}, [newProgress]);

// Better version using scaleX
const progressBarStyle = useAnimatedStyle(() => ({
  transform: [{ scaleX: progress.value }],
}));
```
**Performance**: Use scaleX instead of width for better performance

### 11. Swipe to Delete - Physics Resistance
**Trigger**: User swipes card left  
**Animation**: Card translates with resistance, reveals delete button, snaps back or deletes  
**Duration**: 250ms snap/delete  
**Easing**: `withSpring({ damping: 20 })` for snap  
**API**: `useAnimatedGestureHandler`, `PanGestureHandler`

```javascript
const translateX = useSharedValue(0);
const DELETE_THRESHOLD = -120;

const panGesture = useAnimatedGestureHandler({
  onStart: (_, ctx) => {
    ctx.startX = translateX.value;
  },
  onActive: (event, ctx) => {
    const newTranslateX = ctx.startX + event.translationX;
    translateX.value = newTranslateX < DELETE_THRESHOLD
      ? DELETE_THRESHOLD + (newTranslateX - DELETE_THRESHOLD) * 0.3
      : newTranslateX;
  },
  onEnd: (event) => {
    if (translateX.value < DELETE_THRESHOLD) {
      translateX.value = withTiming(-width, { duration: 250 });
      runOnJS(handleDelete)();
    } else {
      translateX.value = withSpring(0, { damping: 20 });
    }
  },
});
```
**Performance**: Use simultaneousHandlers for nested scrolls

### 12. Delete - Vertical Collapse
**Trigger**: Delete confirmed  
**Animation**: Card height → 0, opacity → 0, neighbors shift up  
**Duration**: 300ms  
**Easing**: `withTiming(Easing.in(Easing.ease))`  
**API**: `Layout.springify()`, `exiting` prop

```javascript
<Animated.View
  exiting={FadeOut.duration(200)}
  layout={Layout.springify().damping(18)}
>
  {/* Card content */}
</Animated.View>
```
**Performance**: Use `removeClippedSubviews` on FlatList

---

## 🎬 MEDIA DETAIL SCREEN ANIMATIONS

### 13. Add to Watchlist - Icon Morph
**Trigger**: User taps "Add" button  
**Animation**: Plus icon morphs to checkmark, button glows, haptic feedback  
**Duration**: 300ms  
**Easing**: `withSpring({ damping: 12 })`  
**API**: `withSpring`, `interpolate`

```javascript
const isAdded = useSharedValue(0);

const iconRotate = useAnimatedStyle(() => ({
  transform: [{
    rotate: `${interpolate(isAdded.value, [0, 1], [0, 90])}deg`,
  }],
}));

const glowStyle = useAnimatedStyle(() => ({
  shadowOpacity: interpolate(isAdded.value, [0, 1], [0, 0.8]),
  shadowRadius: 16,
  shadowColor: '#4CAF50',
}));

const handlePress = () => {
  isAdded.value = withSpring(isAdded.value === 1 ? 0 : 1, { damping: 12 });
  HapticFeedback.trigger('notificationSuccess');
};
```
**Performance**: Use react-native-vector-icons with AnimatedComponent

### 14. Rating Badge - Count Up
**Trigger**: Badge appears on screen  
**Animation**: Number counts from 0 → actual rating  
**Duration**: 800ms  
**Easing**: `Easing.out(Easing.cubic)`  
**API**: `withTiming`, `useDerivedValue`

```javascript
const animatedRating = useSharedValue(0);

useEffect(() => {
  animatedRating.value = withTiming(actualRating, {
    duration: 800,
    easing: Easing.out(Easing.cubic),
  });
}, [actualRating]);

const ratingText = useDerivedValue(() => {
  return animatedRating.value.toFixed(1);
});

// In component
<ReText text={ratingText} style={styles.ratingText} />
```
**Performance**: Use react-native-redash for ReText component

### 15. Star Shimmer - First View
**Trigger**: Rating appears for first time  
**Animation**: Gold shimmer sweeps across stars  
**Duration**: 600ms  
**Easing**: Linear  
**API**: `useAnimatedStyle`, `interpolate`

```javascript
const shimmerX = useSharedValue(-100);

useEffect(() => {
  shimmerX.value = withTiming(100, {
    duration: 600,
    easing: Easing.linear,
  });
}, []);

const shimmerStyle = useAnimatedStyle(() => ({
  transform: [{ translateX: shimmerX.value }],
}));
```
**Performance**: Use MaskedView for efficient shimmer

### 16. Cast Avatar - Pop In
**Trigger**: Cast list mounts  
**Animation**: Each avatar scales from 0.5 → 1, staggered  
**Duration**: 280ms per avatar  
**Easing**: `withSpring({ damping: 14 })`  
**API**: `ZoomIn`, `delay`

```javascript
{cast.map((actor, index) => (
  <Animated.View
    key={actor.id}
    entering={ZoomIn.duration(280).delay(index * 60).springify()}
  >
    <Avatar source={{ uri: actor.image }} />
  </Animated.View>
))}
```
**Performance**: Limit to first 10 cast members on low-end devices

---

## 📊 STATS SCREEN ANIMATIONS

### 17. Donut Chart - Sweep Reveal
**Trigger**: Chart mounts  
**Animation**: Donut fills from 0° → 360° based on data  
**Duration**: 1200ms  
**Easing**: `Easing.out(Easing.cubic)`  
**API**: react-native-svg + Reanimated

```javascript
const animatedAngle = useSharedValue(0);

useEffect(() => {
  animatedAngle.value = withTiming(360, {
    duration: 1200,
    easing: Easing.out(Easing.cubic),
  });
}, []);

const animatedProps = useAnimatedProps(() => ({
  strokeDashoffset: interpolate(
    animatedAngle.value,
    [0, 360],
    [circumference, 0]
  ),
}));

<AnimatedCircle animatedProps={animatedProps} />
```
**Performance**: Use `useAnimatedProps` for SVG, not style

### 18. Bar Chart - Stagger Growth
**Trigger**: Chart renders  
**Animation**: Bars grow from 0 → height, staggered by 80ms  
**Duration**: 500ms per bar  
**Easing**: `withSpring({ damping: 16 })`  
**API**: `interpolate`, `withSpring`

```javascript
const barHeight = useSharedValue(0);

useEffect(() => {
  barHeight.value = withDelay(
    index * 80,
    withSpring(actualHeight, { damping: 16 })
  );
}, []);

const barStyle = useAnimatedStyle(() => ({
  height: barHeight.value,
}));
```
**Performance**: Batch bars in groups of 5 for complex charts

### 19. Achievement Unlock - Confetti Burst
**Trigger**: Achievement unlocked  
**Animation**: Lightweight confetti burst, badge scales  
**Duration**: 800ms  
**Easing**: `withSequence`, `withSpring`  
**API**: react-native-confetti-cannon (optimized)

```javascript
const badgeScale = useSharedValue(0);

const unlock = () => {
  badgeScale.value = withSequence(
    withSpring(1.2, { damping: 8 }),
    withSpring(1)
  );
  
  confettiRef.current?.start();
  HapticFeedback.trigger('notificationSuccess');
};

const badgeStyle = useAnimatedStyle(() => ({
  transform: [{ scale: badgeScale.value }],
}));
```
**Performance**: Limit confetti to 10 particles on mid-range devices

---

## 🔄 GLOBAL INTERACTIONS

### 20. Screen Transition - Fade + Scale
**Trigger**: Navigate between screens  
**Animation**: New screen fades in, old scales down slightly  
**Duration**: 300ms  
**Easing**: `Easing.out(Easing.ease)`  
**API**: React Navigation custom transition

```javascript
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
```

### 21. Tab Switch - Icon Lift
**Trigger**: User switches tabs  
**Animation**: Active icon lifts up 2px, color fills  
**Duration**: 200ms  
**Easing**: `withSpring({ damping: 15 })`  
**API**: `interpolate`, `interpolateColor`

```javascript
const isActive = useSharedValue(route.state.index === index ? 1 : 0);

const iconStyle = useAnimatedStyle(() => {
  const translateY = interpolate(isActive.value, [0, 1], [0, -2]);
  const color = interpolateColor(
    isActive.value,
    [0, 1],
    ['rgba(255,255,255,0.5)', '#FF6B6B']
  );
  
  return {
    transform: [{ translateY: withSpring(translateY, { damping: 15 }) }],
    color,
  };
});
```

### 22. Pull to Refresh - Elastic Stretch
**Trigger**: User pulls down on scrollable list  
**Animation**: Header stretches elastically, spinner rotates  
**Duration**: Continuous during pull  
**Easing**: Rubber band physics  
**API**: `useAnimatedScrollHandler`, `interpolate`

```javascript
const scrollY = useSharedValue(0);

const scrollHandler = useAnimatedScrollHandler({
  onScroll: (event) => {
    scrollY.value = event.contentOffset.y;
  },
});

const headerStyle = useAnimatedStyle(() => {
  const extraHeight = interpolate(
    scrollY.value,
    [-150, 0],
    [150, 0],
    Extrapolate.CLAMP
  );
  
  return {
    height: 60 + extraHeight * 0.6, // Elastic damping
  };
});
```

### 23. Skeleton Shimmer - Loading
**Trigger**: Data loading  
**Animation**: Shimmer sweeps across skeleton  
**Duration**: 1500ms loop  
**Easing**: Linear  
**API**: `useAnimatedStyle`, `withRepeat`

```javascript
const shimmerX = useSharedValue(-1);

useEffect(() => {
  shimmerX.value = withRepeat(
    withTiming(1, { duration: 1500, easing: Easing.linear }),
    -1, // Infinite
    false
  );
}, []);

const shimmerStyle = useAnimatedStyle(() => {
  const translateX = interpolate(
    shimmerX.value,
    [-1, 1],
    [-width, width]
  );
  return { transform: [{ translateX }] };
});
```

### 24. Image Progressive Load
**Trigger**: Image loads from network  
**Animation**: Blur placeholder → sharp image fade  
**Duration**: 300ms  
**Easing**: `Easing.out(Easing.ease)`  
**API**: `withTiming`, `BlurView`

```javascript
const imageOpacity = useSharedValue(0);

const handleImageLoad = () => {
  imageOpacity.value = withTiming(1, {
    duration: 300,
    easing: Easing.out(Easing.ease),
  });
};

const imageStyle = useAnimatedStyle(() => ({
  opacity: imageOpacity.value,
}));

// Render
<BlurView intensity={20} style={styles.placeholder} />
<Animated.Image
  source={{ uri }}
  onLoad={handleImageLoad}
  style={imageStyle}
/>
```

### 25. Error Shake - Horizontal Vibration
**Trigger**: Form validation error  
**Animation**: Input field shakes horizontally  
**Duration**: 400ms  
**Easing**: `withSequence`, `withTiming`  
**API**: `withSequence`, `withTiming`

```javascript
const shakeX = useSharedValue(0);

const triggerShake = () => {
  shakeX.value = withSequence(
    withTiming(-10, { duration: 50 }),
    withTiming(10, { duration: 50 }),
    withTiming(-10, { duration: 50 }),
    withTiming(10, { duration: 50 }),
    withTiming(0, { duration: 50 })
  );
  HapticFeedback.trigger('notificationError');
};

const shakeStyle = useAnimatedStyle(() => ({
  transform: [{ translateX: shakeX.value }],
}));
```

### 26. Success Bounce - Green Glow
**Trigger**: Action succeeds (e.g., saved to watchlist)  
**Animation**: Button bounces with green glow pulse  
**Duration**: 500ms  
**Easing**: `withSpring({ damping: 10 })`  
**API**: `withSequence`, `withSpring`

```javascript
const successScale = useSharedValue(1);
const successGlow = useSharedValue(0);

const triggerSuccess = () => {
  successScale.value = withSequence(
    withSpring(1.1, { damping: 10 }),
    withSpring(1)
  );
  
  successGlow.value = withSequence(
    withTiming(1, { duration: 100 }),
    withTiming(0, { duration: 400 })
  );
  
  HapticFeedback.trigger('notificationSuccess');
};

const successStyle = useAnimatedStyle(() => ({
  transform: [{ scale: successScale.value }],
  shadowColor: '#4CAF50',
  shadowOpacity: successGlow.value * 0.8,
  shadowRadius: 16,
}));
```

---

## 🧠 PERFORMANCE & ACCESSIBILITY

### Reduce Motion Support
```javascript
import { AccessibilityInfo } from 'react-native';

const [reduceMotion, setReduceMotion] = useState(false);

useEffect(() => {
  AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion);
}, []);

// In animations
const duration = reduceMotion ? 0 : 300;
```

### Device Detection
```javascript
import { Platform, Dimensions } from 'react-native';

const isLowEnd = Platform.OS === 'android' && 
  Dimensions.get('window').width < 400;

const springConfig = isLowEnd
  ? { damping: 25, stiffness: 400 } // Faster, less smooth
  : { damping: 15, stiffness: 300 }; // Smooth
```

### Animation Guidelines

**✅ DO:**
- Use `transform` and `opacity` only (GPU-accelerated)
- Prefer `useAnimatedStyle` over `Animated.Value`
- Use `worklet` for JS-thread animations
- Batch updates with `runOnUI`

**❌ DON'T:**
- Animate `width`, `height`, `margin`
- Nest `withSpring` in loops
- Use shadows on Android if FPS < 50

---

## 📦 INSTALLATION

```bash
npm install react-native-reanimated react-native-gesture-handler
npm install react-native-linear-gradient react-native-svg
npm install react-native-haptic-feedback
```

Add to `babel.config.js`:
```javascript
plugins: ['react-native-reanimated/plugin']
```

---

**This complete specification ensures every interaction in CineSense feels premium, performant, and purposeful while maintaining 60fps on mid-range Android devices. Each animation is designed to enhance usability, not distract from it.**
