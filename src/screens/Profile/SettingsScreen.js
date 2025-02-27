import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { updateUserSettings } from '../../redux/slices/userSettingsSlice'; // You'll need to create this

const SettingsScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const settings = useSelector(state => state.userSettings);

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color="#333" />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  const handleSettingChange = (setting, value) => {
    dispatch(updateUserSettings({ [setting]: value }));
  };

  const settingsSections = [
    {
      title: 'Display',
      settings: [
        {
          key: 'useMetricSystem',
          title: 'Use Metric System',
          description: 'Show distances in kilometers instead of miles',
          type: 'switch',
          value: settings.useMetricSystem,
        },
        {
          key: 'darkMode',
          title: 'Dark Mode',
          description: 'Enable dark mode throughout the app',
          type: 'switch',
          value: settings.darkMode,
        },
      ],
    },
    {
      title: 'Notifications',
      settings: [
        {
          key: 'pushNotifications',
          title: 'Push Notifications',
          description: 'Receive notifications about new incidents',
          type: 'switch',
          value: settings.pushNotifications,
        },
        {
          key: 'emailNotifications',
          title: 'Email Notifications',
          description: 'Receive email updates about incidents',
          type: 'switch',
          value: settings.emailNotifications,
        },
      ],
    },
    {
      title: 'Location',
      settings: [
        {
          key: 'locationServices',
          title: 'Location Services',
          description: 'Enable location-based features',
          type: 'switch',
          value: settings.locationServices,
        },
        {
          key: 'proximityAlerts',
          title: 'Proximity Alerts',
          description: 'Get notified about incidents near you',
          type: 'switch',
          value: settings.proximityAlerts,
        },
      ],
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {settingsSections.map((section, sectionIndex) => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            {section.settings.map((setting, settingIndex) => (
              <View key={setting.key} style={styles.settingItem}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingTitle}>{setting.title}</Text>
                  <Text style={styles.settingDescription}>
                    {setting.description}
                  </Text>
                </View>
                <Switch
                  value={setting.value}
                  onValueChange={(value) => 
                    handleSettingChange(setting.key, value)
                  }
                  trackColor={{ false: '#767577', true: '#81b0ff' }}
                  thumbColor={setting.value ? '#2196F3' : '#f4f3f4'}
                />
              </View>
            ))}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  section: {
    marginTop: 24,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginLeft: 16,
    marginBottom: 8,
    marginTop: -16,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingTitle: {
    fontSize: 16,
    color: '#333',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: '#666',
  },
  backButton: {
    marginLeft: 16,
    padding: 4,
  },
});

export default SettingsScreen; 