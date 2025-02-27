import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  GoogleAuthProvider,
  signInWithCredential,
  OAuthProvider
} from 'firebase/auth';
import { auth } from '../../config/firebase';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';

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
      // Create an OAuth provider for Apple
      const provider = new OAuthProvider('apple.com');
      
      // Create a credential with the token
      const oauthCredential = provider.credential({
        idToken: credential.identityToken,
        rawNonce: credential.nonce,
      });

      // Sign in with Firebase
      const userCredential = await signInWithCredential(auth, oauthCredential);
      
      // Return user data
      return {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        name: credential.fullName?.givenName 
          ? `${credential.fullName.givenName} ${credential.fullName.familyName}`
          : userCredential.user.displayName,
      };
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
      });
  },
});

export const { setUser, setLoading, setError, clearError } = authSlice.actions;
export default authSlice.reducer; 