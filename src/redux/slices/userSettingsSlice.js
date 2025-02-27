import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  useMetricSystem: false,
  darkMode: false,
  pushNotifications: true,
  emailNotifications: false,
  locationServices: true,
  proximityAlerts: false,
};

const userSettingsSlice = createSlice({
  name: 'userSettings',
  initialState,
  reducers: {
    updateUserSettings: (state, action) => {
      return { ...state, ...action.payload };
    },
    resetSettings: () => initialState,
  },
});

export const { updateUserSettings, resetSettings } = userSettingsSlice.actions;
export default userSettingsSlice.reducer; 