import React, { useState, useEffect, useRef } from 'react';
import { 
  StyleSheet, 
  View, 
  Text,
  TouchableOpacity,
  Dimensions,
  Platform,
  Alert
} from 'react-native';
import MapView, { Marker, Callout, PROVIDER_GOOGLE } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useDispatch, useSelector } from 'react-redux';
import { fetchIncidents } from '../../redux/slices/incidentsSlice';
import { FAB } from 'react-native-elements';
import { collection, query, getDocs, onSnapshot } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useTheme } from '../../context/ThemeContext';
import { lightTheme, darkTheme } from '../../theme/colors';
import { lightMapStyle, darkMapStyle } from '../../theme/mapStyles';

const { width, height } = Dimensions.get('window');

// Helper function to format the time elapsed
const getTimeElapsed = (date) => {
  const now = new Date();
  const incidentDate = new Date(date);
  const diffInSeconds = Math.floor((now - incidentDate) / 1000);
  
  if (diffInSeconds < 60) {
    return 'Just now';
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`;
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  }
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) {
    return `${diffInDays}d ago`;
  }
  
  const diffInMonths = Math.floor(diffInDays / 30);
  return `${diffInMonths}mo ago`;
};

const MapScreen = ({ navigation }) => {
  const [incidents, setIncidents] = useState([]);
  const [region, setRegion] = useState({
    latitude: 31.7683,  // Default to Israel center
    longitude: 35.2137,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const [userLocation, setUserLocation] = useState(null);
  const mapRef = useRef(null);
  const dispatch = useDispatch();
  const { isLoading } = useSelector(state => state.incidents);
  
  // Add this new state to force map updates
  const [mapReady, setMapReady] = useState(false);

  const { isDarkMode } = useTheme();
  const theme = isDarkMode ? darkTheme : lightTheme;

  // Add this function to handle map ready event
  const onMapReady = () => {
    setMapReady(true);
  };

  // Add this effect to force map to update when markers change
  useEffect(() => {
    if (mapReady && mapRef.current) {
      // Force map to update by slightly moving the region
      mapRef.current.animateToRegion({
        ...region,
        latitude: region.latitude + 0.000001
      }, 1);
    }
  }, [incidents, mapReady]);

  useEffect(() => {
    // Set up real-time listener for incidents
    const incidentsRef = collection(db, 'incidents');
    const unsubscribe = onSnapshot(incidentsRef, (snapshot) => {
      const incidentsList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setIncidents(incidentsList);
    }, (error) => {
      console.error("Error fetching incidents:", error);
    });

    getLocationPermission();

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const getLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Permission to access location was denied');
        return;
      }
      
      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;
      
      setUserLocation({ latitude, longitude });
      setRegion({
        latitude,
        longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });
      
      if (mapRef.current) {
        mapRef.current.animateToRegion({
          latitude,
          longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        });
      }
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert('Error', 'Could not get your current location');
    }
  };
  
  const goToUserLocation = () => {
    if (userLocation && mapRef.current) {
      mapRef.current.animateToRegion({
        ...userLocation,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });
    } else {
      getLocationPermission();
    }
  };
  
  const handleReportPress = () => {
    navigation.navigate('ReportsTab', { screen: 'ReportIncident' });
  };
  
  // Add this check for iOS simulator
  const mapProvider = Platform.select({
    ios: undefined, // Use default Apple Maps on iOS
    android: 'google', // Use Google Maps on Android
  });

  const hasUnread = false; // Replace with actual logic to determine if there are unread notifications

  const handleIncidentPress = (incident) => {
    navigation.navigate('IncidentDetails', { incident });
  };

  useEffect(() => {
    console.log('Current incidents:', incidents);
  }, [incidents]);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <MapView
        ref={mapRef}
        style={styles.map}
        customMapStyle={isDarkMode ? darkMapStyle : lightMapStyle}
        provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
        initialRegion={region}
        onRegionChangeComplete={setRegion}
        showsUserLocation
        showsMyLocationButton={false}
        onMapReady={onMapReady}
        maxZoomLevel={20}
        minZoomLevel={0}
      >
        {mapReady && incidents.map(incident => {
          console.log('Rendering incident:', incident);
          return (
            <Marker
              key={incident.id}
              coordinate={{
                latitude: incident.location.latitude,
                longitude: incident.location.longitude
              }}
              pinColor="#e91e63"
              tracksViewChanges={false}
            >
              <Callout
                tooltip
                onPress={() => handleIncidentPress(incident)}
              >
                <View style={[styles.calloutContainer, { backgroundColor: isDarkMode ? theme.surface : '#fff' }]}>
                  <Text style={[styles.calloutTitle, { color: isDarkMode ? '#fff' : '#333' }]} numberOfLines={1}>
                    {incident?.title || 'No Title'}
                  </Text>
                  <Text style={[styles.calloutDescription, { color: isDarkMode ? '#ccc' : '#666' }]} numberOfLines={2}>
                    {incident?.description || 'No Description'}
                  </Text>
                  <Text style={[styles.calloutDate, { color: isDarkMode ? '#999' : '#999' }]}>
                    {incident?.createdAt ? new Date(incident.createdAt).toLocaleDateString() : 'No Date'}
                  </Text>
                </View>
              </Callout>
            </Marker>
          );
        })}
      </MapView>
      
      <View style={[styles.header, { backgroundColor: isDarkMode ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.9)' }]}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Incident Map</Text>
        <TouchableOpacity
          style={[styles.headerNotification, { backgroundColor: isDarkMode ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.9)' }]}
          onPress={() => navigation.navigate('Notifications')}
        >
          <Ionicons 
            name={hasUnread ? "notifications" : "notifications-outline"} 
            size={24} 
            color={theme.text} 
          />
          {hasUnread && <View style={[styles.notificationBadge, { backgroundColor: theme.primary }]} />}
        </TouchableOpacity>
      </View>
      
      <TouchableOpacity
        style={[styles.locationButton, { backgroundColor: theme.background }]}
        onPress={goToUserLocation}
      >
        <Ionicons name="locate" size={24} color={theme.text} />
      </TouchableOpacity>
      
      <FAB
        title="Report Incident"
        icon={<Ionicons name="warning-outline" size={24} color={theme.text} />}
        color={theme.primary}
        style={[styles.fab, { backgroundColor: theme.primary }]}
        onPress={handleReportPress}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width,
    height,
  },
  header: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginHorizontal: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerNotification: {
    padding: 8,
    borderRadius: 20,
    position: 'absolute',
    right: 0,
  },
  notificationBadge: {
    position: 'absolute',
    right: 6,
    top: 6,
    backgroundColor: '#e91e63',
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  locationButton: {
    position: 'absolute',
    bottom: 120,
    right: 20,
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 20,
  },
  calloutContainer: {
    borderRadius: 8,
    padding: 12,
    maxWidth: 200,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  calloutTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  calloutDescription: {
    fontSize: 14,
    marginBottom: 4,
  },
  calloutDate: {
    fontSize: 12,
    marginTop: 4,
  },
});

export default MapScreen; 