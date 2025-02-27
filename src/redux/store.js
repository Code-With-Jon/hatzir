import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import incidentsReducer from './slices/incidentsSlice';
import notificationsReducer from './slices/notificationsSlice';
import userSettingsReducer from './slices/userSettingsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    incidents: incidentsReducer,
    notifications: notificationsReducer,
    userSettings: userSettingsReducer,
  },
}); 