import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
  Image,
  SafeAreaView
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
  const { user } = useSelector(state => state.auth);
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
    try {
      await dispatch(logoutUser()).unwrap();
    } catch (error) {
      Alert.alert('Logout Error', error.message);
    }
  };

  const menuItems = [
    {
      icon: 'settings-outline',
      title: 'Settings',
      onPress: () => navigation.navigate('Settings'),
    },
    {
      icon: 'notifications-outline',
      title: 'Notifications',
      onPress: () => navigation.navigate('Notifications'),
    },
    {
      icon: 'information-circle-outline',
      title: 'About',
      onPress: () => navigation.navigate('About'),
    },
    {
      icon: 'shield-outline',
      title: 'Privacy Policy',
      onPress: () => navigation.navigate('PrivacyPolicy'),
    },
    {
      icon: 'log-out-outline',
      title: 'Logout',
      onPress: handleLogout,
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.userInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.email?.[0]?.toUpperCase() || 'U'}
            </Text>
          </View>
          <Text style={styles.email}>{user?.email}</Text>
          <Text style={styles.displayName}>{user?.displayName}</Text>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => navigation.navigate('EditProfile')}
          >
            <Text style={styles.editButtonText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.menu}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.menuItem}
              onPress={item.onPress}
            >
              <Ionicons name={item.icon} size={24} color="#333" />
              <Text style={styles.menuItemText}>{item.title}</Text>
              <Ionicons name="chevron-forward" size={24} color="#ccc" />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  content: {
    flex: 1,
  },
  userInfo: {
    alignItems: 'center',
    padding: 20,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#e91e63',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 32,
    color: '#fff',
    fontWeight: 'bold',
  },
  email: {
    fontSize: 16,
    color: '#333',
  },
  menu: {
    paddingHorizontal: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  menuItemText: {
    flex: 1,
    marginLeft: 16,
    fontSize: 16,
    color: '#333',
  },
  displayName: {
    fontSize: 18,
    color: '#333',
    fontWeight: '600',
    marginTop: 4,
  },
  editButton: {
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 12,
  },
  editButtonText: {
    color: '#e91e63',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default ProfileScreen; 