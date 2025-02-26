import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  ScrollView, 
  Image, 
  TouchableOpacity,
  Share,
  Alert 
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { voteIncident, flagIncident } from '../../redux/slices/incidentsSlice';

const IncidentDetailsScreen = ({ route, navigation }) => {
  const { incident } = route.params;
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);
  
  // Local state to track votes
  const [currentVotes, setCurrentVotes] = useState(incident.votes || 0);

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Antisemitic Incident Report: ${incident.title}\n\nLocation: ${incident.location.latitude}, ${incident.location.longitude}\n\n${incident.description}`,
      });
    } catch (error) {
      Alert.alert('Error', 'Could not share incident');
    }
  };

  const handleVote = async (newValue) => {
    try {
      const resultAction = await dispatch(voteIncident({ 
        id: incident.id, 
        voteValue: newValue 
      })).unwrap();
      
      // Update local state with new vote count
      setCurrentVotes(resultAction.votes);
    } catch (error) {
      console.error('Failed to update vote:', error);
    }
  };

  const handleFlag = async () => {
    try {
      await dispatch(flagIncident(incident.id)).unwrap();
      Alert.alert('Success', 'Incident has been flagged for review');
    } catch (error) {
      Alert.alert('Error', 'Could not flag incident');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{incident.title}</Text>
        <Text style={styles.date}>
          {new Date(incident.createdAt).toLocaleDateString()}
        </Text>
      </View>

      {incident.mediaUrls?.length > 0 && (
        <ScrollView horizontal style={styles.mediaContainer}>
          {incident.mediaUrls.map((media, index) => (
            <Image
              key={index}
              source={{ uri: media.url }}
              style={styles.media}
              resizeMode="cover"
            />
          ))}
        </ScrollView>
      )}

      <View style={styles.descriptionContainer}>
        <Text style={styles.description}>{incident.description}</Text>
      </View>

      <View style={styles.actionsContainer}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => handleVote(currentVotes + 1)}
        >
          <Ionicons name="arrow-up-circle" size={24} color="#4CAF50" />
          <Text style={styles.voteCount}>{currentVotes}</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionButton}
          onPress={handleShare}
        >
          <Ionicons name="share-outline" size={24} color="#2196F3" />
          <Text style={styles.actionText}>Share</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionButton}
          onPress={handleFlag}
        >
          <Ionicons name="flag-outline" size={24} color="#F44336" />
          <Text style={styles.actionText}>Flag</Text>
        </TouchableOpacity>
      </View>

      {!incident.isAnonymous && (
        <View style={styles.reporterContainer}>
          <Text style={styles.reporterLabel}>Reported by:</Text>
          <Text style={styles.reporterName}>
            {incident.reportedBy === user?.uid ? 'You' : 'Anonymous'}
          </Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  date: {
    fontSize: 14,
    color: '#666',
  },
  mediaContainer: {
    padding: 20,
  },
  media: {
    width: 200,
    height: 200,
    borderRadius: 10,
    marginRight: 10,
  },
  descriptionContainer: {
    padding: 20,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  actionButton: {
    alignItems: 'center',
  },
  voteCount: {
    marginTop: 5,
    color: '#4CAF50',
  },
  actionText: {
    marginTop: 5,
    color: '#666',
  },
  reporterContainer: {
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  reporterLabel: {
    fontSize: 14,
    color: '#666',
    marginRight: 5,
  },
  reporterName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
});

export default IncidentDetailsScreen; 