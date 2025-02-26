import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
  Image
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { logoutUser } from '../../redux/slices/authSlice';
import { registerForPushNotifications } from '../../redux/slices/notificationsSlice';

const SettingItem = ({ icon, title, value, onPress, isSwitch = false }) => (
  <TouchableOpacity 
    style={styles.settingItem}
    onPress={!isSwitch ? onPress : null}
  >
    <View style={styles.settingLeft}>
      <Ionicons name={icon} size={24} color="#666" />
      <Text style={styles.settingTitle}>{title}</Text>
    </View>
    {isSwitch ? (
      <Switch
        value={value}
        onValueChange={onPress}
        trackColor={{ false: "#767577", true: "#81b0ff" }}
        thumbColor={value ? "#2196F3" : "#f4f3f4"}
      />
    ) : (
      <View style={styles.settingRight}>
        {value && <Text style={styles.settingValue}>{value}</Text>}
        <Ionicons name="chevron-forward" size={24} color="#666" />
      </View>
    )}
  </TouchableOpacity>
);

const ProfileScreen = ({ navigation }) => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [locationEnabled, setLocationEnabled] = useState(false);
  
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);
  const { token: notificationToken } = useSelector(state => state.notifications);

  useEffect(() => {
    setNotificationsEnabled(!!notificationToken);
  }, [notificationToken]);

  const handleNotificationToggle = async (value) => {
    try {
      if (value) {
        await dispatch(registerForPushNotifications(user.uid)).unwrap();
        setNotificationsEnabled(true);
      } else {
        // TODO: Implement notification deregistration
        setNotificationsEnabled(false);
      }
    } catch (error) {
      Alert.alert('Error', 'Could not update notification settings');
      setNotificationsEnabled(!value);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Confirm Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await dispatch(logoutUser()).unwrap();
            } catch (error) {
              Alert.alert('Error', 'Could not logout. Please try again.');
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Image
            source={{ uri: 'https://ui-avatars.com/api/?name=' + user.email }}
            style={styles.avatar}
          />
          <Text style={styles.email}>{user.email}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notifications</Text>
        <SettingItem
          icon="notifications"
          title="Push Notifications"
          value={notificationsEnabled}
          onPress={handleNotificationToggle}
          isSwitch
        />
        <SettingItem
          icon="location"
          title="Location Services"
          value={locationEnabled}
          onPress={setLocationEnabled}
          isSwitch
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        <SettingItem
          icon="person"
          title="Edit Profile"
          onPress={() => {}}
        />
        <SettingItem
          icon="notifications"
          title="Notifications"
          onPress={() => navigation.navigate('Notifications')}
        />
        <SettingItem
          icon="shield"
          title="Privacy Policy"
          onPress={() => {}}
        />
        <SettingItem
          icon="information-circle"
          title="About"
          onPress={() => {}}
        />
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  avatarContainer: {
    alignItems: 'center',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  email: {
    fontSize: 16,
    color: '#333',
    marginTop: 8,
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 20,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 20,
    marginBottom: 10,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingTitle: {
    fontSize: 16,
    color: '#333',
    marginLeft: 15,
  },
  settingRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingValue: {
    fontSize: 16,
    color: '#666',
    marginRight: 10,
  },
  logoutButton: {
    margin: 20,
    padding: 15,
    backgroundColor: '#F44336',
    borderRadius: 8,
    alignItems: 'center',
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ProfileScreen; 