import React, { useState, useEffect, useRef } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  ScrollView, 
  Image, 
  TouchableOpacity,
  Share,
  Alert,
  FlatList,
  TextInput,
  Keyboard,
  Platform,
  KeyboardAvoidingView
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { voteIncident, flagIncident } from '../../redux/slices/incidentsSlice';
import CommentSection from '../../components/CommentSection';
import IncidentMedia from '../../components/IncidentMedia';
import { collection, addDoc, query, where, orderBy, getDocs, serverTimestamp, onSnapshot, doc, updateDoc, arrayUnion, arrayRemove, increment } from 'firebase/firestore';
import { db } from '../../config/firebase';
import * as Location from 'expo-location';

// Create a memoized comment component
const CommentItem = React.memo(({ item, formatTimestamp, onLike, onReply, currentUserId }) => {
  const isLiked = item.likes?.includes(currentUserId);

  return (
    <View style={styles.commentContainer}>
      <View style={styles.commentHeader}>
        <Text style={styles.commentUser}>{item.userEmail.split('@')[0]}</Text>
        <Text style={styles.commentTime}>{formatTimestamp(item.createdAt)}</Text>
      </View>
      <View style={styles.commentContent}>
        <View style={styles.commentTextContainer}>
          {item.replyTo && (
            <Text style={styles.replyingTo}>
              Replying to @{item.replyToUser.split('@')[0]}
            </Text>
          )}
          <Text style={styles.commentText}>{item.text}</Text>
        </View>
        <View style={styles.commentActions}>
          <TouchableOpacity 
            style={styles.likeButton} 
            onPress={() => onLike(item.id, isLiked)}
          >
            <Ionicons
              name={isLiked ? "heart" : "heart-outline"}
              size={20}
              color={isLiked ? "#e91e63" : "#666"}
            />
            {item.likes?.length > 0 && (
              <Text style={styles.likeCount}>{item.likes.length}</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.replyButton} 
            onPress={() => onReply(item)}
          >
            <Ionicons
              name="return-down-back-outline"
              size={20}
              color="#666"
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
});

const IncidentDetailsScreen = ({ route, navigation }) => {
  const { incident } = route.params;
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);
  const { useMetricSystem } = useSelector(state => state.userSettings);
  const [userLocation, setUserLocation] = useState(null);
  
  // Local state to track votes
  const [currentVotes, setCurrentVotes] = useState(incident.votes || 0);
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState([]);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);

  // Add input ref
  const inputRef = useRef(null);

  // Get user location
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

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => setKeyboardVisible(true)
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => setKeyboardVisible(false)
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  // Fetch comments on mount
  useEffect(() => {
    if (!incident.id) {
      console.error('No incident ID available');
      return;
    }
    
    console.log('Setting up comments listener for incident:', incident.id);
    const commentsRef = collection(db, 'comments');
    const q = query(
      commentsRef,
      where('incidentId', '==', incident.id),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      console.log('Comments snapshot received, count:', snapshot.docs.length);
      const fetchedComments = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt
      }));
      console.log('Fetched comments:', fetchedComments);
      setComments(fetchedComments);
    }, (error) => {
      console.error('Error fetching comments:', error);
      Alert.alert('Error', 'Failed to load comments');
    });

    return () => unsubscribe();
  }, [incident.id]);

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

  const handleReply = (comment) => {
    setReplyingTo(comment);
    setNewComment(`@${comment.userEmail.split('@')[0]} `);
  };

  const cancelReply = () => {
    setReplyingTo(null);
    setNewComment('');
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;
    
    try {
      // Create the comment first
      let commentData = {
        incidentId: incident.id,
        userId: user.uid,
        userEmail: user.email,
        text: newComment.trim(),
        createdAt: new Date(),
        likes: [],
      };

      if (replyingTo) {
        commentData = {
          ...commentData,
          replyTo: replyingTo.id,
          replyToUser: replyingTo.userEmail,
        };
      }

      await addDoc(collection(db, 'comments'), commentData);
      
      // Update incident comment count
      const incidentRef = doc(db, 'incidents', incident.id);
      await updateDoc(incidentRef, {
        commentCount: (incident.commentCount || 0) + 1
      });

      console.log('Comment added successfully');

      // Try to send notification, but don't fail if it errors
      if (replyingTo) {
        try {
          console.log('Preparing notification for:', replyingTo.userId);
          const notification = {
            userId: replyingTo.userId,
            type: 'comment_reply',
            title: 'New Reply',
            body: `${user.email.split('@')[0]} replied to your comment`,
            data: {
              incidentId: incident.id,
              commentId: replyingTo.id,
            },
            createdAt: new Date(),
            read: false,
          };
          
          await addDoc(collection(db, 'notifications'), notification);
          console.log('Notification added successfully');
        } catch (notificationError) {
          // Log the error but don't show it to the user since the comment was still created
          console.warn('Failed to create notification:', notificationError);
        }
      }

      // Clear the input and reply state regardless of notification success
      setNewComment('');
      setReplyingTo(null);
      Keyboard.dismiss();
    } catch (error) {
      console.error('Error posting comment:', error.code, error.message, error);
      Alert.alert('Error', 'Failed to post comment');
    }
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    
    try {
      // Convert Firestore timestamp to JS Date
      const date = timestamp.toDate();
      const now = new Date();
      // If the date is in the future, just show the actual date
      if (date > now) {
        return date.toLocaleDateString();
      }
      const diffInMinutes = Math.floor((now - date) / (1000 * 60));

      if (diffInMinutes < 1) return 'just now';
      if (diffInMinutes < 60) return `${diffInMinutes}m`;
      if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;
      return `${Math.floor(diffInMinutes / 1440)}d`;
    } catch (error) {
      console.error('Error formatting timestamp:', error, timestamp);
      // If there's an error, return the raw timestamp data
      if (timestamp?.seconds) {
        const date = new Date(timestamp.seconds * 1000);
        return date.toLocaleDateString();
      }
      return 'Invalid date';
    }
  };

  const handleLikeComment = async (commentId, isCurrentlyLiked) => {
    try {
      const commentRef = doc(db, 'comments', commentId);
      
      if (isCurrentlyLiked) {
        // Remove like
        await updateDoc(commentRef, {
          likes: arrayRemove(user.uid)
        });
      } else {
        // Add like
        await updateDoc(commentRef, {
          likes: arrayUnion(user.uid)
        });
      }
    } catch (error) {
      console.error('Error updating like:', error);
      Alert.alert('Error', 'Failed to update like');
    }
  };

  const handleReplyComment = (comment) => {
    setReplyingTo(comment);
    setNewComment(`@${comment.userEmail.split('@')[0]} `);
    // Focus the input field
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const renderHeader = React.useMemo(() => (
    <>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{incident.title}</Text>
          <Text style={styles.date}>
            {new Date(incident.createdAt).toLocaleDateString()}
          </Text>
        </View>
        <View style={styles.locationContainer}>
          <Ionicons name="location" size={16} color="#666" />
          <View>
            <Text style={styles.location}>
              {incident.locationDetails?.city && incident.locationDetails?.state 
                ? `${incident.locationDetails.city}, ${incident.locationDetails.state}`
                : 'Location unknown'
              }
            </Text>
            {userLocation && (
              <Text style={styles.distance}>
                {getDistanceText()}
              </Text>
            )}
          </View>
        </View>
      </View>

      {incident.mediaUrls?.length > 0 && (
        <View style={styles.mediaContainer}>
          <IncidentMedia mediaUrls={incident.mediaUrls} />
        </View>
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

      <View style={styles.separator} />
      <Text style={styles.commentsTitle}>Comments</Text>
    </>
  ), [incident, currentVotes, user?.uid, userLocation]);

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 34 : 0}
    >
      <FlatList
        style={styles.mainContent}
        ListHeaderComponent={renderHeader}
        ListHeaderComponentStyle={styles.headerSection}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        data={comments}
        initialNumToRender={4}
        maxToRenderPerBatch={4}
        windowSize={5}
        scrollEnabled={true}
        showsVerticalScrollIndicator={true}
        renderItem={({ item }) => (
          <CommentItem 
            item={item} 
            formatTimestamp={formatTimestamp}
            onLike={handleLikeComment}
            onReply={handleReplyComment}
            currentUserId={user.uid}
          />
        )}
        keyExtractor={item => item.id}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No comments yet</Text>
        }
      />
      <View style={[
        styles.inputContainer,
        keyboardVisible && styles.inputContainerWithKeyboard
      ]}>
        {replyingTo && (
          <View style={styles.replyingToContainer}>
            <Text style={styles.replyingToText}>
              Replying to @{replyingTo.userEmail.split('@')[0]}
            </Text>
            <TouchableOpacity onPress={cancelReply}>
              <Ionicons name="close-circle" size={20} color="#666" />
            </TouchableOpacity>
          </View>
        )}
        <TextInput
          ref={inputRef}
          style={styles.input}
          placeholder="Add a comment..."
          value={newComment}
          onChangeText={setNewComment}
          multiline
          maxLength={1000}
          autoCapitalize="sentences"
          returnKeyType="send"
          enablesReturnKeyAutomatically
          blurOnSubmit={false}
          onSubmitEditing={handleSubmitComment}
        />
        <TouchableOpacity
          style={[
            styles.submitButton,
            newComment.trim() ? styles.submitButtonActive : styles.submitButtonInactive
          ]}
          onPress={handleSubmitComment}
          disabled={!newComment.trim()}
        >
          <Ionicons
            name="send"
            size={24}
            color={newComment.trim() ? "#fff" : "#999"}
          />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  mainContent: {
    flex: 1,
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  titleContainer: {
    flex: 1,
    marginRight: 16,
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
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    maxWidth: '40%',
  },
  location: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
    marginBottom: 2,
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
  separator: {
    height: 8,
    backgroundColor: '#f5f5f5',
    marginVertical: 16,
  },
  commentsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    padding: 20,
  },
  headerSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  commentContainer: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#fff',
    minHeight: 80, // Set a consistent height for comment containers
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  commentUser: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  commentTime: {
    fontSize: 12,
    color: '#666',
    marginLeft: 10,
  },
  commentContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  commentTextContainer: {
    flex: 1,
  },
  commentText: {
    fontSize: 16,
    color: '#333',
    marginTop: 4,
    flex: 1,
    marginRight: 8,
  },
  commentActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  likeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 4,
  },
  likeCount: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  replyingTo: {
    fontSize: 12,
    color: '#e91e63',
    marginBottom: 4,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    padding: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: '#fff',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  inputContainerWithKeyboard: {
    paddingBottom: 16,
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    marginRight: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    fontSize: 16,
  },
  submitButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitButtonActive: {
    backgroundColor: '#e91e63',
  },
  submitButtonInactive: {
    backgroundColor: '#f5f5f5',
  },
  replyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 4,
    marginLeft: 8,
  },
  replyingToContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 8,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginBottom: 8,
  },
  replyingToText: {
    fontSize: 12,
    color: '#666',
    marginRight: 8,
  },
  distance: {
    fontSize: 12,
    color: '#999',
    marginLeft: 4,
    fontStyle: 'italic',
  },
});

export default IncidentDetailsScreen; 