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
  Image,
  Platform,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { Video } from 'expo-av';
import { addIncident } from '../../redux/slices/incidentsSlice';
import { useTheme } from '../../context/ThemeContext';
import { lightTheme, darkTheme } from '../../theme/colors';
import * as MediaLibrary from 'expo-media-library';

const ReportIncidentScreen = ({ navigation }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState(null);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [mediaFiles, setMediaFiles] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);
  const { isDarkMode } = useTheme();
  const theme = isDarkMode ? darkTheme : lightTheme;

  useEffect(() => {
    (async () => {
      if (Platform.OS !== 'web') {
        const { status: mediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
        const { status: locationStatus } = await Location.requestForegroundPermissionsAsync();
        
        if (mediaStatus !== 'granted' || cameraStatus !== 'granted') {
          Alert.alert('Sorry, we need camera and media library permissions!');
          return;
        }

        if (locationStatus !== 'granted') {
          Alert.alert('Permission Denied', 'Location permission is required to report incidents.');
          return;
        }

        const currentLocation = await Location.getCurrentPositionAsync({});
        setLocation({
          latitude: currentLocation.coords.latitude,
          longitude: currentLocation.coords.longitude,
        });
      }
    })();
  }, []);

  const showMediaPicker = () => {
    Alert.alert(
      'Add Media',
      'Choose an option',
      [
        {
          text: 'Take Photo',
          onPress: () => pickMedia('camera', 'image'),
        },
        {
          text: 'Take Video',
          onPress: () => pickMedia('camera', 'video'),
        },
        {
          text: 'Choose from Gallery',
          onPress: () => pickMedia('library', 'all'),
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ],
      { cancelable: true }
    );
  };

  const pickMedia = async (source, mediaType) => {
    try {
      let result;
      const options = {
        mediaTypes: mediaType === 'all' 
          ? ['images', 'videos']
          : mediaType === 'image' 
            ? ['images']
            : ['videos'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        videoMaxDuration: 60,
        base64: false,
        exif: true,
      };

      if (source === 'camera') {
        result = await ImagePicker.launchCameraAsync(options);
      } else {
        result = await ImagePicker.launchImageLibraryAsync(options);
      }

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        console.log('Picked asset:', asset);

        const newMedia = {
          uri: asset.uri,
          type: asset.type || (asset.uri.toLowerCase().endsWith('.mp4') ? 'video' : 'image'),
          fileName: asset.uri.split('/').pop(),
          duration: asset.duration,
          width: asset.width,
          height: asset.height,
        };

        setMediaFiles(prev => [...prev, newMedia]);
      }
    } catch (error) {
      console.error('Error picking media:', error);
      Alert.alert('Error', 'Failed to pick media');
    }
  };

  const removeMedia = (index) => {
    setMediaFiles(prev => prev.filter((_, i) => i !== index));
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

  const renderMediaPreview = () => {
    return (
      <ScrollView horizontal style={styles.mediaPreviewContainer}>
        {mediaFiles.map((media, index) => (
          <View key={index} style={styles.mediaPreviewWrapper}>
            {media.type === 'video' ? (
              <View style={styles.mediaPreview}>
                <Video
                  source={{ uri: media.uri }}
                  style={styles.mediaPreview}
                  resizeMode="cover"
                  shouldPlay={false}
                  isMuted={true}
                  useNativeControls={false}
                  isLooping={false}
                  posterSource={{ uri: media.uri }}
                  usePoster={true}
                  onLoad={() => console.log('Video loaded')}
                  onError={(error) => console.error('Video error:', error)}
                />
                <View style={styles.videoOverlay}>
                  <Ionicons name="play-circle" size={32} color="white" />
                </View>
              </View>
            ) : (
              <Image
                source={{ uri: media.uri }}
                style={styles.mediaPreview}
                resizeMode="cover"
              />
            )}
            <TouchableOpacity
              style={styles.removeMediaButton}
              onPress={() => removeMedia(index)}
            >
              <View style={styles.removeButtonBackground}>
                <Ionicons name="close-circle" size={28} color="white" />
              </View>
            </TouchableOpacity>
            {media.type === 'video' && (
              <View style={styles.videoIndicator}>
                <Ionicons name="videocam" size={20} color="#fff" />
                <Text style={styles.videoText}>Video</Text>
              </View>
            )}
          </View>
        ))}
        {mediaFiles.length < 5 && (
          <TouchableOpacity
            style={[styles.addMediaButton, { backgroundColor: theme.inputBackground }]}
            onPress={showMediaPicker}
          >
            <Ionicons name="add" size={40} color={theme.text} />
            <Text style={[styles.addMediaText, { color: theme.text }]}>
              Add Photo/Video
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    );
  };

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: theme.background }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.form}>
        <Text style={[styles.label, { color: theme.text }]}>Title *</Text>
        <TextInput
          style={[styles.input, { 
            backgroundColor: theme.inputBackground,
            borderColor: theme.border,
            color: theme.text
          }]}
          value={title}
          onChangeText={setTitle}
          placeholder="Enter incident title"
          placeholderTextColor={theme.textSecondary}
        />

        <Text style={[styles.label, { color: theme.text }]}>Description *</Text>
        <TextInput
          style={[styles.input, styles.textArea, { 
            backgroundColor: theme.inputBackground,
            borderColor: theme.border,
            color: theme.text
          }]}
          value={description}
          onChangeText={setDescription}
          placeholder="Describe what happened"
          placeholderTextColor={theme.textSecondary}
          multiline
          numberOfLines={4}
        />

        <View style={styles.mediaSection}>
          <Text style={[styles.label, { color: theme.text }]}>Add Media</Text>
          {renderMediaPreview()}
        </View>

        <View style={styles.switchContainer}>
          <Text style={[styles.label, { color: theme.text }]}>Report Anonymously</Text>
          <Switch
            value={isAnonymous}
            onValueChange={setIsAnonymous}
            trackColor={{ false: theme.border, true: theme.primary }}
            thumbColor={isAnonymous ? theme.primary : theme.text}
          />
        </View>

        <TouchableOpacity
          style={[styles.submitButton, { backgroundColor: theme.primary }]}
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
  },
  form: {
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  input: {
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    borderWidth: 1,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  mediaSection: {
    marginBottom: 20,
  },
  mediaPreviewContainer: {
    flexDirection: 'row',
    marginVertical: 10,
    maxHeight: 140,
  },
  mediaPreviewWrapper: {
    marginRight: 12,
    position: 'relative',
  },
  mediaPreview: {
    width: 120,
    height: 120,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  removeMediaButton: {
    position: 'absolute',
    top: -10,
    right: -10,
    zIndex: 1,
  },
  removeButtonBackground: {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 14,
    padding: 2,
  },
  videoIndicator: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 12,
    padding: 6,
    flexDirection: 'row',
    alignItems: 'center',
  },
  videoText: {
    color: '#fff',
    marginLeft: 4,
    fontSize: 12,
    fontWeight: '500',
  },
  addMediaButton: {
    width: 120,
    height: 120,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  addMediaText: {
    marginTop: 8,
    fontSize: 12,
    textAlign: 'center',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  submitButton: {
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
  videoOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
});

export default ReportIncidentScreen; 