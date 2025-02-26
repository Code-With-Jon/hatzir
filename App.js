import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Provider } from 'react-redux';
import { store } from './src/redux/store';
import RootNavigator from './src/navigation';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './src/config/firebase';
import { setUser } from './src/redux/slices/authSlice';
import * as Notifications from 'expo-notifications';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export default function App() {
  useEffect(() => {
    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is signed in
        store.dispatch(
          setUser({
            uid: user.uid,
            email: user.email,
          })
        );
      } else {
        // User is signed out
        store.dispatch(setUser(null));
      }
    });

    // Cleanup subscription
    return unsubscribe;
  }, []);

  return (
    <Provider store={store}>
      <StatusBar style="auto" />
      <RootNavigator />
    </Provider>
  );
} 