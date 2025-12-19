import React, { useState } from 'react';
import { View, StyleSheet, Image } from 'react-native';
import Animated, { useAnimatedStyle, withTiming, useSharedValue } from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { colors } from '../../constants/theme';

const ProgressiveImage = ({ source, style, placeholderColor = colors.cardDark, ...props }) => {
  const [loaded, setLoaded] = useState(false);
  const opacity = useSharedValue(0);

  const handleLoad = () => {
    setLoaded(true);
    opacity.value = withTiming(1, { duration: 400 });
  };

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <View style={[style, styles.container]}>
      {/* Placeholder / Low-res blur */}
      {!loaded && (
        <View style={[StyleSheet.absoluteFill, { backgroundColor: placeholderColor }]}>
           {/* If we had a low-res URL we would put it here with a BlurView */}
           <BlurView intensity={30} style={StyleSheet.absoluteFill} tint="dark" />
        </View>
      )}
      
      <Animated.Image
        {...props}
        source={source}
        style={[style, animatedStyle]}
        onLoad={handleLoad}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    backgroundColor: colors.cardDark,
  },
});

export default ProgressiveImage;

