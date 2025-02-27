import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { initializeFirestore, getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getFunctions } from 'firebase/functions';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDYHNnh09tCEd0XNJGqXY0RauOfmfeChr8",
  authDomain: "hatzir-38b6e.firebaseapp.com",
  projectId: "hatzir-38b6e",
  storageBucket: "hatzir-38b6e.firebasestorage.app",
  messagingSenderId: "861494268063",
  appId: "1:861494268063:web:c6d85f25a4854015fc92aa",
  measurementId: "G-PGLFY8HFW6"
};


// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth with persistence
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

// Initialize Firestore with settings for React Native
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
  useFetchStreams: false
});

// Initialize Storage
export const storage = getStorage(app);

// Initialize Functions
export const functions = getFunctions(app);

export default app; 