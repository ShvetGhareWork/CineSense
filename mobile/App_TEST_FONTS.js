import { registerRootComponent } from 'expo';
import React, { useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { 
  useFonts,
  PlusJakartaSans_700Bold,
} from '@expo-google-fonts/plus-jakarta-sans';
import {
  Inter_400Regular,
} from '@expo-google-fonts/inter';
import * as SplashScreen from 'expo-splash-screen';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

function App() {
  const [fontsLoaded] = useFonts({
    PlusJakartaSans_700Bold,
    Inter_400Regular,
  });

  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={styles.container} onLayout={onLayoutRootView}>
      <Text style={[styles.text, { fontFamily: 'PlusJakartaSans_700Bold' }]}>
        Test 3: Fonts loaded!
      </Text>
      <Text style={[styles.text, { fontFamily: 'Inter_400Regular', marginTop: 10 }]}>
        Inter font works too!
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: '#fff',
    fontSize: 18,
  },
});

registerRootComponent(App);
