import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  FlatList,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Image
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { setIncidents } from '../../redux/slices/incidentsSlice';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../../config/firebase';
import IncidentCard from '../../components/IncidentCard';
import * as Location from 'expo-location';
import { useTheme } from '../../context/ThemeContext';
import { lightTheme, darkTheme } from '../../theme/colors';
import { FAB } from 'react-native-elements';

const IncidentFeedScreen = ({ navigation }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [sortBy, setSortBy] = useState('date'); // 'date', 'votes', or 'distance'
  const [userLocation, setUserLocation] = useState(null);
  const dispatch = useDispatch();
  const { incidents, isLoading } = useSelector(state => state.incidents);
  const { isDarkMode } = useTheme();
  const theme = isDarkMode ? darkTheme : lightTheme;

  useEffect(() => {
    const getUserLocation = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          console.warn('Permission to access location was denied');
          return;
        }
        
        const location = await Location.getCurrentPositionAsync({});
        setUserLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
      } catch (error) {
        console.error('Error getting location:', error);
      }
    };
    
    getUserLocation();
  }, []);

  useEffect(() => {
    const incidentsRef = collection(db, 'incidents');
    const q = query(
      incidentsRef,
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedIncidents = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        votes: doc.data().votes || 0,
        commentCount: doc.data().commentCount || 0,
        flagCount: doc.data().flagCount || 0,
      }));
      
      dispatch(setIncidents(fetchedIncidents));
    });

    return () => unsubscribe();
  }, [dispatch]);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const handleIncidentPress = (incident) => {
    navigation.navigate('IncidentDetails', { incident });
  };

  const handleAddReport = () => {
    navigation.navigate('ReportIncident');
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c; // Distance in km
    return distance;
  };

  const sortedIncidents = [...incidents].sort((a, b) => {
    if (sortBy === 'date') {
      return new Date(b.createdAt) - new Date(a.createdAt);
    }
    if (sortBy === 'votes') {
      return b.votes - a.votes;
    }
    if (sortBy === 'distance' && userLocation) {
      const distanceA = calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        a.location.latitude,
        a.location.longitude
      );
      const distanceB = calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        b.location.latitude,
        b.location.longitude
      );
      return distanceA - distanceB;
    }
    return 0;
  });

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>Recent Incidents</Text>
      <View style={styles.sortButtons}>
        <TouchableOpacity
          style={[styles.sortButton, sortBy === 'date' && styles.sortButtonActive]}
          onPress={() => setSortBy('date')}
        >
          <Text style={[styles.sortButtonText, sortBy === 'date' && styles.sortButtonTextActive]}>
            Latest
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.sortButton, sortBy === 'votes' && styles.sortButtonActive]}
          onPress={() => setSortBy('votes')}
        >
          <Text style={[styles.sortButtonText, sortBy === 'votes' && styles.sortButtonTextActive]}>
            Most Voted
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.sortButton, sortBy === 'distance' && styles.sortButtonActive]}
          onPress={() => setSortBy('distance')}
        >
          <Text style={[styles.sortButtonText, sortBy === 'distance' && styles.sortButtonTextActive]}>
            Nearest
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (isLoading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#e91e63" />
      </View>
    );
  }

  const renderItem = ({ item }) => (
    <IncidentCard
      incident={item}
      onPress={() => handleIncidentPress(item)}
      userLocation={userLocation}
    />
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <FlatList
        data={sortedIncidents}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        ListHeaderComponent={renderHeader}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.primary]}
          />
        }
        contentContainerStyle={styles.listContent}
      />
      
      <FAB
        title="Monitor News"
        icon={<Ionicons name="newspaper-outline" size={24} color="white" />}
        color={theme.primary}
        style={[styles.monitorFab]}
        onPress={() => navigation.navigate('IncidentMonitor')}
      />
      
      <FAB
        title="Report Incident"
        icon={<Ionicons name="warning-outline" size={24} color="white" />}
        color={theme.primary}
        style={[styles.reportFab]}
        onPress={() => navigation.navigate('ReportIncident')}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 16,
  },
  header: {
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  sortButtons: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  sortButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: '#fff',
  },
  sortButtonActive: {
    backgroundColor: '#e91e63',
  },
  sortButtonText: {
    color: '#666',
  },
  sortButtonTextActive: {
    color: '#fff',
  },
  monitorFab: {
    position: 'absolute',
    bottom: 90, // Position above the Report FAB
    right: 20,
  },
  reportFab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
  },
});

export default IncidentFeedScreen; 