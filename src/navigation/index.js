import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';

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
const MainTabNavigator = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ focused, color, size }) => {
        let iconName;
        if (route.name === 'MapTab') {
          iconName = focused ? 'map' : 'map-outline';
        } else if (route.name === 'ReportsTab') {
          iconName = focused ? 'document-text' : 'document-text-outline';
        } else if (route.name === 'ProfileTab') {
          iconName = focused ? 'person' : 'person-outline';
        }
        return <Ionicons name={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: '#e91e63',
      tabBarInactiveTintColor: 'gray',
    })}
  >
    <Tab.Screen 
      name="MapTab" 
      component={MapScreen} 
      options={{ 
        headerShown: false,
        title: 'Map'
      }} 
    />
    <Tab.Screen 
      name="ReportsTab" 
      component={IncidentFeedScreen} 
      options={{ 
        title: 'Reports'
      }} 
    />
    <Tab.Screen 
      name="ProfileTab" 
      component={ProfileScreen} 
      options={{ 
        title: 'Profile'
      }} 
    />
  </Tab.Navigator>
);

// Root Navigator
const RootNavigator = () => {
  const user = useSelector(state => state.auth.user);
  
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
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
              options={{ headerShown: true, title: 'Notifications' }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default RootNavigator; 