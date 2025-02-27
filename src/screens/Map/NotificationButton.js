import React from 'react';
import { TouchableOpacity, View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';

const NotificationButton = () => {
  const navigation = useNavigation();
  const { notifications } = useSelector(state => state.notifications);
  const hasUnread = notifications.some(n => !n.read);

  return (
    <TouchableOpacity
      style={styles.notificationButton}
      onPress={() => navigation.navigate('Notifications')}
    >
      <Ionicons 
        name={hasUnread ? "notifications" : "notifications-outline"} 
        size={24} 
        color="#333" 
      />
      {hasUnread && <View style={styles.badge} />}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  notificationButton: {
    padding: 8,
    marginRight: 8,
  },
  badge: {
    position: 'absolute',
    right: 6,
    top: 6,
    backgroundColor: '#e91e63',
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});

export default NotificationButton; 