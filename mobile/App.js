import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import useAuthStore from './src/store/authStore';
import { colors } from './src/constants/theme';

// Screens
import LoginScreen from './src/screens/auth/LoginScreen';
import RegisterScreen from './src/screens/auth/RegisterScreen';
import HomeScreen from './src/screens/home/HomeScreen';
import WatchlistScreen from './src/screens/watchlist/WatchlistScreen';
import DiscoverScreen from './src/screens/discover/DiscoverScreen';
import AIRecommendationsScreen from './src/screens/ai/AIRecommendationsScreen';
import StatsScreen from './src/screens/stats/StatsScreen';
import ProfileScreen from './src/screens/profile/ProfileScreen';
import MediaDetailScreen from './src/screens/detail/MediaDetailScreen';
import EditProfileScreen from './src/screens/settings/EditProfileScreen';
import NotificationsScreen from './src/screens/settings/NotificationsScreen';
import AppearanceScreen from './src/screens/settings/AppearanceScreen';
import HelpScreen from './src/screens/settings/HelpScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Tab Navigator
function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
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

          return <Ionicons name={iconName} size={size} color={color} />;
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
  const { user, token, getMe } = useAuthStore();

  useEffect(() => {
    // Check if user is logged in and fetch user data
    if (token && !user) {
      getMe();
    }
  }, [token]);

  return (
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
        }}
      >
        {user ? (
          // Logged in screens
          <>
            <Stack.Screen 
              name="Main" 
              component={TabNavigator}
              options={{ headerShown: false }}
            />
            <Stack.Screen 
              name="MediaDetail" 
              component={MediaDetailScreen}
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
              name="Help" 
              component={HelpScreen}
              options={{ headerShown: false }}
            />
          </>
        ) : (
          // Auth screens
          <>
            <Stack.Screen 
              name="Login" 
              component={LoginScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen 
              name="Register" 
              component={RegisterScreen}
              options={{ title: 'Create Account' }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
