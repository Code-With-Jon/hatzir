import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { Platform } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { lightTheme, darkTheme } from '../theme/colors';
import { DefaultTheme } from '@react-navigation/native';

// Auth Screens
import LandingScreen from '../screens/Auth/LandingScreen';
import LoginScreen from '../screens/Auth/LoginScreen';
import RegisterScreen from '../screens/Auth/RegisterScreen';
import SocialVerificationScreen from '../screens/Auth/SocialVerificationScreen';

// Main App Screens
import MapScreen from '../screens/Map/MapScreen';
import IncidentDetailsScreen from '../screens/Map/IncidentDetailsScreen';
import ReportIncidentScreen from '../screens/Reports/ReportIncidentScreen';
import IncidentFeedScreen from '../screens/Reports/IncidentFeedScreen';
import ProfileScreen from '../screens/Profile/ProfileScreen';
import NotificationsScreen from '../screens/Profile/NotificationsScreen';
import AboutScreen from '../screens/Profile/AboutScreen';
import PrivacyPolicyScreen from '../screens/Profile/PrivacyPolicyScreen';
import EditProfileScreen from '../screens/Profile/EditProfileScreen';
import NotificationButton from '../screens/Map/NotificationButton';
import SettingsScreen from '../screens/Profile/SettingsScreen';
import EditIncidentScreen from '../screens/Reports/EditIncidentScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Auth Navigator
const AuthNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Landing" component={LandingScreen} />
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Register" component={RegisterScreen} />
    <Stack.Screen name="SocialVerification" component={SocialVerificationScreen} />
  </Stack.Navigator>
);

// Main Tab Navigator
const MainTabNavigator = () => {
  const { isDarkMode } = useTheme();
  const theme = isDarkMode ? darkTheme : lightTheme;

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.textSecondary,
        tabBarStyle: {
          backgroundColor: theme.tabBar,
          borderTopColor: theme.border,
          borderTopWidth: 1,
        },
        headerStyle: {
          backgroundColor: theme.background,
          borderBottomColor: theme.border,
          borderBottomWidth: 1,
        },
        headerTintColor: theme.text,
      }}
    >
      <Tab.Screen 
        name="MapTab" 
        component={MapScreen} 
        options={{ 
          headerShown: false,
          title: 'Map',
          tabBarIcon: ({ focused, color }) => (
            <Ionicons name={focused ? 'map' : 'map-outline'} size={24} color={color} />
          ),
        }} 
      />
      <Tab.Screen 
        name="ReportsTab" 
        component={IncidentFeedScreen} 
        options={{ 
          title: 'Reports',
          tabBarIcon: ({ focused, color }) => (
            <Ionicons name={focused ? 'document-text' : 'document-text-outline'} size={24} color={color} />
          ),
        }} 
      />
      <Tab.Screen 
        name="ProfileTab" 
        component={ProfileScreen} 
        options={{ 
          title: 'Profile',
          tabBarIcon: ({ focused, color }) => (
            <Ionicons name={focused ? 'person' : 'person-outline'} size={24} color={color} />
          ),
        }} 
      />
    </Tab.Navigator>
  );
};

// Root Navigator
const RootNavigator = () => {
  const user = useSelector(state => state.auth.user);
  const { isDarkMode } = useTheme();
  const theme = isDarkMode ? darkTheme : lightTheme;
  
  // Create a complete navigation theme with all required properties
  const navigationTheme = {
    dark: isDarkMode,
    colors: {
      primary: theme.primary,
      background: theme.background,
      card: theme.surface,
      text: theme.text,
      border: theme.border,
      notification: theme.primary,
    },
    // Add missing typography properties
    fonts: {
      regular: {
        fontFamily: 'System',
        fontWeight: '400',
      },
      medium: {
        fontFamily: 'System',
        fontWeight: '500',
      },
      light: {
        fontFamily: 'System',
        fontWeight: '300',
      },
      thin: {
        fontFamily: 'System',
        fontWeight: '100',
      },
    },
  };
  
  return (
    <NavigationContainer theme={navigationTheme}>
      <Stack.Navigator 
        screenOptions={{ 
          headerShown: false,
          headerStyle: {
            backgroundColor: theme.background,
            borderBottomColor: theme.border,
            borderBottomWidth: 1,
          },
          headerTintColor: theme.text,
          headerTitleStyle: {
            color: theme.text,
          },
          cardStyle: {
            backgroundColor: theme.background,
          },
          headerBackTitle: ' ',
        }}
      >
        {!user ? (
          // Auth Stack
          <Stack.Screen name="Auth" component={AuthNavigator} />
        ) : (
          // App Stack
          <>
            <Stack.Screen name="MainTabs" component={MainTabNavigator} />
            <Stack.Screen 
              name="IncidentDetails" 
              component={IncidentDetailsScreen} 
              options={{ headerShown: true, title: 'Incident Details' }}
            />
            <Stack.Screen 
              name="ReportIncident" 
              component={ReportIncidentScreen} 
              options={{ headerShown: true, title: 'Report Incident' }}
            />
            <Stack.Screen 
              name="Notifications" 
              component={NotificationsScreen} 
              options={{ 
                headerShown: true, 
                title: 'Notifications',
                headerBackTitle: ' ',
              }} 
            />
            <Stack.Screen 
              name="About" 
              component={AboutScreen} 
              options={{ headerShown: true, title: 'About' }}
            />
            <Stack.Screen 
              name="PrivacyPolicy" 
              component={PrivacyPolicyScreen} 
              options={{ headerShown: true, title: 'Privacy Policy' }}
            />
            <Stack.Screen 
              name="EditProfile" 
              component={EditProfileScreen} 
              options={{ 
                headerShown: true, 
                title: 'Edit Profile',
                headerBackTitle: ' ',
              }} 
            />
            <Stack.Screen 
              name="Settings" 
              component={SettingsScreen}
              options={{
                headerShown: true,
                title: 'Settings',
                headerShadowVisible: false,
              }} 
            />
            <Stack.Screen 
              name="EditIncident" 
              component={EditIncidentScreen}
              options={{
                title: 'Edit Incident',
                headerTitleAlign: 'center',
              }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default RootNavigator; 