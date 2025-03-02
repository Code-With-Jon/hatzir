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
  KeyboardAvoidingView,
  Dimensions
} from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { voteIncident, flagIncident } from '../../redux/slices/incidentsSlice';
import CommentSection from '../../components/CommentSection';
import IncidentMedia from '../../components/IncidentMedia';
import { collection, addDoc, query, where, orderBy, getDocs, serverTimestamp, onSnapshot, doc, updateDoc, arrayUnion, arrayRemove, increment, deleteDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import * as Location from 'expo-location';
import { useNavigation } from '@react-navigation/native';

// Create a memoized comment component
const CommentItem = React.memo(({ item, formatTimestamp, onLike, onReply, currentUserId }) => {
  const isLiked = item.likes?.includes(currentUserId);
  const likeCount = item.likes?.length || 0;

  return (
    <View style={styles.commentContainer}>
      <View style={styles.commentUserAvatar}>
        <Ionicons name="person-circle" size={36} color="#999" />
      </View>
      <View style={styles.commentContent}>
        <View style={styles.commentHeader}>
          <Text style={styles.commentUsername}>
            {item.userEmail.split('@')[0]}
          </Text>
          <Text style={styles.commentText}>
            {item.replyTo && (
              <Text style={styles.replyingToText}>
                @{item.replyToUser.split('@')[0]}{' '}
              </Text>
            )}
            {item.text}
          </Text>
        </View>
        <View style={styles.commentMeta}>
          <Text style={styles.commentTime}>
            {formatTimestamp(item.createdAt)}
          </Text>
          {likeCount > 0 && (
            <Text style={styles.commentLikes}>
              {likeCount} {likeCount === 1 ? 'like' : 'likes'}
            </Text>
          )}
          <TouchableOpacity onPress={() => onReply(item)}>
            <Text style={styles.replyButton}>Reply</Text>
          </TouchableOpacity>
        </View>
      </View>
      <TouchableOpacity 
        style={styles.likeButton} 
        onPress={() => onLike(item.id, isLiked)}
      >
        <Ionicons
          name={isLiked ? "heart" : "heart-outline"}
          size={20}
          color={isLiked ? "#e91e63" : "#999"}
        />
      </TouchableOpacity>
    </View>
  );
});

const IncidentDetailsScreen = ({ route }) => {
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
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  // Add input ref
  const inputRef = useRef(null);
  const scrollViewRef = useRef(null);

  // Add this state to track input focus
  const [isInputFocused, setIsInputFocused] = useState(false);

  const windowHeight = Dimensions.get('window').height;

  const navigation = useNavigation();

  // Add these debug logs
  useEffect(() => {
    console.log('Incident:', incident);
    console.log('Current user:', user);
    console.log('Incident reportedBy:', incident.reportedBy);
    console.log('User ID:', user?.uid);
    console.log('Is match:', user?.uid === incident.reportedBy);
  }, [incident, user]);

  // Update the isUserIncident check
  const isUserIncident = Boolean(user?.uid && incident.reportedBy && user.uid === incident.reportedBy);

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

  // Update keyboard handling
  useEffect(() => {
    const keyboardWillShow = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => {
        setKeyboardVisible(true);
        setKeyboardHeight(e.endCoordinates.height);
      }
    );

    const keyboardWillHide = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setKeyboardVisible(false);
        setKeyboardHeight(0);
      }
    );

    return () => {
      keyboardWillShow.remove();
      keyboardWillHide.remove();
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

  const scrollToBottom = () => {
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  };

  const handleReplyComment = (comment) => {
    setReplyingTo(comment);
    setNewComment(`@${comment.userEmail.split('@')[0]} `);
    setIsInputFocused(true);
    setTimeout(() => {
      inputRef.current?.focus();
      scrollToBottom();
    }, 100);
  };

  const handleEditIncident = () => {
    navigation.navigate('EditIncident', { incident });
  };

  const handleDeleteIncident = () => {
    Alert.alert(
      'Delete Incident',
      'Are you sure you want to delete this incident? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDoc(doc(db, 'incidents', incident.id));
              navigation.goBack();
              Alert.alert('Success', 'Incident deleted successfully');
            } catch (error) {
              console.error('Error deleting incident:', error);
              Alert.alert('Error', 'Failed to delete incident');
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const renderHeader = React.useMemo(() => (
    <>
      <View style={styles.headerContent}>
        <Text style={styles.title}>{incident.title}</Text>
        <Text style={styles.date}>
          {new Date(incident.createdAt).toLocaleDateString()}
        </Text>
        <Text style={styles.description}>{incident.description}</Text>
      </View>

      {isUserIncident && (
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={handleEditIncident}
          >
            <Ionicons name="create-outline" size={24} color="#2196F3" />
            <Text style={styles.actionButtonText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.actionButton, styles.deleteButton]}
            onPress={handleDeleteIncident}
          >
            <Ionicons name="trash-outline" size={24} color="#F44336" />
            <Text style={[styles.actionButtonText, styles.deleteButtonText]}>Delete</Text>
          </TouchableOpacity>
        </View>
      )}
    </>
  ), [incident, isUserIncident]);

  useEffect(() => {
    console.log('Debug user ownership:', {
      currentUserId: user?.uid,
      incidentReporterId: incident.reportedBy,
      isMatch: user?.uid === incident.reportedBy,
      isUserIncident
    });
  }, [user, incident, isUserIncident]);

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : null}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
      >
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          ref={scrollViewRef}
        >
          {/* Incident Details Section */}
          <View style={styles.headerSection}>
            {renderHeader}
            {getDistanceText() && (
              <Text style={styles.distance}>{getDistanceText()}</Text>
            )}
            <View style={styles.reporterInfo}>
              <Text style={styles.reporterLabel}>Reported by:</Text>
              <Text style={styles.reporterName}>
                {incident.isAnonymous ? 'Anonymous' : incident.reportedBy}
              </Text>
            </View>
          </View>

          {/* Media Section */}
          {incident.mediaUrls?.length > 0 && (
            <View style={styles.mediaSection}>
              <IncidentMedia mediaUrls={incident.mediaUrls} />
            </View>
          )}

          {/* Comments Section */}
          <View style={styles.commentsSection}>
            <Text style={styles.commentsTitle}>
              Comments {comments.length > 0 && `(${comments.length})`}
            </Text>
            {comments.length === 0 ? (
              <View style={styles.emptyCommentsContainer}>
                <Ionicons name="chatbubble-outline" size={48} color="#ccc" />
                <Text style={styles.emptyText}>No comments yet</Text>
                <Text style={styles.emptySubtext}>Be the first to comment</Text>
              </View>
            ) : (
              comments.map((comment) => (
                <CommentItem
                  key={comment.id}
                  item={comment}
                  formatTimestamp={formatTimestamp}
                  onLike={handleLikeComment}
                  onReply={handleReplyComment}
                  currentUserId={user?.uid}
                />
              ))
            )}
          </View>
        </ScrollView>

        <View style={[
          styles.inputContainer,
          keyboardVisible && { marginBottom: Platform.OS === 'ios' ? 0 : keyboardHeight }
        ]}>
          {replyingTo && (
            <View style={styles.replyingToContainer}>
              <Text style={styles.replyingToText}>
                Replying to @{replyingTo.userEmail.split('@')[0]}
              </Text>
              <TouchableOpacity 
                onPress={() => {
                  setReplyingTo(null);
                  setNewComment('');
                }}
              >
                <Ionicons name="close-circle" size={20} color="#666" />
              </TouchableOpacity>
            </View>
          )}
          <View style={styles.inputWrapper}>
            <TextInput
              ref={inputRef}
              style={styles.input}
              value={newComment}
              onChangeText={setNewComment}
              placeholder="Add a comment..."
              multiline
              maxLength={500}
              onFocus={() => {
                setIsInputFocused(true);
                setKeyboardVisible(true);
              }}
              onBlur={() => {
                setIsInputFocused(false);
              }}
              autoCapitalize="sentences"
              returnKeyType="default"
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
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  headerSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    marginBottom: 16,
  },
  mediaSection: {
    marginVertical: 16,
  },
  commentsSection: {
    flex: 1,
  },
  commentsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  commentContainer: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    alignItems: 'flex-start',
  },
  commentUserAvatar: {
    marginRight: 12,
  },
  commentContent: {
    flex: 1,
    marginRight: 8,
  },
  commentHeader: {
    flexDirection: 'column',
  },
  commentUsername: {
    fontSize: 14,
    fontWeight: '600',
    color: '#262626',
    marginBottom: 2,
  },
  commentText: {
    fontSize: 14,
    color: '#262626',
    lineHeight: 20,
  },
  commentMeta: {
    flexDirection: 'row',
    marginTop: 8,
    alignItems: 'center',
  },
  commentTime: {
    fontSize: 12,
    color: '#999',
    marginRight: 12,
  },
  commentLikes: {
    fontSize: 12,
    color: '#999',
    marginRight: 12,
  },
  replyButton: {
    fontSize: 12,
    color: '#999',
    fontWeight: '600',
  },
  likeButton: {
    padding: 4,
  },
  replyingToText: {
    color: '#00376b',
    fontWeight: '600',
  },
  emptyCommentsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 16,
    fontWeight: '500',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
  },
  inputContainer: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    padding: 12,
    paddingBottom: Platform.OS === 'ios' ? 24 : 12,
    width: '100%',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#fff',
    paddingTop: 8,
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    paddingRight: 48,
    fontSize: 16,
    color: '#333',
    textAlignVertical: 'center',
  },
  submitButton: {
    marginLeft: 8,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'flex-end',
  },
  submitButtonActive: {
    backgroundColor: '#e91e63',
  },
  submitButtonInactive: {
    backgroundColor: '#f5f5f5',
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
  headerContent: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
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
  reporterInfo: {
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  distance: {
    fontSize: 12,
    color: '#999',
    marginLeft: 4,
    fontStyle: 'italic',
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 12,
    backgroundColor: '#f8f8f8',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  actionButtonText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '500',
    color: '#2196F3',
  },
  deleteButton: {
    backgroundColor: '#fff',
  },
  deleteButtonText: {
    color: '#F44336',
  },
});

export default IncidentDetailsScreen; 