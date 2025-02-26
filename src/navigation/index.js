import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';

// Auth Screens
import LoginScreen from '../screens/Auth/LoginScreen';
import RegisterScreen from '../screens/Auth/RegisterScreen';

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
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Register" component={RegisterScreen} />
  </Stack.Navigator>
);

// Map Stack Navigator
const MapStackNavigator = () => (
  <Stack.Navigator>
    <Stack.Screen name="Map" component={MapScreen} options={{ headerShown: false }} />
    <Stack.Screen name="IncidentDetails" component={IncidentDetailsScreen} options={{ title: 'Incident Details' }} />
  </Stack.Navigator>
);

// Reports Stack Navigator
const ReportsStackNavigator = () => (
  <Stack.Navigator>
    <Stack.Screen name="IncidentFeed" component={IncidentFeedScreen} options={{ title: 'Incidents' }} />
    <Stack.Screen name="ReportIncident" component={ReportIncidentScreen} options={{ title: 'Report Incident' }} />
    <Stack.Screen name="IncidentDetails" component={IncidentDetailsScreen} options={{ title: 'Incident Details' }} />
  </Stack.Navigator>
);

// Profile Stack Navigator
const ProfileStackNavigator = () => (
  <Stack.Navigator>
    <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: 'My Profile' }} />
    <Stack.Screen name="Notifications" component={NotificationsScreen} options={{ title: 'Notifications' }} />
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
          iconName = focused ? 'list' : 'list-outline';
        } else if (route.name === 'ProfileTab') {
          iconName = focused ? 'person' : 'person-outline';
        }

        return <Ionicons name={iconName} size={size} color={color} />;
      },
    })}
    tabBarOptions={{
      activeTintColor: '#e91e63',
      inactiveTintColor: 'gray',
    }}
  >
    <Tab.Screen 
      name="MapTab" 
      component={MapStackNavigator} 
      options={{ title: 'Map', headerShown: false }}
    />
    <Tab.Screen 
      name="ReportsTab" 
      component={ReportsStackNavigator} 
      options={{ title: 'Reports', headerShown: false }}
    />
    <Tab.Screen 
      name="ProfileTab" 
      component={ProfileStackNavigator} 
      options={{ title: 'Profile', headerShown: false }}
    />
  </Tab.Navigator>
);

// Root Navigator
const RootNavigator = () => {
  const user = useSelector(state => state.auth.user);
  
  return (
    <NavigationContainer>
      {user ? <MainTabNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
};

export default RootNavigator; 