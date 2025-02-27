import { configureStore } from '@reduxjs/toolkit';
import incidentsReducer from './slices/incidentsSlice';
import authReducer from './slices/authSlice';
import notificationsReducer from './slices/notificationsSlice';

export const store = configureStore({
  reducer: {
    incidents: incidentsReducer,
    auth: authReducer,
    notifications: notificationsReducer,
  },
}); 