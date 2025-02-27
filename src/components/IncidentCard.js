import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useSelector } from 'react-redux';

const IncidentCard = ({ incident, onPress, userLocation }) => {
  const { useMetricSystem } = useSelector(state => state.userSettings);

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = useMetricSystem ? 6371 : 3959; // Earth's radius in km or miles
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c; // Distance in km or miles
    return distance;
  };

  // Debug log
  console.log('IncidentCard props:', {
    id: incident.id,
    votes: incident.votes,
    commentCount: incident.commentCount,
    flagCount: incident.flagCount
  });

  // Format location string
  const getLocationString = () => {
    if (incident.locationDetails?.city && incident.locationDetails?.state) {
      return `${incident.locationDetails.city}, ${incident.locationDetails.state}`;
    }
    return 'Location unknown';
  };

  const getDistanceText = () => {
    if (!userLocation || !incident.location) return null;
    
    const distance = calculateDistance(
      userLocation.latitude,
      userLocation.longitude,
      incident.location.latitude,
      incident.location.longitude
    );
    
    if (distance < 1) {
      if (useMetricSystem) {
        return `${(distance * 1000).toFixed(0)}m away`;
      } else {
        return `${(distance * 5280).toFixed(0)}ft away`;
      }
    }
    return `${distance.toFixed(1)}${useMetricSystem ? 'km' : 'mi'} away`;
  };

  const distanceText = getDistanceText();

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.header}>
        <Text style={styles.title} numberOfLines={1}>
          {incident.title}
        </Text>
        <Text style={styles.date}>
          {new Date(incident.createdAt).toLocaleDateString()}
        </Text>
      </View>
      <Text style={styles.description} numberOfLines={2}>
        {incident.description}
      </Text>
      <View style={styles.footer}>
        <View style={styles.locationContainer}>
          <View style={styles.locationRow}>
            <Ionicons name="location" size={12} color="#666" />
            <Text style={styles.location}>
              {getLocationString()}
            </Text>
          </View>
          <View style={styles.bottomRow}>
            <View style={styles.statsContainer}>
              <View style={styles.stat}>
                <Ionicons name="arrow-up" size={16} color="#4CAF50" />
                <Text style={[styles.statText, styles.voteText]}>
                  {incident.votes || 0}
                </Text>
              </View>
              <View style={styles.stat}>
                <Ionicons name="chatbubble-outline" size={16} color="#2196F3" />
                <Text style={[styles.statText, styles.commentText]}>
                  {incident.commentCount || 0}
                </Text>
              </View>
              <View style={styles.stat}>
                <Ionicons name="flag-outline" size={16} color="#F44336" />
                <Text style={[styles.statText, styles.flagText]}>
                  {incident.flagCount || 0}
                </Text>
              </View>
            </View>
            {distanceText && (
              <View style={styles.distanceContainer}>
                <Ionicons name="navigate" size={12} color="#999" />
                <Text style={styles.distance}>
                  {distanceText}
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 8,
  },
  date: {
    fontSize: 12,
    color: '#666',
  },
  description: {
    fontSize: 14,
    color: '#444',
    marginBottom: 12,
  },
  footer: {
    marginTop: 8,
  },
  locationContainer: {
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  distanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  statText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#666',
  },
  voteText: {
    color: '#4CAF50',
  },
  commentText: {
    color: '#2196F3',
  },
  flagText: {
    color: '#F44336',
  },
  location: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
  },
  distance: {
    fontSize: 12,
    color: '#999',
    marginLeft: 4,
  },
});

export default IncidentCard; 