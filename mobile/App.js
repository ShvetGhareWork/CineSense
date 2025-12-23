import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { colors } from './src/constants/theme';
import Toast from './src/components/common/Toast';
import { registerToast } from './src/utils/toast';

// Auth Screens
import LoginScreen from './src/screens/auth/LoginScreen';
import RegisterScreen from './src/screens/auth/RegisterScreen';

// Screens
import HomeScreen from './src/screens/home/HomeScreen';
import WatchlistScreen from './src/screens/watchlist/WatchlistScreen';
import DiscoverScreen from './src/screens/discover/DiscoverScreen';
import AIRecommendationsScreen from './src/screens/ai/AIRecommendationsScreen';
import StatsScreen from './src/screens/stats/StatsScreen';
import AchievementsScreen from './src/screens/stats/AchievementsScreen';
import ProfileScreen from './src/screens/profile/ProfileScreen';
import MediaDetailScreen from './src/screens/detail/MediaDetailScreen';
import PersonProfileScreen from './src/screens/person/PersonProfileScreen';
import EditProfileScreen from './src/screens/settings/EditProfileScreen';
import NotificationsScreen from './src/screens/settings/NotificationsScreen';
import AppearanceScreen from './src/screens/settings/AppearanceScreen';
import HelpScreen from './src/screens/settings/HelpScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Animated Tab Icon Component
const AnimatedTabIcon = ({ focused, iconName, size }) => {
  const translateY = useSharedValue(focused ? -2 : 0);

  React.useEffect(() => {
    translateY.value = withSpring(focused ? -2 : 0, { damping: 15 });
  }, [focused]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const iconColor = focused ? colors.electricPurple : colors.softGrey;

  return (
    <Animated.View style={animatedStyle}>
      <Ionicons name={iconName} size={size} color={iconColor} />
    </Animated.View>
  );
};

// Tab Navigator
function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Watchlist') {
            iconName = focused ? 'list' : 'list-outline';
          } else if (route.name === 'Discover') {
            iconName = focused ? 'compass' : 'compass-outline';
          } else if (route.name === 'AI') {
            iconName = focused ? 'sparkles' : 'sparkles-outline';
          } else if (route.name === 'Stats') {
            iconName = focused ? 'stats-chart' : 'stats-chart-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <AnimatedTabIcon focused={focused} iconName={iconName} size={size} />;
        },
        tabBarActiveTintColor: colors.electricPurple,
        tabBarInactiveTintColor: colors.softGrey,
        tabBarStyle: {
          backgroundColor: colors.charcoal,
          borderTopColor: colors.cardDark,
        },
        headerStyle: {
          backgroundColor: colors.charcoal,
        },
        headerTintColor: colors.textPrimary,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Watchlist" component={WatchlistScreen} />
      <Tab.Screen name="Discover" component={DiscoverScreen} />
      <Tab.Screen name="AI" component={AIRecommendationsScreen} options={{ title: 'AI Picks' }} />
      <Tab.Screen name="Stats" component={StatsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        <StatusBar style="light" />
        <Stack.Navigator
          screenOptions={{
            headerStyle: {
              backgroundColor: colors.charcoal,
            },
            headerTintColor: colors.textPrimary,
            cardStyle: {
              backgroundColor: colors.midnight,
            },
            cardStyleInterpolator: ({ current }) => ({
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
            transitionSpec: {
              open: {
                animation: 'timing',
                config: { duration: 300 },
              },
              close: {
                animation: 'timing',
                config: { duration: 250 },
              },
            },
          }}
        >
          <Stack.Screen 
            name="Main" 
            component={TabNavigator}
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="Login" 
            component={LoginScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="Register" 
            component={RegisterScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="MediaDetail" 
            component={MediaDetailScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="PersonProfile" 
            component={PersonProfileScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="EditProfile" 
            component={EditProfileScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="Notifications" 
            component={NotificationsScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="Appearance" 
            component={AppearanceScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="Achievements" 
            component={AchievementsScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="Help" 
            component={HelpScreen}
            options={{ headerShown: false }}
          />
        </Stack.Navigator>
      </NavigationContainer>
      <Toast ref={(ref) => registerToast(ref)} />
    </GestureHandlerRootView>
  );
}
