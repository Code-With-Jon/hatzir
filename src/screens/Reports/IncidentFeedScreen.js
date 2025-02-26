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
import { fetchIncidents } from '../../redux/slices/incidentsSlice';

const IncidentCard = ({ incident, onPress }) => {
  const date = new Date(incident.createdAt).toLocaleDateString();
  
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      {incident.mediaUrls?.length > 0 && (
        <Image
          source={{ uri: incident.mediaUrls[0].url }}
          style={styles.cardImage}
          resizeMode="cover"
        />
      )}
      
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{incident.title}</Text>
        <Text style={styles.cardDescription} numberOfLines={2}>
          {incident.description}
        </Text>
        
        <View style={styles.cardFooter}>
          <Text style={styles.cardDate}>{date}</Text>
          <View style={styles.cardStats}>
            <View style={styles.statItem}>
              <Ionicons name="arrow-up" size={16} color="#4CAF50" />
              <Text style={styles.statText}>{incident.votes}</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="flag" size={16} color="#F44336" />
              <Text style={styles.statText}>{incident.flags}</Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const IncidentFeedScreen = ({ navigation }) => {
  const [refreshing, setRefreshing] = useState(false);
  const [sortBy, setSortBy] = useState('date'); // 'date' or 'votes'
  const dispatch = useDispatch();
  const { incidents, isLoading } = useSelector(state => state.incidents);

  useEffect(() => {
    loadIncidents();
  }, []);

  const loadIncidents = async () => {
    try {
      await dispatch(fetchIncidents()).unwrap();
    } catch (error) {
      console.error('Error loading incidents:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadIncidents();
    setRefreshing(false);
  };

  const handleIncidentPress = (incident) => {
    navigation.navigate('IncidentDetails', { incident });
  };

  const handleAddReport = () => {
    navigation.navigate('ReportIncident');
  };

  const sortedIncidents = [...incidents].sort((a, b) => {
    if (sortBy === 'date') {
      return new Date(b.createdAt) - new Date(a.createdAt);
    }
    return b.votes - a.votes;
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

  return (
    <View style={styles.container}>
      <FlatList
        data={sortedIncidents}
        renderItem={({ item }) => (
          <IncidentCard
            incident={item}
            onPress={() => handleIncidentPress(item)}
          />
        )}
        keyExtractor={item => item.id}
        ListHeaderComponent={renderHeader}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#e91e63']}
          />
        }
        contentContainerStyle={styles.listContent}
      />
      
      <TouchableOpacity
        style={styles.fab}
        onPress={handleAddReport}
      >
        <Ionicons name="add" size={24} color="#fff" />
      </TouchableOpacity>
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
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardImage: {
    width: '100%',
    height: 200,
  },
  cardContent: {
    padding: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardDate: {
    fontSize: 12,
    color: '#999',
  },
  cardStats: {
    flexDirection: 'row',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 16,
  },
  statText: {
    marginLeft: 4,
    color: '#666',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#e91e63',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
});

export default IncidentFeedScreen; 