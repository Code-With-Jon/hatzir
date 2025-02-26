import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { initializeFirestore, getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getFunctions } from 'firebase/functions';
import { Platform } from 'react-native';

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

// Initialize Auth
export const auth = getAuth(app);

// Initialize Firestore with settings
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true, // This may help with connectivity issues
  useFetchStreams: false,
});

// Enable offline persistence if not on web
if (Platform.OS !== 'web') {
  enableIndexedDbPersistence(db).catch((err) => {
    if (err.code === 'failed-precondition') {
      // Multiple tabs open, persistence can only be enabled in one tab at a time.
      console.log('Persistence failed: Multiple tabs open');
    } else if (err.code === 'unimplemented') {
      // The current browser doesn't support persistence
      console.log('Persistence not supported');
    }
  });
}

// Initialize Storage
export const storage = getStorage(app);

// Initialize Functions
export const functions = getFunctions(app);

export default app; 