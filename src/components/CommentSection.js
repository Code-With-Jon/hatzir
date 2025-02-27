import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { collection, addDoc, query, where, orderBy, getDocs, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';

const CommentSection = ({ incidentId }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useSelector(state => state.auth);

  useEffect(() => {
    fetchComments();
  }, [incidentId]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const commentsRef = collection(db, 'comments');
      const q = query(
        commentsRef,
        where('incidentId', '==', incidentId),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const fetchedComments = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      
      setComments(fetchedComments);
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;

    try {
      const commentData = {
        incidentId,
        userId: user.uid,
        userEmail: user.email,
        text: newComment.trim(),
        createdAt: serverTimestamp(),
      };

      await addDoc(collection(db, 'comments'), commentData);
      setNewComment('');
      fetchComments(); // Refresh comments
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    const date = timestamp.toDate();
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));

    if (diffInMinutes < 1) return 'just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;
    return `${Math.floor(diffInMinutes / 1440)}d`;
  };

  const renderComment = ({ item }) => (
    <View style={styles.commentContainer}>
      <View style={styles.commentHeader}>
        <Text style={styles.commentUser}>{item.userEmail.split('@')[0]}</Text>
        <Text style={styles.commentTime}>{formatTimestamp(item.createdAt)}</Text>
      </View>
      <Text style={styles.commentText}>{item.text}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Comments</Text>
      
      {loading ? (
        <ActivityIndicator color="#e91e63" style={styles.loading} />
      ) : (
        <FlatList
          data={comments}
          renderItem={renderComment}
          keyExtractor={item => item.id}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No comments yet</Text>
          }
        />
      )}

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Add a comment..."
          value={newComment}
          onChangeText={setNewComment}
          multiline
        />
        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSubmitComment}
          disabled={!newComment.trim()}
        >
          <Ionicons
            name="send"
            size={24}
            color={newComment.trim() ? "#e91e63" : "#ccc"}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: '#333',
  },
  commentContainer: {
    marginBottom: 16,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  commentUser: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginRight: 8,
  },
  commentTime: {
    fontSize: 12,
    color: '#666',
  },
  commentText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 16,
    marginTop: 16,
  },
  input: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    fontSize: 14,
    maxHeight: 100,
  },
  submitButton: {
    padding: 8,
  },
  loading: {
    marginVertical: 20,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    marginVertical: 20,
  },
});

export default CommentSection; 