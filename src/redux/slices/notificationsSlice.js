import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as Notifications from 'expo-notifications';
import { collection, addDoc, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '../../config/firebase';

export const registerForPushNotifications = createAsyncThunk(
  'notifications/register',
  async (userId, { rejectWithValue }) => {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        throw new Error('Permission not granted for notifications');
      }
      
      const token = (await Notifications.getExpoPushTokenAsync()).data;
      
      // Save token to Firestore
      await addDoc(collection(db, 'tokens'), {
        userId,
        token,
        createdAt: new Date()
      });
      
      return token;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchUserNotifications = createAsyncThunk(
  'notifications/fetchUserNotifications',
  async (userId, { rejectWithValue }) => {
    try {
      const notificationsRef = collection(db, 'notifications');
      const q = query(
        notificationsRef, 
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const notifications = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        notifications.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate?.() || new Date()
        });
      });
      
      return notifications;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState = {
  token: null,
  notifications: [],
  isLoading: false,
  error: null,
};

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    clearNotificationsError: (state) => {
      state.error = null;
    },
    addNotification: (state, action) => {
      state.notifications.unshift(action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerForPushNotifications.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerForPushNotifications.fulfilled, (state, action) => {
        state.isLoading = false;
        state.token = action.payload;
      })
      .addCase(registerForPushNotifications.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchUserNotifications.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserNotifications.fulfilled, (state, action) => {
        state.isLoading = false;
        state.notifications = action.payload;
      })
      .addCase(fetchUserNotifications.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearNotificationsError, addNotification } = notificationsSlice.actions;
export default notificationsSlice.reducer; 