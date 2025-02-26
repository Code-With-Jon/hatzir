import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  ActivityIndicator,
  Image
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { addIncident } from '../../redux/slices/incidentsSlice';

const ReportIncidentScreen = ({ navigation }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState(null);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [mediaFiles, setMediaFiles] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);

  useEffect(() => {
    getLocationPermission();
  }, []);

  const getLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required to report incidents.');
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({});
      setLocation({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
      });
    } catch (error) {
      Alert.alert('Error', 'Could not get your current location');
    }
  };

  const pickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Camera roll permission is required to add media.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
        videoMaxDuration: 120,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        const type = asset.type || (asset.uri.endsWith('.mp4') ? 'video' : 'image');
        setMediaFiles([...mediaFiles, { 
          uri: asset.uri,
          type: type,
          name: `${type}_${Date.now()}.${type === 'video' ? 'mp4' : 'jpg'}`
        }]);
      }
    } catch (error) {
      Alert.alert('Error', 'Could not select media');
    }
  };

  const handleSubmit = async () => {
    if (!title || !description || !location) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await dispatch(addIncident({
        title,
        description,
        location,
        isAnonymous,
        mediaFiles,
        userId: user?.uid || 'anonymous',
      })).unwrap();

      console.log('Incident submitted successfully:', result);
      
      Alert.alert(
        'Success',
        'Incident reported successfully',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error) {
      console.error('Submit error:', error);
      Alert.alert('Error', error.message || 'Could not submit incident report');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.form}>
        <Text style={styles.label}>Title *</Text>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="Enter incident title"
        />

        <Text style={styles.label}>Description *</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={description}
          onChangeText={setDescription}
          placeholder="Describe what happened"
          multiline
          numberOfLines={4}
        />

        <View style={styles.mediaSection}>
          <Text style={styles.label}>Add Photos</Text>
          <ScrollView horizontal style={styles.mediaPreview}>
            {mediaFiles.map((file, index) => (
              <View key={index} style={styles.mediaItem}>
                <Image source={{ uri: file.uri }} style={styles.mediaImage} />
                <TouchableOpacity
                  style={styles.removeMedia}
                  onPress={() => setMediaFiles(files => files.filter((_, i) => i !== index))}
                >
                  <Ionicons name="close-circle" size={24} color="#F44336" />
                </TouchableOpacity>
              </View>
            ))}
            <TouchableOpacity style={styles.addMediaButton} onPress={pickImage}>
              <Ionicons name="camera" size={32} color="#666" />
              <Text style={styles.addMediaText}>Add Photo</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        <View style={styles.switchContainer}>
          <Text style={styles.label}>Report Anonymously</Text>
          <Switch
            value={isAnonymous}
            onValueChange={setIsAnonymous}
            trackColor={{ false: "#767577", true: "#81b0ff" }}
            thumbColor={isAnonymous ? "#2196F3" : "#f4f3f4"}
          />
        </View>

        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>Submit Report</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  form: {
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  mediaSection: {
    marginBottom: 20,
  },
  mediaPreview: {
    flexDirection: 'row',
    marginTop: 10,
  },
  mediaItem: {
    marginRight: 10,
    position: 'relative',
  },
  mediaImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  removeMedia: {
    position: 'absolute',
    top: -10,
    right: -10,
    backgroundColor: 'white',
    borderRadius: 12,
  },
  addMediaButton: {
    width: 100,
    height: 100,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderStyle: 'dashed',
  },
  addMediaText: {
    marginTop: 5,
    color: '#666',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  submitButton: {
    backgroundColor: '#e91e63',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default ReportIncidentScreen; 