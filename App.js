import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Provider } from 'react-redux';
import { store } from './src/redux/store';
import RootNavigator from './src/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './src/config/firebase';
import { setUser } from './src/redux/slices/authSlice';
import * as Notifications from 'expo-notifications';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Create a separate component for the auth listener
const AuthListener = () => {
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        store.dispatch(
          setUser({
            uid: user.uid,
            email: user.email,
          })
        );
      } else {
        store.dispatch(setUser(null));
      }
    });

    return unsubscribe;
  }, []);

  return null;
};

// Separate component for app content that uses theme
const ThemedApp = () => {
  const { isDarkMode } = useTheme();
  
  return (
    <>
      <StatusBar style={isDarkMode ? 'light' : 'dark'} />
      <RootNavigator />
    </>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <Provider store={store}>
        <AuthListener />
        <ThemedApp />
      </Provider>
    </ThemeProvider>
  );
} 