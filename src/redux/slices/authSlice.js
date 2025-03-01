import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  GoogleAuthProvider,
  signInWithCredential,
  OAuthProvider,
  updateProfile,
  updateEmail,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential
} from 'firebase/auth';
import { auth } from '../../config/firebase';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';

// Make sure to call this at app startup
WebBrowser.maybeCompleteAuthSession();

// Async thunks for authentication
export const registerUser = createAsyncThunk(
  'auth/register',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      return { uid: userCredential.user.uid, email: userCredential.user.email };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const loginUser = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return { uid: userCredential.user.uid, email: userCredential.user.email };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await signOut(auth);
      return null;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const googleLogin = createAsyncThunk(
  'auth/googleLogin',
  async (idToken, { rejectWithValue }) => {
    try {
      // Create a credential with the token
      const credential = GoogleAuthProvider.credential(idToken);
      
      // Sign in with Firebase
      const userCredential = await signInWithCredential(auth, credential);
      
      return {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        displayName: userCredential.user.displayName
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const appleLogin = createAsyncThunk(
  'auth/appleLogin',
  async (credential, { rejectWithValue }) => {
    try {
      console.log('Starting Apple login with credential:', credential);
      
      const provider = new OAuthProvider('apple.com');
      const oauthCredential = provider.credential({
        idToken: credential.identityToken,
        rawNonce: credential.nonce,
      });

      const userCredential = await signInWithCredential(auth, oauthCredential);
      
      // Check if we got a name from Apple (first-time sign-in)
      let displayName = null;
      if (credential.fullName?.givenName) {
        displayName = `${credential.fullName.givenName} ${credential.fullName.familyName || ''}`.trim();
        try {
          // Store the name in Firestore
          await setDoc(doc(db, 'users', userCredential.user.uid), {
            displayName,
            email: userCredential.user.email,
            updatedAt: new Date().toISOString(),
          }, { merge: true });
          
          // Update Firebase Auth profile
          await updateProfile(auth.currentUser, { displayName });
        } catch (firestoreError) {
          console.log('Failed to save user data to Firestore:', firestoreError);
          // Continue with the login process even if Firestore update fails
        }
      } else {
        try {
          // Try to get the name from Firestore
          const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
          if (userDoc.exists()) {
            displayName = userDoc.data().displayName;
          }
        } catch (firestoreError) {
          console.log('Failed to fetch user data from Firestore:', firestoreError);
          // Use Firebase Auth display name as fallback
          displayName = userCredential.user.displayName;
        }
      }

      // Return user data
      const userData = {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        name: displayName || userCredential.user.displayName,
      };
      
      console.log('Returning user data:', userData);
      return userData;
    } catch (error) {
      console.error('Apple login error:', error);
      return rejectWithValue(error.message);
    }
  }
);

export const updateUserProfile = createAsyncThunk(
  'auth/updateProfile',
  async ({ displayName }, { rejectWithValue }) => {
    try {
      await updateProfile(auth.currentUser, { displayName });
      return { displayName };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateUserEmail = createAsyncThunk(
  'auth/updateEmail',
  async ({ newEmail, password }, { rejectWithValue }) => {
    try {
      const credential = EmailAuthProvider.credential(
        auth.currentUser.email,
        password
      );
      await reauthenticateWithCredential(auth.currentUser, credential);
      await updateEmail(auth.currentUser, newEmail);
      return { email: newEmail };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateUserPassword = createAsyncThunk(
  'auth/updatePassword',
  async ({ currentPassword, newPassword }, { rejectWithValue }) => {
    try {
      const credential = EmailAuthProvider.credential(
        auth.currentUser.email,
        currentPassword
      );
      await reauthenticateWithCredential(auth.currentUser, credential);
      await updatePassword(auth.currentUser, newPassword);
      return null;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const registerForPushNotifications = createAsyncThunk(
  'auth/registerPushNotifications',
  async (userId, { rejectWithValue }) => {
    try {
      // Your push notification registration logic here
      // This might include getting the token from Expo notifications
      // and saving it to your backend/Firebase
      return userId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  user: null,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
      })
      .addCase(googleLogin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(googleLogin.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(googleLogin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(appleLogin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(appleLogin.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(appleLogin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.user = { ...state.user, ...action.payload };
      })
      .addCase(updateUserEmail.fulfilled, (state, action) => {
        state.user = { ...state.user, ...action.payload };
      });
  },
});

export const { setUser, setLoading, setError, clearError } = authSlice.actions;
export default authSlice.reducer; 